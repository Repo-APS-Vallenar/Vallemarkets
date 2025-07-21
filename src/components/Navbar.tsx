import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, Store, Package, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-800">PymeMarket</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-700 hover:text-emerald-600'} pb-1 transition-colors`}
            >
              Inicio
            </Link>
            <Link 
              to="/productos" 
              className={`${isActive('/productos') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-700 hover:text-emerald-600'} pb-1 transition-colors`}
            >
              Productos
            </Link>
            {isAuthenticated && user?.role === 'seller' && (
              <Link 
                to="/dashboard/vendedor" 
                className={`${isActive('/dashboard/vendedor') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-700 hover:text-emerald-600'} pb-1 transition-colors`}
              >
                Mi Tienda
              </Link>
            )}
            {isAuthenticated && user?.role === 'buyer' && (
              <Link 
                to="/mis-pedidos" 
                className={`${isActive('/mis-pedidos') ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-700 hover:text-emerald-600'} pb-1 transition-colors`}
              >
                Mis Pedidos
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                <Link to="/carrito" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-emerald-600 transition-colors" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <img 
                    src={user?.avatar || `https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1`}
                    alt={user?.name} 
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-gray-700 text-sm">{user?.name}</span>
                  <button 
                    onClick={logout}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;