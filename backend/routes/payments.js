import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import PaymentService from '../services/PaymentService.js';
import { OrderService } from '../services/OrderService.js';

const router = express.Router();

// Crear preferencia de pago
router.post('/create-preference', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID es requerido' });
    }

    // Obtener datos de la orden
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenece al usuario
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para esta orden' });
    }

    // Verificar que la orden esté pendiente
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'La orden ya ha sido procesada' });
    }

    const paymentData = {
      order_id: order.id,
      user_id: order.buyer_id,
      user_email: req.user.email,
      user_name: req.user.name,
      items: order.items,
      total: order.total
    };

    // Crear preferencia en MercadoPago
    const preference = await PaymentService.createPayment(paymentData);
    
    res.json({
      success: true,
      preference_id: preference.preference_id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creating payment preference:', error);
    res.status(500).json({ 
      error: 'Error al crear la preferencia de pago',
      details: error.message 
    });
  }
});

// Webhook de MercadoPago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data, action } = req.body;
    
    console.log('🔔 Webhook recibido:', { type, data, action });

    if (type === 'payment') {
      const result = await PaymentService.processWebhook(req.body);
      
      if (result.success) {
        // Aquí podrías actualizar el estado de la orden
        console.log('✅ Pago procesado exitosamente:', result.payment_id);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Pago simulado para desarrollo
router.post('/simulate-payment', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID es requerido' });
    }

    // Obtener datos de la orden
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenece al usuario
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para esta orden' });
    }

    // Simular pago
    const paymentResult = await PaymentService.simulatePayment({
      order_id: order.id,
      total: order.total
    });

    if (paymentResult.success) {
      // Actualizar estado de la orden
      await OrderService.updateOrderStatus(orderId, 'paid');
      
      res.json({
        success: true,
        message: 'Pago simulado exitosamente',
        payment_id: paymentResult.payment_id,
        order_status: 'paid'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Pago simulado falló',
        error: 'El pago fue rechazado'
      });
    }

  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({ 
      error: 'Error al simular el pago',
      details: error.message 
    });
  }
});

export default router;
