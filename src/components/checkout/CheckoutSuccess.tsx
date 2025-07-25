import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home, CreditCard, Clock, XCircle } from 'lucide-react';

interface PaymentStatus {
  icon: React.ReactNode;
  message: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  useEffect(() => {
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');
    
    if (status) {
      setPaymentStatus(status);
      console.log('Payment details:', { status, paymentId, preferenceId });
    }
  }, [searchParams]);

  const getStatusMessage = (): PaymentStatus => {
    switch (paymentStatus) {
      case 'approved':
        return {
          icon: <CreditCard className="h-5 w-5" />,
          message: 'Pago aprobado exitosamente',
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-800'
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          message: 'Pago pendiente de confirmación',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          message: 'Pago rechazado',
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <CreditCard className="h-5 w-5" />,
          message: 'Pago procesado',
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-800'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-200">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Compra Exitosa!
            </h2>
            <p className="text-gray-600">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          <div className={`${statusInfo.bgColor} rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-center space-x-2">
              {statusInfo.icon}
              <span className={`font-medium ${statusInfo.textColor}`}>
                {statusInfo.message}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Número de pedido
                  </p>
                  <p className="text-sm text-gray-600">
                    #{searchParams.get('preference_id') || 'VALL-' + Date.now()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Estado del pedido
                  </p>
                  <p className="text-sm text-gray-600">
                    Confirmado y en preparación
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/mis-pedidos"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <Package className="h-4 w-4 mr-2" />
              Ver mis pedidos
            </Link>
            
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Continuar comprando
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Recibirás un email de confirmación con los detalles de tu pedido.
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

export default CheckoutSuccess;