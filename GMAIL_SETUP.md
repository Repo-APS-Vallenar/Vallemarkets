# 📧 CONFIGURACIÓN GMAIL - VALLEMARKETS

## PASOS PARA ACTIVAR EMAILS REALES:

### 1. Configurar Gmail App Password:
1. Ir a Google Account → Seguridad
2. Activar "Verificación en 2 pasos" (si no está)
3. Buscar "Contraseñas de aplicaciones"
4. Crear nueva contraseña para "Mail"
5. Copiar la contraseña generada (16 caracteres)

### 2. Actualizar .env:
```
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # App Password
```

### 3. PRUEBAS:
- Desarrollo: Emails de prueba en Ethereal
- Producción: Emails reales via Gmail

---

## ✅ ESTADO ACTUAL:
- ✅ Nodemailer instalado
- ✅ Templates de email listos
- ✅ Fallback a consola
- ⏳ Solo falta configurar Gmail

## 📝 EMAILS QUE SE ENVÍAN:
- ✅ Confirmación de orden
- ✅ Notificación a vendedor
- ✅ Estado de orden actualizado
- ✅ Orden completada
