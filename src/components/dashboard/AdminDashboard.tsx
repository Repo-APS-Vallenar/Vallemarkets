import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Store, 
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCLP } from '../../utils/currency';

interface AdminStats {
  users: Array<{ role: string; count: number; verified_count: number }>;
  products: {
    total_products: number;
    total_stock: number;
    avg_price: number;
    pending_products: number;
  };
  orders: Array<{ status: string; count: number; total_amount: number }>;
  commissions: {
    overview: {
      total_commissions: number;
      pending_amount: number;
      paid_amount: number;
      total_amount: number;
      active_sellers: number;
    };
    sellers: Array<any>;
    businessTypes: Array<any>;
  };
  dailyRevenue: Array<{ date: string; order_count: number; daily_revenue: number }>;
}

interface Seller {
  id: string;
  email: string;
  name: string;
  business_name: string;
  business_type: string;
  commission_rate: number;
  verified: boolean;
  created_at: string;
  product_count: number;
  order_count: number;
  total_sales: number;
  pending_commissions: number;
}

interface PendingOrder {
  id: string;
  total: number;
  created_at: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  item_count: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'products' | 'commissions' | 'orders'>('overview');
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadSellers();
    loadPendingOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/orders/pending-completion', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data.orders);
      }
    } catch (error) {
      console.error('Error loading pending orders:', error);
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadPendingOrders();
        await loadDashboardData(); // Refresh stats
        alert('Orden completada exitosamente y comisiones calculadas');
      } else {
        const error = await response.json();
        alert(error.error || 'Error completando orden');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completando orden');
    }
  };

  const updateSeller = async (sellerId: string, updates: Partial<Seller>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/sellers/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await loadSellers();
        setEditingSeller(null);
        alert('Vendedor actualizado exitosamente');
      } else {
        alert('Error actualizando vendedor');
      }
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Error actualizando vendedor');
    }
  };

  const configurePilotSeller = async (email: string, businessData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/pilot/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email,
          ...businessData
        })
      });

      if (response.ok) {
        await loadSellers();
        alert('PyME piloto configurada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error configuring pilot seller:', error);
      alert('Error configurando PyME piloto');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getBusinessTypeText = (type: string) => {
    switch (type) {
      case 'neighborhood_store': return 'Negocio de Barrio';
      case 'liquor_store': return 'Botillería';
      default: return 'Otro';
    }
  };

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'neighborhood_store': return 'bg-blue-100 text-blue-800';
      case 'liquor_store': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Panel de control para Valle Markets</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'sellers', label: 'PyMEs', icon: Store },
          { id: 'products', label: 'Productos', icon: Package },
          { id: 'commissions', label: 'Comisiones', icon: DollarSign },
          { id: 'orders', label: 'Órdenes', icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total PyMEs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.users.find(u => u.role === 'seller')?.count || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.users.find(u => u.role === 'seller')?.verified_count || 0} verificadas
                  </p>
                </div>
                <Store className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products.total_products}</p>
                  <p className="text-xs text-gray-500">
                    {stats.products.pending_products} pendientes
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Órdenes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.orders.reduce((sum, o) => sum + o.count, 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCLP(stats.orders.reduce((sum, o) => sum + o.total_amount, 0))}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comisiones Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCLP(stats.commissions.overview.pending_amount || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Total: {formatCLP(stats.commissions.overview.total_amount || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Últimos 30 Días</h3>
              <div className="space-y-2">
                {stats.dailyRevenue.slice(-7).map(day => (
                  <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('es-CL')}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCLP(day.daily_revenue)}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {day.order_count} órdenes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">PyMEs Registradas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Negocio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map(seller => (
                    <tr key={seller.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {seller.business_name || seller.name}
                          </div>
                          <div className="text-sm text-gray-500">{seller.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBusinessTypeColor(seller.business_type)}`}>
                          {getBusinessTypeText(seller.business_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.commission_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCLP(seller.total_sales || 0)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.order_count || 0} órdenes
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {seller.verified ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditingSeller(seller)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar vendedor */}
      {editingSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar {editingSeller.business_name}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                updateSeller(editingSeller.id, {
                  commission_rate: parseFloat(formData.get('commission_rate') as string),
                  verified: formData.get('verified') === 'true',
                  business_name: formData.get('business_name') as string,
                  business_type: formData.get('business_type') as string
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      defaultValue={editingSeller.business_name}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Negocio
                    </label>
                    <select
                      name="business_type"
                      defaultValue={editingSeller.business_type}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="neighborhood_store">Negocio de Barrio</option>
                      <option value="liquor_store">Botillería</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Comisión (%)
                    </label>
                    <input
                      type="number"
                      name="commission_rate"
                      min="0"
                      max="50"
                      step="0.1"
                      defaultValue={editingSeller.commission_rate}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      name="verified"
                      defaultValue={editingSeller.verified.toString()}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="true">Verificado</option>
                      <option value="false">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingSeller(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Órdenes Pendientes de Completar
            </h2>
            
            {pendingOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comprador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.buyer_name}</div>
                            <div className="text-sm text-gray-500">{order.buyer_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCLP(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.item_count} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => completeOrder(order.id)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Completar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay órdenes pendientes de completar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
