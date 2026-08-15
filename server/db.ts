import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;

// Determine if connecting to DigitalOcean or remote cloud PostgreSQL
const isCloud = Boolean(
  connectionString &&
    (connectionString.includes('digitalocean') ||
      connectionString.includes('ondigitalocean') ||
      connectionString.includes('sslmode=require') ||
      (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')))
);

export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: isCloud ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const isDbConfigured = Boolean(connectionString);

// Auto-migration, Schema Verification & Initial Seeding
export async function initDatabase(retries = 5, delayMs = 3000): Promise<boolean> {
  if (!isDbConfigured) {
    console.log('ℹ️ No DATABASE_URL provided. Operating in LocalStorage fallback mode.');
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to PostgreSQL database (Attempt ${attempt}/${retries})...`);
      const client = await pool.connect();
      console.log('✅ Successfully connected to PostgreSQL database (DigitalOcean Dev DB)!');

      // 1. Create Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workspaces (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
            currency VARCHAR(10) DEFAULT 'DKK',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workspace_members (
            workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
            user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (workspace_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            name_fa VARCHAR(255),
            icon VARCHAR(64) NOT NULL,
            color VARCHAR(32) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense'))
        );

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
            created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
            created_by_name VARCHAR(255),
            created_by_avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS budget_limits (
            id VARCHAR(64) PRIMARY KEY,
            workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
            category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
            month VARCHAR(7) NOT NULL,
            limit_amount NUMERIC(14, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON transactions(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_budget_limits_ws_month ON budget_limits(workspace_id, month);
      `);

      // 2. Seed Initial Users if empty
      const userCheck = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        console.log('🌱 Seeding initial demo users into PostgreSQL...');
        await client.query(`
          INSERT INTO users (id, name, email, avatar) VALUES
          ('user_alice', 'Alice Johnson', 'alice@example.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
          ('user_bob', 'Bob Miller (Partner)', 'bob@example.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
          ('user_charlie', 'Charlie Smith (Auditor)', 'charlie@example.com', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80');
        `);
      }

      // 3. Seed Initial Workspaces if empty
      const wsCheck = await client.query('SELECT COUNT(*) FROM workspaces');
      if (parseInt(wsCheck.rows[0].count, 10) === 0) {
        console.log('🌱 Seeding initial DKK workspaces into PostgreSQL...');
        await client.query(`
          INSERT INTO workspaces (id, name, description, owner_id, currency) VALUES
          ('ws_family', 'Shared Family Budget', 'Joint household expenses and shared goals', 'user_alice', 'DKK'),
          ('ws_personal', 'Personal Wallet', 'Personal day-to-day finances and savings', 'user_alice', 'DKK');

          INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
          ('ws_family', 'user_alice', 'owner'),
          ('ws_family', 'user_bob', 'editor'),
          ('ws_family', 'user_charlie', 'viewer'),
          ('ws_personal', 'user_alice', 'owner');
        `);
      }

      client.release();
      console.log('✅ PostgreSQL database schema verified and seed data initialized successfully.');
      return true;
    } catch (error) {
      console.error(`⚠️ Database connection attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error('❌ Could not connect to PostgreSQL after multiple retries.');
  return false;
}
