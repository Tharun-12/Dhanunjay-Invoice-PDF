/*
# Saree Billing — Sales and Sale Items tables

## Purpose
Stores offline saree sale records for a boutique billing + receipt app. The shop
owner manually enters customer and purchase details after an in-store sale, then
generates a PDF receipt and shares it to the customer's WhatsApp. No sign-in is
required — this is a single-device shop tool — so policies are open to anon.

## 1. New Tables
- `sales`
  - `id` uuid primary key
  - `invoice_number` text, unique, not null — human-readable invoice id (e.g. INV-2026-001)
  - `customer_name` text, not null
  - `customer_phone` text, not null
  - `customer_address` text, nullable
  - `subtotal` numeric, not null — sum of item line totals before discount
  - `discount` numeric, not null default 0
  - `total` numeric, not null — subtotal minus discount
  - `payment_method` text, not null — 'Cash' | 'UPI' | 'Card' | 'Other'
  - `payment_status` text, not null — 'Paid' | 'Partial' | 'Unpaid'
  - `amount_paid` numeric, not null default 0 — amount received (for partial payments)
  - `notes` text, nullable
  - `sale_date` date, not null, default today
  - `created_at` timestamptz, default now()
- `sale_items`
  - `id` uuid primary key
  - `sale_id` uuid, FK to sales(id) ON DELETE CASCADE
  - `saree_name` text, not null
  - `saree_code` text, nullable
  - `quantity` integer, not null, default 1
  - `price` numeric, not null — per-unit price
  - `line_total` numeric, not null — quantity * price

## 2. Indexes
- `sales` on `sale_date` desc (dashboard + history queries)
- `sale_items` on `sale_id` (join lookups)

## 3. Security
- RLS enabled on both tables.
- CRUD granted to anon + authenticated (no-auth single-device app, data is
  intentionally shared; USING (true) is appropriate here).
- All four CRUD policies per table (select/insert/update/delete).
- sale_items INSERT policy allows writes because parent sale is writable.
*/
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  subtotal numeric(12,2) NOT NULL,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL,
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  saree_name text NOT NULL,
  saree_code text,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales (sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items (sale_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sales TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sale_items TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_sales" ON sales;
CREATE POLICY "anon_select_sales" ON sales FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sales" ON sales;
CREATE POLICY "anon_insert_sales" ON sales FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sales" ON sales;
CREATE POLICY "anon_update_sales" ON sales FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sales" ON sales;
CREATE POLICY "anon_delete_sales" ON sales FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_sale_items" ON sale_items;
CREATE POLICY "anon_select_sale_items" ON sale_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sale_items" ON sale_items;
CREATE POLICY "anon_insert_sale_items" ON sale_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sale_items" ON sale_items;
CREATE POLICY "anon_update_sale_items" ON sale_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sale_items" ON sale_items;
CREATE POLICY "anon_delete_sale_items" ON sale_items FOR DELETE
  TO anon, authenticated USING (true);
