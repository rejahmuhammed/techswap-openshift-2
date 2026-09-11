-- Migration: 006_create_reviews_table.sql
-- Product/technician reviews

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  product_id UUID REFERENCES products(id),
  technician_id UUID REFERENCES users(id), -- for technician reviews
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate reviews from same user on same product
  UNIQUE(user_id, product_id)
);

-- Index on product for product reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
-- Index on technician for technician reviews
CREATE INDEX IF NOT EXISTS idx_reviews_technician ON reviews(technician_id);