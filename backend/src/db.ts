import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://docinator:docinator@localhost:5432/docinator';

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
  return res;
}
