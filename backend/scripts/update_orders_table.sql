-- Actualizar tabla de órdenes para mejor gestión de flujo
ALTER TABLE orders 
ADD COLUMN payment_id VARCHAR(255) NULL COMMENT 'ID del pago en MercadoPago',
ADD COLUMN auto_accept_at DATETIME NULL COMMENT 'Fecha límite para aceptación automática',
ADD COLUMN rejection_reason TEXT NULL COMMENT 'Razón de rechazo',
ADD COLUMN notes TEXT NULL COMMENT 'Notas adicionales',
ADD COLUMN expires_at DATETIME NULL COMMENT 'Fecha de expiración de la orden';

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_orders_auto_accept ON orders(auto_accept_at);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);

-- Actualizar estados posibles
ALTER TABLE orders 
MODIFY COLUMN status ENUM(
  'pending',      -- Pendiente de pago
  'paid',         -- Pagada, esperando aceptación del vendedor
  'accepted',     -- Aceptada por el vendedor
  'shipped',      -- Enviada
  'delivered',    -- Entregada
  'completed',    -- Completada (confirmada por comprador)
  'cancelled',    -- Cancelada (antes del pago)
  'rejected',     -- Rechazada por vendedor
  'disputed',     -- En disputa
  'refunded'      -- Reembolsada
) DEFAULT 'pending';

-- Actualizar estados de pago
ALTER TABLE orders 
MODIFY COLUMN payment_status ENUM(
  'pending',      -- Pendiente
  'processing',   -- Procesando
  'approved',     -- Aprobado
  'rejected',     -- Rechazado
  'cancelled',    -- Cancelado
  'refunded',     -- Reembolsado
  'disputed'      -- En disputa
) DEFAULT 'pending';
