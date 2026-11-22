import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ 
    connectionString: process.env.DATABASE_URL 
});

const result = await pool.query('SELECT NOW()');
console.log('Connected! Time from DB:', result.rows[0]);

await pool.end();