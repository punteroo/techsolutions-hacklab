import { Router, Request, Response } from 'express';
import db from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get all users (admin only)
router.get('/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, username, email, role, created_at FROM users'
    );

    res.json({
      success: true,
      users: rows
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get system stats
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const [userCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM users');
    const [customerCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM customers');
    const [orderCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM orders');

    res.json({
      success: true,
      stats: {
        users: userCount[0].count,
        customers: customerCount[0].count,
        orders: orderCount[0].count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

export default router;
