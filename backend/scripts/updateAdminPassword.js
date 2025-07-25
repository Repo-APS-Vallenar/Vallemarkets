import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Script para actualizar contraseña del administrador
 */
async function updateAdminPassword() {
  try {
    const adminEmail = 'admin@ecommerce.com';
    const newPassword = 'admin123';
    
    console.log('🔍 Buscando usuario administrador...');
    
    const admin = await executeQuery(
      'SELECT id, email, name FROM users WHERE email = ? AND role = ?', 
      [adminEmail, 'admin']
    );
    
    if (admin.length === 0) {
      console.log('❌ Usuario administrador no encontrado');
      return;
    }
    
    console.log(`✅ Administrador encontrado: ${admin[0].name}`);
    console.log('🔐 Actualizando contraseña...');
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y verificar usuario
    await executeQuery(`
      UPDATE users 
      SET password = ?, verified = 1, updated_at = NOW()
      WHERE email = ? AND role = ?
    `, [hashedPassword, adminEmail, 'admin']);
    
    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('='.repeat(50));
    console.log('🔑 CREDENCIALES DE ADMINISTRADOR:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${newPassword}`);
    console.log('='.repeat(50));
    console.log('\n🌐 Acceso al dashboard:');
    console.log('   Frontend: http://localhost:5174/dashboard/admin');
    console.log('   (o http://localhost:5173/dashboard/admin si corre en puerto 5173)');
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    throw error;
  }
}

// Ejecutar script
updateAdminPassword()
  .then(() => {
    console.log('\n🎉 Actualización completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
