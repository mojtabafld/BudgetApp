import { Router } from 'express';
import crypto from 'crypto';
import { pool, isDbConfigured, createAllTables } from './db';

const router = Router();

// Password Hashing Helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Health Check & DB Status
router.get('/health', async (req, res) => {
  if (!isDbConfigured) {
    return res.json({ status: 'ok', database: 'disconnected', mode: 'offline/local' });
  }
  try {
    const tableRes = await createAllTables();
    const dbRes = await pool.query('SELECT NOW()');
    return res.json({
      status: 'ok',
      database: 'connected',
      tablesCreated: tableRes.success,
      tableError: tableRes.error || null,
      time: dbRes.rows[0].now,
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', database: 'error', error: err.message });
  }
});

// ==========================================
// REAL AUTHENTICATION & USER REGISTRATION
// ==========================================

// Register Real User on DigitalOcean PostgreSQL
router.post('/auth/register', async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: 'Database not connected. Please verify DATABASE_URL.' });
  }

  try {
    // Ensure all tables exist in budgetapp schema
    const setupRes = await createAllTables();
    if (!setupRes.success) {
      console.error('Table setup issue on register:', setupRes.error);
      return res.status(500).json({ error: `Database initialization error: ${setupRes.error}` });
    }

    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailNorm = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM budgetapp.users WHERE LOWER(email) = $1', [emailNorm]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists' });
    }

    const userId = `user_${Date.now()}`;
    const pwdHash = hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    // 1. Insert user
    await pool.query(
      `INSERT INTO budgetapp.users (id, name, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, name.trim(), emailNorm, pwdHash, avatar]
    );

    // 2. Create initial Personal Wallet in DKK
    const wsId = `ws_${Date.now()}`;
    await pool.query(
      `INSERT INTO budgetapp.workspaces (id, name, description, owner_id, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [wsId, 'Personal Wallet', 'Personal finances & savings', userId, 'DKK']
    );

    // 3. Add user as owner of workspace
    await pool.query(
      `INSERT INTO budgetapp.workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [wsId, userId, 'owner']
    );

    const userObj = {
      id: userId,
      name: name.trim(),
      email: emailNorm,
      avatar,
      created_at: new Date().toISOString(),
    };

    const workspaceObj = {
      id: wsId,
      name: 'Personal Wallet',
      description: 'Personal finances & savings',
      owner_id: userId,
      currency: 'DKK',
      members: [
        {
          user_id: userId,
          name: name.trim(),
          email: emailNorm,
          avatar,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      user: userObj,
      workspaces: [workspaceObj],
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login Real User against PostgreSQL Dev DB
router.post('/auth/login', async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: 'Database not connected. Please verify DATABASE_URL.' });
  }

  try {
    const setupRes = await createAllTables();
    if (!setupRes.success) {
      console.error('Table setup issue on login:', setupRes.error);
      return res.status(500).json({ error: `Database initialization error: ${setupRes.error}` });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailNorm = email.trim().toLowerCase();

    // Look up user in budgetapp.users
    const userRes = await pool.query('SELECT * FROM budgetapp.users WHERE LOWER(email) = $1', [emailNorm]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'No account found with this email' });
    }

    const userRow = userRes.rows[0];

    // Check password
    if (!userRow.password_hash || !verifyPassword(password, userRow.password_hash)) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Incorrect password' });
    }

    // Fetch workspaces the user is a member of
    const wsRes = await pool.query(
      `SELECT w.* FROM budgetapp.workspaces w
       JOIN budgetapp.workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1
       ORDER BY w.created_at ASC`,
      [userRow.id]
    );

    const membersRes = await pool.query(
      `SELECT wm.*, u.name, u.email, u.avatar 
       FROM budgetapp.workspace_members wm 
       LEFT JOIN budgetapp.users u ON wm.user_id = u.id`
    );

    const workspaces = wsRes.rows.map((ws) => {
      const members = membersRes.rows
        .filter((m) => m.workspace_id === ws.id)
        .map((m) => ({
          user_id: m.user_id,
          name: m.name || 'Member',
          email: m.email || '',
          avatar: m.avatar,
          role: m.role,
          joined_at: m.joined_at,
        }));

      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        owner_id: ws.owner_id,
        currency: ws.currency || 'DKK',
        members,
        created_at: ws.created_at,
      };
    });

    const userObj = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar: userRow.avatar,
      created_at: userRow.created_at,
    };

    return res.json({
      success: true,
      user: userObj,
      workspaces,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ==========================================
// TRANSACTIONS (CRUD)
// ==========================================

// GET all transactions
router.get('/transactions', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const { workspaceId, month } = req.query;
    let query = 'SELECT * FROM budgetapp.transactions';
    const params: any[] = [];

    if (workspaceId) {
      params.push(workspaceId);
      query += ` WHERE workspace_id = $${params.length}`;
    }

    if (month) {
      params.push(`${month}%`);
      query += params.length === 1 ? ` WHERE date::text LIKE $1` : ` AND date::text LIKE $2`;
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const result = await pool.query(query, params);
    const mapped = result.rows.map((row) => ({
      id: row.id,
      workspace_id: row.workspace_id,
      type: row.type,
      amount: parseFloat(row.amount),
      category_id: row.category_id,
      date: row.date.toISOString().split('T')[0],
      note: row.note,
      payment_method: row.payment_method,
      tags: row.tags || [],
      is_recurring: Boolean(row.is_recurring),
      recurring_months: row.recurring_months || 1,
      created_by: {
        id: row.created_by_id,
        name: row.created_by_name,
        avatar: row.created_by_avatar,
      },
      created_at: row.created_at,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction
router.post('/transactions', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, workspace_id, type, amount, category_id, date, note, payment_method, tags, is_recurring, recurring_months, created_by } = req.body;
    const txId = id || `tx_${Date.now()}`;

    await pool.query(
      `INSERT INTO budgetapp.transactions (id, workspace_id, type, amount, category_id, date, note, payment_method, tags, is_recurring, recurring_months, created_by_id, created_by_name, created_by_avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         amount = EXCLUDED.amount,
         category_id = EXCLUDED.category_id,
         date = EXCLUDED.date,
         note = EXCLUDED.note,
         payment_method = EXCLUDED.payment_method,
         tags = EXCLUDED.tags,
         is_recurring = EXCLUDED.is_recurring`,
      [
        txId,
        workspace_id,
        type,
        amount,
        category_id,
        date,
        note || null,
        payment_method || 'card',
        tags || [],
        Boolean(is_recurring),
        recurring_months || 1,
        created_by?.id || null,
        created_by?.name || null,
        created_by?.avatar || null,
      ]
    );

    res.status(201).json({ id: txId, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction
router.put('/transactions/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id } = req.params;
    const { type, amount, category_id, date, note, payment_method, tags } = req.body;

    await pool.query(
      `UPDATE budgetapp.transactions 
       SET type = COALESCE($1, type),
           amount = COALESCE($2, amount),
           category_id = COALESCE($3, category_id),
           date = COALESCE($4, date),
           note = COALESCE($5, note),
           payment_method = COALESCE($6, payment_method),
           tags = COALESCE($7, tags)
       WHERE id = $8`,
      [type, amount, category_id, date, note, payment_method, tags, id]
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction
router.delete('/transactions/:id', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM budgetapp.transactions WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// WORKSPACES & MEMBERS
// ==========================================

// GET workspaces for active user
router.get('/workspaces', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM budgetapp.workspaces ORDER BY created_at ASC';
    const params: any[] = [];

    if (userId) {
      query = `SELECT w.* FROM budgetapp.workspaces w
               JOIN budgetapp.workspace_members wm ON w.id = wm.workspace_id
               WHERE wm.user_id = $1
               ORDER BY w.created_at ASC`;
      params.push(userId);
    }

    const wsRes = await pool.query(query, params);
    const membersRes = await pool.query(
      `SELECT wm.*, u.name, u.email, u.avatar 
       FROM budgetapp.workspace_members wm 
       LEFT JOIN budgetapp.users u ON wm.user_id = u.id`
    );

    const workspaces = wsRes.rows.map((ws) => {
      const members = membersRes.rows
        .filter((m) => m.workspace_id === ws.id)
        .map((m) => ({
          user_id: m.user_id,
          name: m.name || 'Member',
          email: m.email || '',
          avatar: m.avatar,
          role: m.role,
          joined_at: m.joined_at,
        }));

      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        owner_id: ws.owner_id,
        currency: ws.currency || 'DKK',
        members,
        created_at: ws.created_at,
      };
    });

    res.json(workspaces);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST new workspace
router.post('/workspaces', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, name, description, owner_id, currency, members } = req.body;
    const wsId = id || `ws_${Date.now()}`;

    await pool.query(
      `INSERT INTO budgetapp.workspaces (id, name, description, owner_id, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [wsId, name, description || null, owner_id, currency || 'DKK']
    );

    if (members && Array.isArray(members)) {
      for (const m of members) {
        await pool.query(
          `INSERT INTO budgetapp.workspace_members (workspace_id, user_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
          [wsId, m.user_id, m.role]
        );
      }
    }

    res.status(201).json({ id: wsId, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST add/update workspace member
router.post('/workspaces/:id/members', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    await pool.query(
      `INSERT INTO budgetapp.workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [id, user_id, role]
    );

    res.json({ success: true, workspace_id: id, user_id, role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE workspace member
router.delete('/workspaces/:id/members/:userId', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, userId } = req.params;
    await pool.query('DELETE FROM budgetapp.workspace_members WHERE workspace_id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true, workspace_id: id, user_id: userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// BUDGET LIMITS
// ==========================================

router.get('/budgets', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const result = await pool.query('SELECT * FROM budgetapp.budget_limits');
    const mapped = result.rows.map((r) => ({
      id: r.id,
      workspace_id: r.workspace_id,
      category_id: r.category_id,
      month: r.month,
      limit_amount: parseFloat(r.limit_amount),
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/budgets', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, workspace_id, category_id, month, limit_amount } = req.body;
    const bId = id || `bl_${Date.now()}`;

    await pool.query(
      `INSERT INTO budgetapp.budget_limits (id, workspace_id, category_id, month, limit_amount)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET limit_amount = EXCLUDED.limit_amount`,
      [bId, workspace_id, category_id, month, limit_amount]
    );

    res.json({ success: true, id: bId, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
