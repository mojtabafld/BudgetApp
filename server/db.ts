import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Node TLS accepts DigitalOcean self-signed certificates in private DB clusters
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

// Get connection string from environment
const rawConnectionString = process.env.DATABASE_URL;

// Clean connection string by removing sslmode parameters that override rejectUnauthorized: false
let cleanConnectionString = rawConnectionString;
if (cleanConnectionString) {
  cleanConnectionString = cleanConnectionString
    .replace(/[?&]sslmode=[^&]+/g, '')
    .replace(/[?&]ssl=[^&]+/g, '');

  if (cleanConnectionString.endsWith('?')) {
    cleanConnectionString = cleanConnectionString.slice(0, -1);
  }
}

const isCloud = Boolean(
  rawConnectionString &&
    (rawConnectionString.includes('digitalocean') ||
      rawConnectionString.includes('ondigitalocean') ||
      rawConnectionString.includes('sslmode') ||
      (!rawConnectionString.includes('localhost') && !rawConnectionString.includes('127.0.0.1')))
);

export const pool = new Pool({
  connectionString: cleanConnectionString || undefined,
  ssl: isCloud
    ? {
        rejectUnauthorized: false, // Explicitly allow DigitalOcean internal/dev certificates
      }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Configure search_path to the current user's dedicated schema on every connection
pool.on('connect', async (client) => {
  try {
    const userRes = await client.query('SELECT CURRENT_USER as u');
    const currUser = userRes.rows[0]?.u;
    if (currUser && currUser !== 'public') {
      try {
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${currUser}"`);
      } catch {}
      await client.query(`SET search_path TO "${currUser}", "$user", public`);
    }
  } catch (e: any) {
    console.log('Search path initialization notice:', e.message);
  }
});

export const isDbConfigured = Boolean(rawConnectionString);

export async function createAllTables(): Promise<{ success: boolean; error?: string }> {
  if (!isDbConfigured) return { success: false, error: 'DATABASE_URL is not configured' };

  let client;
  try {
    client = await pool.connect();

    // 1. Detect user and configure user's dedicated schema
    let targetSchema = 'public';
    try {
      const userRes = await client.query('SELECT CURRENT_USER as u');
      const currUser = userRes.rows[0]?.u;
      if (currUser && currUser !== 'public') {
        try {
          await client.query(`CREATE SCHEMA IF NOT EXISTS "${currUser}"`);
        } catch {}
        targetSchema = currUser;
      }
      await client.query(`SET search_path TO "${targetSchema}", "$user", public`);
    } catch {}

    // 2. Create tables inside the user's schema
    const statements = [
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT,
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".workspaces (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          owner_id VARCHAR(64),
          currency VARCHAR(10) DEFAULT 'DKK',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".workspace_members (
          workspace_id VARCHAR(64),
          user_id VARCHAR(64),
          role VARCHAR(20) NOT NULL DEFAULT 'owner',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (workspace_id, user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_fa VARCHAR(255),
          icon VARCHAR(64) NOT NULL,
          color VARCHAR(32) NOT NULL,
          type VARCHAR(20) NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".transactions (
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
      )`,
      `CREATE TABLE IF NOT EXISTS "${targetSchema}".budget_limits (
          id VARCHAR(64) PRIMARY KEY,
          workspace_id VARCHAR(64),
          category_id VARCHAR(64),
          month VARCHAR(7) NOT NULL,
          limit_amount NUMERIC(14, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `ALTER TABLE "${targetSchema}".users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
      `ALTER TABLE "${targetSchema}".transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE "${targetSchema}".transactions ADD COLUMN IF NOT EXISTS recurring_months INT DEFAULT 1`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON "${targetSchema}".users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_tx_ws ON "${targetSchema}".transactions(workspace_id)`
    ];

    for (const sql of statements) {
      await client.query(sql);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Schema initialization error:', err.message);
    return { success: false, error: err.message };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Auto-migration & Schema Verification
export async function initDatabase(retries = 5, delayMs = 2000): Promise<boolean> {
  if (!isDbConfigured) {
    console.log('ℹ️ No DATABASE_URL provided. Operating in LocalStorage fallback mode.');
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to PostgreSQL database (Attempt ${attempt}/${retries})...`);
      const res = await createAllTables();
      if (res.success) {
        console.log('✅ PostgreSQL database schema verified and tables exist.');
        return true;
      } else {
        console.error('⚠️ Table creation issue:', res.error);
      }
    } catch (error: any) {
      console.error(`⚠️ Database connection attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        console.log(`⏳ Retrying database schema setup in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return false;
}
