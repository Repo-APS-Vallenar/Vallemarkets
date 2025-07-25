# 🏦 CONFIGURACIÓN MERCADOPAGO - VALLEMARKETS

## PASOS PARA ACTIVAR PAGOS REALES:

### 1. Crear cuenta MercadoPago (GRATIS):
👉 https://www.mercadopago.cl/developers

### 2. Obtener credenciales:
1. Ir a "Tus aplicaciones" 
2. Crear nueva aplicación
3. Nombre: "Vallemarkets"
4. Copiar las credenciales:

```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx-xxx-xxx  (Sandbox)
MERCADOPAGO_PUBLIC_KEY=TEST-xxx-xxx-xxx   (Sandbox)

# Para producción:
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx-xxx-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx-xxx-xxx
```

### 3. Actualizar .env:
Pegar las credenciales en:
- `backend/.env`

### 4. PRUEBAS:
- Sandbox: Usar tarjetas de prueba
- Producción: Tarjetas reales

## 💳 TARJETAS DE PRUEBA (SANDBOX):

### VISA (Aprobada):
- Número: 4170 0688 1010 8020
- Código: 123
- Vencimiento: 12/30

### MASTERCARD (Rechazada):
- Número: 5031 7557 3453 0604  
- Código: 123
- Vencimiento: 12/30

---

## ✅ ESTADO ACTUAL:
- ✅ SDK instalado
- ✅ Endpoints creados
- ✅ Frontend listo
- ⏳ Solo faltan credenciales reales
