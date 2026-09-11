-- Migration: 002_create_categories_table.sql
-- Categories for product classification

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on slug for lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);