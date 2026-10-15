-- ===================================================================
-- TATADANA QUANTUM FINTECH - SUPABASE SQL SCHEMA
-- Target Database: Supabase PostgreSQL (Public Access / RLS Disabled)
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/wchpkvxjufjujaganaca/sql
-- ===================================================================

-- 1. WALLETS TABLE (Multi-Wallet: BCA, Mandiri, GoPay, Cash)
CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'bank',
    color TEXT DEFAULT '#0066AE',
    "isDefault" BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TRANSACTIONS TABLE (Catat Pengeluaran, Pemasukan, Transfer)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'expense', 'income', 'transfer'
    amount NUMERIC NOT NULL,
    "walletId" TEXT,
    "walletName" TEXT,
    "targetWalletId" TEXT,
    "targetWalletName" TEXT,
    category TEXT,
    note TEXT,
    date TEXT,
    datetime TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BUDGETS TABLE (Target & Limit Pengeluaran)
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    limit_amount NUMERIC NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#facc15',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CUSTOM CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CHAT HISTORY TABLE (Sinkronisasi AI Chat & Bot Telegram)
CREATE TABLE IF NOT EXISTS public.chat_history (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL DEFAULT 'web_user',
    text TEXT NOT NULL,
    reply TEXT,
    time TEXT,
    platform TEXT NOT NULL DEFAULT 'web', -- 'web' or 'telegram'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. USERS TABLE (Pengguna & Approval Admin)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    "registeredAt" TEXT,
    plan TEXT DEFAULT 'Gratis',
    "paymentStatus" TEXT DEFAULT 'Aktif',
    "paymentMethod" TEXT DEFAULT '-',
    role TEXT DEFAULT 'User',
    "telegramUsername" TEXT DEFAULT '-',
    "senderName" TEXT,
    "senderAccount" TEXT,
    "proofImage" TEXT,
    "paymentAmount" NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. APP CONFIG / STATE TABLE (Unified KV Store)
CREATE TABLE IF NOT EXISTS public.app_state (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR TUGAS KULIAH / PUBLIC ANON ACCESS
-- ===================================================================
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_state DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.wallets TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.budgets TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.custom_categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chat_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_state TO anon, authenticated, service_role;

-- ===================================================================
-- INITIAL DEFAULT SEED DATA (Clean State Mulai dari Rp0)
-- ===================================================================
INSERT INTO public.wallets (id, name, balance, type, color, "isDefault") VALUES
    ('w1', 'BCA', 0, 'bank', '#0066AE', true),
    ('w2', 'Mandiri', 0, 'bank', '#003D79', false),
    ('w3', 'GoPay', 0, 'ewallet', '#00AED6', false),
    ('w4', 'Cash', 0, 'cash', '#10B981', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.custom_categories (id, name) VALUES
    ('cat_1', '🎮 Top Up Skin ML'),
    ('cat_2', '🏋️ Member gym'),
    ('cat_3', '👶 Kebutuhan Anak'),
    ('cat_4', '✈️ Traveling'),
    ('cat_5', '🚗 Transportasi'),
    ('cat_6', '🌐 Kuota')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, phone, "registeredAt", plan, "paymentStatus", "paymentMethod", role, "telegramUsername") VALUES
    ('usr_superadmin', 'Rizky M. Riady', 'rrizky205@gmail.com', '+62 89513102470', '2026-10-15 00:00', 'Pro', 'Approved', 'System Superadmin', 'Superadmin', '@DANATATA_BOT')
ON CONFLICT (id) DO NOTHING;
