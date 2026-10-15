/**
 * TataDana Unified Data Store & Persistence Layer
 * Provides high-fidelity state management for all entities:
 * Profiles, Wallets, Categories, Budgets, Transactions, Receipt Items, Exports, AI Logs, Admin Audit.
 */

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number: string;
  phone_verified: boolean;
  phone_otp_code?: string;
  plan: 'starter' | 'pro';
  plan_expires_at?: string;
  currency: string;
  role: 'user' | 'admin' | 'superadmin';
  telegram_chat_id?: number | null;
  telegram_username?: string;
  telegram_link_code: string;
  telegram_bot_token_encrypted?: string;
  telegram_connected_at?: string;
  reminder_enabled: boolean;
  reminder_frequency: 1 | 2;
  reminder_time_1: string;
  reminder_time_2: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'cash' | 'investment';
  balance: number;
  is_default: boolean;
  color: string;
  icon: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  period_month: string; // YYYY-MM
  alert_80_sent: boolean;
  alert_100_sent: boolean;
  created_at: string;
}

export interface ReceiptItem {
  id: string;
  transaction_id: string;
  item_name: string;
  quantity: number;
  price: number;
  category_name?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  source: 'web' | 'telegram_text' | 'telegram_photo' | 'telegram_voice';
  receipt_url?: string;
  receipt_merchant?: string;
  is_receipt_parent?: boolean;
  receipt_items?: ReceiptItem[];
  to_wallet_id?: string; // for transfer
  created_at: string;
}

export interface ExportRecord {
  id: string;
  user_id: string;
  file_name: string;
  format: 'pdf' | 'xlsx';
  period_label: string;
  file_url: string;
  storage_path: string;
  file_size_bytes: number;
  created_at: string;
}

export interface AiProviderConfig {
  id: string;
  provider_name: 'gemini' | 'openai' | 'deepseek';
  is_active: boolean;
  priority_order: number;
  api_key_masked: string;
  model_name: string;
}

export interface AiLog {
  id: string;
  user_id?: string;
  provider: string;
  prompt_type: 'parse_transaction' | 'ocr_receipt' | 'speech_transcription' | 'financial_advisor' | 'onboarding_recommendation';
  tokens_used: number;
  response_time_ms: number;
  status: 'success' | 'failed' | 'failover_fallback';
  error_message?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  user_name: string;
  order_id: string;
  plan_selected: 'starter' | 'pro';
  amount: number;
  payment_method: string;
  status: 'pending' | 'settlement' | 'deny' | 'expire' | 'cancel' | 'refund';
  proof_image_url?: string;
  admin_notes?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  target_user_id: string;
  action: string;
  details: any;
  ip_address: string;
  created_at: string;
}

// Initial In-Memory State
const initialProfiles: Profile[] = [
  {
    id: 'usr_tatadana_01',
    email: 'rizky@tatadana.id',
    full_name: 'Rizky Muhammad Riady',
    phone_number: '081298765432',
    phone_verified: true,
    plan: 'pro',
    currency: 'IDR',
    role: 'superadmin',
    telegram_chat_id: 987654321,
    telegram_username: '@rizky_tatadana',
    telegram_link_code: 'TATA88',
    reminder_enabled: true,
    reminder_frequency: 2,
    reminder_time_1: '12:00:00',
    reminder_time_2: '20:00:00',
    created_at: '2026-10-01T08:00:00+07:00'
  },
  {
    id: 'usr_tatadana_02',
    email: 'andi.pratama@gmail.com',
    full_name: 'Andi Pratama',
    phone_number: '085712348899',
    phone_verified: true,
    plan: 'starter',
    currency: 'IDR',
    role: 'user',
    telegram_chat_id: null,
    telegram_username: undefined,
    telegram_link_code: 'TATA42',
    reminder_enabled: true,
    reminder_frequency: 1,
    reminder_time_1: '19:30:00',
    reminder_time_2: '21:00:00',
    created_at: '2026-10-05T10:15:00+07:00'
  }
];

const initialWallets: Wallet[] = [
  {
    id: 'wal_01',
    user_id: 'usr_tatadana_01',
    name: 'Bank BCA',
    type: 'bank',
    balance: 5450000,
    is_default: true,
    color: '#005EB8',
    icon: 'building-2',
    created_at: '2026-10-01T08:00:00+07:00'
  },
  {
    id: 'wal_02',
    user_id: 'usr_tatadana_01',
    name: 'GoPay',
    type: 'ewallet',
    balance: 420000,
    is_default: false,
    color: '#00AED6',
    icon: 'smartphone',
    created_at: '2026-10-01T08:05:00+07:00'
  },
  {
    id: 'wal_03',
    user_id: 'usr_tatadana_01',
    name: 'Dompet Tunai',
    type: 'cash',
    balance: 850000,
    is_default: false,
    color: '#10B981',
    icon: 'banknote',
    created_at: '2026-10-01T08:10:00+07:00'
  }
];

const initialCategories: Category[] = [
  { id: 'cat_01', user_id: 'usr_tatadana_01', name: 'Makanan & Minuman', type: 'expense', emoji: '🍜', color: '#FF6B00', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_02', user_id: 'usr_tatadana_01', name: 'Transportasi', type: 'expense', emoji: '🚗', color: '#3B82F6', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_03', user_id: 'usr_tatadana_01', name: 'Belanja Harian', type: 'expense', emoji: '🛒', color: '#EC4899', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_04', user_id: 'usr_tatadana_01', name: 'Tagihan & Listrik', type: 'expense', emoji: '🏠', color: '#8B5CF6', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_05', user_id: 'usr_tatadana_01', name: 'Hiburan & Santai', type: 'expense', emoji: '🎮', color: '#F59E0B', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_06', user_id: 'usr_tatadana_01', name: 'Kesehatan & Obat', type: 'expense', emoji: '💊', color: '#EF4444', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_07', user_id: 'usr_tatadana_01', name: 'Gaji Pokok', type: 'income', emoji: '💰', color: '#10B981', is_system: true, created_at: '2026-10-01' },
  { id: 'cat_08', user_id: 'usr_tatadana_01', name: 'Project Freelance', type: 'income', emoji: '💻', color: '#06B6D4', is_system: true, created_at: '2026-10-01' }
];

const initialBudgets: Budget[] = [
  { id: 'bud_01', user_id: 'usr_tatadana_01', category_id: 'cat_01', monthly_limit: 2500000, period_month: '2026-10', alert_80_sent: false, alert_100_sent: false, created_at: '2026-10-01' },
  { id: 'bud_02', user_id: 'usr_tatadana_01', category_id: 'cat_02', monthly_limit: 1000000, period_month: '2026-10', alert_80_sent: false, alert_100_sent: false, created_at: '2026-10-01' },
  { id: 'bud_03', user_id: 'usr_tatadana_01', category_id: 'cat_03', monthly_limit: 1500000, period_month: '2026-10', alert_80_sent: false, alert_100_sent: false, created_at: '2026-10-01' },
  { id: 'bud_04', user_id: 'usr_tatadana_01', category_id: 'cat_04', monthly_limit: 800000, period_month: '2026-10', alert_80_sent: true, alert_100_sent: false, created_at: '2026-10-01' }
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx_01',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_01',
    category_id: 'cat_07',
    type: 'income',
    amount: 9500000,
    note: 'Gaji Bulanan Oktober 2026',
    date: '2026-10-01',
    time: '09:00:00',
    source: 'web',
    created_at: '2026-10-01T09:00:00+07:00'
  },
  {
    id: 'tx_02',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_01',
    category_id: 'cat_04',
    type: 'expense',
    amount: 650000,
    note: 'Bayar Listrik PLN & Internet Indihome',
    date: '2026-10-03',
    time: '14:20:00',
    source: 'telegram_text',
    created_at: '2026-10-03T14:20:00+07:00'
  },
  {
    id: 'tx_03',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_02',
    category_id: 'cat_01',
    type: 'expense',
    amount: 45000,
    note: 'Makan siang Nasi Padang Sederhana',
    date: '2026-10-07',
    time: '12:35:00',
    source: 'telegram_text',
    created_at: '2026-10-07T12:35:00+07:00'
  },
  {
    id: 'tx_04',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_02',
    category_id: 'cat_02',
    type: 'expense',
    amount: 28000,
    note: 'Gojek ke Stasiun Sudirman',
    date: '2026-10-09',
    time: '08:15:00',
    source: 'telegram_text',
    created_at: '2026-10-09T08:15:00+07:00'
  },
  {
    id: 'tx_05',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_01',
    category_id: 'cat_08',
    type: 'income',
    amount: 2200000,
    note: 'DP Project Landing Page UMKM',
    date: '2026-10-10',
    time: '16:00:00',
    source: 'web',
    created_at: '2026-10-10T16:00:00+07:00'
  },
  {
    id: 'tx_06',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_01',
    category_id: 'cat_03',
    type: 'expense',
    amount: 185000,
    note: 'Belanja Mingguan Indomaret Fresh',
    date: '2026-10-11',
    time: '19:40:00',
    source: 'telegram_photo',
    receipt_merchant: 'Indomaret Fresh Tebet',
    is_receipt_parent: true,
    receipt_items: [
      { id: 'rc_01', transaction_id: 'tx_06', item_name: 'Susu Ultra Milk 1L (2x)', quantity: 2, price: 42000, category_name: 'Belanja Harian' },
      { id: 'rc_02', transaction_id: 'tx_06', item_name: 'Roti Tawar Sari Roti', quantity: 1, price: 18000, category_name: 'Belanja Harian' },
      { id: 'rc_03', transaction_id: 'tx_06', item_name: 'Kopi Kapal Api Special', quantity: 2, price: 25000, category_name: 'Belanja Harian' },
      { id: 'rc_04', transaction_id: 'tx_06', item_name: 'Buah Apel Fuji 1kg', quantity: 1, price: 55000, category_name: 'Makanan & Minuman' },
      { id: 'rc_05', transaction_id: 'tx_06', item_name: 'Deterjen Rinso Molto 800g', quantity: 1, price: 45000, category_name: 'Belanja Harian' }
    ],
    created_at: '2026-10-11T19:40:00+07:00'
  },
  {
    id: 'tx_07',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_03',
    category_id: 'cat_01',
    type: 'expense',
    amount: 35000,
    note: 'Kopi Susu Gula Aren & Roti',
    date: '2026-10-12',
    time: '15:10:00',
    source: 'telegram_voice',
    created_at: '2026-10-12T15:10:00+07:00'
  },
  {
    id: 'tx_08',
    user_id: 'usr_tatadana_01',
    wallet_id: 'wal_01',
    to_wallet_id: 'wal_02',
    category_id: undefined,
    type: 'transfer',
    amount: 500000,
    note: 'Top up saldo GoPay dari BCA',
    date: '2026-10-12',
    time: '16:00:00',
    source: 'web',
    created_at: '2026-10-12T16:00:00+07:00'
  }
];

const initialAiConfigs: AiProviderConfig[] = [
  { id: 'ai_01', provider_name: 'gemini', is_active: true, priority_order: 1, api_key_masked: 'AIzaSyD...9Xk2', model_name: 'gemini-1.5-flash' },
  { id: 'ai_02', provider_name: 'openai', is_active: true, priority_order: 2, api_key_masked: 'sk-proj...T5q8', model_name: 'gpt-4o-mini' },
  { id: 'ai_03', provider_name: 'deepseek', is_active: true, priority_order: 3, api_key_masked: 'sk-deep...88Lq', model_name: 'deepseek-chat' }
];

const initialAiLogs: AiLog[] = [
  { id: 'log_01', user_id: 'usr_tatadana_01', provider: 'gemini', prompt_type: 'parse_transaction', tokens_used: 184, response_time_ms: 320, status: 'success', created_at: '2026-10-12T15:10:00+07:00' },
  { id: 'log_02', user_id: 'usr_tatadana_01', provider: 'gemini', prompt_type: 'ocr_receipt', tokens_used: 420, response_time_ms: 890, status: 'success', created_at: '2026-10-11T19:40:00+07:00' },
  { id: 'log_03', user_id: 'usr_tatadana_01', provider: 'gemini', prompt_type: 'financial_advisor', tokens_used: 310, response_time_ms: 540, status: 'success', created_at: '2026-10-10T20:00:00+07:00' }
];

const initialPayments: PaymentTransaction[] = [
  {
    id: 'pay_01',
    user_id: 'usr_tatadana_01',
    user_name: 'Rizky Muhammad Riady',
    order_id: 'ORD-TATADANA-PRO-98124',
    plan_selected: 'pro',
    amount: 99000,
    payment_method: 'qris',
    status: 'settlement',
    admin_notes: 'Midtrans QRIS Auto Settlement',
    created_at: '2026-10-01T08:05:00+07:00'
  },
  {
    id: 'pay_02',
    user_id: 'usr_tatadana_02',
    user_name: 'Andi Pratama',
    order_id: 'ORD-TATADANA-ST-88192',
    plan_selected: 'starter',
    amount: 49000,
    payment_method: 'manual_transfer',
    status: 'pending',
    proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    admin_notes: 'Transfer via BCA konfirmasi manual',
    created_at: '2026-10-12T11:20:00+07:00'
  }
];

const initialExports: ExportRecord[] = [
  {
    id: 'exp_01',
    user_id: 'usr_tatadana_01',
    file_name: 'Laporan_Keuangan_TataDana_Oktober_2026.pdf',
    format: 'pdf',
    period_label: 'Oktober 2026',
    file_url: '/api/export/download?file=exp_01',
    storage_path: 'exports/usr_01/laporan_okt_2026.pdf',
    file_size_bytes: 145820,
    created_at: '2026-10-12T10:00:00+07:00'
  }
];

const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'aud_01',
    admin_id: 'usr_tatadana_01',
    admin_email: 'rizky@tatadana.id',
    target_user_id: 'usr_tatadana_02',
    action: 'VIEW_USER_TRANSACTIONS',
    details: { reason: 'Support ticket #102 - bantuan verifikasi' },
    ip_address: '180.252.12.98',
    created_at: '2026-10-12T11:45:00+07:00'
  }
];

// Singleton Store with In-Memory + LocalStorage Sync
class TataDanaStore {
  profiles: Profile[] = [...initialProfiles];
  wallets: Wallet[] = [...initialWallets];
  categories: Category[] = [...initialCategories];
  budgets: Budget[] = [...initialBudgets];
  transactions: Transaction[] = [...initialTransactions];
  aiConfigs: AiProviderConfig[] = [...initialAiConfigs];
  aiLogs: AiLog[] = [...initialAiLogs];
  payments: PaymentTransaction[] = [...initialPayments];
  exports: ExportRecord[] = [...initialExports];
  auditLogs: AdminAuditLog[] = [...initialAuditLogs];
  aiMode: 'single' | 'parallel' = 'parallel';
  processedUpdates = new Set<number>();
  activeUserId: string = 'usr_tatadana_01'; // Default logged in user

  getCurrentUser(): Profile {
    const user = this.profiles.find(p => p.id === this.activeUserId);
    return user || this.profiles[0];
  }

  setCurrentUser(userId: string) {
    this.activeUserId = userId;
  }

  updateProfile(userId: string, updates: Partial<Profile>) {
    const user = this.profiles.find(p => p.id === userId);
    if (user) {
      Object.assign(user, updates);
    }
  }

  // --- Transactions ---
  getTransactions(userId: string = this.activeUserId): Transaction[] {
    return this.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const id = 'tx_' + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = {
      ...tx,
      id,
      created_at: new Date().toISOString()
    };
    this.transactions.unshift(newTx);

    // Update wallet balances automatically
    if (newTx.type === 'expense' && newTx.wallet_id) {
      const w = this.wallets.find(item => item.id === newTx.wallet_id);
      if (w) w.balance -= newTx.amount;
    } else if (newTx.type === 'income' && newTx.wallet_id) {
      const w = this.wallets.find(item => item.id === newTx.wallet_id);
      if (w) w.balance += newTx.amount;
    } else if (newTx.type === 'transfer' && newTx.wallet_id && newTx.to_wallet_id) {
      const sourceW = this.wallets.find(item => item.id === newTx.wallet_id);
      const targetW = this.wallets.find(item => item.id === newTx.to_wallet_id);
      if (sourceW) sourceW.balance -= newTx.amount;
      if (targetW) targetW.balance += newTx.amount;
    }

    return newTx;
  }

  deleteTransaction(id: string) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      const [tx] = this.transactions.splice(idx, 1);
      // Revert wallet balance
      if (tx.type === 'expense' && tx.wallet_id) {
        const w = this.wallets.find(item => item.id === tx.wallet_id);
        if (w) w.balance += tx.amount;
      } else if (tx.type === 'income' && tx.wallet_id) {
        const w = this.wallets.find(item => item.id === tx.wallet_id);
        if (w) w.balance -= tx.amount;
      }
    }
  }

  // --- Wallets ---
  getWallets(userId: string = this.activeUserId): Wallet[] {
    return this.wallets.filter(w => w.user_id === userId);
  }

  getDefaultWallet(userId: string = this.activeUserId): Wallet | undefined {
    const userWallets = this.getWallets(userId);
    return userWallets.find(w => w.is_default) || userWallets[0];
  }

  addWallet(wallet: Omit<Wallet, 'id' | 'created_at'>): Wallet {
    const id = 'wal_' + Math.random().toString(36).substring(2, 9);
    const newWallet: Wallet = {
      ...wallet,
      id,
      created_at: new Date().toISOString()
    };
    if (newWallet.is_default) {
      this.wallets.forEach(w => {
        if (w.user_id === wallet.user_id) w.is_default = false;
      });
    }
    this.wallets.push(newWallet);
    return newWallet;
  }

  updateWallet(id: string, updates: Partial<Wallet>) {
    const w = this.wallets.find(item => item.id === id);
    if (w) {
      if (updates.is_default) {
        this.wallets.forEach(item => {
          if (item.user_id === w.user_id) item.is_default = false;
        });
      }
      Object.assign(w, updates);
    }
  }

  deleteWallet(id: string) {
    this.wallets = this.wallets.filter(w => w.id !== id);
  }

  // --- Categories ---
  getCategories(userId: string = this.activeUserId): Category[] {
    return this.categories.filter(c => c.user_id === userId);
  }

  addCategory(cat: Omit<Category, 'id' | 'created_at'>): Category {
    const id = 'cat_' + Math.random().toString(36).substring(2, 9);
    const newCat: Category = {
      ...cat,
      id,
      created_at: new Date().toISOString()
    };
    this.categories.push(newCat);
    return newCat;
  }

  // --- Budgets ---
  getBudgets(userId: string = this.activeUserId, period: string = '2026-10'): Budget[] {
    return this.budgets.filter(b => b.user_id === userId && b.period_month === period);
  }

  setBudget(userId: string, categoryId: string, limit: number, period: string = '2026-10'): Budget {
    let existing = this.budgets.find(b => b.user_id === userId && b.category_id === categoryId && b.period_month === period);
    if (existing) {
      existing.monthly_limit = limit;
      return existing;
    }
    const newBudget: Budget = {
      id: 'bud_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      category_id: categoryId,
      monthly_limit: limit,
      period_month: period,
      alert_80_sent: false,
      alert_100_sent: false,
      created_at: new Date().toISOString()
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  // --- Exports ---
  getExports(userId: string = this.activeUserId): ExportRecord[] {
    return this.exports.filter(e => e.user_id === userId);
  }

  addExport(rec: Omit<ExportRecord, 'id' | 'created_at'>): ExportRecord {
    const newRec: ExportRecord = {
      ...rec,
      id: 'exp_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.exports.unshift(newRec);
    return newRec;
  }

  // --- AI Configs & Logs ---
  getAiConfigs(): AiProviderConfig[] {
    return this.aiConfigs;
  }

  updateAiConfig(id: string, updates: Partial<AiProviderConfig>) {
    const item = this.aiConfigs.find(c => c.id === id);
    if (item) Object.assign(item, updates);
  }

  addAiLog(log: Omit<AiLog, 'id' | 'created_at'>): AiLog {
    const newLog: AiLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.aiLogs.unshift(newLog);
    return newLog;
  }

  // --- Payments ---
  getPayments(): PaymentTransaction[] {
    return this.payments;
  }

  updatePaymentStatus(orderId: string, status: PaymentTransaction['status'], adminNotes?: string) {
    const p = this.payments.find(item => item.order_id === orderId);
    if (p) {
      p.status = status;
      if (adminNotes) p.admin_notes = adminNotes;
      if (status === 'settlement') {
        const u = this.profiles.find(user => user.id === p.user_id);
        if (u) u.plan = p.plan_selected;
      }
    }
  }

  // --- Audit Log ---
  logAdminAction(adminEmail: string, targetUserId: string, action: string, details: any) {
    this.auditLogs.unshift({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      admin_id: this.activeUserId,
      admin_email: adminEmail,
      target_user_id: targetUserId,
      action,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    });
  }

  // --- Idempotency Check for Telegram ---
  isUpdateProcessed(updateId: number): boolean {
    return this.processedUpdates.has(updateId);
  }

  markUpdateProcessed(updateId: number) {
    this.processedUpdates.add(updateId);
  }
}

// Global Singleton
const globalStore = (globalThis as any).__tatadana_store || new TataDanaStore();
(globalThis as any).__tatadana_store = globalStore;

export const db = globalStore as TataDanaStore;
