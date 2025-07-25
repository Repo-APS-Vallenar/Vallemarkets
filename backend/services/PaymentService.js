import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN'
});

class PaymentService {
  static async createPayment(orderData) {
    try {
      const preference = new Preference(client);

      const preferenceData = {
        items: orderData.items.map(item => ({
          title: item.product_name,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          currency_id: 'CLP'
        })),
        payer: {
          email: orderData.user_email,
          name: orderData.user_name
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/checkout/success`,
          failure: `${process.env.FRONTEND_URL}/checkout/failure`,
          pending: `${process.env.FRONTEND_URL}/checkout/pending`
        },
        auto_return: 'approved',
        external_reference: orderData.order_id.toString(),
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        metadata: {
          order_id: orderData.order_id,
          user_id: orderData.user_id
        }
      };

      const result = await preference.create({ body: preferenceData });
      
      return {
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        preference_id: result.id
      };
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error('Error al crear la preferencia de pago');
    }
  }

  static async processWebhook(paymentData) {
    try {
      // Procesar notificación de MercadoPago
      const { type, data } = paymentData;
      
      if (type === 'payment') {
        const paymentId = data.id;
        
        // TODO: Consultar el estado real del pago en MercadoPago
        // const payment = await mercadopago.payment.findById(paymentId);
        
        console.log(`💳 Webhook recibido - Payment ID: ${paymentId}`);
        
        return {
          success: true,
          payment_id: paymentId,
          status: 'approved' // En producción, usar payment.status
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  // Método de pago simulado para desarrollo
  static async simulatePayment(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: Math.random() > 0.1, // 90% éxito
          payment_id: `sim_${Date.now()}`,
          status: 'approved'
        });
      }, 2000);
    });
  }
}

export default PaymentService;
