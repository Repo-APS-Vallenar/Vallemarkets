import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const updateImageColumn = async () => {
  try {
    // Crear conexión
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vallemarkets',
      port: parseInt(process.env.DB_PORT) || 3306
    });

    console.log('🔌 Conectado a MySQL');

    // Actualizar el campo image en products
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN image TEXT
    `);

    console.log('✅ Campo image actualizado en la tabla products');

    // Actualizar el campo image en categories también por si acaso
    await connection.execute(`
      ALTER TABLE categories 
      MODIFY COLUMN image TEXT
    `);

    console.log('✅ Campo image actualizado en la tabla categories');

    await connection.end();
    console.log('🎉 Actualización completada exitosamente');

  } catch (error) {
    console.error('❌ Error actualizando la base de datos:', error);
    process.exit(1);
  }
};

updateImageColumn();
