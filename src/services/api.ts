import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: {
    name?: string;
    phone?: string;
    address?: string;
  }) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Servicios de productos
export const productsAPI = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    stock: number;
    image?: string;
  }) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    image?: string;
  }) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getMyProducts: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/products/seller/my-products', { params });
    return response.data;
  },
};

// Servicios de categorías
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: {
    name: string;
    description?: string;
    image?: string;
  }) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: {
    name?: string;
    description?: string;
    image?: string;
  }) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Servicios de carrito
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const response = await api.put('/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId: string) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};

// Servicios de órdenes
export const ordersAPI = {
  getOrders: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: {
    shippingAddress: string;
    paymentMethod: string;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const response = await api.put(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  },

  getAllOrders: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },
};

// Servicio de salud de la API
export const healthAPI = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
