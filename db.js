const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "./pairs.db";

function createDbConnection() {
    if (fs.existsSync(filepath)) {
        return new sqlite3.Database(filepath);
    } else {
        const db = new sqlite3.Database(filepath, (error) => {
            if (error) {
                return console.error(error.message);
            }
            createTable(db);
        });
        console.log("Connection with SQLite has been established");
        return db;
    }
}

function createTable(db) {
    db.exec(`
    CREATE TABLE pairs
    (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      token0   VARCHAR(50) NOT NULL,
      token1   VARCHAR(50) NOT NULL,
      router_name   VARCHAR(50) NOT NULL,
      router_address VARCHAR(50) NOT NULL,
      reserve_in BIGINT,
      reserve_out BIGINT,
      pair_address VARCHAR(50)
    );
  `);
}

module.exports = createDbConnection();