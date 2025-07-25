import { Product } from '../contexts/CartContext';

export const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Leche Descremada 1L',
    price: 890,
    image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Leche descremada fresca de la región',
    category: 'Lácteos',
    sellerId: 'demo-seller-1',
    sellerName: 'Lácteos San Pedro',
    stock: 50
  },
  {
    id: '2',
    name: 'Pan Integral',
    price: 1200,
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Pan integral artesanal horneado diariamente',
    category: 'Panadería',
    sellerId: 'demo-seller-2',
    sellerName: 'Panadería Central',
    stock: 20
  },
  {
    id: '3',
    name: 'Manzanas Rojas 1kg',
    price: 1500,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Manzanas rojas frescas de temporada',
    category: 'Frutas',
    sellerId: 'demo-seller-3',
    sellerName: 'Frutería El Huerto',
    stock: 30
  },
  {
    id: '4',
    name: 'Queso Fresco 250g',
    price: 2100,
    image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Queso fresco artesanal',
    category: 'Lácteos',
    sellerId: 'demo-seller-1',
    sellerName: 'Lácteos San Pedro',
    stock: 15
  },
  {
    id: '5',
    name: 'Yogurt Natural 150g',
    price: 450,
    image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Yogurt natural sin azúcar',
    category: 'Lácteos',
    sellerId: 'demo-seller-4',
    sellerName: 'Lácteos Valle Verde',
    stock: 40
  },
  {
    id: '6',
    name: 'Detergente Ecológico 1L',
    price: 2800,
    image: 'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Detergente biodegradable para ropa',
    category: 'Limpieza',
    sellerId: 'demo-seller-5',
    sellerName: 'EcoLimpio',
    stock: 25
  },
  {
    id: '7',
    name: 'Cerveza Artesanal IPA',
    price: 3200,
    image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Cerveza artesanal estilo IPA con lúpulo local',
    category: 'Bebidas',
    sellerId: 'demo-seller-6',
    sellerName: 'Cervecería Andina',
    stock: 18
  },
  {
    id: '8',
    name: 'Huevos de Campo Docena',
    price: 3500,
    image: 'https://images.pexels.com/photos/162712/egg-white-food-eat-162712.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    description: 'Huevos frescos de gallinas de campo',
    category: 'Abarrotes',
    sellerId: 'demo-seller-7',
    sellerName: 'Granja Los Pinos',
    stock: 60
  }
];

export const demoCategories = [
  { id: '1', name: 'Lácteos', description: 'Productos lácteos frescos' },
  { id: '2', name: 'Panadería', description: 'Panes y productos de panadería' },
  { id: '3', name: 'Frutas', description: 'Frutas frescas de temporada' },
  { id: '4', name: 'Limpieza', description: 'Productos de limpieza' },
  { id: '5', name: 'Bebidas', description: 'Bebidas y jugos' },
  { id: '6', name: 'Abarrotes', description: 'Productos básicos' }
];
