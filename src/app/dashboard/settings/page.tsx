'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Send,
  Bell,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  ShieldCheck,
  Smartphone,
  Copy,
  Clock,
  Sparkles
} from 'lucide-react';
import { db, Profile, Category } from '@/lib/mock-db';

export default function SettingsPage() {
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'profil' | 'telegram' | 'reminder' | 'kategori'>('telegram');

  // Profil tab form
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Telegram tab form
  const [botToken, setBotToken] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'connected' | 'disconnected'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [connectedBotInfo, setConnectedBotInfo] = useState<any>(null);

  // Reminder tab form
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFreq, setReminderFreq] = useState<1 | 2>(1);
  const [reminderTime1, setReminderTime1] = useState('12:00');
  const [reminderTime2, setReminderTime2] = useState('20:00');
  const [reminderSaved, setReminderSaved] = useState(false);

  // Category tab form
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🍜');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  const refreshData = () => {
    const u = db.getCurrentUser();
    setUser(u);
    setFullName(u.full_name);
    setPhoneNumber(u.phone_number);
    setReminderEnabled(u.reminder_enabled);
    setReminderFreq(u.reminder_frequency);
    setReminderTime1(u.reminder_time_1?.slice(0, 5) || '12:00');
    setReminderTime2(u.reminder_time_2?.slice(0, 5) || '20:00');
    setTestStatus(u.telegram_connected_at || u.telegram_chat_id ? 'connected' : 'disconnected');
    setCategories(db.getCategories(u.id));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProfile(user.id, { full_name: fullName, phone_number: phoneNumber });
    setProfileSaved(true);
    refreshData();
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleTestBotConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;

    setTestStatus('testing');
    setStatusMessage('⏳ Testing getMe & setWebhook Telegram API...');

    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken.trim(), userId: user.id })
      });

      const data = await res.json();
      if (data.ok) {
        setTestStatus('connected');
        setConnectedBotInfo(data.bot);
        setStatusMessage(`🟢 Terhubung! Bot @${data.bot?.username || 'TataDana'} aktif dan webhook berhasil disetel.`);
        refreshData();
      } else {
        setTestStatus('disconnected');
        setStatusMessage(`🔴 Tidak terhubung: ${data.error || 'Token tidak valid.'}`);
      }
    } catch (err: any) {
      setTestStatus('disconnected');
      setStatusMessage(`🔴 Tidak terhubung: ${err.message}`);
    }
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProfile(user.id, {
      reminder_enabled: reminderEnabled,
      reminder_frequency: reminderFreq,
      reminder_time_1: `${reminderTime1}:00`,
      reminder_time_2: `${reminderTime2}:00`
    });
    setReminderSaved(true);
    refreshData();
    setTimeout(() => setReminderSaved(false), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    db.addCategory({
      user_id: user.id,
      name: newCatName,
      type: newCatType,
      emoji: newCatEmoji,
      color: '#FF6B00',
      is_system: false
    });

    setNewCatName('');
    refreshData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Kelola profil, integrasi Telegram bot, jadwal reminder, dan kategori keuangan.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl w-fit text-xs font-bold text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${activeTab === 'profil' ? 'bg-white text-[#FF6B00] shadow-sm' : 'hover:text-slate-900'}`}
        >
          <User className="w-4 h-4" />
          <span>Profil</span>
        </button>
        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${activeTab === 'telegram' ? 'bg-white text-[#FF6B00] shadow-sm' : 'hover:text-slate-900'}`}
        >
          <Send className="w-4 h-4" />
          <span>Telegram Bot</span>
        </button>
        <button
          onClick={() => setActiveTab('reminder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${activeTab === 'reminder' ? 'bg-white text-[#FF6B00] shadow-sm' : 'hover:text-slate-900'}`}
        >
          <Bell className="w-4 h-4" />
          <span>Reminder</span>
        </button>
        <button
          onClick={() => setActiveTab('kategori')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${activeTab === 'kategori' ? 'bg-white text-[#FF6B00] shadow-sm' : 'hover:text-slate-900'}`}
        >
          <Tag className="w-4 h-4" />
          <span>Kategori</span>
        </button>
      </div>

      {/* TAB 1: PROFIL */}
      {activeTab === 'profil' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
          <h3 className="font-extrabold text-base text-slate-900">Informasi Pribadi & Kontak</h3>

          {profileSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP (Kunci Akun)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <span className="px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Terverifikasi</span>
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mata Uang Default</label>
              <input
                type="text"
                value="IDR (Indonesian Rupiah - Rp)"
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold shadow-glow hover:opacity-95"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TELEGRAM BOT */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* Quick Connect Method 1: Link Code to Shared Bot */}
          <div className="glass-card rounded-3xl p-6 border border-orange-200 bg-orange-50/30 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Hubungkan ke Bot Bersama TataDana (Rekomendasi Cepat)</h3>
                  <p className="text-xs text-slate-600">Gunakan 1 bot bersama @TataDanaOfficialBot tanpa perlu membuat bot sendiri.</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${user.telegram_chat_id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {user.telegram_chat_id ? '🟢 Akun Terhubung' : '🟡 Menunggu Tautan'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-700">Kode Unik Telegram Kamu:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-black text-[#FF6B00] font-mono tracking-wider bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                    {user.telegram_link_code || 'TATA88'}
                  </span>
                  <span className="text-slate-500 text-[11px]">Buka Telegram, cari bot dan ketik: <code>/start {user.telegram_link_code || 'TATA88'}</code></span>
                </div>
              </div>
              <a
                href={`https://t.me/TataDanaOfficialBot?start=${user.telegram_link_code || 'TATA88'}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-slate-800 transition whitespace-nowrap"
              >
                <span>Buka Telegram Bot</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Method 2: Custom Bot Token via BotFather */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Gunakan Bot Telegram Pribadi Kamu</h3>
                  <p className="text-xs text-slate-600">Buat bot khusus lewat @BotFather dan masukkan token di sini.</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                {testStatus === 'connected' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    🟢 Terhubung
                  </span>
                )}
                {testStatus === 'disconnected' && (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                    🔴 Tidak terhubung
                  </span>
                )}
                {testStatus === 'testing' && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>⏳ Testing...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Step by Step Guide from @BotFather */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>📖 Panduan Step-by-Step dari @BotFather:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Buka aplikasi Telegram dan cari user <strong>@BotFather</strong></li>
                <li>Ketik <code>/newbot</code> lalu ikuti instruksi (masukkan nama bot dan username berakhiran <code>bot</code>)</li>
                <li>Salin token API HTTP yang diberikan (contoh: <code>123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</code>)</li>
                <li>Paste token ke input di bawah dan klik <strong>Test Koneksi</strong></li>
              </ol>
            </div>

            {/* Test Form */}
            <form onSubmit={handleTestBotConnection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Telegram Bot Token (HTTP API)</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Contoh: 7182948210:AAHq_rN9xV4..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  testStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  testStatus === 'disconnected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={testStatus === 'testing'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-glow hover:opacity-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{testStatus === 'testing' ? 'Sedang Memverifikasi...' : 'Test Koneksi & Set Webhook'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: REMINDER */}
      {activeTab === 'reminder' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Jadwal Pengingat Transaksi Harian</h3>
            <p className="text-xs text-slate-600">
              Notifikasi dikirim langsung ke Telegram kamu sesuai kebijakan produk (maksimal 2x per hari).
            </p>
          </div>

          {reminderSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan reminder berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSaveReminder} className="space-y-5 text-xs max-w-lg">
            {/* Toggle ON/OFF */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Status Reminder Telegram</span>
                <span className="text-[11px] text-slate-500">Aktifkan pengingat catat pengeluaran harian</span>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#FF6B00] rounded cursor-pointer"
              />
            </div>

            {/* Frekuensi (1x atau 2x sehari) */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Frekuensi Reminder</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReminderFreq(1)}
                  className={`p-3 rounded-2xl border text-center font-bold transition ${
                    reminderFreq === 1 ? 'border-orange-500 bg-orange-50 text-[#FF6B00]' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  1x Sehari
                </button>
                <button
                  type="button"
                  onClick={() => setReminderFreq(2)}
                  className={`p-3 rounded-2xl border text-center font-bold transition ${
                    reminderFreq === 2 ? 'border-orange-500 bg-orange-50 text-[#FF6B00]' : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  2x Sehari (Maksimal)
                </button>
              </div>
            </div>

            {/* Waktu Reminder */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam Reminder 1 (WIB)</label>
                <input
                  type="time"
                  value={reminderTime1}
                  onChange={(e) => setReminderTime1(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>

              {reminderFreq === 2 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Reminder 2 (WIB)</label>
                  <input
                    type="time"
                    value={reminderTime2}
                    onChange={(e) => setReminderTime2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  />
                </div>
              )}
            </div>

            {/* Preview Pesan Reminder */}
            <div className="p-4 rounded-2xl bg-[#EFEAE2]/40 border border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Preview Pesan di Telegram:</span>
              <p>⏰ Reminder Keuangan!</p>
              <p>Jangan lupa catat pengeluaran hari ini ya 📝</p>
              <p>Pencatatan rutin = keuangan lebih terkontrol 💪</p>
              <p>Ketik transaksimu sekarang!</p>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold shadow-glow hover:opacity-95"
            >
              Simpan Jadwal Reminder
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: KATEGORI */}
      {activeTab === 'kategori' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Kelola Kategori Transaksi</h3>
              <p className="text-xs text-slate-600">Tambah kategori custom lengkap dengan emoji dan tipe pos keuangan.</p>
            </div>
          </div>

          {/* Form Add Category */}
          <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
            <div className="w-16">
              <label className="block font-bold text-slate-600 mb-1">Emoji</label>
              <input
                type="text"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                maxLength={2}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-lg"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block font-bold text-slate-600 mb-1">Nama Kategori</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Contoh: Skincare, Gym, Kopi"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div className="w-32">
              <label className="block font-bold text-slate-600 mb-1">Jenis</label>
              <select
                value={newCatType}
                onChange={(e: any) => setNewCatType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>
            <div className="pt-5">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white font-bold hover:bg-[#EA580C] shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <h5 className="font-bold text-slate-900">{cat.name}</h5>
                    <span className="text-[10px] text-slate-400 capitalize">{cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
