import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

const sessionUser = (user: { id: string; email: string; full_name: string; role: 'guest' | 'admin' }) => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role,
});

const regenerateSession = (req: Express.Request) => new Promise<void>((resolve, reject) => {
  req.session.regenerate((error) => error ? reject(error) : resolve());
});

const saveSession = (req: Express.Request) => new Promise<void>((resolve, reject) => {
  req.session.save((error) => error ? reject(error) : resolve());
});

router.post('/register', async (req, res) => {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role`,
      [email, passwordHash, input.fullName],
    );

    await regenerateSession(req);
    req.session.userId = result.rows[0].id;
    await saveSession(req);
    res.status(201).json({ user: sessionUser(result.rows[0]) });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    throw error;
  }
});

router.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await pool.query(
    'SELECT id, email, full_name, password_hash, role FROM users WHERE LOWER(email) = LOWER($1)',
    [input.email],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  await regenerateSession(req);
  req.session.userId = user.id;
  await saveSession(req);
  res.json({ user: sessionUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }
    res.clearCookie('hotel.sid');
    res.status(204).end();
  });
});

export default router;
