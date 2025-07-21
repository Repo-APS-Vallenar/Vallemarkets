import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'pyme',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'vallemarkets',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8_general_ci'
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
};

// Función para ejecutar queries
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

export default pool;
