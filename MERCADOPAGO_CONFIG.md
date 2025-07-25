# 🔥 CONFIGURACIÓN MERCADOPAGO RÁPIDA

## 📋 PASOS A SEGUIR:

### 1. En tu navegador (https://www.mercadopago.cl/developers):
1. **Crear cuenta o iniciar sesión**
2. **Ir a "Tus aplicaciones"**
3. **Crear nueva aplicación:**
   - Nombre: `Vallemarkets`
   - Modelo de negocio: `Marketplace`
   - Categoría: `Otros`

### 2. Obtener credenciales:
Una vez creada la app, verás:

**MODO SANDBOX (para pruebas):**
```
Public Key: TEST-xxx-xxx-xxx
Access Token: TEST-xxx-xxx-xxx
```

**MODO PRODUCCIÓN (para real):**
```
Public Key: APP_USR-xxx-xxx-xxx
Access Token: APP_USR-xxx-xxx-xxx
```

### 3. Pegar aquí las credenciales cuando las tengas:

**SANDBOX (para empezar):**
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx-xxx-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx-xxx-xxx
```

**PRODUCCIÓN (cuando estés listo):**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx-xxx-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx-xxx-xxx
```

---

## ⚡ TARJETAS DE PRUEBA (SANDBOX):

### ✅ APROBADA:
- **Número:** 4170 0688 1010 8020
- **CVV:** 123
- **Vencimiento:** 12/30
- **Nombre:** APRO

### ❌ RECHAZADA:
- **Número:** 5031 7557 3453 0604
- **CVV:** 123
- **Vencimiento:** 12/30
- **Nombre:** OTHE

---

## 🎯 SIGUIENTE PASO:
1. Obtén las credenciales de MercadoPago
2. Las pegamos en el .env
3. ¡Probamos el pago completo!

**¿Ya tienes las credenciales? ¡Compártelas y las configuramos! 🚀**
