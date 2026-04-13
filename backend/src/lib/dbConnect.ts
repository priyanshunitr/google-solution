import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

//For NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

//For local
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'googlesol',
//   password: process.env.DB_PASS,
//   port: 5432,
// });

export default pool;

// Testing connection (Optional)
// Wrap in an IIFE or move to a separate test script
(async () => {
    try {
        const res = await pool.query('SELECT current_database()');
        console.log('Connected to database:', res.rows[0].current_database);
    } catch (err) {
        console.error('Database connection error:', err);
    }
})();
