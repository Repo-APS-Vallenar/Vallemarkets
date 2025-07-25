# 🚀 DEPLOY VALLEMARKETS - GUÍA COMPLETA

## OPCIÓN 1: DEPLOY RÁPIDO (Gratis)

### Frontend (Vercel):
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy desde la carpeta raíz
vercel

# 3. Configurar variables de entorno en Vercel dashboard:
VITE_API_URL=https://tu-backend-url.railway.app
```

### Backend (Railway):
```bash
# 1. Crear cuenta en railway.app
# 2. Conectar GitHub repo
# 3. Seleccionar carpeta 'backend'
# 4. Configurar variables de entorno:

DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=railway
DB_PORT=3306

JWT_SECRET=tu-clave-super-segura-de-produccion
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-gmail
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
FRONTEND_URL=https://tu-app.vercel.app
BACKEND_URL=https://tu-backend.railway.app
NODE_ENV=production
```

### Base de Datos (Railway MySQL):
1. Crear servicio MySQL en Railway
2. Copiar credenciales de conexión
3. Ejecutar script de inicialización

---

## OPCIÓN 2: DEPLOY PROFESIONAL

### Frontend (Netlify/Vercel Pro):
- CDN global
- SSL automático
- Deploy previews
- Analytics

### Backend (AWS/DigitalOcean):
- PM2 para procesos
- Nginx como proxy
- SSL con Let's Encrypt
- Logs centralizados

### Base de Datos (AWS RDS/PlanetScale):
- Backups automáticos
- Alta disponibilidad
- Escalabilidad

---

## 📋 CHECKLIST PRE-DEPLOY:

### Seguridad:
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET aleatorio y seguro
- [ ] Rate limiting activado
- [ ] Validación de datos robusta

### Performance:
- [ ] Compresión gzip
- [ ] Cache de assets
- [ ] Optimización de imágenes
- [ ] Lazy loading

### Monitoreo:
- [ ] Logs estructurados
- [ ] Health checks
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)

---

## 🎯 SIGUIENTE PASO:
1. **Configurar MercadoPago** (5 min)
2. **Configurar Gmail** (3 min)
3. **Deploy a Railway + Vercel** (15 min)
4. **Probar en producción** (10 min)

**Total: 33 minutos para estar live! 🚀**
