const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_SOURCE = "main.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        // Create tables if they don't exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT,
                level TEXT,
                branchId INTEGER,
                regionalId INTEGER,
                isActive BOOLEAN DEFAULT TRUE
            )`, (err) => {
                if (err) console.error("Error creating users table", err);
            });

            db.run(`CREATE TABLE IF NOT EXISTS dashboards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                metabaseDashboardId INTEGER
            )`, (err) => {
                 if (err) console.error("Error creating dashboards table", err);
            });

            db.run(`CREATE TABLE IF NOT EXISTS dashboard_permissions (
                role TEXT,
                dashboard_id INTEGER,
                PRIMARY KEY (role, dashboard_id),
                FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
            )`, (err) => {
                 if (err) console.error("Error creating dashboard_permissions table", err);
            });
        });
    }
});

module.exports = db;