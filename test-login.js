// Script de prueba para verificar persistencia de sesión
console.log('🧪 Iniciando test de persistencia de sesión...');

// Función para hacer login
async function testLogin() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@ecommerce.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('📥 Respuesta del login:', data);

    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Datos guardados en localStorage');
      console.log('👤 Usuario:', data.user);
      
      // Verificar que los datos se guardaron
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      console.log('💾 Verificación localStorage:');
      console.log('  Token guardado:', !!savedToken);
      console.log('  Usuario guardado:', !!savedUser);
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('  Usuario parseado:', parsedUser);
      }
      
      alert('¡Login exitoso! Ahora recarga la página para probar la persistencia.');
    } else {
      console.error('❌ Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
}

// Ejecutar test
testLogin();

// También verificar localStorage actual
console.log('🔍 Estado actual del localStorage:');
console.log('  Token:', localStorage.getItem('token'));
console.log('  User:', localStorage.getItem('user'));
