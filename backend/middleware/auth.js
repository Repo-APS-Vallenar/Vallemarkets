import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe
    const users = await executeQuery('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};
