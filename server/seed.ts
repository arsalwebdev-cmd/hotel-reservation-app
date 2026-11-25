import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const sampleRooms = [
  {
    slug: 'deluxe-city-room', name: 'Deluxe City Room',
    description: 'A bright, spacious room with a king bed, city views, and thoughtful comforts for a relaxing stay.',
    type: 'deluxe', price: 299, capacity: 2, size: 42,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'breakfast', 'parking'], featured: true, breakfast: true, pets: false,
  },
  {
    slug: 'executive-suite', name: 'Executive Suite',
    description: 'An elegant suite with a separate living area, premium amenities, and plenty of room to unwind.',
    type: 'suite', price: 499, capacity: 3, size: 65,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'breakfast', 'pool'], featured: true, breakfast: true, pets: false,
  },
  {
    slug: 'ocean-view-suite', name: 'Ocean View Suite',
    description: 'A relaxing suite with sweeping ocean views, a spa-inspired bathroom, and personalized service.',
    type: 'suite', price: 699, capacity: 4, size: 85,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'breakfast', 'pool', 'parking'], featured: true, breakfast: true, pets: false,
  },
  {
    slug: 'standard-queen-room', name: 'Standard Queen Room',
    description: 'A comfortable, welcoming room with a queen bed and all the essentials for a city break.',
    type: 'standard', price: 199, capacity: 2, size: 30,
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'parking'], featured: false, breakfast: false, pets: true,
  },
  {
    slug: 'garden-deluxe-room', name: 'Garden Deluxe Room',
    description: 'A peaceful deluxe room overlooking the garden, with a king bed and a cozy seating area.',
    type: 'deluxe', price: 349, capacity: 2, size: 46,
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'breakfast', 'parking'], featured: false, breakfast: true, pets: true,
  },
  {
    slug: 'family-suite', name: 'Family Suite',
    description: 'A roomy suite with flexible sleeping space and family-friendly amenities for an easy stay.',
    type: 'suite', price: 559, capacity: 5, size: 78,
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['wifi', 'breakfast', 'pool', 'parking'], featured: false, breakfast: true, pets: false,
  },
];

try {
  for (const room of sampleRooms) {
    await pool.query(
      `INSERT INTO rooms (slug, name, description, type, price, capacity, size_sqm, images, amenities, featured, breakfast, pets_allowed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO NOTHING`,
      [room.slug, room.name, room.description, room.type, room.price, room.capacity, room.size, room.images,
        room.amenities, room.featured, room.breakfast, room.pets],
    );
  }
  console.log(`Seeded ${sampleRooms.length} sample rooms.`);

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_NAME && ADMIN_EMAIL && ADMIN_PASSWORD) {
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [ADMIN_EMAIL]);
    if (!existing.rowCount) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await pool.query(
        "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, 'admin')",
        [ADMIN_EMAIL.toLowerCase(), passwordHash, ADMIN_NAME],
      );
      console.log('Created the configured first administrator account.');
    } else {
      console.log('Administrator email already exists; left its role unchanged.');
    }
  }
} catch (error) {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
