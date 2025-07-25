import { executeQuery } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class CommissionServiceV2 {
  
  // Calcular comisión cuando se completa una orden
  static async calculateCommission(orderId) {
    try {
      // Obtener datos de la orden con todos los vendedores involucrados
      const orderItemsQuery = `
        SELECT 
          oi.*, 
          p.seller_id, 
          u.commission_rate,
          u.business_name,
          o.total as order_total,
          (oi.price * oi.quantity) as item_total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON p.seller_id = u.id
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.order_id = ?
      `;
      
      const orderItems = await executeQuery(orderItemsQuery, [orderId]);
      
      if (orderItems.length === 0) return null;

      const commissions = [];

      // Calcular comisión por cada vendedor en la orden
      for (const item of orderItems) {
        const commissionAmount = (item.item_total * item.commission_rate) / 100;

        // Verificar si ya existe una comisión para este vendedor y orden
        const existingCommission = await executeQuery(`
          SELECT id FROM commissions 
          WHERE order_id = ? AND seller_id = ?
        `, [orderId, item.seller_id]);

        if (existingCommission.length === 0) {
          const commissionId = uuidv4();
          
          await executeQuery(`
            INSERT INTO commissions (id, order_id, seller_id, commission_amount, commission_rate, order_total, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
          `, [commissionId, orderId, item.seller_id, commissionAmount, item.commission_rate, item.item_total]);

          commissions.push({
            id: commissionId,
            orderId,
            sellerId: item.seller_id,
            commissionAmount,
            commissionRate: item.commission_rate,
            orderTotal: item.item_total,
            businessName: item.business_name
          });
        }
      }

      return commissions;

    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  // Obtener comisiones pendientes por vendedor
  static async getPendingCommissions(sellerId) {
    try {
      const commissions = await executeQuery(`
        SELECT 
          c.*, 
          o.created_at as order_date,
          o.id as order_number
        FROM commissions c
        JOIN orders o ON c.order_id = o.id
        WHERE c.seller_id = ? AND c.status = 'pending'
        ORDER BY c.created_at DESC
      `, [sellerId]);

      const total = commissions.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

      return {
        commissions,
        total,
        count: commissions.length
      };
    } catch (error) {
      console.error('Error getting pending commissions:', error);
      throw error;
    }
  }

  // Obtener estadísticas de comisiones para admin
  static async getCommissionStats() {
    try {
      const [overviewResult] = await executeQuery(`
        SELECT 
          COUNT(*) as total_commissions,
          SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as paid_amount,
          SUM(commission_amount) as total_amount,
          COUNT(DISTINCT seller_id) as active_sellers
        FROM commissions
      `);

      const sellerStats = await executeQuery(`
        SELECT 
          u.id,
          u.business_name,
          u.business_type,
          u.commission_rate,
          u.verified,
          COUNT(DISTINCT c.order_id) as total_orders,
          SUM(c.order_total) as total_sales,
          SUM(c.commission_amount) as total_commissions,
          SUM(CASE WHEN c.status = 'pending' THEN c.commission_amount ELSE 0 END) as pending_commissions
        FROM users u
        LEFT JOIN commissions c ON u.id = c.seller_id
        WHERE u.role = 'seller'
        GROUP BY u.id
        ORDER BY total_sales DESC
      `);

      // Estadísticas por tipo de negocio
      const businessTypeStats = await executeQuery(`
        SELECT 
          u.business_type,
          COUNT(DISTINCT u.id) as seller_count,
          SUM(c.commission_amount) as total_commissions,
          SUM(c.order_total) as total_sales
        FROM users u
        LEFT JOIN commissions c ON u.id = c.seller_id
        WHERE u.role = 'seller'
        GROUP BY u.business_type
      `);

      return {
        overview: overviewResult || {},
        sellers: sellerStats,
        businessTypes: businessTypeStats
      };
    } catch (error) {
      console.error('Error getting commission stats:', error);
      throw error;
    }
  }

  // Actualizar configuración de comisión para un vendedor
  static async updateSellerCommission(sellerId, commissionRate) {
    try {
      await executeQuery(`
        UPDATE users 
        SET commission_rate = ?
        WHERE id = ? AND role = 'seller'
      `, [commissionRate, sellerId]);

      return { success: true };
    } catch (error) {
      console.error('Error updating seller commission:', error);
      throw error;
    }
  }
}

export default CommissionServiceV2;
