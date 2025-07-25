import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home, RefreshCw } from 'lucide-react';

const CheckoutPending: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pago Pendiente
            </h2>
            <p className="text-gray-600">
              Tu pago está siendo procesado
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Tu pago está pendiente de confirmación. Te notificaremos cuando se complete el proceso.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/mis-pedidos"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ver estado del pedido
            </Link>
            
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Recibirás un email cuando el pago sea confirmado.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ¿Necesitas ayuda? Contáctanos a soporte@vallemarkets.cl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPending;
