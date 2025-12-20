import pkg from "pg";
const { Pool } = pkg;

// This checks if we are on Render. If not, it uses your local settings.
const isProduction = process.env.DATABASE_URL;

export const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: "postgres",
        host: "localhost",
        database: "game_db",
        password: "adj234FNQ21d",
        port: 5432,
      }

);
pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Successfully connected to the database!');
    }
});