-- TechSolutions S.A. Database Initialization
-- WARNING: This is a deliberately vulnerable database for educational purposes only

CREATE DATABASE IF NOT EXISTS techsolutions;
USE techsolutions;

-- Users table (stores passwords in plain text - VULNERABLE!)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'manager') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  credit_card_last4 VARCHAR(4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2),
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Insert vulnerable admin credentials (compromised in external breach)
INSERT INTO users (username, email, password, role) VALUES
('carlos.admin@techsolutions.com', 'carlos.admin@techsolutions.com', 'TechSol2024!Admin', 'admin'),
('maria.manager@techsolutions.com', 'maria.manager@techsolutions.com', 'Manager2024!', 'manager'),
('juan.user@techsolutions.com', 'juan.user@techsolutions.com', 'user123', 'user'),
('ana.developer@techsolutions.com', 'ana.developer@techsolutions.com', 'DevPass456', 'user'),
('backup_svc', 'backup@techsolutions.com', 'B@ckup!2024', 'admin'); -- Backdoor account created by attacker

-- Insert customer data (will be leaked)
INSERT INTO customers (first_name, last_name, email, phone, address, city, country, credit_card_last4) VALUES
('Roberto', 'García', 'roberto.garcia@email.com', '+54 11 4567-8901', 'Av. Corrientes 1234', 'Buenos Aires', 'Argentina', '4532'),
('Laura', 'Fernández', 'laura.fernandez@email.com', '+54 11 5678-9012', 'Calle Florida 567', 'Buenos Aires', 'Argentina', '7890'),
('Diego', 'Martínez', 'diego.martinez@email.com', '+56 2 2345-6789', 'Av. Providencia 890', 'Santiago', 'Chile', '1234'),
('Carolina', 'López', 'carolina.lopez@email.com', '+54 11 6789-0123', 'Av. Santa Fe 2345', 'Buenos Aires', 'Argentina', '5678'),
('Martín', 'Rodríguez', 'martin.rodriguez@email.com', '+56 2 3456-7890', 'Calle Huérfanos 456', 'Santiago', 'Chile', '9012'),
('Valeria', 'Sánchez', 'valeria.sanchez@email.com', '+54 11 7890-1234', 'Av. Callao 678', 'Buenos Aires', 'Argentina', '3456'),
('Sebastián', 'Torres', 'sebastian.torres@email.com', '+56 2 4567-8901', 'Av. Apoquindo 123', 'Santiago', 'Chile', '7891'),
('Florencia', 'Díaz', 'florencia.diaz@email.com', '+54 11 8901-2345', 'Av. Rivadavia 1111', 'Buenos Aires', 'Argentina', '2345'),
('Lucas', 'Pérez', 'lucas.perez@email.com', '+56 2 5678-9012', 'Calle Ahumada 789', 'Santiago', 'Chile', '6789'),
('Camila', 'González', 'camila.gonzalez@email.com', '+54 11 9012-3456', 'Av. Cabildo 2222', 'Buenos Aires', 'Argentina', '0123');

-- Insert more customers for realistic data volume
INSERT INTO customers (first_name, last_name, email, phone, address, city, country, credit_card_last4)
SELECT 
  CONCAT('Cliente', id),
  CONCAT('Apellido', id),
  CONCAT('cliente', id, '@email.com'),
  CONCAT('+54 11 ', LPAD(id, 8, '0')),
  CONCAT('Calle ', id),
  IF(id % 2 = 0, 'Buenos Aires', 'Santiago'),
  IF(id % 2 = 0, 'Argentina', 'Chile'),
  LPAD(MOD(id, 10000), 4, '0')
FROM users
LIMIT 1237; -- Total leaked records mentioned in the scenario

-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, status) VALUES
(1, 1250.50, 'completed'),
(2, 890.75, 'completed'),
(3, 2100.00, 'processing'),
(4, 450.25, 'completed'),
(5, 1680.90, 'pending'),
(6, 320.50, 'completed'),
(7, 950.00, 'cancelled'),
(8, 1450.75, 'completed'),
(9, 780.30, 'processing'),
(10, 2200.00, 'completed');

-- Enable general query log for forensics
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
