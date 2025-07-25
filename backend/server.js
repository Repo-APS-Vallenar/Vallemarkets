import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import setupCronJobs from './utils/cronJobs.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';
import testingRoutes from './routes/testing.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/payments.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/testing', testingRoutes);

// Ruta de salud
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API E-commerce Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Advertencia: No se pudo conectar a la base de datos');
      console.log('   Asegúrate de que MySQL esté ejecutándose y las credenciales sean correctas');
      console.log('   Revisa el archivo .env para la configuración de la base de datos');
    }

    app.listen(PORT, () => {
      console.log('🚀 Servidor backend iniciado exitosamente');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 API Docs: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Base de datos: ${dbConnected ? '✅ Conectada' : '❌ Desconectada'}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
      console.log('📝 Endpoints disponibles:');
      console.log('   GET  /api/health          - Estado del servidor');
      console.log('   POST /api/auth/register   - Registro de usuario');
      console.log('   POST /api/auth/login      - Inicio de sesión');
      console.log('   GET  /api/products        - Listar productos');
      console.log('   GET  /api/categories      - Listar categorías');
      console.log('   GET  /api/cart            - Ver carrito');
      console.log('   GET  /api/orders          - Ver órdenes');
      console.log('   POST /api/webhooks/mercadopago - Webhook MercadoPago');
      console.log('');

      // Configurar trabajos programados
      setupCronJobs();
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

startServer();
