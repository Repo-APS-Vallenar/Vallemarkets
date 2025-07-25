import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';
import CommissionServiceV2 from '../services/CommissionServiceV2.js';
import { OrderService } from '../services/OrderService.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Dashboard de admin - estadísticas generales
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Estadísticas de usuarios
    const userStats = await executeQuery(`
      SELECT 
        role,
        COUNT(*) as count,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_count
      FROM users 
      GROUP BY role
    `);

    // Estadísticas de productos
    const productStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_stock,
        AVG(price) as avg_price,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_products
      FROM products
    `);

    // Estadísticas de órdenes
    const orderStats = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total) as total_amount
      FROM orders 
      GROUP BY status
    `);

    // Estadísticas de comisiones
    const commissionStats = await CommissionServiceV2.getCommissionStats();

    // Ingresos por día (últimos 30 días)
    const dailyRevenue = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as daily_revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      users: userStats,
      products: productStats[0] || {},
      orders: orderStats,
      commissions: commissionStats,
      dailyRevenue
    });

  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Gestionar vendedores
router.get('/sellers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const sellers = await executeQuery(`
      SELECT 
        u.id, u.email, u.name, u.business_name, u.business_type, 
        u.commission_rate, u.verified, u.created_at,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        SUM(o.total) as total_sales,
        SUM(CASE WHEN c.status = 'pending' THEN c.commission_amount ELSE 0 END) as pending_commissions
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN commissions c ON u.id = c.seller_id
      LEFT JOIN orders o ON c.order_id = o.id
      WHERE u.role = 'seller'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json(sellers);
  } catch (error) {
    console.error('Error getting sellers:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar configuración de vendedor
router.put('/sellers/:id', authenticateToken, authorizeRoles('admin'), [
  body('commission_rate').isFloat({ min: 0, max: 50 }).withMessage('Comisión debe estar entre 0% y 50%'),
  body('verified').isBoolean().withMessage('Verificación debe ser true o false'),
  body('business_name').optional().trim().isLength({ min: 2 }).withMessage('Nombre de negocio muy corto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { commission_rate, verified, business_name, business_type } = req.body;

    await executeQuery(`
      UPDATE users 
      SET commission_rate = ?, verified = ?, business_name = ?, business_type = ?
      WHERE id = ? AND role = 'seller'
    `, [commission_rate, verified, business_name, business_type, id]);

    res.json({ message: 'Vendedor actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener productos pendientes de aprobación
router.get('/products/pending', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const products = await executeQuery(`
      SELECT 
        p.*, 
        u.business_name as seller_business,
        u.email as seller_email,
        c.name as category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
    `);

    res.json(products);
  } catch (error) {
    console.error('Error getting pending products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Aprobar producto
router.put('/products/:id/approve', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await executeQuery('UPDATE products SET status = "active" WHERE id = ?', [id]);
    
    res.json({ message: 'Producto aprobado exitosamente' });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rechazar producto
router.put('/products/:id/reject', authenticateToken, authorizeRoles('admin'), [
  body('reason').trim().isLength({ min: 10 }).withMessage('Debe proporcionar una razón de al menos 10 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    
    await executeQuery('UPDATE products SET status = "rejected", rejection_reason = ? WHERE id = ?', [reason, id]);
    
    res.json({ message: 'Producto rechazado' });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las órdenes para administración
router.get('/orders', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        o.*,
        u.email as buyer_email,
        u.name as buyer_name,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    let params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ` 
      GROUP BY o.id 
      ORDER BY o.created_at DESC 
      LIMIT ?
    `;
    params.push(parseInt(limit));
    
    const orders = await executeQuery(query, params);
    
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Configurar PyMEs piloto (para tus 5 negocios)
router.post('/pilot/configure', authenticateToken, authorizeRoles('admin'), [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('business_name').trim().isLength({ min: 2 }).withMessage('Nombre de negocio requerido'),
  body('business_type').isIn(['neighborhood_store', 'liquor_store', 'other']).withMessage('Tipo de negocio inválido'),
  body('commission_rate').isFloat({ min: 0, max: 10 }).withMessage('Comisión debe estar entre 0% y 10% para pilotos')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, business_name, business_type, commission_rate } = req.body;
    
    // Buscar al usuario por email
    const user = await executeQuery('SELECT id FROM users WHERE email = ? AND role = "seller"', [email]);
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    // Configurar como PyME piloto
    await executeQuery(`
      UPDATE users 
      SET business_name = ?, business_type = ?, commission_rate = ?, verified = TRUE
      WHERE id = ?
    `, [business_name, business_type, commission_rate, user[0].id]);

    res.json({ 
      message: 'PyME piloto configurada exitosamente',
      sellerId: user[0].id,
      configuration: {
        business_name,
        business_type,
        commission_rate,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error configuring pilot seller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Completar orden (marcar como entregada y calcular comisiones)
router.put('/orders/:orderId/complete', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { orderId } = req.params;

    await OrderService.completeOrder(orderId);

    res.json({ 
      message: 'Orden completada exitosamente y comisiones calculadas',
      orderId 
    });

  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
});

// Obtener órdenes pendientes de completar
router.get('/orders/pending-completion', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await executeQuery(`
      SELECT 
        o.id, 
        o.total,
        o.created_at,
        o.status,
        u.name as buyer_name,
        u.email as buyer_email,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'accepted'
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({ orders });

  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
