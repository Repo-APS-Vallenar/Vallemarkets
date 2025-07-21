import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Obtener todos los productos con filtros
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Precio máximo inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, search, minPrice, maxPrice } = req.query;

    let whereConditions = ['p.status = "active"'];
    let queryParams = [];

    if (category) {
      whereConditions.push('c.name = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (minPrice) {
      whereConditions.push('p.price >= ?');
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      whereConditions.push('p.price <= ?');
      queryParams.push(maxPrice);
    }

    const whereClause = whereConditions.join(' AND ');

    // Consulta principal con paginación
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category,
        p.created_at
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const products = await executeQuery(query, [...queryParams, limit, offset]);

    // Contar total de productos para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;

    const [countResult] = await executeQuery(countQuery, queryParams);
    const total = countResult.total;

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const products = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category,
        p.created_at
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = "active"
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ product: products[0] });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo producto (solo vendedores)
router.post('/', authenticateToken, authorizeRoles('seller', 'admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('description').trim().isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  body('price').isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
  body('categoryId').isUUID().withMessage('ID de categoría inválido'),
  body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número no negativo'),
  body('image').optional().isURL().withMessage('URL de imagen inválida')
], async (req, res) => {
  try {
    console.log('=== CREANDO PRODUCTO ===');
    console.log('Body recibido:', req.body);
    console.log('Usuario:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, categoryId, stock, image } = req.body;
    const sellerId = req.user.id;

    // Verificar que la categoría existe
    const categories = await executeQuery('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (categories.length === 0) {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }

    // Crear el producto con UUID generado
    const productId = randomUUID();
    await executeQuery(
      'INSERT INTO products (id, name, description, price, category_id, seller_id, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [productId, name, description, price, categoryId, sellerId, stock, image]
    );

    // Obtener el producto creado
    const newProducts = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category,
        p.created_at
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [productId]);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProducts[0]
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar producto (solo el vendedor propietario)
router.put('/:id', authenticateToken, authorizeRoles('seller', 'admin'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  body('price').optional().isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock debe ser un número no negativo'),
  body('image').optional().isURL().withMessage('URL de imagen inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price, stock, image } = req.body;
    const userId = req.user.id;

    // Verificar que el producto existe y pertenece al usuario (o es admin)
    const products = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (req.user.role !== 'admin' && products[0].seller_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este producto' });
    }

    // Actualizar el producto
    const currentProduct = products[0];
    await executeQuery(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ? WHERE id = ?',
      [
        name || currentProduct.name,
        description || currentProduct.description,
        price || currentProduct.price,
        stock !== undefined ? stock : currentProduct.stock,
        image || currentProduct.image,
        id
      ]
    );

    // Obtener el producto actualizado
    const updatedProducts = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.seller_id as sellerId,
        u.name as sellerName,
        c.name as category,
        p.updated_at
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProducts[0]
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto (solo el vendedor propietario)
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el producto existe y pertenece al usuario (o es admin)
    const products = await executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (req.user.role !== 'admin' && products[0].seller_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este producto' });
    }

    // Marcar producto como inactivo en lugar de eliminarlo físicamente
    await executeQuery('UPDATE products SET status = "inactive" WHERE id = ?', [id]);

    res.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener productos del vendedor autenticado
router.get('/seller/my-products', authenticateToken, authorizeRoles('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await executeQuery(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.stock,
        p.status,
        c.name as category,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [sellerId, limit, offset]);

    // Contar total
    const [countResult] = await executeQuery('SELECT COUNT(*) as total FROM products WHERE seller_id = ?', [sellerId]);
    const total = countResult.total;

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos del vendedor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
