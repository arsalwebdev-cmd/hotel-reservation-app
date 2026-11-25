import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';

const router = Router();
const roomType = z.enum(['standard', 'deluxe', 'suite']);

const roomSelect = `
  SELECT
    r.id::text AS id,
    r.slug,
    r.name,
    r.description,
    r.price::float8 AS price,
    r.currency,
    r.capacity,
    r.size_sqm::float8 AS size,
    r.type,
    r.images,
    r.amenities,
    r.featured,
    r.breakfast,
    r.pets_allowed AS pets,
    r.is_active AS available,
    COALESCE(r.images[1], '') AS "imageUrl",
    ROUND(AVG(rv.rating)::numeric, 1)::float8 AS rating
  FROM rooms r
  LEFT JOIN reviews rv ON rv.room_id = r.id
`;

router.get('/', async (req, res) => {
  const query = z.object({
    search: z.string().trim().max(100).optional(),
    guests: z.coerce.number().int().min(1).max(12).optional(),
    type: z.union([roomType, z.literal('any')]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    amenities: z.string().max(250).optional(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sort: z.enum(['recommended', 'price-asc', 'price-desc', 'rating']).optional(),
  }).refine((values) => Boolean(values.checkIn) === Boolean(values.checkOut), {
    message: 'Provide both check-in and check-out dates.',
  }).parse(req.query);

  const params: unknown[] = [];
  const conditions = ['r.is_active = TRUE'];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (query.guests) conditions.push(`r.capacity >= ${add(query.guests)}`);
  if (query.search) conditions.push(`(r.name ILIKE '%' || ${add(query.search)} || '%' OR r.description ILIKE '%' || ${add(query.search)} || '%')`);
  if (query.type && query.type !== 'any') conditions.push(`r.type = ${add(query.type)}`);
  if (query.minPrice !== undefined) conditions.push(`r.price >= ${add(query.minPrice)}`);
  if (query.maxPrice !== undefined) conditions.push(`r.price <= ${add(query.maxPrice)}`);

  const amenities = query.amenities?.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean) || [];
  if (amenities.length) conditions.push(`r.amenities @> ${add(amenities)}::text[]`);

  if (query.checkIn && query.checkOut) {
    if (query.checkOut <= query.checkIn) {
      res.status(400).json({ error: 'Check-out must be after check-in.' });
      return;
    }
    const checkIn = add(query.checkIn);
    const checkOut = add(query.checkOut);
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.room_id = r.id
        AND b.status IN ('pending', 'confirmed')
        AND daterange(b.check_in, b.check_out, '[)') && daterange(${checkIn}::date, ${checkOut}::date, '[)')
    )`);
  }

  const orderBy = {
    'price-asc': 'r.price ASC',
    'price-desc': 'r.price DESC',
    rating: 'rating DESC NULLS LAST, r.featured DESC, r.name ASC',
    recommended: 'r.featured DESC, rating DESC NULLS LAST, r.name ASC',
  }[query.sort || 'recommended'];

  const result = await pool.query(
    `${roomSelect}
     WHERE ${conditions.join(' AND ')}
     GROUP BY r.id
     ORDER BY ${orderBy}`,
    params,
  );
  res.json({ rooms: result.rows });
});

router.get('/:id', async (req, res) => {
  const id = z.string().min(1).max(100).parse(req.params.id);
  const result = await pool.query(
    `${roomSelect}
     WHERE r.is_active = TRUE AND (r.id::text = $1 OR r.slug = $1)
     GROUP BY r.id
     LIMIT 1`,
    [id],
  );

  if (!result.rowCount) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }

  res.json({ room: result.rows[0] });
});

router.get('/:id/availability', async (req, res) => {
  const id = z.string().min(1).max(100).parse(req.params.id);
  const dates = z.object({
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).parse(req.query);
  if (dates.checkOut <= dates.checkIn) {
    res.status(400).json({ error: 'Check-out must be after check-in.' });
    return;
  }

  const result = await pool.query(
    `SELECT r.is_active AND NOT EXISTS (
       SELECT 1 FROM bookings b
       WHERE b.room_id = r.id
         AND b.status IN ('pending', 'confirmed')
         AND daterange(b.check_in, b.check_out, '[)') && daterange($2::date, $3::date, '[)')
     ) AS available
     FROM rooms r WHERE r.id::text = $1 OR r.slug = $1 LIMIT 1`,
    [id, dates.checkIn, dates.checkOut],
  );
  if (!result.rowCount) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }
  res.json({ available: result.rows[0].available });
});

export default router;
