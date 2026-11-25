import type { NextFunction, Request, Response } from 'express';
import { pool } from '../db.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, email, full_name AS "fullName", role FROM users WHERE id = $1',
      [req.session.userId],
    );

    if (!result.rowCount) {
      req.session.destroy(() => undefined);
      res.clearCookie('hotel.sid');
      res.status(401).json({ error: 'Your session is no longer valid. Please sign in again.' });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access is required.' });
    return;
  }

  next();
};
