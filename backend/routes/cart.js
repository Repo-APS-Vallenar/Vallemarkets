import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Obtener carrito del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await executeQuery(`
      SELECT 
        ci.id as cartItemId,
        ci.quantity,
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.created_at DESC
    `, [userId]);

    // Calcular totales
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar producto al carrito
router.post('/add', authenticateToken, [
  body('productId').isUUID().withMessage('ID de producto inválido'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser un número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Verificar que el producto existe y está activo
    const products = await executeQuery('SELECT * FROM products WHERE id = ? AND status = "active"', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const product = products[0];

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Verificar si el producto ya está en el carrito
    const existingItems = await executeQuery('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

    if (existingItems.length > 0) {
      // Actualizar cantidad
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: 'No puedes agregar más de la cantidad disponible en stock' });
      }

      await executeQuery('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [newQuantity, userId, productId]);
    } else {
      // Agregar nuevo item con UUID generado
      const cartItemId = randomUUID();
      await executeQuery('INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)', [cartItemId, userId, productId, quantity]);
    }

    // Obtener carrito actualizado
    const cartItems = await executeQuery(`
      SELECT 
        ci.id as cartItemId,
        ci.quantity,
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.created_at DESC
    `, [userId]);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      message: 'Producto agregado al carrito',
      cart: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cantidad de un producto en el carrito
router.put('/update', authenticateToken, [
  body('productId').isUUID().withMessage('ID de producto inválido'),
  body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser un número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Verificar que el item está en el carrito
    const cartItems = await executeQuery('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    // Verificar stock disponible
    const products = await executeQuery('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0 || products[0].stock < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Actualizar cantidad
    await executeQuery('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);

    res.json({ message: 'Cantidad actualizada exitosamente' });

  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Remover producto del carrito
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await executeQuery('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json({ message: 'Producto removido del carrito' });

  } catch (error) {
    console.error('Error removiendo del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Limpiar carrito
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await executeQuery('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.json({ message: 'Carrito limpiado exitosamente' });

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
