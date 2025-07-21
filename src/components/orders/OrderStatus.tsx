import React from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrder } from '../../contexts/OrderContext';

const OrderStatus: React.FC = () => {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrder();

  const userOrders = user ? getOrdersByUser(user.id) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered': return <Package className="h-5 w-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600">Consulta el estado de tus pedidos</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes pedidos</h2>
          <p className="text-gray-600 mb-6">Cuando realices una compra, aparecerá aquí</p>
          <a
            href="/productos"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Explorar productos
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id.slice(-8)}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha del pedido:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total del pedido:</p>
                  <p className="text-lg font-bold text-emerald-600">${order.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Productos:</h4>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-600">Vendido por: {item.sellerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Dirección de envío:</h4>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              )}

              {/* Status Timeline */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${order.status === 'pending' ? 'text-yellow-600' : 'text-gray-400'}`}>
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Pendiente</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${order.status === 'accepted' || order.status === 'shipped' || order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Aceptado</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <Truck className="h-4 w-4" />
                    <span className="text-sm">Enviado</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${order.status === 'delivered' ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Entregado</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;