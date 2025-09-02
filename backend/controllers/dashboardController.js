const db = require('../database.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Get dashboards available for the user's role
const getAvailableDashboards = (req, res) => {
    const userRole = req.user.role;

    const sql = `
        SELECT d.id, d.name, d.slug
        FROM dashboards d
        JOIN dashboard_permissions dp ON d.id = dp.dashboard_id
        WHERE dp.role = ? OR dp.role = 'all'
    `;

    db.all(sql, [userRole], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json(rows);
    });
};


// Get the embedding URL for a specific dashboard
const getDashboardEmbed = (req, res) => {
    const slug = req.params.slug; // slug, not metabaseDashboardId
    const userRole = req.user.role;
    const { level, branchId, regionalId, role } = req.user;
    const { merchant, merchantProvince } = req.query;

    const sql = `
        SELECT d.metabaseDashboardId
        FROM dashboards d
        JOIN dashboard_permissions dp ON d.id = dp.dashboard_id
        WHERE d.slug = ? AND (dp.role = ? OR dp.role = 'all')
    `;

    db.get(sql, [slug, userRole], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!row) {
            console.warn(`Access denied. slug=${slug}, role=${userRole}`);
            return res.status(403).json({ message: "Not authorized for this dashboard" });
        }

        const dashboardId = row.metabaseDashboardId;

        // your params logic stays the same ...
        let params = {};
        if (level === 'branch' && dashboardId === 24) {
            params.branch_id = branchId ? branchId.toString() : [];
            params.regional_id = [];
        } else if (level === 'regional' && dashboardId === 24) {
            params.branch_id = [];
            params.regional_id = regionalId ? regionalId.toString() : [];
        } else if (level === 'ho' && dashboardId === 24) {
            params.branch_id = [];
            params.regional_id = [];
        } else if (role === "merchant" && dashboardId === 25) {
            params.merchant_id = branchId ? branchId.toString() : [];
            params.merchant_name = [];
            params.merchant_province = [];
        } else if (level === 'ho' && dashboardId === 25) {
            params.merchant_id = [];
            params.merchant_name = merchant && merchant.length > 0 ? merchant.split(',') : [];
            params.merchant_province = merchantProvince && merchantProvince.length > 0 ? merchantProvince.split(',') : [];
        }

        const payload = {
            resource: { dashboard: dashboardId },
            params,
            exp: Math.round(Date.now() / 1000) + (10 * 60)
        };

        const token = jwt.sign(payload, process.env.METABASE_SECRET_KEY);
        const iframeUrl = `${process.env.METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

        res.json({ iframeUrl });
    });
};



// --- Admin Functions ---

const getDashboards = (req, res) => {
    const sql = `
        SELECT d.id, d.name, d.metabaseDashboardId, GROUP_CONCAT(dp.role) AS roles, d.slug
        FROM dashboards d
        LEFT JOIN dashboard_permissions dp ON d.id = dp.dashboard_id
        GROUP BY d.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        
        // Convert the comma-separated roles string back to an array
        const dashboardsWithRoles = rows.map(row => ({
            ...row,
            roles: row.roles ? row.roles.split(',') : []
        }));
        
        res.json(dashboardsWithRoles);
    });
};

// Add a new dashboard to the system
const addDashboard = (req, res) => {
    const { name, metabaseDashboardId, roles } = req.body;

    // generate random slug
    const slug = crypto.randomBytes(8).toString('hex');

    db.run(
        `INSERT INTO dashboards (name, metabaseDashboardId, slug) VALUES (?, ?, ?)`,
        [name, metabaseDashboardId, slug],
        function (err) {
            if (err) {
                return res.status(400).json({ message: "Failed to add dashboard", error: err.message });
            }

            const newDashboardId = this.lastID;
            const stmt = db.prepare(`INSERT INTO dashboard_permissions (role, dashboard_id) VALUES (?, ?)`);

            roles.forEach(role => {
                stmt.run(role, newDashboardId);
            });

            stmt.finalize(err => {
                if (err) {
                    return res.status(400).json({ message: "Failed to set dashboard permissions", error: err.message });
                }
                res.status(201).json({ message: "Dashboard added successfully", slug });
            });
        }
    );
};

const deleteDashboard = (req, res) => {
    const dashboardId = req.params.id;

    // Use a transaction to ensure both deletions succeed or fail together
    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");
        db.run(`DELETE FROM dashboard_permissions WHERE dashboard_id = ?`, dashboardId, (err) => {
            if (err) {
                db.run("ROLLBACK;");
                return res.status(500).json({ message: "Failed to delete dashboard permissions", error: err.message });
            }
        });
        db.run(`DELETE FROM dashboards WHERE id = ?`, dashboardId, (err) => {
            if (err) {
                db.run("ROLLBACK;");
                return res.status(500).json({ message: "Failed to delete dashboard", error: err.message });
            }
            db.run("COMMIT;");
            res.json({ message: "Dashboard deleted successfully" });
        });
    });
};

const updateDashboardPermissions = (req, res) => {
    const dashboardId = req.params.id;
    const { roles } = req.body;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");
        // First, delete all existing permissions for the dashboard
        db.run(`DELETE FROM dashboard_permissions WHERE dashboard_id = ?`, dashboardId, (err) => {
            if (err) {
                db.run("ROLLBACK;");
                return res.status(500).json({ message: "Failed to delete old permissions", error: err.message });
            }

            // Then, insert the new permissions
            const stmt = db.prepare(`INSERT INTO dashboard_permissions (role, dashboard_id) VALUES (?, ?)`);
            roles.forEach(role => {
                stmt.run(role, dashboardId);
            });
            stmt.finalize((err) => {
                if (err) {
                    db.run("ROLLBACK;");
                    return res.status(500).json({ message: "Failed to set new permissions", error: err.message });
                }
                db.run("COMMIT;");
                res.json({ message: "Dashboard permissions updated successfully" });
            });
        });
    });
};

module.exports = { 
    getAvailableDashboards, 
    getDashboardEmbed, 
    addDashboard,
    getDashboards,
    deleteDashboard,
    updateDashboardPermissions
};