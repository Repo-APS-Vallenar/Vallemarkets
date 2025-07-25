-- Script para agregar sistema de comisiones
-- Ejecutar después de tener la base de datos básica

-- Tabla de configuración de comisiones por vendedor
CREATE TABLE IF NOT EXISTS seller_commissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  seller_id VARCHAR(36) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 3.00, -- Porcentaje de comisión (ej: 3.00 = 3%)
  is_pilot BOOLEAN DEFAULT FALSE, -- Para identificar PyMEs piloto
  pilot_end_date DATE NULL, -- Fecha fin del periodo piloto
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status)
);

-- Tabla de transacciones de comisiones
CREATE TABLE IF NOT EXISTS commission_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id VARCHAR(36) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  order_total DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  platform_revenue DECIMAL(10,2) NOT NULL,
  seller_revenue DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'calculated', 'paid', 'disputed') DEFAULT 'pending',
  payment_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date)
);

-- Tabla de configuración de la plataforma
CREATE TABLE IF NOT EXISTS platform_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- Insertar configuraciones por defecto
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('default_commission_rate', '3.00', 'Porcentaje de comisión por defecto para nuevos vendedores'),
('pilot_commission_rate', '0.00', 'Porcentaje de comisión para PyMEs piloto'),
('pilot_duration_days', '30', 'Duración en días del periodo piloto'),
('min_commission_rate', '0.00', 'Porcentaje mínimo de comisión'),
('max_commission_rate', '15.00', 'Porcentaje máximo de comisión')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
updated_at = CURRENT_TIMESTAMP;

-- Agregar campo admin a la tabla users si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Crear usuario admin inicial (cambiar email y password en producción)
INSERT IGNORE INTO users (id, name, email, password, role, is_admin, created_at) VALUES
('admin-001', 'Administrador Valle Markets', 'admin@vallemarkets.cl', '$2b$10$8K8H4gH4gH4gH4gH4gH4gOuP9P9P9P9P9P9P9P9P9P9P9P9P9P9P9P', 'admin', TRUE, NOW());

-- Crear comisiones por defecto para vendedores existentes
INSERT INTO seller_commissions (seller_id, commission_rate, is_pilot, pilot_end_date)
SELECT 
  id,
  3.00,
  FALSE,
  NULL
FROM users 
WHERE role = 'seller' 
AND id NOT IN (SELECT seller_id FROM seller_commissions);
