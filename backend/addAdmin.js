const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// --- CONFIGURATION ---
const ADMIN_USERNAME = "farid.ridho";
const ADMIN_PASSWORD = "123456"; // CHANGE THIS
// ---------------------

const db = new sqlite3.Database('main.db');

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, salt);

// The 'admin' role has 'ho' level and null IDs by default
const sql = `INSERT INTO users (username, password, role, level, branchId, regionalId, isActive) 
             VALUES (?, ?, 'admin', 'ho', NULL, NULL, TRUE)`;

db.run(sql, [ADMIN_USERNAME, hashedPassword], function(err) {
    if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
            return console.error("Admin user already exists.");
        }
        return console.error("Error creating admin user:", err.message);
    }
    console.log(`✅ Admin user '${ADMIN_USERNAME}' created successfully with ID: ${this.lastID}`);
});

db.close();