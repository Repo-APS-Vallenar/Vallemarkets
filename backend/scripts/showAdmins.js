import { executeQuery } from '../config/database.js';

/**
 * Script para mostrar información de usuarios admin
 */
async function showAdminUsers() {
  try {
    console.log('🔍 Buscando usuarios administradores...');
    
    const admins = await executeQuery(
      'SELECT id, name, email, role, business_name, verified, created_at FROM users WHERE role = ?', 
      ['admin']
    );
    
    if (admins.length === 0) {
      console.log('❌ No se encontraron usuarios administradores');
      return;
    }
    
    console.log(`✅ Encontrados ${admins.length} administrador(es):`);
    console.log('='.repeat(60));
    
    admins.forEach((admin, index) => {
      console.log(`👤 Admin ${index + 1}:`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👤 Nombre: ${admin.name}`);
      console.log(`   🏢 Negocio: ${admin.business_name || 'N/A'}`);
      console.log(`   ✅ Verificado: ${admin.verified}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   📅 Creado: ${admin.created_at}`);
      console.log('-'.repeat(40));
    });
    
    console.log('\n🔑 Para iniciar sesión usa:');
    console.log(`   Email: ${admins[0].email}`);
    console.log(`   Password: [la contraseña configurada]`);
    
  } catch (error) {
    console.error('❌ Error consultando administradores:', error);
    throw error;
  }
}

// Ejecutar script
showAdminUsers()
  .then(() => {
    console.log('\n🎉 Consulta completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
