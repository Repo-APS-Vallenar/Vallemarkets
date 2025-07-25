-- Agregar columnas faltantes a la tabla orders
ALTER TABLE orders 
ADD COLUMN auto_accept_at TIMESTAMP NULL,
ADD COLUMN expires_at TIMESTAMP NULL,
ADD COLUMN payment_id VARCHAR(100) NULL,
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'mercadopago',
ADD COLUMN notes TEXT NULL,
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN delivered_at TIMESTAMP NULL;
