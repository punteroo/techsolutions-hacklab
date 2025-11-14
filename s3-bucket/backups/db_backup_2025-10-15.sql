-- TechSolutions Database Backup
-- Date: 2025-10-15
-- CONFIDENTIAL - DO NOT DISTRIBUTE

USE techsolutions;

-- User credentials (EXPOSED!)
INSERT INTO users VALUES
(1, 'carlos.admin@techsolutions.com', 'carlos.admin@techsolutions.com', 'TechSol2024!Admin', 'admin', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
(2, 'maria.manager@techsolutions.com', 'maria.manager@techsolutions.com', 'Manager2024!', 'manager', '2024-02-01 09:30:00', '2024-02-01 09:30:00'),
(3, 'juan.user@techsolutions.com', 'juan.user@techsolutions.com', 'user123', 'user', '2024-03-10 14:20:00', '2024-03-10 14:20:00'),
(4, 'ana.developer@techsolutions.com', 'ana.developer@techsolutions.com', 'DevPass456', 'user', '2024-04-05 11:15:00', '2024-04-05 11:15:00');

-- Internal system credentials
-- DB_CONNECTION_STRING=mysql://root:vulnerable123@localhost:3306/techsolutions
-- AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
-- AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
-- JWT_SECRET=insecure-secret-key-do-not-use-in-production

-- Customer data (CONFIDENTIAL)
-- Total records: 1,247 customers
-- Last update: 2025-10-15
