import express from 'express';
import CommissionService from '../services/CommissionService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener configuración de comisión del vendedor actual
router.get('/my-commission', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const commission = await CommissionService.getSellerCommission(sellerId);
    
    if (!commission) {
      return res.status(404).json({ 
        error: 'No commission configuration found' 
      });
    }
    
    res.json({ commission });
  } catch (error) {
    console.error('Error getting my commission:', error);
    res.status(500).json({ error: 'Error retrieving commission information' });
  }
});

// RUTAS DE ADMINISTRADOR

// Obtener estadísticas generales de comisiones
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await CommissionService.getCommissionStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error getting commission stats:', error);
    res.status(500).json({ error: 'Error retrieving commission statistics' });
  }
});

// Obtener todas las comisiones de vendedores
router.get('/sellers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sellers = await CommissionService.getAllSellerCommissions();
    res.json({ sellers });
  } catch (error) {
    console.error('Error getting seller commissions:', error);
    res.status(500).json({ error: 'Error retrieving seller commissions' });
  }
});

// Actualizar comisión de un vendedor
router.put('/sellers/:sellerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { commissionRate, isPilot, pilotDurationDays } = req.body;

    if (commissionRate < 0 || commissionRate > 15) {
      return res.status(400).json({ 
        error: 'Commission rate must be between 0% and 15%' 
      });
    }

    let pilotEndDate = null;
    if (isPilot && pilotDurationDays) {
      pilotEndDate = new Date(Date.now() + pilotDurationDays * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
    }

    await CommissionService.setSellerCommission(
      sellerId, 
      commissionRate, 
      isPilot, 
      pilotEndDate
    );

    res.json({ 
      success: true, 
      message: 'Commission updated successfully',
      pilotEndDate 
    });
  } catch (error) {
    console.error('Error updating seller commission:', error);
    res.status(500).json({ error: 'Error updating commission' });
  }
});

// Establecer estado de piloto para un vendedor
router.post('/sellers/:sellerId/pilot', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { isPilot, durationDays = 30 } = req.body;

    const result = await CommissionService.setPilotStatus(sellerId, isPilot, durationDays);
    
    res.json({ 
      success: true, 
      message: isPilot ? 'Seller set as pilot' : 'Pilot status removed',
      pilotEndDate: result.pilotEndDate 
    });
  } catch (error) {
    console.error('Error setting pilot status:', error);
    res.status(500).json({ error: 'Error updating pilot status' });
  }
});

// Obtener configuraciones de la plataforma
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await CommissionService.getPlatformSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Error getting platform settings:', error);
    res.status(500).json({ error: 'Error retrieving platform settings' });
  }
});

// Actualizar configuración de la plataforma
router.put('/settings/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const success = await CommissionService.updatePlatformSetting(key, value);
    
    if (!success) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ 
      success: true, 
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    console.error('Error updating platform setting:', error);
    res.status(500).json({ error: 'Error updating setting' });
  }
});

// Calcular comisión para una orden (usado internamente)
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { orderId, orderTotal, sellerId } = req.body;

    if (!orderId || !orderTotal || !sellerId) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, orderTotal, sellerId' 
      });
    }

    const commission = await CommissionService.calculateOrderCommission(
      orderId, 
      orderTotal, 
      sellerId
    );

    res.json({ 
      success: true, 
      commission 
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ error: 'Error calculating commission' });
  }
});

export default router;
