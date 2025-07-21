import express from 'express';
import { OrderService } from '../services/OrderService.js';

const router = express.Router();

/**
 * Webhook de MercadoPago para notificaciones de pago
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📨 Webhook recibido:', { type, data });

    if (type === 'payment') {
      // Obtener información completa del pago desde MercadoPago API
      // Por ahora simulamos los datos
      const paymentData = {
        id: data.id,
        status: req.body.status || 'approved', // approved, rejected, cancelled, etc.
        order_id: req.body.external_reference, // ID de nuestra orden
        amount: req.body.amount,
        currency: 'COP'
      };

      await OrderService.handlePaymentWebhook(paymentData);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

/**
 * Endpoint manual para simular pagos (solo para desarrollo)
 */
router.post('/simulate-payment', async (req, res) => {
  try {
    const { orderId, status = 'approved' } = req.body;

    const paymentData = {
      id: `sim_${Date.now()}`,
      status: status,
      order_id: orderId,
      amount: 100000,
      currency: 'COP'
    };

    await OrderService.handlePaymentWebhook(paymentData);

    res.json({ 
      message: `Pago ${status} simulado exitosamente`,
      payment: paymentData 
    });
  } catch (error) {
    console.error('Error simulando pago:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
