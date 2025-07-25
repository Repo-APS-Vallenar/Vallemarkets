import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Script para crear usuario administrador
 */
async function createAdminUser() {
  try {
    console.log('🔍 Verificando si existe usuario administrador...');
    
    // Verificar si ya existe un admin
    const existingAdmin = await executeQuery(
      'SELECT id, email, role FROM users WHERE role = ? OR email = ?', 
      ['admin', 'admin@vallemarkets.cl']
    );
    
    if (existingAdmin.length > 0) {
      console.log('✅ Usuario administrador ya existe:');
      console.log(`   Email: ${existingAdmin[0].email}`);
      console.log(`   Role: ${existingAdmin[0].role}`);
      console.log(`   ID: ${existingAdmin[0].id}`);
      return;
    }
    
    console.log('🔨 Creando usuario administrador...');
    
    // Hashear password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Crear usuario admin
    const result = await executeQuery(`
      INSERT INTO users (
        name, email, password, role, 
        business_name, business_type, commission_rate, verified, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'Administrador Valle Markets',
      'admin@vallemarkets.cl',
      hashedPassword,
      'admin',
      'Valle Markets',
      'marketplace',
      0,
      true
    ]);
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email: admin@vallemarkets.cl');
    console.log('🔑 Password: admin123');
    console.log(`🆔 ID: ${result.insertId}`);
    
    // Verificar que se creó correctamente
    const verification = await executeQuery(
      'SELECT id, name, email, role, verified FROM users WHERE email = ?', 
      ['admin@vallemarkets.cl']
    );
    
    console.log('🔍 Verificación:');
    console.log(verification[0]);
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

// Ejecutar script
createAdminUser()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });
