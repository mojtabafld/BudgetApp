import { Router } from 'express';
import { pool, isDbConfigured } from './db';

const router = Router();

// Health Check & DB Status
router.get('/health', async (req, res) => {
  if (!isDbConfigured) {
    return res.json({ status: 'ok', database: 'disconnected', mode: 'offline/local' });
  }
  try {
    const dbRes = await pool.query('SELECT NOW()');
    return res.json({ status: 'ok', database: 'connected', time: dbRes.rows[0].now });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', database: 'error', error: err.message });
  }
});

// GET all transactions
router.get('/transactions', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const { workspaceId, month } = req.query;
    let query = 'SELECT * FROM transactions';
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
      `INSERT INTO transactions (id, workspace_id, type, amount, category_id, date, note, payment_method, tags, is_recurring, recurring_months, created_by_id, created_by_name, created_by_avatar)
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
      `UPDATE transactions 
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
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all workspaces
router.get('/workspaces', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const wsRes = await pool.query('SELECT * FROM workspaces ORDER BY created_at ASC');
    const membersRes = await pool.query(
      `SELECT wm.*, u.name, u.email, u.avatar 
       FROM workspace_members wm 
       LEFT JOIN users u ON wm.user_id = u.id`
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
      `INSERT INTO workspaces (id, name, description, owner_id, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [wsId, name, description || null, owner_id, currency || 'DKK']
    );

    if (members && Array.isArray(members)) {
      for (const m of members) {
        await pool.query(
          `INSERT INTO workspace_members (workspace_id, user_id, role)
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
      `INSERT INTO workspace_members (workspace_id, user_id, role)
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
    await pool.query('DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true, workspace_id: id, user_id: userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET budget limits
router.get('/budgets', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const result = await pool.query('SELECT * FROM budget_limits');
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

// POST/PUT budget limit
router.post('/budgets', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, workspace_id, category_id, month, limit_amount } = req.body;
    const bId = id || `bl_${Date.now()}`;

    await pool.query(
      `INSERT INTO budget_limits (id, workspace_id, category_id, month, limit_amount)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET limit_amount = EXCLUDED.limit_amount`,
      [bId, workspace_id, category_id, month, limit_amount]
    );

    res.json({ success: true, id: bId, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET/POST users
router.get('/users', async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: 'Database not configured' });
  try {
    const { id, name, email, avatar } = req.body;
    const uId = id || `user_${Date.now()}`;
    await pool.query(
      `INSERT INTO users (id, name, email, avatar)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar`,
      [uId, name, email, avatar || null]
    );
    res.status(201).json({ id: uId, name, email, avatar });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
