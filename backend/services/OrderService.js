import { executeQuery } from '../config/database.js';
import { randomUUID } from 'crypto';

/**
 * Servicio para manejar la lógica de órdenes y pagos
 */
export class OrderService {
  
  /**
   * Configuración de tiempos (en horas)
   */
  static CONFIG = {
    AUTO_ACCEPT_HOURS: 24,      // Tiempo para auto-aceptar si vendedor no responde
    ORDER_EXPIRY_HOURS: 72,     // Tiempo total antes de cancelar orden
    PAYMENT_TIMEOUT_MINUTES: 30 // Tiempo límite para completar pago
  };

  /**
   * Crear una nueva orden
   */
  static async createOrder(userId, orderData) {
    const orderId = randomUUID();
    const now = new Date();
    const autoAcceptAt = new Date(now.getTime() + (this.CONFIG.AUTO_ACCEPT_HOURS * 60 * 60 * 1000));
    const expiresAt = new Date(now.getTime() + (this.CONFIG.ORDER_EXPIRY_HOURS * 60 * 60 * 1000));

    try {
      // Crear la orden
      await executeQuery(`
        INSERT INTO orders (
          id, user_id, total, status, payment_status, 
          shipping_address, payment_method, auto_accept_at, expires_at
        ) VALUES (?, ?, ?, 'pending', 'pending', ?, ?, ?, ?)
      `, [
        orderId, userId, orderData.total, 
        JSON.stringify(orderData.shippingAddress), 
        orderData.paymentMethod, autoAcceptAt, expiresAt
      ]);

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Manejar webhook de MercadoPago
   */
  static async handlePaymentWebhook(paymentData) {
    const { id: paymentId, status, order_id: orderId } = paymentData;

    try {
      switch (status) {
        case 'approved':
          await this.markOrderAsPaid(orderId, paymentId);
          break;
        case 'rejected':
        case 'cancelled':
          await this.cancelOrder(orderId, `Pago ${status}`);
          break;
        case 'refunded':
          await this.refundOrder(orderId, paymentId);
          break;
      }
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      throw error;
    }
  }

  /**
   * Marcar orden como pagada y configurar auto-aceptación
   */
  static async markOrderAsPaid(orderId, paymentId) {
    const autoAcceptAt = new Date(Date.now() + (this.CONFIG.AUTO_ACCEPT_HOURS * 60 * 60 * 1000));

    await executeQuery(`
      UPDATE orders 
      SET status = 'paid', 
          payment_status = 'approved', 
          payment_id = ?,
          auto_accept_at = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [paymentId, autoAcceptAt, orderId]);

    // Programar tarea de auto-aceptación
    this.scheduleAutoAccept(orderId, autoAcceptAt);

    // Notificar al vendedor
    await this.notifySellerNewOrder(orderId);
  }

  /**
   * Aceptar orden manualmente por el vendedor
   */
  static async acceptOrder(orderId, sellerId, notes = null) {
    try {
      // Verificar que la orden pertenece al vendedor
      const orders = await executeQuery(`
        SELECT o.*, p.seller_id 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? AND p.seller_id = ?
        LIMIT 1
      `, [orderId, sellerId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada o no autorizada');
      }

      const order = orders[0];
      
      // Verificar que la orden esté en estado válido
      if (!['paid', 'pending'].includes(order.status)) {
        throw new Error(`No se puede aceptar orden en estado: ${order.status}`);
      }

      // Actualizar orden
      await executeQuery(`
        UPDATE orders 
        SET status = 'accepted',
            notes = ?,
            auto_accept_at = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [notes, orderId]);

      // Cancelar auto-aceptación programada
      this.cancelAutoAccept(orderId);

      // Notificar al comprador
      await this.notifyBuyerOrderAccepted(orderId);

      return true;
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  /**
   * Rechazar orden manualmente por el vendedor
   */
  static async rejectOrder(orderId, sellerId, reason) {
    try {
      // Verificar que la orden pertenece al vendedor
      const orders = await executeQuery(`
        SELECT o.*, p.seller_id 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? AND p.seller_id = ?
        LIMIT 1
      `, [orderId, sellerId]);

      if (orders.length === 0) {
        throw new Error('Orden no encontrada o no autorizada');
      }

      const order = orders[0];
      
      // Solo se puede rechazar si está pagada o pendiente
      if (!['paid', 'pending'].includes(order.status)) {
        throw new Error(`No se puede rechazar orden en estado: ${order.status}`);
      }

      // Actualizar orden
      await executeQuery(`
        UPDATE orders 
        SET status = 'rejected',
            rejection_reason = ?,
            auto_accept_at = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [reason, orderId]);

      // Cancelar auto-aceptación
      this.cancelAutoAccept(orderId);

      // Procesar reembolso si ya estaba pagada
      if (order.payment_status === 'approved') {
        await this.processRefund(orderId, order.payment_id);
      }

      // Notificar al comprador
      await this.notifyBuyerOrderRejected(orderId, reason);

      return true;
    } catch (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }
  }

  /**
   * Auto-aceptar orden después del tiempo límite
   */
  static async autoAcceptOrder(orderId) {
    try {
      const orders = await executeQuery(`
        SELECT * FROM orders 
        WHERE id = ? AND status = 'paid' AND auto_accept_at <= NOW()
      `, [orderId]);

      if (orders.length === 0) return false;

      await executeQuery(`
        UPDATE orders 
        SET status = 'accepted',
            notes = 'Aceptada automáticamente por falta de respuesta del vendedor',
            auto_accept_at = NULL,
            updated_at = NOW()
        WHERE id = ?
      `, [orderId]);

      // Notificar al comprador
      await this.notifyBuyerOrderAccepted(orderId);

      return true;
    } catch (error) {
      console.error('Error auto-accepting order:', error);
      throw error;
    }
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(orderId, reason) {
    await executeQuery(`
      UPDATE orders 
      SET status = 'cancelled',
          rejection_reason = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [reason, orderId]);
  }

  /**
   * Procesar reembolso
   */
  static async processRefund(orderId, paymentId) {
    // Aquí integrarías con MercadoPago para procesar el reembolso
    // Por ahora solo actualizamos el estado
    await executeQuery(`
      UPDATE orders 
      SET payment_status = 'refunded',
          updated_at = NOW()
      WHERE id = ?
    `, [orderId]);
  }

  /**
   * Verificar órdenes expiradas y procesarlas
   */
  static async processExpiredOrders() {
    const expiredOrders = await executeQuery(`
      SELECT id FROM orders 
      WHERE expires_at <= NOW() 
      AND status IN ('pending', 'paid') 
    `);

    for (const order of expiredOrders) {
      await this.cancelOrder(order.id, 'Orden expirada por falta de pago o aceptación');
    }
  }

  /**
   * Verificar órdenes para auto-aceptar
   */
  static async processAutoAcceptOrders() {
    const ordersToAccept = await executeQuery(`
      SELECT id FROM orders 
      WHERE auto_accept_at <= NOW() 
      AND status = 'paid'
    `);

    for (const order of ordersToAccept) {
      await this.autoAcceptOrder(order.id);
    }
  }

  // Métodos de notificación (implementar según necesidades)
  static async notifySellerNewOrder(orderId) {
    // Implementar notificación por email/SMS al vendedor
    console.log(`🔔 Notificar vendedor - Nueva orden: ${orderId}`);
  }

  static async notifyBuyerOrderAccepted(orderId) {
    // Implementar notificación por email/SMS al comprador
    console.log(`✅ Notificar comprador - Orden aceptada: ${orderId}`);
  }

  static async notifyBuyerOrderRejected(orderId, reason) {
    // Implementar notificación por email/SMS al comprador
    console.log(`❌ Notificar comprador - Orden rechazada: ${orderId} - ${reason}`);
  }

  // Métodos para manejar auto-aceptación programada
  static scheduleAutoAccept(orderId, date) {
    // Implementar con cron job o sistema de colas
    console.log(`⏰ Programar auto-aceptación: ${orderId} para ${date}`);
  }

  static cancelAutoAccept(orderId) {
    // Cancelar tarea programada
    console.log(`⏰ Cancelar auto-aceptación: ${orderId}`);
  }
}
