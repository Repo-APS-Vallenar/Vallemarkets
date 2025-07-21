import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar a comprar</p>
          <Link
            to="/productos"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Explorar productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.sellerName}</p>
                  <p className="text-lg font-bold text-emerald-600">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-emerald-600">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center mt-6"
            >
              Proceder al pago
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;