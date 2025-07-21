import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pedido Confirmado!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido procesado exitosamente. Recibirás un email con los detalles de tu compra.
          </p>
          
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium">
                El vendedor revisará tu pedido y lo confirmará pronto
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link
              to="/mis-pedidos"
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Package className="h-5 w-5" />
              <span>Ver mis pedidos</span>
            </Link>
            
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;