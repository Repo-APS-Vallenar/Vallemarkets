# 🧪 Guía de Pruebas MercadoPago - VALLEMARKETS

## ✅ Estado de Configuración
- **Public Key**: `TEST-6b3c2c85-0b4a-4b8e-ab7c-3cf603de8b2e`
- **Access Token**: `TEST-8138401743011005-071711-361c8ba062b4c5a5bac5df8ccd9c84f2-512145211`
- **Entorno**: SANDBOX (Pruebas)
- **Backend**: ✅ Configurado
- **Frontend**: ✅ Configurado

## 💳 Tarjetas de Prueba Disponibles

### Tarjetas de Crédito
| Marca | Número | CVV | Fecha |
|-------|--------|-----|-------|
| **Mastercard** | 5416 7526 0258 2580 | 123 | 11/30 |
| **Visa** | 4168 8188 4444 7115 | 123 | 11/30 |
| **American Express** | 3757 781744 61804 | 1234 | 11/30 |

### Tarjetas de Débito
| Marca | Número | CVV | Fecha |
|-------|--------|-----|-------|
| **Mastercard Débito** | 5241 0198 2664 6950 | 123 | 11/30 |
| **Visa Débito** | 4023 6535 2391 4373 | 123 | 11/30 |

## 👤 Usuarios de Prueba
- **Vendedor**: TESTUSER200296614 (Contraseña: 5oQugCq5ON)
- **Comprador**: TESTUSER79298402 (Contraseña: OZwsHDlR71)

## 🔬 Pasos para Probar el Sistema

### 1. Preparación
```bash
# Frontend: http://localhost:5174/
# Backend: http://localhost:3001/
```

### 2. Flujo de Compra Completo
1. **Registro/Login** en la aplicación
2. **Agregar productos** al carrito
3. **Ir al checkout**
4. **Seleccionar método de pago**
5. **Usar tarjeta de prueba**
6. **Completar el pago**
7. **Verificar confirmación**

### 3. Verificación de Estados
- ✅ **approved**: Pago aprobado
- ❌ **rejected**: Pago rechazado
- ⏳ **pending**: Pago pendiente
- 🔄 **in_process**: En proceso

## 🚀 Endpoints de Prueba

### Crear Preferencia de Pago
```bash
POST http://localhost:3001/api/payments/create-preference
```

### Webhook (Automático)
```bash
POST http://localhost:3001/api/webhooks/mercadopago
```

## 📝 Notas Importantes
- Usar **solo tarjetas de prueba** proporcionadas
- Los pagos no son reales en entorno SANDBOX
- Todos los estados de pago se pueden simular
- El webhook se activará automáticamente

## 🎯 Próximos Pasos
1. ✅ **Configuración MercadoPago**: COMPLETADO
2. ⏭️ **Pruebas funcionales**: EN CURSO
3. 📧 **Configuración de emails**: PENDIENTE

---
**Fecha de configuración**: 24/07/2025
**Estado**: ✅ LISTO PARA PRUEBAS
