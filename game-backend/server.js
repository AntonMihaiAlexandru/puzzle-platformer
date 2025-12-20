import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* Save a player time */
app.post("/time", async (req, res) => {
  const { playerName, level, timeMs } = req.body;

  if (!playerName || !level || !Number.isInteger(timeMs)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    await pool.query(
      "INSERT INTO player_times (player_name, level, time_ms) VALUES ($1, $2, $3)",
      [playerName, level, timeMs]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* Get leaderboard - Best time per player */
app.get("/leaderboard/:level", async (req, res) => {
  const { level } = req.params;

  try {
    const result = await pool.query(
      `SELECT player_name, MIN(time_ms) as time_ms
       FROM player_times
       WHERE level = $1
       GROUP BY player_name
       ORDER BY time_ms ASC
       LIMIT 10`,
      [level]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

/* Get specific player rank */
app.get("/rank/:level/:playerName", async (req, res) => {
    const { level, playerName } = req.params;

    try {
        const result = await pool.query(
            `SELECT COUNT(*) + 1 as rank
             FROM (
                 SELECT player_name, MIN(time_ms) as best_time
                 FROM player_times
                 WHERE level = $1
                 GROUP BY player_name
             ) as subquery
             WHERE best_time < (
                 SELECT MIN(time_ms) 
                 FROM player_times 
                 WHERE level = $1 AND player_name = $2
             )`,
            [level, playerName]
        );

        res.json({ rank: result.rows[0].rank });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  
  // AUTO-TABLE CREATION LOGIC START
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_times (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(50) NOT NULL,
        level VARCHAR(50) NOT NULL,
        time_ms INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database table is ready (created or already exists).");
  } catch (err) {
    console.error("Error initializing database table:", err);
  }
  // AUTO-TABLE CREATION LOGIC END
});