-- Simplified Pricing Plans Database Update
-- Run this in your Supabase SQL Editor

-- First, update the orders table to support new fields if needed
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS videos INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_video DECIMAL(10,3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_credit DECIMAL(10,3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commercial BOOLEAN DEFAULT FALSE;

-- Update user_profiles table to track plan features
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resolution TEXT DEFAULT '720p';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS max_duration TEXT DEFAULT '8s';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS commercial_rights BOOLEAN DEFAULT FALSE;

-- Create or update the products table (if you want to store products in DB)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  credits INTEGER NOT NULL,
  videos INTEGER,
  price_per_video DECIMAL(10,3),
  price_per_credit DECIMAL(10,3),
  duration TEXT,
  resolution TEXT,
  commercial BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('once', 'subscription')),
  price_increase BOOLEAN DEFAULT FALSE,
  description TEXT,
  features JSONB,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  button_text TEXT,
  button_color TEXT,
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing products and insert new simplified plans
DELETE FROM products;

-- Insert the simplified pricing plans
INSERT INTO products (
  product_id, product_name, price, original_price, credits, videos, 
  price_per_video, price_per_credit, duration, resolution, commercial, 
  type, features, button_text, popular
) VALUES 
(
  'trial',
  'AI ASMR Trial',
  790,
  990,
  100,
  10,
  0.79,
  0.079,
  '8s',
  '720p',
  false,
  'once',
  '["Google Veo 3 ASMR support", "Max 8s video duration", "720p resolution", "Binaural audio effects", "ASMR trigger library"]'::jsonb,
  'Try AI ASMR ⚡',
  false
),
(
  'basic',
  'AI ASMR Basic',
  1990,
  2490,
  300,
  30,
  0.66,
  0.066,
  '8s',
  '720p',
  true,
  'subscription',
  '["Google Veo 3 ASMR support", "Max 8s video duration", "720p resolution", "Whisper & voice sync", "Binaural audio effects", "ASMR trigger library", "Commercial usage rights", "Standard processing", "Basic support", "Global availability"]'::jsonb,
  'Subscribe to Basic ⚡',
  true
),
(
  'pro_monthly',
  'AI ASMR Pro',
  2990,
  3990,
  500,
  50,
  0.59,
  0.059,
  '8s',
  '1080p',
  true,
  'subscription',
  '["All Basic features included", "1080p video resolution", "Advanced whisper sync", "Premium binaural audio", "Full ASMR trigger library", "Fastest processing", "Commercial usage rights", "Priority support", "Global availability", "Pro-level features"]'::jsonb,
  'Go Pro 🔥',
  false
);

-- Update billing_period for subscription plans
UPDATE products SET billing_period = 'monthly' WHERE product_id = 'basic';
UPDATE products SET billing_period = 'monthly' WHERE product_id = 'pro_monthly';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Add RLS policy for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for products (public read access)
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can view active products" ON products;
  
  -- Create new policy
  CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (active = true);
END $$;

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Simplified pricing plans database schema updated successfully!';
    RAISE NOTICE 'New plans: AI ASMR Trial ($7.9), AI ASMR Basic ($19.9/month), AI ASMR Pro ($29.9/month)';
    RAISE NOTICE 'Products table created with RLS policies and proper indexing.';
END $$;