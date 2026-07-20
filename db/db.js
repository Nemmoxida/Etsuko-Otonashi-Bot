import Database from "better-sqlite3";

const db = new Database("circle.db");

// db initialization
db.exec(
  "CREATE TABLE IF NOT EXISTS circle_list(channel_id TEXT PRIMARY KEY, circle_id TEXT NOT NULL, quota INT NOT NULL)",
);

export default db;
