import React from 'react';
import { ShoppingCart, Star, MapPin } from 'lucide-react';
import { Product } from '../contexts/CartContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCLP } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Debug: Log del producto para ver qué imagen llega
  console.log('🔍 ProductCard recibió producto:', {
    name: product.name,
    image: product.image,
    id: product.id
  });

  // Función para obtener URL completa de imagen
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      console.log('⚠️ No hay imagen para el producto:', product.name);
      return 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
    }
    if (imagePath.startsWith('http')) {
      console.log('🔗 URL externa:', imagePath);
      return imagePath;
    }
    const fullUrl = `http://localhost:3001${imagePath}`;
    console.log('🖼️ URL construida para producto público:', fullUrl);
    return fullUrl;
  };

  const handleAddToCart = () => {
    if (isAuthenticated && user?.role === 'buyer') {
      addToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.log('❌ Error cargando imagen del producto público:', product.image);
            // Si falla la imagen, mostrar placeholder
            e.currentTarget.src = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
          }}
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
            <span className="text-2xl font-bold text-emerald-600">{formatCLP(product.price)}</span>
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