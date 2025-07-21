import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

// Función para generar UUID
const generateUUID = () => {
  return randomUUID();
};

const createDatabase = async () => {
  let connection, dbConnection;
  
  try {
    // Primera conexión para crear la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pyme',
      password: process.env.DB_PASSWORD || 'admin123',
      port: parseInt(process.env.DB_PORT) || 3306
    });

    // Crear la base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${process.env.DB_NAME}' creada/verificada`);
    
    // Cerrar la primera conexión
    await connection.end();
    
    // Nueva conexión a la base de datos específica
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pyme',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'vallemarkets',
      port: parseInt(process.env.DB_PORT) || 3306
    });

    // Crear tabla de usuarios (usando auto_increment en lugar de UUID())
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
        avatar VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada');

    // Crear tabla de categorías
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla categories creada');

    // Crear tabla de productos
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(255),
        category_id VARCHAR(36),
        seller_id VARCHAR(36) NOT NULL,
        stock INT DEFAULT 0,
        status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla products creada');

    // Crear tabla de carrito
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `);
    console.log('✅ Tabla cart_items creada');

    // Crear tabla de órdenes
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla orders creada');

    // Crear tabla de items de órdenes
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla order_items creada');

    // Insertar datos de ejemplo
    await insertSampleData(dbConnection);

    console.log('🎉 ¡Base de datos configurada correctamente!');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
  } finally {
    if (dbConnection) await dbConnection.end();
    if (connection) await connection.end();
  }
};

const insertSampleData = async (connection) => {
  try {
    // Generar UUIDs para categorías
    const electronicsId = generateUUID();
    const ropaId = generateUUID();
    const hogarId = generateUUID();
    const deportesId = generateUUID();
    const librosId = generateUUID();

    // Insertar categorías de ejemplo con IDs específicos
    await connection.execute(`
      INSERT IGNORE INTO categories (id, name, description) VALUES 
      (?, 'Electrónicos', 'Dispositivos electrónicos y gadgets'),
      (?, 'Ropa', 'Ropa y accesorios de moda'),
      (?, 'Hogar', 'Artículos para el hogar y decoración'),
      (?, 'Deportes', 'Equipamiento deportivo y fitness'),
      (?, 'Libros', 'Libros y material educativo')
    `, [electronicsId, ropaId, hogarId, deportesId, librosId]);

    // Generar UUIDs para usuarios
    const adminId = generateUUID();
    const sellerId = generateUUID();
    const buyerId = generateUUID();

    // Insertar usuarios de ejemplo con IDs específicos
    await connection.execute(`
      INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
      (?, 'Admin', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
      (?, 'Vendedor Demo', 'seller@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller'),
      (?, 'Comprador Demo', 'buyer@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer')
    `, [adminId, sellerId, buyerId]);

    // Insertar algunos productos de ejemplo
    await connection.execute(`
      INSERT IGNORE INTO products (id, name, description, price, category_id, seller_id, stock, image) VALUES 
      (?, 'iPhone 15 Pro', 'El último iPhone con tecnología avanzada', 999.99, ?, ?, 10, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'),
      (?, 'Laptop Gaming', 'Laptop para gaming de alta gama', 1299.99, ?, ?, 5, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400'),
      (?, 'Camiseta Casual', 'Camiseta cómoda de algodón', 29.99, ?, ?, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
      (?, 'Sofá Moderno', 'Sofá de 3 plazas estilo moderno', 599.99, ?, ?, 3, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400')
    `, [
      generateUUID(), electronicsId, sellerId,
      generateUUID(), electronicsId, sellerId,
      generateUUID(), ropaId, sellerId,
      generateUUID(), hogarId, sellerId
    ]);

    console.log('✅ Datos de ejemplo insertados');
  } catch (error) {
    console.error('Error insertando datos de ejemplo:', error);
  }
};

// Ejecutar el script
createDatabase();
