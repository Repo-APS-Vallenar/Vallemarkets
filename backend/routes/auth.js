import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Función para generar JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Registro de usuario
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').optional().isIn(['buyer', 'seller']).withMessage('Rol inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'buyer', phone, address } = req.body;

    // Verificar si el usuario ya existe
    const existingUsers = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con UUID generado - convertir undefined a null
    const userId = randomUUID();
    await executeQuery(
      'INSERT INTO users (id, name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, role, phone || null, address || null]
    );

    // Obtener el usuario creado
    const newUsers = await executeQuery('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?', [userId]);
    const user = newUsers[0];

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar el usuario
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('phone').optional().trim(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address } = req.body;
    const userId = req.user.id;

    await executeQuery(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name || req.user.name, phone !== undefined ? phone : req.user.phone, address !== undefined ? address : req.user.address, userId]
    );

    const updatedUsers = await executeQuery('SELECT id, name, email, role, phone, address FROM users WHERE id = ?', [userId]);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUsers[0]
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
