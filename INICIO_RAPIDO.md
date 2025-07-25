# 🛒 Guía Rápida - Vallemarkets con IA

## ✅ Sistema Listo para Usar

### 🚀 **Para Iniciar Sesión como Comprador:**

1. **Ve a la página de login**: http://localhost:5176/login
2. **Completa los campos**:
   - Email: `cualquier-email@ejemplo.com` (puede ser cualquier email)
   - Contraseña: `cualquier-password` (puede ser cualquier contraseña)
   - **Importante**: Selecciona **"Comprador"** en el rol
3. **Haz clic en "Iniciar Sesión"**

El sistema usará **autenticación local de demostración** y te permitirá acceder como comprador.

---

## 🤖 **Funciones de IA Disponibles:**

### 1. **Chatbot Inteligente**
- **Ubicación**: Botón flotante azul en la esquina inferior derecha
- **Cómo usar**: Haz clic y pregunta sobre productos
- **Ejemplos**:
  - "¿Qué productos lácteos tienen?"
  - "Necesito algo para limpiar"
  - "¿Cuáles son las mejores ofertas?"

### 2. **Ver Productos con IA**
- **Ve a**: http://localhost:5176/productos
- **Funciones**:
  - Búsqueda inteligente (haz clic en ✨)
  - Recomendaciones automáticas
  - Productos agrupados por similitud

### 3. **Configuración de IA**
- **Ve a**: http://localhost:5176/configuracion-ia
- **Personaliza**: Comportamiento del chatbot, recomendaciones, etc.

---

## 🛍️ **Probar las Funciones:**

### Como Comprador:
1. **Explora productos** en `/productos`
2. **Agrega productos al carrito**
3. **Chatea con la IA** sobre productos
4. **Prueba la búsqueda inteligente**

### Datos de Demostración:
- ✅ **8 productos** de ejemplo con imágenes reales
- ✅ **6 categorías** (Lácteos, Panadería, Frutas, etc.)
- ✅ **Carrito de compras** funcional
- ✅ **IA completamente funcional**

---

## 🔧 **Estado del Sistema:**

- ✅ **Frontend**: Funcionando en puerto 5176
- ⚠️ **Backend**: No requerido (modo demostración)
- ✅ **IA**: Funcional (requiere API key de OpenAI)
- ✅ **Carrito**: Funcional localmente
- ✅ **Autenticación**: Local/demostración

---

## 🔑 **Para Activar IA Completa:**

1. Obtén una API key de [OpenAI](https://platform.openai.com/api-keys)
2. Edita `.env` y agrega: `VITE_OPENAI_API_KEY=tu-api-key`
3. Recarga la página

---

## 🎯 **URLs Importantes:**

- **Inicio**: http://localhost:5176/
- **Login**: http://localhost:5176/login
- **Productos**: http://localhost:5176/productos
- **Configuración IA**: http://localhost:5176/configuracion-ia

---

**¡Disfruta explorando tu e-commerce con superpoderes de IA! 🚀✨**
