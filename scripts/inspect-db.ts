import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Neon PostgreSQL.');

    const res = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `);

    console.log(`Found ${res.rows.length} existing tables:`);
    for (const row of res.rows) {
      console.log(`- ${row.table_schema}.${row.table_name}`);
    }

    const extRes = await client.query(`
      SELECT extname, extversion FROM pg_extension;
    `);
    console.log('Installed extensions:');
    for (const row of extRes.rows) {
      console.log(`- ${row.extname} (v${row.extversion})`);
    }

    const availRes = await client.query(`
      SELECT name, default_version FROM pg_available_extensions WHERE name IN ('pg_trgm', 'uuid-ossp', 'btree_gin', 'vector');
    `);
    console.log('Available extensions:');
    for (const row of availRes.rows) {
      console.log(`- ${row.name} (v${row.default_version})`);
    }
  } catch (err: any) {
    console.error('Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

inspectDb();
