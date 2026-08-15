import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: connectionString || undefined,
  // If running on DigitalOcean or cloud, enable SSL compatibility
  ssl: connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false,
});

export const isDbConfigured = Boolean(connectionString);

// Auto-migration & Schema Initialization on Startup
export async function initDatabase() {
  if (!isDbConfigured) {
    console.log('ℹ️ No DATABASE_URL provided. Operating in LocalStorage fallback mode.');
    return false;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database (DigitalOcean Dev DB)!');

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
    `);

    client.release();
    console.log('✅ PostgreSQL database tables and schema verified/created successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
}
