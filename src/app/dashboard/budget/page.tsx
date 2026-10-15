'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Send,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { db, Budget, Category, Profile } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function BudgetPage() {
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [txs, setTxs] = useState(db.getTransactions());

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [budgetError, setBudgetError] = useState('');

  const refreshData = () => {
    setUser(db.getCurrentUser());
    setBudgets(db.getBudgets());
    setCategories(db.getCategories());
    setTxs(db.getTransactions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetError('');

    const limit = parseFloat(limitStr.replace(/\D/g, ''));
    if (!limit || limit <= 0 || !selectedCatId) return;

    // Enforce Starter plan limit: max 5 category budgets
    const isNewCategoryBudget = !budgets.some(b => b.category_id === selectedCatId);
    if (user.plan === 'starter' && isNewCategoryBudget && budgets.length >= 5) {
      setBudgetError('Batas maksimal 5 kategori budget untuk paket Starter telah tercapai. Upgrade ke paket Pro untuk mengatur budget kategori tanpa batas.');
      return;
    }

    db.setBudget(user.id, selectedCatId, limit);
    setIsModalOpen(false);
    setLimitStr('');
    refreshData();
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Target & Budget Kategori
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Atur batas pengeluaran bulanan dan dapatkan alert otomatis ke Telegram saat mencapai 80% dan 100%.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCatId(expenseCategories[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Atur Budget Kategori</span>
        </button>
      </div>

      {/* Alert Policy Notice Card */}
      <div className="glass-card rounded-3xl p-5 border border-orange-200/80 bg-orange-50/40 shadow-card flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-[#FF6B00] text-white shadow-sm flex-shrink-0">
          <BellRing className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <h4 className="font-extrabold text-slate-900 text-sm">Sistem Notifikasi Telegram Otomatis</h4>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Setiap kali kamu mencatat transaksi dan pengeluaran suatu kategori mencapai <strong>80%</strong> atau <strong>100%</strong> dari plafon bulanan, bot Telegram TataDana akan langsung mengirimkan peringatan dan tips penghematan secara real-time.
          </p>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map(b => {
          const cat = categories.find(c => c.id === b.category_id);
          const spent = txs
            .filter(t => t.category_id === b.category_id && t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

          const pct = Math.round((spent / b.monthly_limit) * 100);
          const sisa = Math.max(0, b.monthly_limit - spent);
          const isOver = pct >= 100;
          const isWarning = pct >= 80 && pct < 100;

          return (
            <div
              key={b.id}
              className={`glass-card rounded-3xl p-5 border shadow-card flex flex-col justify-between ${
                isOver ? 'border-rose-300 bg-rose-50/20' : isWarning ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-100">{cat?.emoji || '🏷️'}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{cat?.name || 'Kategori'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Bulan Ini (Oktober 2026)</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    isOver ? 'bg-rose-100 text-rose-600' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {pct}% Terpakai
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-[#FF6B00]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Terpakai: {formatRupiah(spent)}</span>
                    <span className="text-slate-900">Batas: {formatRupiah(b.monthly_limit)}</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  {isOver ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overbudget! Defisit {formatRupiah(spent - b.monthly_limit)}
                    </span>
                  ) : isWarning ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Peringatan 80% (Sisa {formatRupiah(sisa)})
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aman (Sisa {formatRupiah(sisa)})
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedCatId(b.category_id);
                    setLimitStr(b.monthly_limit.toLocaleString('id-ID'));
                    setIsModalOpen(true);
                  }}
                  className="text-slate-500 hover:text-orange-600 font-bold hover:underline"
                >
                  Ubah
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Atur Batas Budget Bulanan</h3>
              <button onClick={() => { setIsModalOpen(false); setBudgetError(''); }} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {budgetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                {budgetError}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Kategori</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Batas Bulanan (IDR)</label>
                <input
                  type="text"
                  value={limitStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setLimitStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                  }}
                  placeholder="Contoh: 1.500.000"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-glow hover:opacity-95"
              >
                Simpan Target Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
