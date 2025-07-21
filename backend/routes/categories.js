import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await executeQuery('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una categoría específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await executeQuery('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ category: categories[0] });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva categoría (solo admin)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('description').optional().trim(),
  body('image').optional().isURL().withMessage('URL de imagen inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, image } = req.body;

    // Verificar si la categoría ya existe
    const existingCategories = await executeQuery('SELECT * FROM categories WHERE name = ?', [name]);
    if (existingCategories.length > 0) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    // Crear la categoría con UUID generado
    const categoryId = randomUUID();
    await executeQuery('INSERT INTO categories (id, name, description, image) VALUES (?, ?, ?, ?)', [categoryId, name, description, image]);

    // Obtener la categoría creada
    const newCategories = await executeQuery('SELECT * FROM categories WHERE id = ?', [categoryId]);

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: newCategories[0]
    });

  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar categoría (solo admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('description').optional().trim(),
  body('image').optional().isURL().withMessage('URL de imagen inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, image } = req.body;

    // Verificar que la categoría existe
    const categories = await executeQuery('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const currentCategory = categories[0];

    // Actualizar la categoría
    await executeQuery(
      'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
      [
        name || currentCategory.name,
        description !== undefined ? description : currentCategory.description,
        image || currentCategory.image,
        id
      ]
    );

    // Obtener la categoría actualizada
    const updatedCategories = await executeQuery('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      message: 'Categoría actualizada exitosamente',
      category: updatedCategories[0]
    });

  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar categoría (solo admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const categories = await executeQuery('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si hay productos asociados
    const products = await executeQuery('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la categoría porque tiene productos asociados' });
    }

    // Eliminar la categoría
    await executeQuery('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ message: 'Categoría eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
