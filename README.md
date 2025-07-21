# 🛒 E-commerce Platform

Una plataforma de comercio electrónico completa construida con React + TypeScript y Node.js + MySQL.

## 📋 Características

- ✅ **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- ✅ **Backend**: Node.js + Express + MySQL
- ✅ **Autenticación**: JWT con roles (buyer, seller, admin)
- ✅ **Gestión de productos**: CRUD completo
- ✅ **Carrito de compras**: Agregar, quitar, actualizar cantidades
- ✅ **Sistema de órdenes**: Checkout y seguimiento
- ✅ **Dashboard de vendedor**: Gestión de productos propios
- ✅ **Panel de administración**: Gestión completa

## 🚀 Configuración del Proyecto

### Prerrequisitos

- **Node.js** (v18 o superior)
- **MySQL** (v8.0 o superior)
- **npm** o **yarn**

### 1. Configurar MySQL

#### Opción A: XAMPP (Recomendado para desarrollo)
1. Descarga e instala [XAMPP](https://www.apachefriends.org/)
2. Abre XAMPP Control Panel
3. Inicia el servicio "MySQL"
4. Las credenciales por defecto son:
   - Usuario: `root`
   - Contraseña: (vacía)
   - Puerto: `3306`

#### Opción B: MySQL Community Server
1. Descarga e instala [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. Durante la instalación, configura la contraseña para el usuario `root`
3. Asegúrate de que el servicio esté ejecutándose

### 2. Configurar el Backend

1. **Navega a la carpeta del backend:**
   ```bash
   cd backend
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   
   Edita el archivo `backend/.env` con tus credenciales de MySQL:
   ```env
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_aqui
   DB_NAME=ecommerce_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=tu_clave_secreta_super_segura_aqui
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Configura la base de datos:**
   ```bash
   npm run setup-db
   ```
   
   Este comando creará automáticamente:
   - La base de datos `ecommerce_db`
   - Todas las tablas necesarias
   - Datos de ejemplo para testing

5. **Inicia el servidor backend:**
   ```bash
   npm run dev
   ```
   
   El backend estará disponible en: `http://localhost:3001`

### 3. Configurar el Frontend

1. **Instala las dependencias del frontend:**
   ```bash
   npm install
   ```

2. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   
   El frontend estará disponible en: `http://localhost:5173`

## 🎯 Uso del Proyecto

### Credenciales de Prueba

El sistema viene con usuarios de ejemplo:

**Administrador:**
- Email: `admin@ecommerce.com`
- Contraseña: `password`

**Vendedor:**
- Email: `seller@demo.com`
- Contraseña: `password`

**Comprador:**
- Email: `buyer@demo.com`
- Contraseña: `password`

### Funcionalidades por Rol

#### 🛍️ **Comprador (Buyer)**
- Navegar y buscar productos
- Filtrar por categorías y precios
- Agregar productos al carrito
- Realizar checkout y crear órdenes
- Ver historial de órdenes
- Gestionar perfil

#### 🏪 **Vendedor (Seller)**
- Todo lo del comprador +
- Crear y gestionar productos propios
- Ver dashboard de ventas
- Gestionar inventario
- Actualizar estados de órdenes

#### 👑 **Administrador (Admin)**
- Todo lo anterior +
- Gestionar todos los productos
- Gestionar categorías
- Ver todas las órdenes
- Gestionar usuarios
- Actualizar estados de pago

## 🛠️ Comandos Útiles

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Verificar código
```

### Backend
```bash
npm run dev        # Servidor de desarrollo con nodemon
npm start          # Servidor de producción
npm run setup-db   # Configurar base de datos
```

### VS Code Tasks
En VS Code puedes usar las tareas predefinidas:
- `Ctrl+Shift+P` → "Tasks: Run Task"
- **Dev Server**: Inicia el frontend
- **Backend Server**: Inicia el backend
- **Setup Database**: Configura la base de datos

## 📁 Estructura del Proyecto

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Context API (Auth, Cart, Orders)
│   │   ├── services/          # Servicios de API
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── config/               # Configuración de DB
│   ├── middleware/           # Middlewares de Express
│   ├── routes/               # Rutas de la API
│   ├── scripts/              # Scripts de utilidad
│   ├── server.js             # Servidor principal
│   ├── package.json
│   └── .env
└── README.md
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales:
- **users**: Usuarios del sistema
- **categories**: Categorías de productos
- **products**: Productos del e-commerce
- **cart_items**: Items del carrito de compras
- **orders**: Órdenes de compra
- **order_items**: Items de las órdenes

## 🔧 Desarrollo

### Agregar Nuevas Funcionalidades

1. **Frontend**: Crear componentes en `src/components/`
2. **Backend**: Agregar rutas en `backend/routes/`
3. **Base de datos**: Modificar scripts en `backend/scripts/`

### API Endpoints

Base URL: `http://localhost:3001/api`

#### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile` - Obtener perfil
- `PUT /auth/profile` - Actualizar perfil

#### Productos
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `POST /products` - Crear producto (seller+)
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

#### Carrito
- `GET /cart` - Obtener carrito
- `POST /cart/add` - Agregar al carrito
- `PUT /cart/update` - Actualizar cantidad
- `DELETE /cart/remove/:id` - Remover del carrito

#### Órdenes
- `GET /orders` - Obtener órdenes del usuario
- `POST /orders` - Crear nueva orden
- `GET /orders/:id` - Obtener orden específica

## 🐛 Troubleshooting

### Error de Conexión a MySQL
```
Error: Access denied for user 'root'@'localhost'
```
**Solución:** Verifica las credenciales en el archivo `.env`

### Puerto en Uso
```
Error: Port 3001 is already in use
```
**Solución:** Mata el proceso o cambia el puerto en `.env`

### CORS Error
```
Access to fetch at 'http://localhost:3001' blocked by CORS
```
**Solución:** Verifica que el backend esté ejecutándose y las URLs sean correctas

## 📝 Próximas Mejoras

- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Notificaciones en tiempo real
- [ ] Sistema de reviews y ratings
- [ ] Chat en vivo
- [ ] Análisis y métricas
- [ ] Multi-idioma
- [ ] PWA (Progressive Web App)

## 📄 Licencia

Este proyecto es para fines educativos y de desarrollo.
# Vallemarkets
