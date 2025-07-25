import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Helper para formatear precios
const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

interface Order {
  id: string;
  total: number;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);

  useEffect(() => {
    // Cargar datos de la orden
    const loadOrder = () => {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = savedOrders.find((o: Order) => o.id === orderId);
      setOrder(foundOrder || null);
    };

    loadOrder();
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();

      if (result.success) {
        setPaymentResult('success');
        // Actualizar el estado de la orden en localStorage
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedOrders = savedOrders.map((o: Order) =>
          o.id === orderId ? { ...o, status: 'paid' } : o
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        setTimeout(() => {
          navigate('/checkout/success');
        }, 3000);
      } else {
        setPaymentResult('failure');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentResult('failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMercadoPagoPayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();

      if (result.success) {
        // Redirigir a MercadoPago
        window.location.href = result.sandbox_init_point || result.init_point;
      } else {
        alert('Error al crear la preferencia de pago');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error creating payment preference:', error);
      alert('Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Pagar Orden</h1>
          <p className="text-gray-600 mt-2">Orden #{order.id}</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Resumen de la orden */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resumen de la orden</h2>
            <div className="mt-4 space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.productName} x {item.quantity}
                  </span>
                  <span className="font-medium">{formatCLP(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCLP(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Opciones de pago */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Método de pago</h2>
            
            {paymentResult === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">¡Pago procesado exitosamente!</span>
                </div>
                <p className="text-green-700 mt-1">Serás redirigido en unos segundos...</p>
              </div>
            )}

            {paymentResult === 'failure' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">El pago fue rechazado</span>
                </div>
                <p className="text-red-700 mt-1">Por favor intenta nuevamente o usa otro método.</p>
              </div>
            )}

            <div className="space-y-4">
              {/* MercadoPago */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">MercadoPago</h3>
                      <p className="text-sm text-gray-600">Tarjetas de crédito, débito y más</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMercadoPagoPayment}
                    disabled={isProcessing || paymentResult === 'success'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar con MercadoPago
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pago simulado para desarrollo */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Pago Simulado</h3>
                      <p className="text-sm text-gray-600">Solo para desarrollo y pruebas</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing || paymentResult === 'success'}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Simular Pago'
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 Este botón simula un pago real. 90% de éxito, 10% falla para pruebas.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🔒 Tus datos están protegidos con encriptación SSL</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
