// Script para hacer login automático como vendedor
console.log('🔐 Haciendo login como vendedor...');

// Datos de login para un vendedor
const loginData = {
  email: 'almacen.maria@vallemarkets.cl',
  password: 'maria123'
};

async function loginAsSeller() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    console.log('📥 Respuesta del login:', data);

    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Login exitoso como vendedor');
      console.log('👤 Usuario:', data.user);
      
      // Redirigir al dashboard de vendedor
      window.location.href = '/dashboard/vendedor';
    } else {
      console.error('❌ Error en login:', data);
    }
  } catch (error) {
    console.error('❌ Error en petición:', error);
  }
}

loginAsSeller();
