import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Authentication failed - No token provided', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'insecure-secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    logger.warn('Authentication failed - Invalid token', {
      ip: req.ip,
      path: req.path,
      error: error.message
    });
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
