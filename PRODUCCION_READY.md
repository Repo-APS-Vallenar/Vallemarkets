# 🚀 CONFIGURACIÓN DE PRODUCCIÓN - VALLEMARKETS

## ⚡ SETUP RÁPIDO (15 minutos)

### 1. MERCADOPAGO (5 minutos)
1. Ve a: https://www.mercadopago.cl/developers
2. Crea una aplicación llamada "Vallemarkets"
3. Copia las credenciales:

```env
# En backend/.env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
```

### 2. GMAIL SMTP (5 minutos)
1. Ve a: https://myaccount.google.com/security
2. Activa verificación en 2 pasos
3. Busca "Contraseñas de aplicaciones"
4. Crea una para "Mail"
5. Copia la contraseña (16 caracteres):

```env
# En backend/.env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 3. URLS DE PRODUCCIÓN (2 minutos)
```env
# En backend/.env
FRONTEND_URL=https://vallemarkets.vercel.app
BACKEND_URL=https://vallemarkets-backend.railway.app
NODE_ENV=production
```

### 4. SEGURIDAD (3 minutos)
```env
# En backend/.env - GENERAR UNA NUEVA
JWT_SECRET=super-clave-segura-aleatoria-de-64-caracteres-minimo-aqui
```

---

## 🔧 DEPLOY AUTOMÁTICO

### Opción A: Railway + Vercel (GRATIS)
```bash
# 1. Deploy backend en Railway
# - Conecta tu repo de GitHub
# - Selecciona carpeta /backend
# - Configura variables de entorno arriba

# 2. Deploy frontend en Vercel
npx vercel
# - Configura VITE_API_URL=https://tu-backend.railway.app
```

### Opción B: Solo local con credenciales reales
```bash
# Backend
cd backend
npm run dev

# Frontend
npm run dev
```

---

## ✅ CHECKLIST FINAL

- [ ] Credenciales MercadoPago configuradas
- [ ] Gmail SMTP configurado
- [ ] Variables de entorno actualizadas
- [ ] JWT_SECRET cambiado
- [ ] Base de datos arreglada ✅
- [ ] UI optimizada ✅
- [ ] SEO básico ✅

## 🎉 RESULTADO:
**VALLEMARKETS 100% FUNCIONAL Y LISTO PARA PRODUCCIÓN!**

## 🚀 PRÓXIMO PASO:
Configurar las credenciales y hacer el primer deploy!
