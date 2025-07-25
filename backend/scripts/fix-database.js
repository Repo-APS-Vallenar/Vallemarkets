import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pyme',
      password: process.env.DB_PASSWORD || 'admin123',
      database: process.env.DB_NAME || 'vallemarkets'
    });

    console.log('🔧 Conectando a la base de datos...');

    // Agregar columnas faltantes
    const columns = [
      { name: 'auto_accept_at', type: 'TIMESTAMP NULL' },
      { name: 'expires_at', type: 'TIMESTAMP NULL' },
      { name: 'payment_id', type: 'VARCHAR(100) NULL' },
      { name: 'payment_method', type: 'VARCHAR(50) DEFAULT "mercadopago"' },
      { name: 'notes', type: 'TEXT NULL' },
      { name: 'rejection_reason', type: 'TEXT NULL' },
      { name: 'delivered_at', type: 'TIMESTAMP NULL' }
    ];

    for (const column of columns) {
      try {
        // Verificar si la columna existe
        const [rows] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?
        `, [process.env.DB_NAME || 'vallemarkets', column.name]);

        if (rows.length === 0) {
          // La columna no existe, agregarla
          await connection.execute(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.type}`);
          console.log('✅ Columna agregada:', column.name);
        } else {
          console.log('⚠️  Columna ya existe:', column.name);
        }
      } catch (error) {
        console.error('❌ Error con columna', column.name, ':', error.message);
      }
    }

    await connection.end();
    console.log('🎉 Base de datos actualizada correctamente!');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    process.exit(1);
  }
}

fixDatabase();
