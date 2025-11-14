import { Router, Request, Response } from 'express';
import db from '../config/database';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';

const router = Router();

// VULNERABLE LOGIN ENDPOINT - SQL Injection
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    // ⚠️ INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION
    // This uses string concatenation instead of parameterized queries
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    logger.warn('SQL Query Executed (VULNERABLE)', {
      query: query,
      ip: clientIp,
      timestamp: new Date().toISOString()
    });

    const [rows] = await db.execute<RowDataPacket[]>(query);

    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'insecure-secret',
        { expiresIn: '24h' }
      );

      logger.info('Successful login', {
        username: user.username,
        ip: clientIp,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      logger.warn('Failed login attempt', {
        username: username,
        ip: clientIp,
        timestamp: new Date().toISOString()
      });

      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error: any) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      query: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,
      ip: clientIp
    });

    // ⚠️ VULNERABLE - Exposing SQL errors to attackers
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
      sqlState: error.sqlState
    });
  }
});

// Register endpoint (less vulnerable but still has issues)
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    // Check if user exists
    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Insert new user (passwords stored in plain text - VULNERABLE!)
    await db.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, 'user']
    );

    logger.info('New user registered', {
      username: username,
      email: email,
      ip: clientIp,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error: any) {
    logger.error('Registration error', {
      error: error.message,
      ip: clientIp
    });

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

export default router;
