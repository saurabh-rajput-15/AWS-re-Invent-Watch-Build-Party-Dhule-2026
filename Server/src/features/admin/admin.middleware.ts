import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

export interface AdminAuthRequest extends Request {
  adminUser?: {
    role: string;
    authenticatedAt: number;
  };
}

export function requireAdminAuth(req: AdminAuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Allow direct ADMIN_KEY access for bookmarklets, CLI scripts, and webhooks
  if (config.adminKey && token === config.adminKey) {
    req.adminUser = { role: 'admin', authenticatedAt: Date.now() };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { role: string; authenticatedAt: number };
    if (decoded.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges (Admin role required)' });
      return;
    }
    req.adminUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired admin session token' });
    return;
  }
}

export function requireScannerOrAdminAuth(req: AdminAuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Allow direct ADMIN_KEY or SCANNER_KEY access
  if (config.adminKey && token === config.adminKey) {
    req.adminUser = { role: 'admin', authenticatedAt: Date.now() };
    return next();
  }
  if (config.scannerKey && token === config.scannerKey) {
    req.adminUser = { role: 'scanner', authenticatedAt: Date.now() };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { role: string; authenticatedAt: number };
    if (decoded.role !== 'admin' && decoded.role !== 'scanner') {
      res.status(403).json({ success: false, message: 'Forbidden: Scanner or Admin role required' });
      return;
    }
    req.adminUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    return;
  }
}
