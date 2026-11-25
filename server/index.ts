import 'dotenv/config';
import app from './app.js';
import { pool } from './db.js';

const port = Number(process.env.API_PORT || 4000);
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('Set SESSION_SECRET to a random value with at least 32 characters.');
}

const server = app.listen(port, () => {
  console.log(`Hotel API listening on http://localhost:${port}`);
});

const shutdown = () => {
  server.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
