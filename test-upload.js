// Test del endpoint de upload
console.log('🧪 Probando endpoint de upload...');

async function testUploadEndpoint() {
  try {
    // Primero hacer login para obtener token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'almacen.maria@vallemarkets.cl',
        password: 'maria123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔐 Login exitoso:', loginData.user);

    if (!loginData.token) {
      throw new Error('No se obtuvo token');
    }

    // Crear un archivo de prueba (simular)
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 100, 100);

    // Convertir canvas a blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('image', blob, 'test-image.png');

      console.log('📤 Enviando imagen de prueba...');

      const uploadResponse = await fetch('http://localhost:3001/api/upload/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        },
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      console.log('📥 Resultado del upload:', uploadResult);

      if (uploadResult.imageUrl) {
        console.log('✅ Upload exitoso!');
        console.log('🖼️ URL de imagen:', uploadResult.imageUrl);
      } else {
        console.error('❌ Upload falló:', uploadResult);
      }
    }, 'image/png');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testUploadEndpoint();
