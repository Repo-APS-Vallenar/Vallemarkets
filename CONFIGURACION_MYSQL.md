# 🛠️ Configuración de MySQL para el proyecto E-commerce

## Pasos para configurar MySQL:

### 1. Asegúrate de que MySQL esté instalado y ejecutándose

Si no tienes MySQL instalado:
- Descarga MySQL Community Server desde: https://dev.mysql.com/downloads/mysql/
- O instala XAMPP que incluye MySQL: https://www.apachefriends.org/

### 2. Verifica que el servicio esté ejecutándose

**Opción A - Si usas XAMPP:**
- Abre XAMPP Control Panel
- Inicia el servicio "MySQL"

**Opción B - Servicio de Windows:**
- Abre "Servicios" (services.msc)
- Busca "MySQL" y asegúrate de que esté ejecutándose

### 3. Configura las credenciales en el archivo .env

Edita el archivo `backend/.env` y ajusta estas líneas según tu configuración:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=ecommerce_db
DB_PORT=3306
```

### 4. Credenciales comunes por defecto:

**XAMPP:**
- Usuario: root
- Contraseña: (vacía, sin contraseña)
- Puerto: 3306

**MySQL Workbench/Community Server:**
- Usuario: root
- Contraseña: la que configuraste durante la instalación
- Puerto: 3306

### 5. Probar la conexión

Una vez configurado, ejecuta:
```bash
cd backend
npm run setup-db
```

### 6. Si tienes problemas de conexión:

**Error "Access denied":**
- Verifica usuario y contraseña
- Asegúrate de que el servicio MySQL esté ejecutándose

**Error "Connection refused":**
- Verifica que MySQL esté ejecutándose en el puerto correcto
- Revisa si hay firewall bloqueando la conexión

**Error "Unknown database":**
- Normal, el script creará la base de datos automáticamente

### 7. Crear usuario alternativo (opcional)

Si prefieres no usar root, puedes crear un usuario específico:

```sql
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

Luego actualiza el .env:
```env
DB_USER=ecommerce_user
DB_PASSWORD=tu_contraseña
```

## ¿Necesitas ayuda?

1. Verifica qué configuración de MySQL tienes
2. Actualiza el archivo .env con las credenciales correctas
3. Ejecuta `npm run setup-db` nuevamente
