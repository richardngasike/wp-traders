-- =====================================================================
-- W&P GRAINS TRADERS — Supabase Database Schema
-- =====================================================================
-- Run this entire file in: Supabase Dashboard > SQL Editor > New Query
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CEREAL TYPES (Maize, Beans, Rice, Millet, Sorghum, etc.)
-- ---------------------------------------------------------------------
create table if not exists cereals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null default 'kg',
  created_at timestamptz not null default now()
);

insert into cereals (name, unit) values
  ('Maize', 'kg'),
  ('Beans', 'kg'),
  ('Rice', 'kg'),
  ('Millet', 'kg'),
  ('Sorghum', 'kg'),
  ('Green Grams', 'kg')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 2. DAILY CEREAL RECORDS
-- Buying price & selling price fluctuate daily, recorded per cereal/day.
-- ---------------------------------------------------------------------
create table if not exists cereal_records (
  id uuid primary key default gen_random_uuid(),
  record_date date not null,
  cereal_id uuid not null references cereals(id) on delete cascade,
  buying_price numeric(12,2) not null default 0,   -- price per unit bought that day
  selling_price numeric(12,2) not null default 0,  -- price per unit sold that day
  quantity_bought numeric(12,2) not null default 0,
  quantity_sold numeric(12,2) not null default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cereal_records_date on cereal_records(record_date);
create index if not exists idx_cereal_records_cereal on cereal_records(cereal_id);

-- ---------------------------------------------------------------------
-- 3. DAILY EXPENSES
-- ---------------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  category text not null default 'General',
  description text,
  amount numeric(12,2) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_date on expenses(expense_date);

-- ---------------------------------------------------------------------
-- 4. ADMIN PROFILES
-- Linked 1-1 with Supabase Auth users. Only these two are allowed in.
-- ---------------------------------------------------------------------
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cereal_records_updated on cereal_records;
create trigger trg_cereal_records_updated
before update on cereal_records
for each row execute procedure set_updated_at();

drop trigger if exists trg_expenses_updated on expenses;
create trigger trg_expenses_updated
before update on expenses
for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- Only authenticated users that exist in admin_profiles can read/write.
-- ---------------------------------------------------------------------
alter table cereals enable row level security;
alter table cereal_records enable row level security;
alter table expenses enable row level security;
alter table admin_profiles enable row level security;

-- Helper: is the current logged-in user a registered admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid()
  );
$$ language sql security definer;

-- cereals
drop policy if exists "Admins can read cereals" on cereals;
create policy "Admins can read cereals" on cereals
  for select using (is_admin());
drop policy if exists "Admins can manage cereals" on cereals;
create policy "Admins can manage cereals" on cereals
  for all using (is_admin()) with check (is_admin());

-- cereal_records
drop policy if exists "Admins can read records" on cereal_records;
create policy "Admins can read records" on cereal_records
  for select using (is_admin());
drop policy if exists "Admins can manage records" on cereal_records;
create policy "Admins can manage records" on cereal_records
  for all using (is_admin()) with check (is_admin());

-- expenses
drop policy if exists "Admins can read expenses" on expenses;
create policy "Admins can read expenses" on expenses
  for select using (is_admin());
drop policy if exists "Admins can manage expenses" on expenses;
create policy "Admins can manage expenses" on expenses
  for all using (is_admin()) with check (is_admin());

-- admin_profiles (admins can see each other, but not edit each other)
drop policy if exists "Admins can read profiles" on admin_profiles;
create policy "Admins can read profiles" on admin_profiles
  for select using (is_admin());
drop policy if exists "Users can update own profile" on admin_profiles;
create policy "Users can update own profile" on admin_profiles
  for update using (id = auth.uid());

-- =====================================================================
-- 7. CREATE THE TWO ADMIN ACCOUNTS
-- =====================================================================
-- Supabase Auth users CANNOT be created directly via plain SQL insert
-- (passwords must go through Supabase Auth's hashing). Do this instead:
--
--  1. Go to Supabase Dashboard > Authentication > Users > "Add user"
--     - Email: purity@wptraders.com   | Password: Purity254
--     - Email: wangoi@wptraders.com    | Password: Wangoi254
--     - Tick "Auto Confirm User" for both.
--
--  2. Copy each generated User UID, then run (replace the UUIDs/emails):
--
--   insert into admin_profiles (id, full_name, email, role) values
--     ('b82cf7e1-c23f-4441-9393-87c1e6f32ec9', 'Purity Mutuma', 'purity@wptraders.com', 'admin'),
--     ('db055a4f-21a2-498c-a88c-b2715478d7a6',  'Wangoi',          'wangoi@wptraders.com',  'admin');
--
-- Only emails present in admin_profiles can sign in successfully and
-- read/write data, thanks to the is_admin() RLS policies above.
-- =====================================================================
