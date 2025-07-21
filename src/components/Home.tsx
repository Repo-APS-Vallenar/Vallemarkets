import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Store, Users, TrendingUp } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../contexts/CartContext';

const Home: React.FC = () => {
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Artesanías de Cuero Premium',
      price: 45000,
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      description: 'Carteras y billeteras artesanales hechas con cuero genuino de alta calidad.',
      category: 'Artesanías',
      sellerId: '1',
      sellerName: 'Cueros Santa Fe',
      stock: 15
    },
    {
      id: '2',
      name: 'Café Premium Colombiano',
      price: 28000,
      image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      description: 'Café 100% colombiano, tostado artesanal con notas frutales y chocolateadas.',
      category: 'Alimentos',
      sellerId: '2',
      sellerName: 'Café de la Montaña',
      stock: 50
    },
    {
      id: '3',
      name: 'Joyas Artesanales',
      price: 75000,
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
      description: 'Collares y aretes únicos hechos a mano con piedras naturales.',
      category: 'Accesorios',
      sellerId: '5',
      sellerName: 'Joyería Luna',
      stock: 12
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-sky-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Conectamos 
              <span className="text-emerald-600"> PyMEs </span>
              con compradores
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Descubre productos únicos de pequeñas y medianas empresas locales. 
              Apoya el comercio local y encuentra tesoros auténticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/productos"
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Explorar Productos</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Store className="h-5 w-5" />
                <span>Vender Productos</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Store className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">PyMEs Registradas</p>
            </div>
            <div className="text-center">
              <div className="bg-sky-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Clientes Satisfechos</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">Tasa de Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre algunos de nuestros productos más populares de PyMEs locales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/productos"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <span>Ver todos los productos</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Tienes una PyME?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra plataforma y lleva tu negocio al siguiente nivel. 
            Alcanza nuevos clientes y haz crecer tus ventas.
          </p>
          <Link
            to="/register"
            className="bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <Store className="h-5 w-5" />
            <span>Comenzar a Vender</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;