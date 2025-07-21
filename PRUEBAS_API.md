# 🧪 Pruebas del API E-commerce

## Credenciales de Prueba

El sistema viene con usuarios predefinidos para hacer pruebas:

**Administrador:**
- Email: `admin@ecommerce.com`
- Contraseña: `password`

**Vendedor:**
- Email: `seller@demo.com`  
- Contraseña: `password`

**Comprador:**
- Email: `buyer@demo.com`
- Contraseña: `password`

## Endpoints para Probar

### 1. Salud del API
```bash
curl http://localhost:3001/api/health
```

### 2. Login (obtener token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@demo.com",
    "password": "password"
  }'
```

### 3. Registro de nuevo usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Usuario",
    "email": "nuevo@test.com",
    "password": "123456",
    "role": "seller",
    "phone": "1234567890",
    "address": "Mi dirección de prueba"
  }'
```

### 4. Ver categorías
```bash
curl http://localhost:3001/api/categories
```

### 5. Ver productos
```bash
curl http://localhost:3001/api/products
```

### 6. Crear producto (necesita token de vendedor)
```bash
# Primero obtén el token haciendo login como vendedor
# Luego usa el token en la cabecera Authorization

curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Mi Producto de Prueba",
    "description": "Este es un producto de prueba creado desde la API",
    "price": 99.99,
    "categoryId": "ID_DE_CATEGORIA_AQUI",
    "stock": 10,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  }'
```

## 📝 Notas importantes:

1. **Tokens JWT**: Cuando hagas login, copia el token de la respuesta y úsalo en las peticiones que requieren autenticación.

2. **IDs de Categorías**: Usa el endpoint `/api/categories` para obtener los IDs de las categorías antes de crear productos.

3. **Roles**: 
   - `buyer`: Solo puede comprar
   - `seller`: Puede vender y comprar
   - `admin`: Acceso completo

4. **CORS**: El backend está configurado para aceptar peticiones desde `http://localhost:5173` (frontend).

## 🚀 Próximos pasos:

1. Prueba el login en el frontend
2. Crea productos como vendedor
3. Haz pruebas de compra como comprador
4. Explora todas las funcionalidades

¡Tu plataforma e-commerce ya está lista para usar! 🎉
