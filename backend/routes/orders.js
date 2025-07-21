import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { OrderService } from '../services/OrderService.js';

const router = express.Router();

// Obtener órdenes del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtener órdenes con items
    const orders = await executeQuery(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.shipping_address,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // Obtener items de cada orden
    for (let order of orders) {
      const items = await executeQuery(`
        SELECT 
          oi.quantity,
          oi.price,
          p.id as productId,
          p.name,
          p.image,
          u.name as sellerName
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items;
    }

    // Contar total de órdenes
    const [countResult] = await executeQuery('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
    const total = countResult.total;

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una orden específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener la orden
    const orders = await executeQuery(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.shipping_address,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orders[0];

    // Obtener items de la orden
    const items = await executeQuery(`
      SELECT 
        oi.quantity,
        oi.price,
        p.id as productId,
        p.name,
        p.image,
        p.description,
        u.name as sellerName
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE oi.order_id = ?
    `, [id]);

    order.items = items;

    res.json({ order });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva orden
router.post('/', authenticateToken, [
  body('shippingAddress').trim().isLength({ min: 10 }).withMessage('Dirección de envío requerida'),
  body('paymentMethod').trim().isLength({ min: 2 }).withMessage('Método de pago requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Obtener items del carrito
    const cartItems = await executeQuery(`
      SELECT 
        ci.quantity,
        p.id as productId,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Verificar stock disponible
    for (let item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${item.name}. Disponible: ${item.stock}, Solicitado: ${item.quantity}` 
        });
      }
    }

    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear la orden con UUID generado
    const orderId = randomUUID();
    await executeQuery(
      'INSERT INTO orders (id, user_id, total, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId, total, shippingAddress, paymentMethod]
    );

    // Obtener la orden creada
    const [newOrder] = await executeQuery('SELECT * FROM orders WHERE id = ?', [orderId]);

    // Crear items de la orden y actualizar stock
    for (let item of cartItems) {
      // Insertar item de orden con UUID generado
      const orderItemId = randomUUID();
      await executeQuery(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderItemId, orderId, item.productId, item.quantity, item.price]
      );

      // Actualizar stock del producto
      await executeQuery(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Limpiar el carrito
    await executeQuery('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // Obtener la orden completa
    const orderItems = await executeQuery(`
      SELECT 
        oi.quantity,
        oi.price,
        p.id as productId,
        p.name,
        p.image,
        u.name as sellerName
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order: {
        id: orderId,
        total: parseFloat(total.toFixed(2)),
        status: newOrder.status,
        shippingAddress,
        paymentMethod,
        paymentStatus: newOrder.payment_status,
        items: orderItems,
        createdAt: newOrder.created_at
      }
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de orden (solo admin y vendedores)
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'seller'), [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Verificar que la orden existe
    const orders = await executeQuery('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Actualizar estado
    await executeQuery('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Estado de orden actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de pago (solo admin)
router.put('/:id/payment-status', authenticateToken, authorizeRoles('admin'), [
  body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Estado de pago inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { paymentStatus } = req.body;

    // Verificar que la orden existe
    const orders = await executeQuery('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Actualizar estado de pago
    await executeQuery('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, id]);

    res.json({ message: 'Estado de pago actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando estado de pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las órdenes (solo admin)
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const orders = await executeQuery(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.created_at,
        u.name as userName,
        u.email as userEmail
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Contar total
    const [countResult] = await executeQuery('SELECT COUNT(*) as total FROM orders');
    const total = countResult.total;

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Aceptar orden (solo vendedores)
router.put('/:id/accept', authenticateToken, authorizeRoles('seller', 'admin'), [
  body('notes').optional().isString().withMessage('Las notas deben ser texto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { notes } = req.body;
    const sellerId = req.user.id;

    await OrderService.acceptOrder(id, sellerId, notes);

    res.json({ 
      message: 'Orden aceptada exitosamente',
      orderId: id 
    });

  } catch (error) {
    console.error('Error aceptando orden:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rechazar orden (solo vendedores)
router.put('/:id/reject', authenticateToken, authorizeRoles('seller', 'admin'), [
  body('reason').trim().isLength({ min: 5 }).withMessage('La razón de rechazo es requerida (mínimo 5 caracteres)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const sellerId = req.user.id;

    await OrderService.rejectOrder(id, sellerId, reason);

    res.json({ 
      message: 'Orden rechazada exitosamente',
      orderId: id,
      reason 
    });

  } catch (error) {
    console.error('Error rechazando orden:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener órdenes del vendedor
router.get('/seller/my-orders', authenticateToken, authorizeRoles('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtener órdenes que contienen productos del vendedor
    const orders = await executeQuery(`
      SELECT DISTINCT
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.auto_accept_at,
        o.rejection_reason,
        o.notes,
        o.created_at,
        u.name as buyerName,
        u.email as buyerEmail
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE p.seller_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [sellerId, limit, offset]);

    // Obtener items de cada orden que pertenecen a este vendedor
    for (let order of orders) {
      const items = await executeQuery(`
        SELECT 
          oi.quantity,
          oi.price,
          p.id as productId,
          p.name as productName,
          p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND p.seller_id = ?
      `, [order.id, sellerId]);
      
      order.items = items;
      
      // Parsear shipping_address si es JSON string
      if (typeof order.shipping_address === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shipping_address);
        } catch (e) {
          order.shippingAddress = { street: order.shipping_address };
        }
      }
    }

    res.json({ orders });

  } catch (error) {
    console.error('Error obteniendo órdenes del vendedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
