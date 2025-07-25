import express from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Subir imagen
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se ha proporcionado ningún archivo' 
      });
    }

    // URL de la imagen subida
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al subir la imagen' 
    });
  }
});

// Eliminar imagen
router.delete('/delete/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Archivo no encontrado' 
      });
    }

    // Eliminar el archivo
    fs.unlinkSync(filePath);

    res.json({
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al eliminar la imagen' 
    });
  }
});

export default router;
