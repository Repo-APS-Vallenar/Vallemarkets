import express from 'express';
import { executeQuery } from '../config/database.js';
import { randomUUID } from 'crypto';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Crear orden de prueba para testing del sistema de comisiones
router.post('/create-test-order', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { buyerId, sellerId, productId, quantity = 1, testPrice } = req.body;

    // Validar que existan el comprador y vendedor
    const buyer = await executeQuery('SELECT * FROM users WHERE id = ? AND role = "buyer"', [buyerId]);
    const seller = await executeQuery('SELECT * FROM users WHERE id = ? AND role = "seller"', [sellerId]);
    
    if (buyer.length === 0) {
      return res.status(400).json({ error: 'Comprador no encontrado' });
    }
    
    if (seller.length === 0) {
      return res.status(400).json({ error: 'Vendedor no encontrado' });
    }

    // Obtener o usar precio de prueba
    let product = null;
    let finalPrice = testPrice;
    
    if (productId) {
      const products = await executeQuery('SELECT * FROM products WHERE id = ?', [productId]);
      if (products.length > 0) {
        product = products[0];
        finalPrice = finalPrice || product.price;
      }
    }
    
    if (!finalPrice) {
      return res.status(400).json({ error: 'Debe especificar un precio de prueba o un producto válido' });
    }

    const orderId = randomUUID();
    const itemId = randomUUID();
    const total = finalPrice * quantity;

    // Crear la orden en estado 'accepted' para poder completarla inmediatamente
    await executeQuery(`
      INSERT INTO orders (
        id, user_id, total, status, payment_status, 
        shipping_address, payment_method, created_at, updated_at
      ) VALUES (?, ?, ?, 'accepted', 'paid', ?, 'test', NOW(), NOW())
    `, [
      orderId, 
      buyerId, 
      total, 
      JSON.stringify({
        street: 'Dirección de Prueba 123',
        city: 'Santiago',
        region: 'Metropolitana',
        postal_code: '8320000'
      })
    ]);

    // Crear el item de la orden
    await executeQuery(`
      INSERT INTO order_items (
        id, order_id, product_id, seller_id, quantity, price, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      itemId,
      orderId,
      productId || null,
      sellerId,
      quantity,
      finalPrice
    ]);

    res.json({
      message: 'Orden de prueba creada exitosamente',
      orderId,
      details: {
        buyer: buyer[0].name,
        seller: seller[0].name,
        total: total,
        status: 'accepted',
        product: product ? product.name : 'Producto de Prueba',
        quantity,
        price: finalPrice
      }
    });

  } catch (error) {
    console.error('Error creating test order:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Listar usuarios para facilitar el testing
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await executeQuery(`
      SELECT id, name, email, role, business_name, verified 
      FROM users 
      WHERE role IN ('buyer', 'seller')
      ORDER BY role, name
    `);

    const buyers = users.filter(u => u.role === 'buyer');
    const sellers = users.filter(u => u.role === 'seller');

    res.json({ buyers, sellers });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Listar productos para facilitar el testing
router.get('/products', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const products = await executeQuery(`
      SELECT p.id, p.name, p.price, p.stock, u.name as seller_name, u.business_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.stock > 0
      ORDER BY p.name
    `);

    res.json({ products });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
