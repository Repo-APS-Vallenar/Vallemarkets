import React, { useState } from 'react';
import { ShoppingCart, Star, MapPin, ChevronDown, Store } from 'lucide-react';
import { Product } from '../contexts/CartContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCLP } from '../utils/currency';

interface ProductGroupProps {
  products: Product[];
  productName: string;
}

const ProductGroup: React.FC<ProductGroupProps> = ({ products, productName }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [showOptions, setShowOptions] = useState(false);

  // Función para obtener URL completa de imagen
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      return 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:3001${imagePath}`;
  };

  const handleAddToCart = () => {
    if (isAuthenticated && user?.role === 'buyer') {
      addToCart(selectedProduct);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowOptions(false);
  };

  // Ordenar productos por precio (menor a mayor)
  const sortedProducts = [...products].sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
  const minPrice = Math.min(...products.map(p => parseFloat(p.price.toString())));
  const maxPrice = Math.max(...products.map(p => parseFloat(p.price.toString())));

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={getImageUrl(selectedProduct.image)} 
          alt={selectedProduct.name} 
          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
          }}
        />
        {selectedProduct.stock < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            ¡Pocas unidades!
          </div>
        )}
        {products.length > 1 && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center">
            <Store className="h-3 w-3 mr-1" />
            {products.length} vendedores
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{productName}</h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{selectedProduct.description}</p>
        
        {/* Selector de vendedor */}
        {products.length > 1 ? (
          <div className="mb-3">
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedProduct.sellerName}</span>
                  <span className="text-xs text-gray-500">- {formatCLP(selectedProduct.price)}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
              </button>
              
              {showOptions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {sortedProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors ${
                        selectedProduct.id === product.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="text-sm">{product.sellerName}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-emerald-600">{formatCLP(product.price)}</span>
                        <span className="text-xs text-gray-500">{product.stock} disponibles</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span>{selectedProduct.sellerName}</span>
          </div>
        )}

        {/* Precio y botón de compra */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {products.length > 1 && minPrice !== maxPrice ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-emerald-600">{formatCLP(selectedProduct.price)}</span>
                <span className="text-xs text-gray-500">Desde {formatCLP(minPrice)} hasta {formatCLP(maxPrice)}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-emerald-600">{formatCLP(selectedProduct.price)}</span>
            )}
            <span className="text-xs text-gray-500">{selectedProduct.stock} disponibles</span>
          </div>
          
          {isAuthenticated && user?.role === 'buyer' && (
            <button 
              onClick={handleAddToCart}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 group"
              disabled={selectedProduct.stock === 0}
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

export default ProductGroup;
