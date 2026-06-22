import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '.env');

dotenv.config({ path: envFilePath });

const client = new pg.Client({
  host: process.env.HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

try {
  await client.connect();
  const res = await client.query(`
    SELECT id, "nombreCompleto", rut, email, status, rol, region, comuna
    FROM volunteers
    ORDER BY id DESC
    LIMIT 10
  `);
  console.log(JSON.stringify(res.rows, null, 2));
} catch (err) {
  console.error('DB ERROR', err.message || err);
  process.exit(1);
} finally {
  await client.end();
}
