import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Package, ShoppingBag, DollarSign, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrder } from '../../contexts/OrderContext';
import { Product } from '../../contexts/CartContext';
import { productsAPI, categoriesAPI } from '../../services/api';
import { formatCLP } from '../../utils/currency';
import ImageUpload from '../ImageUpload';

interface ProductForm {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrder();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>();

  // Función para obtener URL completa de imagen
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      console.log('⚠️ No hay imagen para el producto');
      return '/placeholder-image.jpg'; // Imagen por defecto
    }
    if (imagePath.startsWith('http')) {
      console.log('🔗 URL externa:', imagePath);
      return imagePath;
    }
    const fullUrl = `http://localhost:3001${imagePath}`;
    console.log('🖼️ URL construida:', fullUrl);
    return fullUrl;
  };

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getMyProducts();
      console.log('📦 Productos cargados:', response.products);
      console.log('🖼️ Primeras 3 imágenes:', response.products?.slice(0, 3).map((p: any) => ({
        name: p.name,
        image: p.image
      })));
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Cargando categorías...');
      const response = await categoriesAPI.getCategories();
      console.log('Categorías recibidas:', response);
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const sellerOrders = orders.filter(order => 
    order.items.some(item => item.sellerId === user?.id)
  );

  const totalRevenue = sellerOrders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;

  const handleOrderStatusUpdate = async (orderId: string, status: 'accepted' | 'rejected') => {
    try {
      const endpoint = status === 'accepted' ? 'accept' : 'reject';
      const payload = status === 'accepted' 
        ? { notes: 'Orden aceptada por el vendedor' }
        : { reason: 'El vendedor no puede procesar esta orden en este momento' };

      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar orden');
      }

      // Actualizar la orden en el estado local
      updateOrderStatus(orderId, status);
      
      alert(status === 'accepted' ? 'Orden aceptada exitosamente' : 'Orden rechazada exitosamente');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado de la orden');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    reset();
    setCurrentImage('');
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('description', product.description);
    setValue('category', product.category);
    setValue('stock', product.stock);
    setValue('image', product.image);
    setCurrentImage(product.image || '');
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        setLoading(true);
        await productsAPI.deleteProduct(productId);
        await loadProducts(); // Recargar la lista
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmitProduct = async (data: ProductForm) => {
    try {
      setLoading(true);
      
      console.log('Datos del formulario:', data);
      console.log('Categorías disponibles:', categories);
      
      // Obtener el ID de la categoría basado en el nombre
      const selectedCategory = categories.find(cat => cat.name === data.category);
      console.log('Categoría seleccionada:', selectedCategory);
      
      if (!selectedCategory) {
        alert('Por favor selecciona una categoría válida');
        return;
      }

      if (editingProduct) {
        // Editar producto existente
        console.log('Editando producto:', editingProduct.id);
        await productsAPI.updateProduct(editingProduct.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          image: data.image
        });
      } else {
        // Agregar nuevo producto
        const productData = {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: selectedCategory.id,
          stock: data.stock,
          image: data.image
        };
        console.log('Creando producto con datos:', productData);
        await productsAPI.createProduct(productData);
      }
      
      // Recargar la lista de productos
      await loadProducts();
      
      setShowProductModal(false);
      reset();
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      
      // Mostrar errores específicos de validación si están disponibles
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join('\n');
        alert(`Errores de validación:\n${errorMessages}`);
      } else {
        alert('Error al guardar el producto. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setCurrentImage('');
    reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard del Vendedor</h1>
        <p className="text-gray-600">Bienvenido, {user?.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'overview' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vista General
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'products' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'orders' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pedidos
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{sellerOrders.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCLP(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mis Productos</h2>
            <button
              onClick={handleAddProduct}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Producto</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tienes productos aún. ¡Agrega tu primer producto!</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        console.log('❌ Error cargando imagen:', product.image);
                        // Si falla la imagen, mostrar placeholder
                        e.currentTarget.src = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-emerald-600">{formatCLP(product.price)}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pedidos Recibidos</h2>
          
          {sellerOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tienes pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{order.id.slice(-8)}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Total: {formatCLP(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dirección de envío:</p>
                      <p className="text-sm text-gray-900">
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Productos:</h4>
                    {order.items.map(item => (
                      <div key={item.productId} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-900">{item.productName}</span>
                        <span className="text-sm text-gray-600">
                          Cantidad: {item.quantity} | {formatCLP(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleOrderStatusUpdate(order.id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Check className="h-4 w-4" />
                        <span>Aceptar</span>
                      </button>
                      <button
                        onClick={() => handleOrderStatusUpdate(order.id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Este campo es requerido' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ej: Artesanías de cuero"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    {...register('price', { 
                      required: 'Este campo es requerido',
                      min: { value: 1, message: 'El precio debe ser mayor a 0' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="45000"
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    {...register('description', { required: 'Este campo es requerido' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Describe tu producto..."
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    {...register('category', { required: 'Este campo es requerido' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    {...register('stock', { 
                      required: 'Este campo es requerido',
                      min: { value: 0, message: 'El stock no puede ser negativo' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="15"
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>
                  )}
                </div>

                <ImageUpload
                  currentImage={currentImage}
                  onImageChange={(imageUrl) => {
                    console.log('📸 Imagen subida:', imageUrl);
                    setCurrentImage(imageUrl);
                    setValue('image', imageUrl);
                  }}
                  onImageRemove={() => {
                    console.log('🗑️ Imagen removida');
                    setCurrentImage('');
                    setValue('image', '');
                  }}
                  className="mb-4"
                />

                <div className="text-center my-4">
                  <span className="text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded">
                    O alternativamente
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pegar URL de imagen
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url && url !== currentImage) {
                        console.log('🔗 URL pegada:', url);
                        setCurrentImage(url);
                        setValue('image', url);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo llena este campo si quieres usar una imagen externa
                  </p>
                  {errors.image && (
                    <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      editingProduct ? 'Actualizar' : 'Agregar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;