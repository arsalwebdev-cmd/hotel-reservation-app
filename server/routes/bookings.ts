import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const createBookingSchema = z.object({
  roomId: z.string().uuid(),
  checkIn: z.string().regex(datePattern),
  checkOut: z.string().regex(datePattern),
  adults: z.number().int().min(1).max(12),
  children: z.number().int().min(0).max(12),
  guestName: z.string().trim().min(2).max(100),
  guestEmail: z.string().trim().email().max(254),
  specialRequests: z.string().trim().max(2000).optional().default(''),
});

router.use(requireAuth);

router.post('/', async (req, res) => {
  const input = createBookingSchema.parse(req.body);
  if (input.checkOut <= input.checkIn) {
    res.status(400).json({ error: 'Check-out must be after check-in.' });
    return;
  }
  if (input.adults + input.children > 12) {
    res.status(400).json({ error: 'A booking can have up to 12 guests.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roomResult = await client.query(
      'SELECT id, name, price, currency, capacity, is_active FROM rooms WHERE id = $1 FOR UPDATE',
      [input.roomId],
    );
    const room = roomResult.rows[0];

    if (!room || !room.is_active) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'This room is no longer available.' });
      return;
    }
    if (input.adults + input.children > room.capacity) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: `This room accommodates up to ${room.capacity} guests.` });
      return;
    }

    const overlap = await client.query(
      `SELECT 1 FROM bookings
       WHERE room_id = $1
         AND status IN ('pending', 'confirmed')
         AND daterange(check_in, check_out, '[)') && daterange($2::date, $3::date, '[)')
       LIMIT 1`,
      [input.roomId, input.checkIn, input.checkOut],
    );
    if (overlap.rowCount) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'This room is already booked for those dates. Choose another stay.' });
      return;
    }

    const nights = Math.round((Date.parse(`${input.checkOut}T00:00:00Z`) - Date.parse(`${input.checkIn}T00:00:00Z`)) / 86_400_000);
    if (nights < 1 || nights > 365) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'A stay must be between 1 and 365 nights.' });
      return;
    }

    const discount = nights >= 7 ? 0.9 : nights >= 3 ? 0.95 : 1;
    const subtotal = (Number(room.price) * nights * discount).toFixed(2);
    const bookingNumber = `SH-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        booking_number, user_id, room_id, room_name_snapshot, check_in, check_out,
        adults, children, guest_name, guest_email, special_requests,
        currency, subtotal, taxes, total, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, $13, 'pending', 'unpaid')
      RETURNING id, booking_number AS "bookingNumber", room_id AS "roomId", room_name_snapshot AS "roomName",
        check_in AS "checkIn", check_out AS "checkOut", adults, children, subtotal::float8, taxes::float8,
        total::float8, currency, status, payment_status AS "paymentStatus", created_at AS "createdAt"`,
      [bookingNumber, req.user!.id, room.id, room.name, input.checkIn, input.checkOut, input.adults, input.children,
        input.guestName, input.guestEmail.toLowerCase(), input.specialRequests, room.currency, subtotal],
    );

    await client.query('COMMIT');
    res.status(201).json({ booking: bookingResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23P01') {
      res.status(409).json({ error: 'This room was just booked for those dates. Please choose another stay.' });
      return;
    }
    throw error;
  } finally {
    client.release();
  }
});

router.get('/mine', async (req, res) => {
  const result = await pool.query(
    `SELECT id, booking_number AS "bookingNumber", room_id AS "roomId", room_name_snapshot AS "roomName",
      user_id AS "userId",
      check_in AS "checkIn", check_out AS "checkOut", adults, children, subtotal::float8, taxes::float8,
      total::float8, currency, status, payment_status AS "paymentStatus", created_at AS "createdAt"
     FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user!.id],
  );
  res.json({ bookings: result.rows });
});

router.get('/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const result = await pool.query(
    `SELECT b.id, b.booking_number AS "bookingNumber", b.room_id AS "roomId", b.room_name_snapshot AS "roomName",
      b.user_id AS "userId", b.guest_name AS "guestName", b.guest_email AS "guestEmail",
      b.check_in AS "checkIn", b.check_out AS "checkOut", b.adults, b.children,
      b.subtotal::float8, b.taxes::float8, b.total::float8, b.currency, b.status,
      b.payment_status AS "paymentStatus", b.special_requests AS "specialRequests", b.created_at AS "createdAt"
     FROM bookings b WHERE b.id = $1 AND ($2 = TRUE OR b.user_id = $3)`,
    [id, req.user!.role === 'admin', req.user!.id],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  res.json({ booking: result.rows[0] });
});

router.post('/:id/cancel', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed') AND check_in > CURRENT_DATE
     RETURNING id, booking_number AS "bookingNumber", status`,
    [id, req.user!.id],
  );
  if (!result.rowCount) {
    res.status(409).json({ error: 'This booking cannot be cancelled online. Contact the hotel for assistance.' });
    return;
  }
  res.json({ booking: result.rows[0] });
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = z.object({ status: z.enum(['confirmed', 'cancelled', 'completed']) }).parse(req.body);
  const result = await pool.query(
    `UPDATE bookings SET status = $2 WHERE id = $1
     RETURNING id, booking_number AS "bookingNumber", status, updated_at AS "updatedAt"`,
    [id, status],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  res.json({ booking: result.rows[0] });
});

export default router;
