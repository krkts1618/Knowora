const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/krkts/.gemini/antigravity/scratch/notenest/.env.local' });

async function testConnections() {
  console.log('Testing DATABASE_URL...');
  const directPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const r1 = await directPool.query('SELECT 1 as direct');
    console.log('Direct connection OK:', r1.rows);
  } catch (err) {
    console.error('Direct connection failed:', err.message);
  } finally {
    await directPool.end();
  }

  console.log('Testing DATABASE_URL_POOLED with ssl object...');
  const pooled1 = new Pool({
    connectionString: process.env.DATABASE_URL_POOLED,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const r2 = await pooled1.query('SELECT 1 as pooled1');
    console.log('Pooled 1 OK:', r2.rows);
  } catch (err) {
    console.error('Pooled 1 failed:', err.message);
  } finally {
    await pooled1.end();
  }

  console.log('Testing DATABASE_URL_POOLED with ssl: true...');
  const pooled2 = new Pool({
    connectionString: process.env.DATABASE_URL_POOLED,
    ssl: true
  });
  try {
    const r3 = await pooled2.query('SELECT 1 as pooled2');
    console.log('Pooled 2 OK:', r3.rows);
  } catch (err) {
    console.error('Pooled 2 failed:', err.message);
  } finally {
    await pooled2.end();
  }

  console.log('Testing DATABASE_URL_POOLED without ssl config...');
  const pooled3 = new Pool({
    connectionString: process.env.DATABASE_URL_POOLED,
  });
  try {
    const r4 = await pooled3.query('SELECT 1 as pooled3');
    console.log('Pooled 3 OK:', r4.rows);
  } catch (err) {
    console.error('Pooled 3 failed:', err.message);
  } finally {
    await pooled3.end();
  }
}

testConnections();
