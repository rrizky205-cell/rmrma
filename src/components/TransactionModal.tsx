'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { db, Wallet, Category } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { getCurrentDateStringWIB, getNowWIB } from '@/lib/utils/date-wib';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const user = db.getCurrentUser();
  const wallets = db.getWallets(user.id);
  const categories = db.getCategories(user.id);

  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getCurrentDateStringWIB());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(amountStr.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (txType === 'transfer' && walletId === toWalletId) {
      setError('Dompet asal dan dompet tujuan tidak boleh sama.');
      return;
    }

    // Check balance for transfer or expense
    const sourceWallet = wallets.find(w => w.id === walletId);
    if ((txType === 'expense' || txType === 'transfer') && sourceWallet && sourceWallet.balance < amount) {
      setError(`Saldo ${sourceWallet.name} tidak mencukupi (Tersisa ${formatRupiah(sourceWallet.balance)}).`);
      return;
    }

    // Enforce Starter monthly transaction quota (max 50)
    const currentMonthPrefix = date.slice(0, 7);
    const userMonthlyCount = db.getTransactions(user.id).filter(t => t.date.startsWith(currentMonthPrefix)).length;
    if (user.plan === 'starter' && userMonthlyCount >= 50) {
      setError('Batas kuota 50 transaksi/bulan untuk paket Starter telah tercapai. Silakan upgrade ke paket Pro untuk transaksi tanpa batas.');
      return;
    }

    setLoading(true);

    const timeStr = `${String(getNowWIB().getHours()).padStart(2, '0')}:${String(getNowWIB().getMinutes()).padStart(2, '0')}:00`;

    db.addTransaction({
      user_id: user.id,
      wallet_id: walletId,
      to_wallet_id: txType === 'transfer' ? toWalletId : undefined,
      category_id: txType === 'transfer' ? undefined : categoryId,
      type: txType,
      amount,
      note: note || (txType === 'transfer' ? 'Transfer Saldo' : txType === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      date,
      time: timeStr,
      source: 'web'
    });

    // Check and trigger budget alert flags
    if (txType === 'expense' && categoryId) {
      const budget = db.getBudgets(user.id).find(b => b.category_id === categoryId);
      if (budget && budget.monthly_limit > 0) {
        const spentSoFar = db.getTransactions(user.id)
          .filter(t => t.category_id === categoryId && t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);
        const pct = Math.round((spentSoFar / budget.monthly_limit) * 100);
        if (pct >= 100 && !budget.alert_100_sent) {
          budget.alert_100_sent = true;
        } else if (pct >= 80 && !budget.alert_80_sent) {
          budget.alert_80_sent = true;
        }
      }
    }

    setLoading(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Catat Transaksi Baru</h3>
            <p className="text-xs text-slate-600">Simpan transaksi langsung ke database Supabase TataDana</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-800 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${txType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('transfer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${txType === 'transfer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Nominal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nominal Transaksi (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-600 text-lg">Rp</span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold text-slate-900 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>
          </div>

          {/* Wallets */}
          {txType === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dari Dompet</label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ke Dompet</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Dompet / Akun</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} — Saldo: {formatRupiah(w.balance)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category (if not transfer) */}
          {txType !== 'transfer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Transaksi</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              >
                {categories.filter(c => c.type === (txType === 'income' ? 'income' : 'expense')).map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan / Keterangan</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Makan siang"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition shadow-glow flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
