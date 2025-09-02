const db = require('../database.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (user && user.isActive && bcrypt.compareSync(password, user.password)) {
            // User authenticated
            const payload = {
                id: user.id,
                username: user.username,
                role: user.role,
                level: user.level,
                branchId: user.branchId,
                regionalId: user.regionalId,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

            res.json({
                message: "Login successful",
                token,
                user: payload
            });
        } else {
            res.status(401).json({ message: "Invalid credentials or user is inactive" });
        }
    });
};

module.exports = { loginUser };