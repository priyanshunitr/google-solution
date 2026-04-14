import pool from './dbConnect.js';

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDb() {
  try {
    console.log('Creating "users" table...');
    await pool.query(createTableQuery);
    console.log('Table "users" created successfully.');
    
    // Optional: Seed some data
    // await pool.query("INSERT INTO users (name, email) VALUES ('Admin', 'admin@example.com') ON CONFLICT DO NOTHING");
    
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

initDb();
