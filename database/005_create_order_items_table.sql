-- Migration: 005_create_order_items_table.sql
-- Individual items within each order

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  price INTEGER NOT NULL,          -- snapshot price at purchase time
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on order for order items lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
-- Index on product for inventory queries
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);