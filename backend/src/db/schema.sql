-- Personal Finance Tracker - Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Users table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'read-only')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Categories table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50)
);

-- ============================================
-- Transactions table
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- ============================================
-- Default categories
-- ============================================
INSERT INTO categories (name, type, icon) VALUES
  ('Food', 'expense', '🍔'),
  ('Transport', 'expense', '🚗'),
  ('Entertainment', 'expense', '🎬'),
  ('Shopping', 'expense', '🛍️'),
  ('Healthcare', 'expense', '🏥'),
  ('Education', 'expense', '📚'),
  ('Utilities', 'expense', '💡'),
  ('Salary', 'income', '💰'),
  ('Freelance', 'income', '💻'),
  ('Investment', 'income', '📈'),
  ('Rent', 'expense', '🏠'),
  ('Other', 'expense', '📦')
ON CONFLICT (name) DO NOTHING;
