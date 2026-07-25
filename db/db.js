import Database from "better-sqlite3";

const db = new Database("master.db");

// db for fans target
db.exec(
  "CREATE TABLE IF NOT EXISTS user_target(discord_id TEXT PRIMARY KEY, game_id TEXT NOT NULL, target INT NOT NULL, deadline INT NOT NULL)",
);

// db for circle initialization
db.exec(
  "CREATE TABLE IF NOT EXISTS circle_list(channel_id TEXT PRIMARY KEY, circle_id TEXT NOT NULL, quota INT NOT NULL)",
);

export default db;
