import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Home, CreditCard } from 'lucide-react';

const CheckoutFailure: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pago Rechazado
            </h2>
            <p className="text-gray-600">
              No se pudo procesar tu pago
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              El pago fue rechazado. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/checkout"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </Link>
            
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda? Contáctanos a soporte@vallemarkets.cl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailure;
