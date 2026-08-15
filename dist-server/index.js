// server/index.ts
import express from "express";
import cors from "cors";
import path from "path";
import dotenv2 from "dotenv";

// server/routes.ts
import { Router } from "express";
import crypto from "crypto";

// server/db.ts
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var { Pool } = pg;
var rawConnectionString = process.env.DATABASE_URL;
var cleanConnectionString = rawConnectionString;
if (cleanConnectionString) {
  cleanConnectionString = cleanConnectionString.replace(/[?&]sslmode=[^&]+/g, "").replace(/[?&]ssl=[^&]+/g, "");
  if (cleanConnectionString.endsWith("?")) {
    cleanConnectionString = cleanConnectionString.slice(0, -1);
  }
}
var isCloud = Boolean(
  rawConnectionString && (rawConnectionString.includes("digitalocean") || rawConnectionString.includes("ondigitalocean") || rawConnectionString.includes("sslmode") || !rawConnectionString.includes("localhost") && !rawConnectionString.includes("127.0.0.1"))
);
var pool = new Pool({
  connectionString: cleanConnectionString || void 0,
  ssl: isCloud ? {
    rejectUnauthorized: false
    // Explicitly allow DigitalOcean internal/dev certificates
  } : false,
  max: 20,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 1e4
});
var isDbConfigured = Boolean(rawConnectionString);
async function createAllTables(clientOrPool = pool) {
  try {
    await clientOrPool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT,
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workspaces (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          owner_id VARCHAR(64),
          currency VARCHAR(10) DEFAULT 'DKK',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workspace_members (
          workspace_id VARCHAR(64),
          user_id VARCHAR(64),
          role VARCHAR(20) NOT NULL DEFAULT 'owner',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (workspace_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_fa VARCHAR(255),
          icon VARCHAR(64) NOT NULL,
          color VARCHAR(32) NOT NULL,
          type VARCHAR(20) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(64) PRIMARY KEY,
          workspace_id VARCHAR(64),
          type VARCHAR(20) NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          category_id VARCHAR(64),
          date DATE NOT NULL,
          note TEXT,
          payment_method VARCHAR(32) DEFAULT 'card',
          tags TEXT[],
          is_recurring BOOLEAN DEFAULT FALSE,
          recurring_months INT DEFAULT 1,
          created_by_id VARCHAR(64),
          created_by_name VARCHAR(255),
          created_by_avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS budget_limits (
          id VARCHAR(64) PRIMARY KEY,
          workspace_id VARCHAR(64),
          category_id VARCHAR(64),
          month VARCHAR(7) NOT NULL,
          limit_amount NUMERIC(14, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_months INT DEFAULT 1;
    `);
    return true;
  } catch (err) {
    console.error("Table creation warning:", err);
    return false;
  }
}
async function initDatabase(retries = 5, delayMs = 2e3) {
  if (!isDbConfigured) {
    console.log("\u2139\uFE0F No DATABASE_URL provided. Operating in LocalStorage fallback mode.");
    return false;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\u{1F4E1} Connecting to PostgreSQL database (Attempt ${attempt}/${retries})...`);
      const client = await pool.connect();
      console.log("\u2705 Successfully connected to PostgreSQL database (DigitalOcean Dev DB)!");
      await createAllTables(client);
      client.release();
      console.log("\u2705 PostgreSQL database schema verified and tables exist.");
      return true;
    } catch (error) {
      console.error(`\u26A0\uFE0F Database connection attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        console.log(`\u23F3 Retrying database schema setup in ${delayMs / 1e3}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

// server/routes.ts
var router = Router();
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
  return hash === originalHash;
}
router.get("/health", async (req, res) => {
  if (!isDbConfigured) {
    return res.json({ status: "ok", database: "disconnected", mode: "offline/local" });
  }
  try {
    await createAllTables();
    const dbRes = await pool.query("SELECT NOW()");
    return res.json({ status: "ok", database: "connected", time: dbRes.rows[0].now });
  } catch (err) {
    return res.status(500).json({ status: "error", database: "error", error: err.message });
  }
});
router.post("/auth/register", async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: "Database not connected. Please verify DATABASE_URL." });
  }
  try {
    await createAllTables();
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const emailNorm = email.trim().toLowerCase();
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [emailNorm]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "EMAIL_EXISTS", message: "An account with this email already exists" });
    }
    const userId = `user_${Date.now()}`;
    const pwdHash = hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, name.trim(), emailNorm, pwdHash, avatar]
    );
    const wsId = `ws_${Date.now()}`;
    await pool.query(
      `INSERT INTO workspaces (id, name, description, owner_id, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [wsId, "Personal Wallet", "Personal finances & savings", userId, "DKK"]
    );
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [wsId, userId, "owner"]
    );
    const userObj = {
      id: userId,
      name: name.trim(),
      email: emailNorm,
      avatar,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const workspaceObj = {
      id: wsId,
      name: "Personal Wallet",
      description: "Personal finances & savings",
      owner_id: userId,
      currency: "DKK",
      members: [
        {
          user_id: userId,
          name: name.trim(),
          email: emailNorm,
          avatar,
          role: "owner",
          joined_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return res.status(201).json({
      success: true,
      user: userObj,
      workspaces: [workspaceObj]
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed: " + err.message });
  }
});
router.post("/auth/login", async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: "Database not connected. Please verify DATABASE_URL." });
  }
  try {
    await createAllTables();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const emailNorm = email.trim().toLowerCase();
    const userRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [emailNorm]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "No account found with this email" });
    }
    const userRow = userRes.rows[0];
    if (!userRow.password_hash || !verifyPassword(password, userRow.password_hash)) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Incorrect password" });
    }
    const wsRes = await pool.query(
      `SELECT w.* FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1
       ORDER BY w.created_at ASC`,
      [userRow.id]
    );
    const membersRes = await pool.query(
      `SELECT wm.*, u.name, u.email, u.avatar 
       FROM workspace_members wm 
       LEFT JOIN users u ON wm.user_id = u.id`
    );
    const workspaces = wsRes.rows.map((ws) => {
      const members = membersRes.rows.filter((m) => m.workspace_id === ws.id).map((m) => ({
        user_id: m.user_id,
        name: m.name || "Member",
        email: m.email || "",
        avatar: m.avatar,
        role: m.role,
        joined_at: m.joined_at
      }));
      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        owner_id: ws.owner_id,
        currency: ws.currency || "DKK",
        members,
        created_at: ws.created_at
      };
    });
    const userObj = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar: userRow.avatar,
      created_at: userRow.created_at
    };
    return res.json({
      success: true,
      user: userObj,
      workspaces
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed: " + err.message });
  }
});
router.get("/transactions", async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const { workspaceId, month } = req.query;
    let query = "SELECT * FROM transactions";
    const params = [];
    if (workspaceId) {
      params.push(workspaceId);
      query += ` WHERE workspace_id = $${params.length}`;
    }
    if (month) {
      params.push(`${month}%`);
      query += params.length === 1 ? ` WHERE date::text LIKE $1` : ` AND date::text LIKE $2`;
    }
    query += " ORDER BY date DESC, created_at DESC";
    const result = await pool.query(query, params);
    const mapped = result.rows.map((row) => ({
      id: row.id,
      workspace_id: row.workspace_id,
      type: row.type,
      amount: parseFloat(row.amount),
      category_id: row.category_id,
      date: row.date.toISOString().split("T")[0],
      note: row.note,
      payment_method: row.payment_method,
      tags: row.tags || [],
      is_recurring: Boolean(row.is_recurring),
      recurring_months: row.recurring_months || 1,
      created_by: {
        id: row.created_by_id,
        name: row.created_by_name,
        avatar: row.created_by_avatar
      },
      created_at: row.created_at
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/transactions", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
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
        payment_method || "card",
        tags || [],
        Boolean(is_recurring),
        recurring_months || 1,
        created_by?.id || null,
        created_by?.name || null,
        created_by?.avatar || null
      ]
    );
    res.status(201).json({ id: txId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/transactions/:id", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/transactions/:id", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/workspaces", async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const { userId } = req.query;
    let query = "SELECT * FROM workspaces ORDER BY created_at ASC";
    const params = [];
    if (userId) {
      query = `SELECT w.* FROM workspaces w
               JOIN workspace_members wm ON w.id = wm.workspace_id
               WHERE wm.user_id = $1
               ORDER BY w.created_at ASC`;
      params.push(userId);
    }
    const wsRes = await pool.query(query, params);
    const membersRes = await pool.query(
      `SELECT wm.*, u.name, u.email, u.avatar 
       FROM workspace_members wm 
       LEFT JOIN users u ON wm.user_id = u.id`
    );
    const workspaces = wsRes.rows.map((ws) => {
      const members = membersRes.rows.filter((m) => m.workspace_id === ws.id).map((m) => ({
        user_id: m.user_id,
        name: m.name || "Member",
        email: m.email || "",
        avatar: m.avatar,
        role: m.role,
        joined_at: m.joined_at
      }));
      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        owner_id: ws.owner_id,
        currency: ws.currency || "DKK",
        members,
        created_at: ws.created_at
      };
    });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/workspaces", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
  try {
    const { id, name, description, owner_id, currency, members } = req.body;
    const wsId = id || `ws_${Date.now()}`;
    await pool.query(
      `INSERT INTO workspaces (id, name, description, owner_id, currency)
       VALUES ($1, $2, $3, $4, $5)`,
      [wsId, name, description || null, owner_id, currency || "DKK"]
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/workspaces/:id/members", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/workspaces/:id/members/:userId", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
  try {
    const { id, userId } = req.params;
    await pool.query("DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true, workspace_id: id, user_id: userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/budgets", async (req, res) => {
  if (!isDbConfigured) return res.json([]);
  try {
    const result = await pool.query("SELECT * FROM budget_limits");
    const mapped = result.rows.map((r) => ({
      id: r.id,
      workspace_id: r.workspace_id,
      category_id: r.category_id,
      month: r.month,
      limit_amount: parseFloat(r.limit_amount)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/budgets", async (req, res) => {
  if (!isDbConfigured) return res.status(400).json({ error: "Database not configured" });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var routes_default = router;

// server/index.ts
dotenv2.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express();
var PORT = Number(process.env.PORT) || 8080;
app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api", routes_default);
var distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});
var server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\u{1F680} BudgetMaster server running on 0.0.0.0:${PORT}`);
  console.log(`\u{1F4E1} Health check active at http://0.0.0.0:${PORT}/health`);
  initDatabase().catch((err) => {
    console.error("Database background initialization error:", err);
  });
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
