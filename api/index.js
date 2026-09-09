import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─────────────────────────────────────────────
// Neon Postgres Connection (Free Tier)
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_q3lYdVLSab4s@ep-damp-rain-aupat3dh-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Keep Neon awake — ping every 4 minutes so it never sleeps during use
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (e) {
    // silent keep-alive
  }
}, 4 * 60 * 1000);

// Helper to run a query
const db = (text, params) => pool.query(text, params);

// ─────────────────────────────────────────────
// Initialize Database Tables
// ─────────────────────────────────────────────
async function initDB() {
  try {
    await db(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        industry TEXT,
        contact_email TEXT,
        logo TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await db(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        icon TEXT DEFAULT 'Box',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await db(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        company_id TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        can_edit BOOLEAN DEFAULT false,
        can_view BOOLEAN DEFAULT true,
        permissions JSONB DEFAULT '{"assets":"view","tickets":"view","companies":"view","products":"view","users":"none"}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Add permissions and company_name column to existing tables without it
    await db(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"assets":"view","tickets":"view","companies":"view","products":"view","users":"none"}'`).catch(() => {});
    await db(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT`).catch(() => {});

    await db(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        company TEXT,
        company_logo TEXT,
        assigned_to TEXT,
        serial_number TEXT,
        location TEXT,
        status TEXT DEFAULT 'Functional',
        lifecycle_state TEXT DEFAULT 'Procured',
        warranty_start DATE,
        warranty_end DATE,
        qr_data TEXT,
        asset_type TEXT,
        specs JSONB DEFAULT '{}',
        history JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await db(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        priority TEXT DEFAULT 'Medium',
        submitted_by UUID REFERENCES users(id),
        assigned_to UUID REFERENCES users(id),
        history JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await db(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        asset_name TEXT,
        asset_code TEXT,
        reported_by TEXT,
        assigned_to TEXT,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending',
        stage TEXT DEFAULT 'Received',
        notes JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Insert default admin user if not exists
    const { rows: existingAdmins } = await db("SELECT id FROM users WHERE name = 'System Administrator' AND role = 'admin'");
    if (existingAdmins.length === 0) {
      await db(`
        INSERT INTO users (name, email, company_id, password, role)
        VALUES ('System Administrator', 'admin@company.com', NULL, 'admin', 'admin')
      `);
    }

    // Insert default products if empty
    const { rows: existingProducts } = await db('SELECT COUNT(*) FROM products');
    if (parseInt(existingProducts[0].count) === 0) {
      const defaults = [
        ['Desktop', 'Monitor'], ['Scanner', 'Printer'], ['Printer', 'Printer'],
        ['Laptop', 'Laptop'], ['Router', 'Router'], ['Switch', 'Network'],
        ['Firewall', 'Shield'], ['IoT Devices', 'Cpu']
      ];
      for (const [name, icon] of defaults) {
        await db('INSERT INTO products (name, icon) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [name, icon]);
      }
    }

    console.log('[DB] Neon Postgres tables ready.');
  } catch (err) {
    console.error('[DB] Error initializing tables:', err.message);
  }
}

initDB();

// ─────────────────────────────────────────────
// IoT REST Endpoint
// ─────────────────────────────────────────────
app.post('/api/iot/ping', async (req, res) => {
  try {
    const payload = req.body;
    await db(
      'UPDATE assets SET specs = specs || $1 WHERE asset_code = $2',
      [JSON.stringify({ healthStatus: payload.status, lastHealthCheck: new Date() }), payload.assetCode]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('IoT update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ASSETS API
// ─────────────────────────────────────────────
app.get('/api/assets', async (req, res) => {
  try {
    const { rows } = await db('SELECT * FROM assets ORDER BY created_at DESC');
    const assets = rows.map(mapAsset);
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assets for a specific company (for employee ticket form)
app.get('/api/assets/by-company/:companyName', async (req, res) => {
  try {
    const { rows } = await db(
      'SELECT * FROM assets WHERE LOWER(company) = LOWER($1) ORDER BY name ASC',
      [req.params.companyName]
    );
    res.json(rows.map(mapAsset));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const { type, name, category, company, companyLogo, assignedTo, serialNumber, location,
            status, lifecycleState, warrantyStart, warrantyEnd, ...specs } = req.body;

    const assetCode = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrData = `Asset: ${name}\nSerial: ${serialNumber}\nCode: ${assetCode}\nCompany: ${company}`;
    const history = JSON.stringify([{ date: new Date().toISOString(), action: 'Created', user: 'System', note: 'Asset added to inventory' }]);

    const { rows } = await db(`
      INSERT INTO assets (asset_code, name, category, company, company_logo, assigned_to, serial_number,
        location, status, lifecycle_state, warranty_start, warranty_end, qr_data, asset_type, specs, history)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [assetCode, name, category, company, companyLogo || null, assignedTo, serialNumber,
        location, status || 'Functional', lifecycleState || 'Procured',
        warrantyStart || null, warrantyEnd || null, qrData, type, JSON.stringify(specs), history]);

    res.json({ success: true, asset: mapAsset(rows[0]) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/assets/:id', async (req, res) => {
  try {
    const { rows: existing } = await db('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });

    const asset = existing[0];
    let history = asset.history || [];

    if (req.body.assignedTo !== asset.assigned_to) {
      history.push({ date: new Date().toISOString(), action: 'Reassigned', user: 'System', note: `Assigned to ${req.body.assignedTo || 'Unassigned'}` });
    }
    if (req.body.status && req.body.status !== asset.status) {
      history.push({ date: new Date().toISOString(), action: 'Status Changed', user: 'System', note: `Status changed to ${req.body.status}` });
    }

    const { rows } = await db(`
      UPDATE assets SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        company = COALESCE($3, company),
        company_logo = $4,
        assigned_to = $5,
        serial_number = COALESCE($6, serial_number),
        location = $7,
        status = COALESCE($8, status),
        lifecycle_state = COALESCE($9, lifecycle_state),
        warranty_start = $10,
        warranty_end = $11,
        history = $12
      WHERE id = $13
      RETURNING *
    `, [
      req.body.name, req.body.category, req.body.company,
      req.body.companyLogo || asset.company_logo,
      req.body.assignedTo, req.body.serialNumber,
      req.body.location, req.body.status, req.body.lifecycleState,
      req.body.warrantyStart || null, req.body.warrantyEnd || null,
      JSON.stringify(history), req.params.id
    ]);

    res.json({ success: true, asset: mapAsset(rows[0]) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    await db('DELETE FROM assets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// TICKETS API
// ─────────────────────────────────────────────
app.get('/api/tickets', async (req, res) => {
  try {
    const { rows } = await db(`
      SELECT t.*, 
        json_build_object('id', u.id, 'name', u.name, 'companyId', u.company_id) as submitted_by_user,
        json_build_object('id', a.id, 'name', a.name) as assigned_to_user
      FROM tickets t
      LEFT JOIN users u ON t.submitted_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      ORDER BY t.created_at DESC
    `);
    const tickets = rows.map(mapTicket);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tickets/my/:userId', async (req, res) => {
  try {
    const { rows } = await db(`
      SELECT t.*,
        json_build_object('id', u.id, 'name', u.name, 'companyId', u.company_id) as submitted_by_user
      FROM tickets t
      LEFT JOIN users u ON t.submitted_by = u.id
      WHERE t.submitted_by = $1
      ORDER BY t.created_at DESC
    `, [req.params.userId]);
    res.json(rows.map(mapTicket));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const history = JSON.stringify([{ date: new Date().toISOString(), action: 'Created', user: 'User', note: 'Ticket opened' }]);
    const { rows } = await db(`
      INSERT INTO tickets (title, description, status, priority, submitted_by, history)
      VALUES ($1, $2, 'Open', $3, $4, $5)
      RETURNING *
    `, [req.body.title, req.body.description, req.body.priority || 'Medium', req.body.submittedBy || null, history]);
    res.json({ success: true, ticket: mapTicket(rows[0]) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { rows: existing } = await db('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });

    const ticket = existing[0];
    let history = ticket.history || [];

    if (req.body.status && req.body.status !== ticket.status) {
      history.push({ date: new Date().toISOString(), action: 'Status Changed', user: req.body.adminName || 'Admin', note: `Status changed to ${req.body.status}` });
    }
    if (req.body.newNote) {
      history.push({ date: new Date().toISOString(), action: 'Note Added', user: req.body.adminName || 'Admin', note: req.body.newNote });
    }

    const { rows } = await db(`
      UPDATE tickets SET status = COALESCE($1, status), assigned_to = $2, history = $3 WHERE id = $4 RETURNING *
    `, [req.body.status, req.body.assignedTo || ticket.assigned_to, JSON.stringify(history), req.params.id]);

    res.json({ success: true, ticket: mapTicket(rows[0]) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await db('DELETE FROM tickets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { role, identifier, password } = req.body;
  try {
    if (role === 'admin') {
      const { rows } = await db("SELECT * FROM users WHERE role='admin' AND (email=$1 OR name=$1)", [identifier]);
      if (rows.length > 0) {
        // Find the first admin matching the password
        const u = rows.find(r => r.password === password);
        if (u) {
          return res.json({ success: true, user: { id: u.id, name: u.name, role: u.role, permissions: u.permissions } });
        }
      }
      // If we are here, either user not found or password didn't match
      // We will still allow the hardcoded master login as a fallback just in case they get locked out
      if (identifier === 'admin' && password === 'admin') {
         const { rows: masterRows } = await db("SELECT * FROM users WHERE role='admin' AND name='System Administrator'");
         if (masterRows.length > 0) {
           const mu = masterRows[0];
           return res.json({ success: true, user: { id: mu.id, name: mu.name, role: mu.role, permissions: mu.permissions } });
         }
      }
      return res.status(401).json({ error: 'Invalid admin credentials. Please check your username and password.' });
    } else {
      // Member login - only needs company_id
      const { rows } = await db("SELECT * FROM users WHERE company_id = $1", [identifier]);
      if (rows.length) {
        const u = rows[0];
        return res.json({ success: true, user: { id: u.id, name: u.name, role: u.role, companyId: u.company_id } });
      }
      return res.status(401).json({ error: `Member ID "${identifier}" not found. Please ask your admin to add your account.` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// COMPANIES API
// ─────────────────────────────────────────────
app.get('/api/companies', async (req, res) => {
  try {
    const { rows } = await db('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(rows.map(c => ({ _id: c.id, ...c })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { rows } = await db(
      'INSERT INTO companies (name, industry, contact_email, logo) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.body.name, req.body.industry, req.body.contactEmail || req.body.contact_email, req.body.logo]
    );
    const c = rows[0];
    res.json({ success: true, company: { _id: c.id, ...c } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { rows } = await db(
      'UPDATE companies SET name=COALESCE($1,name), industry=COALESCE($2,industry), contact_email=COALESCE($3,contact_email), logo=$4 WHERE id=$5 RETURNING *',
      [req.body.name, req.body.industry, req.body.contactEmail || req.body.contact_email, req.body.logo, req.params.id]
    );
    const c = rows[0];
    res.json({ success: true, company: { _id: c.id, ...c } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await db('DELETE FROM companies WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// PRODUCTS API
// ─────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await db('SELECT * FROM products ORDER BY name ASC');
    res.json(rows.map(p => ({ _id: p.id, ...p })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { rows } = await db(
      'INSERT INTO products (name, icon) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING RETURNING *',
      [req.body.name, req.body.icon || 'Box']
    );
    res.json({ success: true, product: { _id: rows[0]?.id, ...rows[0] } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await db(
      'UPDATE products SET name=COALESCE($1,name), icon=COALESCE($2,icon) WHERE id=$3 RETURNING *',
      [req.body.name, req.body.icon, req.params.id]
    );
    res.json({ success: true, product: { _id: rows[0].id, ...rows[0] } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await db("SELECT id, name, email, company_id, company_name, role, can_edit, can_view, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC");
    res.json(rows.map(u => ({ _id: u.id, companyId: u.company_id, companyName: u.company_name, ...u })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { rows } = await db(
      'INSERT INTO users (name, email, company_id, company_name, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.body.name, req.body.email, req.body.companyId || req.body.company_id, req.body.companyName, req.body.password || 'pass123', req.body.role || 'user']
    );
    const u = rows[0];
    res.json({ success: true, user: { _id: u.id, companyId: u.company_id, companyName: u.company_name, ...u } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { rows } = await db(
      'UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), company_id=COALESCE($3,company_id), company_name=COALESCE($4,company_name), role=COALESCE($5,role) WHERE id=$6 RETURNING *',
      [req.body.name, req.body.email, req.body.companyId || req.body.company_id, req.body.companyName, req.body.role, req.params.id]
    );
    const u = rows[0];
    res.json({ success: true, user: { _id: u.id, companyId: u.company_id, companyName: u.company_name, ...u } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// HELPER MAPPERS (DB row → frontend shape)
// ─────────────────────────────────────────────
function mapAsset(row) {
  return {
    _id: row.id,
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    category: row.category,
    company: row.company,
    companyLogo: row.company_logo,
    assignedTo: row.assigned_to,
    serialNumber: row.serial_number,
    location: row.location,
    status: row.status,
    lifecycleState: row.lifecycle_state,
    warrantyStart: row.warranty_start,
    warrantyEnd: row.warranty_end,
    qrData: row.qr_data,
    type: row.asset_type,
    specs: row.specs || {},
    history: row.history || [],
    createdAt: row.created_at
  };
}

function mapTicket(row) {
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    submittedBy: row.submitted_by_user || row.submitted_by,
    assignedTo: row.assigned_to_user || row.assigned_to,
    history: row.history || [],
    createdAt: row.created_at
  };
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ADMIN ACCOUNTS API
// ─────────────────────────────────────────────
app.get('/api/admins', async (req, res) => {
  try {
    const { rows } = await db("SELECT id, name, email, role, can_edit, can_view, permissions, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC");
    res.json(rows.map(u => ({ _id: u.id, ...u })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admins', async (req, res) => {
  try {
    const defaultPerms = { assets: 'edit', tickets: 'edit', companies: 'view', products: 'view', users: 'none' };
    const permissions = req.body.permissions || defaultPerms;
    const { rows } = await db(
      `INSERT INTO users (name, email, password, role, can_edit, can_view, permissions)
       VALUES ($1, $2, $3, 'admin', $4, true, $5) RETURNING *`,
      [req.body.name, req.body.email, req.body.password || 'admin123', req.body.canEdit !== false, JSON.stringify(permissions)]
    );
    const u = rows[0];
    res.json({ success: true, admin: { _id: u.id, ...u } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/admins/:id', async (req, res) => {
  try {
    const { rows } = await db(
      `UPDATE users SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = CASE WHEN $3 IS NOT NULL AND $3 != '' THEN $3 ELSE password END,
        can_edit = COALESCE($4, can_edit),
        permissions = COALESCE($5, permissions)
       WHERE id = $6 AND role = 'admin' RETURNING *`,
      [req.body.name, req.body.email, req.body.password || null, req.body.canEdit,
       req.body.permissions ? JSON.stringify(req.body.permissions) : null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Admin not found' });
    const u = rows[0];
    res.json({ success: true, admin: { _id: u.id, ...u } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admins/:id', async (req, res) => {
  try {
    const { rows } = await db("SELECT name FROM users WHERE id = $1", [req.params.id]);
    if (rows[0]?.name === 'System Administrator') {
      return res.status(403).json({ error: 'Cannot delete the System Administrator account.' });
    }
    await db("DELETE FROM users WHERE id = $1 AND role = 'admin'", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ─────────────────────────────────────────────
// MAINTENANCE API
// ─────────────────────────────────────────────

// Get all maintenance jobs
app.get('/api/maintenance', async (req, res) => {
  try {
    const { rows } = await db('SELECT * FROM maintenance ORDER BY created_at DESC');
    res.json(rows.map(r => ({ _id: r.id, ...r })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create maintenance job (manual or escalated from ticket)
app.post('/api/maintenance', async (req, res) => {
  try {
    const { title, description, assetName, assetCode, reportedBy, assignedTo, priority, ticketId } = req.body;
    const { rows } = await db(
      `INSERT INTO maintenance (ticket_id, title, description, asset_name, asset_code, reported_by, assigned_to, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [ticketId || null, title, description, assetName || null, assetCode || null, reportedBy || null, assignedTo || null, priority || 'Medium']
    );
    // If escalated from ticket, update the ticket status
    if (ticketId) {
      await db(
        `UPDATE tickets SET 
          status = 'In Progress',
          history = history || $1::jsonb
         WHERE id = $2`,
        [JSON.stringify([{ action: 'Escalated to Maintenance', user: 'Admin', date: new Date(), note: 'Ticket moved to Maintenance queue' }]), ticketId]
      );
    }
    const r = rows[0];
    res.json({ success: true, job: { _id: r.id, ...r } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Get maintenance jobs by ticket ID
app.get('/api/maintenance/by-ticket/:ticketId', async (req, res) => {
  try {
    const { rows } = await db('SELECT * FROM maintenance WHERE ticket_id = $1 ORDER BY created_at DESC LIMIT 1', [req.params.ticketId]);
    if (!rows.length) return res.json(null);
    const r = rows[0];
    res.json({ _id: r.id, ...r });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update maintenance job (stage, status, assignedTo, add note)
app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const { stage, status, assignedTo, note, techName } = req.body;
    let noteUpdate = null;
    if (note) {
      const existing = await db('SELECT notes FROM maintenance WHERE id = $1', [req.params.id]);
      const currentNotes = existing.rows[0]?.notes || [];
      const newNote = { text: note, by: techName || 'Admin', date: new Date() };
      noteUpdate = JSON.stringify([...currentNotes, newNote]);
    }
    const { rows } = await db(
      `UPDATE maintenance SET
        stage = COALESCE($1, stage),
        status = COALESCE($2, status),
        assigned_to = COALESCE($3, assigned_to),
        notes = COALESCE($4::jsonb, notes),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [stage || null, status || null, assignedTo || null, noteUpdate, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];

    // Auto-resolve linked ticket when maintenance is Completed
    if ((stage === 'Completed' || status === 'Completed') && r.ticket_id) {
      await db(
        `UPDATE tickets SET
          status = 'Resolved',
          history = history || $1::jsonb
         WHERE id = $2`,
        [JSON.stringify([{
          action: 'Resolved via Maintenance',
          user: 'IT Team',
          date: new Date(),
          note: `Maintenance job completed${r.assigned_to ? ' by ' + r.assigned_to : ''}. Ticket auto-resolved.`
        }]), r.ticket_id]
      );
    }

    res.json({ success: true, job: { _id: r.id, ...r } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Delete maintenance job
app.delete('/api/maintenance/:id', async (req, res) => {
  try {
    await db('DELETE FROM maintenance WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default app;
