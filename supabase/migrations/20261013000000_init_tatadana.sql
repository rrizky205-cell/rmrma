-- ===================================================================
-- TATADANA DATABASE INITIALIZATION MIGRATION
-- Database & Auth: Supabase (PostgreSQL + RLS + Triggers)
-- Timezone: Asia/Jakarta (WIB)
-- ===================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default timezone session to Asia/Jakarta (WIB)
ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_plan_type AS ENUM ('starter', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'settlement', 'deny', 'expire', 'cancel', 'refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'User TataDana',
    avatar_url TEXT,
    phone_number TEXT UNIQUE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_otp_code TEXT,
    phone_otp_expires_at TIMESTAMPTZ,
    plan user_plan_type NOT NULL DEFAULT 'starter',
    plan_expires_at TIMESTAMPTZ,
    currency TEXT NOT NULL DEFAULT 'IDR',
    role user_role_type NOT NULL DEFAULT 'user',
    
    -- Telegram Integration
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
    telegram_link_code TEXT UNIQUE,
    telegram_bot_token_encrypted TEXT,
    telegram_connected_at TIMESTAMPTZ,
    
    -- Reminder Settings (Maksimal 2x sehari)
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_frequency INT NOT NULL DEFAULT 1 CHECK (reminder_frequency IN (1, 2)),
    reminder_time_1 TIME NOT NULL DEFAULT '12:00:00',
    reminder_time_2 TIME NOT NULL DEFAULT '20:00:00',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 4. WALLETS TABLE (Multi Wallet)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'bank' CHECK (type IN ('bank', 'ewallet', 'cash', 'investment')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    color TEXT NOT NULL DEFAULT '#FF6B00',
    icon TEXT NOT NULL DEFAULT 'wallet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    emoji TEXT NOT NULL DEFAULT '🏷️',
    color TEXT NOT NULL DEFAULT '#FF6B00',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 6. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit > 0),
    period_month TEXT NOT NULL, -- Format: YYYY-MM
    alert_80_sent BOOLEAN NOT NULL DEFAULT FALSE,
    alert_100_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(user_id, category_id, period_month)
);

-- 7. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    note TEXT,
    date DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jakarta')::date),
    time TIME NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Jakarta')::time),
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram_text', 'telegram_photo', 'telegram_voice')),
    receipt_url TEXT,
    receipt_merchant TEXT,
    is_receipt_parent BOOLEAN NOT NULL DEFAULT FALSE,
    to_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL, -- for transfers
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 8. RECEIPT ITEMS TABLE (Breakdown Struk Belanja)
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    category_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 9. TELEGRAM UPDATES TABLE (Idempotency Control)
CREATE TABLE IF NOT EXISTS public.telegram_updates (
    update_id BIGINT PRIMARY KEY,
    chat_id BIGINT,
    message_type TEXT DEFAULT 'text',
    status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'ignored')),
    error_message TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 10. EXPORT HISTORY TABLE (PDF & Excel Exports)
CREATE TABLE IF NOT EXISTS public.export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'xlsx')),
    period_label TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 11. AI PROVIDER CONFIGURATIONS TABLE (Admin Dashboard)
CREATE TABLE IF NOT EXISTS public.ai_provider_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL UNIQUE CHECK (provider_name IN ('gemini', 'openai', 'deepseek')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority_order INT NOT NULL DEFAULT 1,
    api_key_encrypted TEXT,
    model_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 12. AI INVOCATION LOGS TABLE (Monitoring & Cost)
CREATE TABLE IF NOT EXISTS public.ai_invocation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('parse_transaction', 'ocr_receipt', 'speech_transcription', 'financial_advisor', 'onboarding_recommendation')),
    tokens_used INT NOT NULL DEFAULT 0,
    response_time_ms INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'failover_fallback')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 13. PAYMENT TRANSACTIONS TABLE (Midtrans & Manual)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    plan_selected user_plan_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status payment_status_type NOT NULL DEFAULT 'pending',
    proof_image_url TEXT,
    admin_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 14. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    target_user_id UUID NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Jakarta')
);

-- 15. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period_month);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_tx ON public.receipt_items(transaction_id);

-- 16. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Wallets Policies
CREATE POLICY "Users can CRUD own wallets" ON public.wallets
    FOR ALL USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can CRUD own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can CRUD own budgets" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can CRUD own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Receipt Items Policies
CREATE POLICY "Users can view receipt items for own transactions" ON public.receipt_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = receipt_items.transaction_id AND t.user_id = auth.uid()
        )
    );

-- Export History Policies
CREATE POLICY "Users can CRUD own export history" ON public.export_history
    FOR ALL USING (auth.uid() = user_id);

-- Payment Transactions Policies
CREATE POLICY "Users can view own payments" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Superadmin Bypass for Admin Dashboard
CREATE POLICY "Admins full access profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );
CREATE POLICY "Admins full access transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );
CREATE POLICY "Admins full access payments" ON public.payment_transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );
CREATE POLICY "Admins full access audit logs" ON public.admin_audit_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

-- 17. AUTOMATIC USER INITIALIZATION TRIGGER
-- Saat user baru mendaftar (via Supabase Auth), buat profile, wallet default (BCA & Cash), dan kategori rekomendasi awal.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id UUID := NEW.id;
    new_email TEXT := NEW.email;
    link_code TEXT;
    default_bca_id UUID;
    default_cash_id UUID;
BEGIN
    -- Generate unique 6-character link code for Telegram
    link_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || new_user_id::TEXT) FROM 1 FOR 6));

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        telegram_link_code,
        plan
    ) VALUES (
        new_user_id,
        new_email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(new_email, '@', 1)),
        link_code,
        'starter'
    );

    -- Insert default wallets
    INSERT INTO public.wallets (id, user_id, name, type, balance, is_default, color, icon)
    VALUES (uuid_generate_v4(), new_user_id, 'Bank BCA', 'bank', 0.00, TRUE, '#005EB8', 'building-2')
    RETURNING id INTO default_bca_id;

    INSERT INTO public.wallets (id, user_id, name, type, balance, is_default, color, icon)
    VALUES (uuid_generate_v4(), new_user_id, 'Dompet Tunai', 'cash', 0.00, FALSE, '#10B981', 'banknote');

    -- Insert initial default categories
    INSERT INTO public.categories (user_id, name, type, emoji, color, is_system) VALUES
    (new_user_id, 'Makanan & Minuman', 'expense', '🍜', '#FF6B00', TRUE),
    (new_user_id, 'Transportasi', 'expense', '🚗', '#3B82F6', TRUE),
    (new_user_id, 'Belanja Harian', 'expense', '🛒', '#EC4899', TRUE),
    (new_user_id, 'Tagihan & Utilitas', 'expense', '🏠', '#8B5CF6', TRUE),
    (new_user_id, 'Hiburan & Hobi', 'expense', '🎮', '#F59E0B', TRUE),
    (new_user_id, 'Kesehatan', 'expense', '💊', '#EF4444', TRUE),
    (new_user_id, 'Gaji Bulanan', 'income', '💰', '#10B981', TRUE),
    (new_user_id, 'Freelance & Side Hustle', 'income', '💻', '#06B6D4', TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed AI provider configs
INSERT INTO public.ai_provider_configs (provider_name, is_active, priority_order, model_name)
VALUES
    ('gemini', TRUE, 1, 'gemini-1.5-flash'),
    ('openai', TRUE, 2, 'gpt-4o-mini'),
    ('deepseek', TRUE, 3, 'deepseek-chat')
ON CONFLICT (provider_name) DO NOTHING;
