import fetch from 'node-fetch';

/**
 * Script para probar login del administrador
 */
async function testAdminLogin() {
  try {
    console.log('🔍 Probando login del administrador...');
    
    const loginData = {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    };
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', JSON.stringify(data.user, null, 2));
      console.log('🔑 Token generado:', data.token ? 'Sí' : 'No');
      
      // Verificar role
      if (data.user.role === 'admin') {
        console.log('✅ Role de admin confirmado');
      } else {
        console.log('❌ Role incorrecto:', data.user.role);
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Error en login:', error);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

// Ejecutar prueba
testAdminLogin()
  .then(() => {
    console.log('\n🎉 Prueba completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
