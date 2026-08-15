-- BudgetMaster PostgreSQL Initial Schema for DigitalOcean

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
    created_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_limits (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) REFERENCES workspaces(id) ON DELETE CASCADE,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- YYYY-MM
    limit_amount NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON transactions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_budget_limits_ws_month ON budget_limits(workspace_id, month);
