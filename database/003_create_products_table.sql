-- Migration: 003_create_products_table.sql
-- Main product/inventory table

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  price INTEGER NOT NULL,          -- stored in paise (1/100 of currency unit)
  condition VARCHAR(20) DEFAULT 'NEW' CHECK (condition IN ('NEW','PRE_OWNED')),
  stock INTEGER DEFAULT 0,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);