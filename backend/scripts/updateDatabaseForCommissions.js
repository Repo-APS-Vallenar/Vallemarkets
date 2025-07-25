import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'pyme',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'vallemarkets',
  port: parseInt(process.env.DB_PORT) || 3306,
};

const updateDatabaseForCommissions = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔄 Conectado a la base de datos, actualizando para sistema de comisiones...');

    // Agregar campos para comisiones a users
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 5.00,
        ADD COLUMN verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN business_name VARCHAR(255),
        ADD COLUMN business_type ENUM('neighborhood_store', 'liquor_store', 'other') DEFAULT 'other'
      `);
      console.log('✅ Campos agregados a tabla users');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Campos ya existen en tabla users');
      } else {
        console.log('⚠️ Error agregando campos a users:', error.message);
      }
    }

    // Crear tabla de comisiones
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS commissions (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        seller_id VARCHAR(36) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        commission_rate DECIMAL(5,2) NOT NULL,
        order_total DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_seller_id (seller_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Tabla commissions creada');

    // Crear tabla de pagos de comisiones
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS commission_payments (
        id VARCHAR(36) PRIMARY KEY,
        seller_id VARCHAR(36) NOT NULL,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_commissions DECIMAL(10,2) NOT NULL,
        total_sales DECIMAL(10,2) NOT NULL,
        payment_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'paid', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        INDEX idx_seller_id (seller_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Tabla commission_payments creada');

    // Agregar campo status a productos si no existe
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN status ENUM('pending', 'active', 'rejected') DEFAULT 'active',
        ADD COLUMN rejection_reason TEXT
      `);
      console.log('✅ Campos de status agregados a productos');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Campos de status ya existen en productos');
      } else {
        console.log('⚠️ Error agregando campos a productos:', error.message);
      }
    }

    // Actualizar vendedores existentes con datos de PyMEs piloto
    const [sellers] = await connection.execute('SELECT id, email, name FROM users WHERE role = "seller"');
    
    if (sellers.length > 0) {
      console.log(`🔄 Actualizando ${sellers.length} vendedores existentes...`);
      
      for (const seller of sellers) {
        // Asignar tipo de negocio basado en email o crear datos de ejemplo
        let businessType = 'other';
        let businessName = seller.name || 'Negocio Local';
        let commissionRate = 0.00; // 0% para piloto los primeros 30 días
        
        if (seller.email.includes('botilleria') || seller.email.includes('liquor')) {
          businessType = 'liquor_store';
          businessName = 'Botillería ' + (seller.name || 'Piloto');
        } else if (seller.email.includes('negocio') || seller.email.includes('barrio') || seller.email.includes('almacen')) {
          businessType = 'neighborhood_store';
          businessName = 'Negocio de Barrio ' + (seller.name || 'Piloto');
        }

        await connection.execute(`
          UPDATE users 
          SET business_type = ?, business_name = ?, commission_rate = ?, verified = TRUE
          WHERE id = ?
        `, [businessType, businessName, commissionRate, seller.id]);
      }
      console.log('✅ Vendedores actualizados con datos de negocio');
    }

    // Crear usuario admin si no existe
    const [adminUsers] = await connection.execute('SELECT id FROM users WHERE role = "admin"');
    
    if (adminUsers.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO users (id, email, password, name, role, verified, created_at)
        VALUES (?, 'admin@vallemarkets.cl', ?, 'Administrador Valle Markets', 'admin', TRUE, NOW())
      `, [adminId, hashedPassword]);
      
      console.log('✅ Usuario admin creado: admin@vallemarkets.cl / admin123');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    console.log('🎉 Base de datos actualizada exitosamente para sistema de comisiones');
    
  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

// Ejecutar
updateDatabaseForCommissions();
