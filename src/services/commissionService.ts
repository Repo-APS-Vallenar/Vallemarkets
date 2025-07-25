export interface CommissionRule {
  id: string;
  sellerId: string;
  sellerName: string;
  commissionPercentage: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  sellerId: string;
  sellerName: string;
  orderTotal: number;
  commissionPercentage: number;
  commissionAmount: number;
  sellerEarnings: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

class CommissionService {
  private baseUrl = 'http://localhost:3001/api';

  // Obtener reglas de comisión
  async getCommissionRules(): Promise<{ rules: CommissionRule[] }> {
    const response = await fetch(`${this.baseUrl}/admin/commission-rules`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Crear/actualizar regla de comisión
  async setCommissionRule(sellerId: string, percentage: number, endDate?: string): Promise<CommissionRule> {
    const response = await fetch(`${this.baseUrl}/admin/commission-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        sellerId,
        commissionPercentage: percentage,
        endDate
      })
    });
    return response.json();
  }

  // Obtener transacciones de comisión
  async getCommissionTransactions(): Promise<{ transactions: CommissionTransaction[] }> {
    const response = await fetch(`${this.baseUrl}/admin/commission-transactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Procesar pago de comisiones
  async processPayment(transactionIds: string[]): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/admin/process-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ transactionIds })
    });
    return response.json();
  }

  // Calcular comisión para una orden
  calculateCommission(orderTotal: number, commissionPercentage: number) {
    const commissionAmount = (orderTotal * commissionPercentage) / 100;
    const sellerEarnings = orderTotal - commissionAmount;
    return {
      commissionAmount,
      sellerEarnings,
      commissionPercentage
    };
  }

  // Obtener resumen financiero
  async getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalCommissions: number;
    pendingPayments: number;
    activeSellers: number;
  }> {
    const response = await fetch(`${this.baseUrl}/admin/financial-summary`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
}

export const commissionService = new CommissionService();
