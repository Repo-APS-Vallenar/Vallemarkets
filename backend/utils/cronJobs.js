import cron from 'node-cron';
import { OrderService } from '../services/OrderService.js';

/**
 * Configurar trabajos programados para procesar órdenes
 */
export function setupCronJobs() {
  
  // Ejecutar cada 5 minutos: verificar órdenes para auto-aceptar
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Procesando órdenes para auto-aceptación...');
      await OrderService.processAutoAcceptOrders();
    } catch (error) {
      console.error('Error en cron auto-accept:', error);
    }
  });

  // Ejecutar cada hora: verificar órdenes expiradas
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🗑️ Procesando órdenes expiradas...');
      await OrderService.processExpiredOrders();
    } catch (error) {
      console.error('Error en cron expired orders:', error);
    }
  });

  console.log('⏰ Trabajos programados configurados exitosamente');
}

export default setupCronJobs;
