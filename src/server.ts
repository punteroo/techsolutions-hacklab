import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import customerRoutes from './routes/customers';
import { logger } from './utils/logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Request logging
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`), { flags: 'a' })
}));
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║        TechSolutions S.A. - Security Lab                 ║
  ║        ⚠️  VULNERABLE APPLICATION - LAB USE ONLY ⚠️       ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  
  Server running on: http://techsolutions.com.test:${PORT}
  Database: MySQL (Port 3306)
  
  Available endpoints:
  - POST /api/auth/login (VULNERABLE to SQL Injection)
  - POST /api/auth/register
  - GET  /api/admin/users (Requires authentication)
  - GET  /api/customers (Requires authentication)
  
  Logs directory: ${logsDir}
  `);
  
  logger.info('TechSolutions Lab Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

export default app;
