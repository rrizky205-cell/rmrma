'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  TrendingUp,
  Plus,
  Send,
  Calendar,
  Filter,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { db, Transaction, Profile } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatIndoLongDate, formatIndoShortDate, formatTelegramReplyDate } from '@/lib/utils/date-wib';
import TransactionModal from '@/components/TransactionModal';
import TelegramSimulator from '@/components/TelegramSimulator';

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState(db.getWallets());
  const [categories, setCategories] = useState(db.getCategories());
  const [budgets, setBudgets] = useState(db.getBudgets());
  const [period, setPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'custom'>('bulanan');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const refreshData = () => {
    setUser(db.getCurrentUser());
    setTransactions(db.getTransactions());
    setWallets(db.getWallets());
    setCategories(db.getCategories());
    setBudgets(db.getBudgets());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter transactions based on selected period
  const filteredTxs = transactions.filter(tx => {
    const today = new Date().toISOString().split('T')[0];
    if (period === 'harian') return tx.date === today;
    if (period === 'mingguan') {
      const past7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      return tx.date >= past7;
    }
    if (period === 'bulanan') return tx.date.startsWith('2026-10');
    if (period === 'tahunan') return tx.date.startsWith('2026');
    if (period === 'custom') {
      if (customStartDate && tx.date < customStartDate) return false;
      if (customEndDate && tx.date > customEndDate) return false;
      return true;
    }
    return true;
  });

  // KPI Calculations
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const remainingBudget = Math.max(0, totalMonthlyBudget - totalExpense);

  // Category Breakdown for Pie Chart
  const expenseByCategory = categories.filter(c => c.type === 'expense').map(c => {
    const spent = filteredTxs.filter(t => t.category_id === c.id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      ...c,
      spent,
      pct: totalExpense > 0 ? (spent / totalExpense) * 100 : 0
    };
  }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);

  // 6 Months Comparison Data
  const sixMonthsData = [
    { month: 'Mei', income: 7500000, expense: 5200000 },
    { month: 'Jun', income: 8200000, expense: 5900000 },
    { month: 'Jul', income: 9000000, expense: 6400000 },
    { month: 'Agt', income: 8500000, expense: 6100000 },
    { month: 'Sep', income: 9200000, expense: 6800000 },
    { month: 'Okt', income: totalIncome, expense: totalExpense },
  ];

  // Daily Trend dynamically computed from filtered transactions
  const dailyMap = new Map<string, number>();
  filteredTxs.filter(t => t.type === 'expense').forEach(t => {
    const day = t.date.slice(-2);
    dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount);
  });
  const sortedDays = Array.from(dailyMap.keys()).sort();
  const dailyData = sortedDays.length > 0
    ? sortedDays.map(d => ({ day: d, amount: dailyMap.get(d) || 0 }))
    : [
        { day: '01', amount: 0 },
        { day: '05', amount: 0 },
        { day: '10', amount: 0 },
        { day: '15', amount: 0 },
      ];

  // Onboarding Checklist items
  const onboardingSteps = [
    { title: 'Tautkan Telegram Bot', done: Boolean(user.telegram_connected_at || user.telegram_chat_id), link: '/dashboard/settings' },
    { title: 'Atur Dompet & Saldo Awal', done: wallets.length >= 2, link: '/dashboard/wallet' },
    { title: 'Tentukan Target Budget Kategori', done: budgets.length >= 3, link: '/dashboard/budget' },
    { title: 'Catat Transaksi Pertama', done: transactions.length > 0, link: '/dashboard/transaksi' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Halo, {user.full_name}! Pantau dan kendalikan pengeluaranmu hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 shadow-sm transition flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>{showSimulator ? 'Tutup Bot' : 'Buka Simulator Bot'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Simulator Modal / Inline Drawer */}
      {showSimulator && (
        <div className="p-4 rounded-3xl bg-orange-50/60 border border-orange-200/80">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-800">Telegram Bot Live Simulator (Terhubung ke Webhook)</h3>
            </div>
            <button
              onClick={() => setShowSimulator(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-semibold"
            >
              Tutup
            </button>
          </div>
          <TelegramSimulator onNewTransaction={refreshData} />
        </div>
      )}

      {/* Onboarding Checklist Card (Shows progress) */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🚀</span>
            <h3 className="text-sm font-extrabold text-slate-900">Checklist Aktivasi Akun TataDana</h3>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            {onboardingSteps.filter(s => s.done).length} dari {onboardingSteps.length} selesai
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {onboardingSteps.map((step, idx) => (
            <Link
              key={idx}
              href={step.link}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition ${
                step.done
                  ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span className="font-semibold">{step.title}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-2xl w-fit text-xs font-bold text-slate-600">
          {(['harian', 'mingguan', 'bulanan', 'tahunan', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition ${
                period === p ? 'bg-white text-[#FF6B00] shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {p === 'custom' ? 'Custom Range' : p}
            </button>
          ))}
        </div>

        {period === 'custom' ? (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
            />
          </div>
        ) : (
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Periode: {period === 'bulanan' ? 'Oktober 2026' : period}
          </span>
        )}
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Total</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalBalance)}
            </h3>
            <p className="text-[11px] text-slate-600 mt-1">Gabungan dari {wallets.length} dompet aktif</p>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pemasukan</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
              +{formatRupiah(totalIncome)}
            </h3>
            <p className="text-[11px] text-slate-600 mt-1">Total uang masuk ({period})</p>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pengeluaran</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">
              -{formatRupiah(totalExpense)}
            </h3>
            <p className="text-[11px] text-slate-600 mt-1">Total belanja & tagihan ({period})</p>
          </div>
        </div>

        {/* Budget Tersisa */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Budget Tersisa</span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#FF6B00]">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRupiah(remainingBudget)}
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full"
                style={{ width: `${totalMonthlyBudget > 0 ? Math.min(100, (totalExpense / totalMonthlyBudget) * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Pemasukan vs Pengeluaran 6 Bulan */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Perbandingan Arus Kas 6 Bulan</h3>
              <p className="text-xs text-slate-600">Pemasukan vs Pengeluaran bulanan</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                <span className="text-slate-600">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#FF6B00]"></span>
                <span className="text-slate-600">Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {sixMonthsData.map((d, idx) => {
              const maxVal = 12000000;
              const inHeight = (d.income / maxVal) * 180;
              const outHeight = (d.expense / maxVal) * 180;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1.5 w-full justify-center h-[180px]">
                    <div
                      style={{ height: `${inHeight}px` }}
                      className="w-4 sm:w-6 bg-emerald-500 rounded-t-lg transition-all duration-500 hover:opacity-90 relative group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap pointer-events-none z-10 font-bold transition">
                        +{formatRupiah(d.income)}
                      </div>
                    </div>
                    <div
                      style={{ height: `${outHeight}px` }}
                      className="w-4 sm:w-6 bg-gradient-to-t from-orange-600 to-[#FF6B00] rounded-t-lg transition-all duration-500 hover:opacity-90 relative group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded whitespace-nowrap pointer-events-none z-10 font-bold transition">
                        -{formatRupiah(d.expense)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart / Breakdown Kategori */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Pengeluaran per Kategori</h3>
            <p className="text-xs text-slate-600 mb-4">Breakdown pengeluaran {period}</p>

            <div className="space-y-3">
              {expenseByCategory.length === 0 ? (
                <p className="text-xs text-slate-600 py-6 text-center">Belum ada pengeluaran di periode ini.</p>
              ) : (
                expenseByCategory.slice(0, 5).map(cat => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{formatRupiah(cat.spent)} ({cat.pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/dashboard/laporan"
            className="mt-4 text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-orange-400 hover:text-orange-600 transition flex items-center justify-center gap-1.5"
          >
            <span>Lihat Laporan Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 10 Transaksi Terbaru */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">10 Transaksi Terbaru</h3>
            <p className="text-xs text-slate-600">Transaksi otomatis via Telegram maupun Web</p>
          </div>
          <Link
            href="/dashboard/transaksi"
            className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
          >
            <span>Kelola Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTxs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-600">Belum ada transaksi.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-xs font-bold text-orange-600 hover:underline"
              >
                + Tambah transaksi pertamamu
              </button>
            </div>
          ) : (
            filteredTxs.slice(0, 10).map((tx) => {
              const cat = categories.find(c => c.id === tx.category_id);
              const wallet = wallets.find(w => w.id === tx.wallet_id);
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                      tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : tx.type === 'transfer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-[#FF6B00]'
                    }`}>
                      {cat?.emoji || (tx.type === 'transfer' ? '🔁' : '💰')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {tx.is_receipt_parent ? `🧾 ${tx.receipt_merchant || 'Struk Belanja'}` : (tx.note || cat?.name || 'Transaksi')}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <span>{formatIndoShortDate(tx.date)}</span>
                        <span>•</span>
                        <span>👛 {wallet?.name || 'Dompet'}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : tx.type === 'transfer' ? 'text-blue-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatRupiah(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
