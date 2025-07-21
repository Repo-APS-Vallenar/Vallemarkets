import React from 'react';
import { ShoppingCart, Star, MapPin } from 'lucide-react';
import { Product } from '../contexts/CartContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const handleAddToCart = () => {
    if (isAuthenticated && user?.role === 'buyer') {
      addToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            ¡Pocas unidades!
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center space-x-1 text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4" />
          <span>{product.sellerName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-emerald-600">${product.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500">{product.stock} disponibles</span>
          </div>
          
          {isAuthenticated && user?.role === 'buyer' && (
            <button 
              onClick={handleAddToCart}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 group"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;