import pkg from "pg";
import dotenv from "dotenv";
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB(retries = 5, retryDelayMs = 2000) {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      const res = await client.query(
        "SELECT current_database() AS current_database",
      );
      console.log(`✅ DB connected (${res.rows[0].current_database})`);
      client.release();
      return;
    } catch (err) {
      retries -= 1;
      if (retries <= 0) {
        break;
      }
      console.log("⏳ DB waking up... retrying");
      await sleep(retryDelayMs);
    }
  }

  throw new Error("❌ Could not connect to DB");
}
