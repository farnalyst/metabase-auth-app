const db = require('../database.js');
const bcrypt = require('bcryptjs');

// Get all users
const getUsers = (req, res) => {
    db.all("SELECT id, username, role, level, branchId, regionalId, isActive FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json(rows);
    });
};

// Create a new user
const createUser = (req, res) => {
    const { username, password, role, level, branchId, regionalId } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const sql = `INSERT INTO users (username, password, role, level, branchId, regionalId) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [username, hashedPassword, role, level, branchId || null, regionalId || null];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(400).json({ message: "Failed to create user", error: err.message });
        }
        res.status(201).json({ message: "User created successfully", userId: this.lastID });
    });
};

// Update user status (activate/deactivate)
const updateUserStatus = (req, res) => {
    const { isActive } = req.body;
    const sql = `UPDATE users SET isActive = ? WHERE id = ?`;
    db.run(sql, [isActive, req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ message: "Failed to update user status", error: err.message });
        }
        res.json({ message: `User status updated successfully.` });
    });
};

const updateUserRole = (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Ensure the new role is one of the valid roles
    const validRoles = ['finance', 'partnership', 'growth', 'admin', 'QC'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role provided." });
    }
    
    const sql = `UPDATE users SET role = ? WHERE id = ?`;
    db.run(sql, [role, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: "Failed to update user role", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "User role updated successfully." });
    });
};


module.exports = { getUsers, createUser, updateUserStatus, updateUserRole };