import pkg from 'pg';
import { env } from './env.js';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
  query: (text, params) => pool.query(text, params),
};

