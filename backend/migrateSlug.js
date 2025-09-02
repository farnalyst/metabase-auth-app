const db = require('./database');
const crypto = require('crypto');

db.serialize(() => {
    // Step 1: Add slug column if not exists
    db.run(`ALTER TABLE dashboards ADD COLUMN slug TEXT`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error adding slug column:", err.message);
            return;
        }

        console.log("Slug column is ready (already exists or just created).");

        // Step 2: For dashboards with NULL slug, generate one
        db.all(`SELECT id FROM dashboards WHERE slug IS NULL OR slug = ''`, [], (err, rows) => {
            if (err) {
                console.error("Error selecting dashboards without slug:", err.message);
                return;
            }

            if (rows.length === 0) {
                console.log("All dashboards already have slugs.");
                return;
            }

            const stmt = db.prepare(`UPDATE dashboards SET slug = ? WHERE id = ?`);

            rows.forEach(row => {
                const slug = crypto.randomBytes(8).toString('hex'); // e.g. "a1b2c3d4e5f6g7h8"
                stmt.run(slug, row.id, (err) => {
                    if (err) {
                        console.error(`Failed to update slug for dashboard ${row.id}:`, err.message);
                    } else {
                        console.log(`Dashboard ${row.id} assigned slug ${slug}`);
                    }
                });
            });

            stmt.finalize(() => {
                console.log("Slug migration completed.");
            });
        });
    });
});
