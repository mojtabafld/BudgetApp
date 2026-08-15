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

export const isDbConfigured = Boolean(rawConnectionString);

let isSchemaReady = false;
let schemaInitPromise: Promise<boolean> | null = null;

// Ensure database schema is ready before handling any query
export async function ensureDatabaseReady(): Promise<boolean> {
  if (isSchemaReady) return true;
  if (!isDbConfigured) return false;

  if (!schemaInitPromise) {
    schemaInitPromise = initDatabase();
  }
  return await schemaInitPromise;
}

// Auto-migration & Schema Creation
export async function initDatabase(retries = 10, delayMs = 2000): Promise<boolean> {
  if (!isDbConfigured) {
    console.log('ℹ️ No DATABASE_URL provided. Operating in LocalStorage fallback mode.');
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      console.log(`📡 Connecting to PostgreSQL database (Attempt ${attempt}/${retries})...`);
      client = await pool.connect();
      console.log('✅ Successfully connected to PostgreSQL database (DigitalOcean Dev DB)!');

      // 1. Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT,
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Create workspaces table
      await client.query(`
        CREATE TABLE IF NOT EXISTS workspaces (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
            currency VARCHAR(10) DEFAULT 'DKK',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Create workspace_members table
      await client.query(`
        CREATE TABLE IF NOT EXISTS workspace_members (
            workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (workspace_id, user_id)
        );
      `);

      // 4. Create categories table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            name_fa VARCHAR(255),
            icon VARCHAR(64) NOT NULL,
            color VARCHAR(32) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense'))
        );
      `);

      // 5. Create transactions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(64) PRIMARY KEY,
            workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
            amount NUMERIC(14, 2) NOT NULL,
            category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
            date DATE NOT NULL,
            note TEXT,
            payment_method VARCHAR(32) DEFAULT 'card',
            tags TEXT[],
            is_recurring BOOLEAN DEFAULT FALSE,
            recurring_months INT DEFAULT 1,
            created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
            created_by_name VARCHAR(255),
            created_by_avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 6. Create budget_limits table
      await client.query(`
        CREATE TABLE IF NOT EXISTS budget_limits (
            id VARCHAR(64) PRIMARY KEY,
            workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
            category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
            month VARCHAR(7) NOT NULL,
            limit_amount NUMERIC(14, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Ensure columns and indexes exist
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_months INT DEFAULT 1;

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON transactions(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_budget_limits_ws_month ON budget_limits(workspace_id, month);
      `);

      isSchemaReady = true;
      console.log('✅ PostgreSQL database schema verified and tables exist.');
      return true;
    } catch (error) {
      console.error(`⚠️ Database schema initialization attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        console.log(`⏳ Retrying database schema setup in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  console.error('❌ Could not initialize PostgreSQL schema after multiple retries.');
  return false;
}
