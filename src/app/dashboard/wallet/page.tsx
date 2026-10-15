'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  Star,
  ArrowLeftRight,
  Building2,
  Smartphone,
  Banknote,
  TrendingUp,
  X,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { db, Wallet, Profile } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function WalletPage() {
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Add form states
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'bank' | 'ewallet' | 'cash' | 'investment'>('bank');
  const [initBalanceStr, setInitBalanceStr] = useState('');
  const [color, setColor] = useState('#005EB8');
  const [addError, setAddError] = useState('');

  // Transfer form states
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [transferAmountStr, setTransferAmountStr] = useState('');
  const [transferError, setTransferError] = useState('');

  const refreshData = () => {
    setUser(db.getCurrentUser());
    const w = db.getWallets();
    setWallets(w);
    if (w.length >= 2) {
      setFromWalletId(w[0].id);
      setToWalletId(w[1].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSetDefault = (id: string) => {
    db.updateWallet(id, { is_default: true });
    refreshData();
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      alert('Kamu harus memiliki minimal satu dompet utama.');
      return;
    }
    if (confirm('Hapus dompet ini?')) {
      db.deleteWallet(id);
      refreshData();
    }
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (user.plan === 'starter' && wallets.length >= 3) {
      setAddError('Batas maksimal 3 dompet untuk paket Starter telah tercapai. Upgrade ke paket Pro untuk dompet tanpa batas.');
      return;
    }

    const balance = parseFloat(initBalanceStr.replace(/\D/g, '')) || 0;
    if (!walletName) return;

    db.addWallet({
      user_id: user.id,
      name: walletName,
      type: walletType,
      balance,
      is_default: wallets.length === 0,
      color,
      icon: walletType === 'bank' ? 'building-2' : walletType === 'ewallet' ? 'smartphone' : 'banknote'
    });

    setIsAddModalOpen(false);
    setWalletName('');
    setInitBalanceStr('');
    refreshData();
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    const amount = parseFloat(transferAmountStr.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      setTransferError('Nominal transfer tidak valid.');
      return;
    }

    if (fromWalletId === toWalletId) {
      setTransferError('Dompet asal dan tujuan tidak boleh sama.');
      return;
    }

    const sourceWallet = wallets.find(w => w.id === fromWalletId);
    if (!sourceWallet || sourceWallet.balance < amount) {
      setTransferError('Saldo dompet asal tidak mencukupi.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0];

    db.addTransaction({
      user_id: user.id,
      wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      type: 'transfer',
      amount,
      note: 'Transfer saldo antar dompet',
      date: today,
      time,
      source: 'web'
    });

    setIsTransferModalOpen(false);
    setTransferAmountStr('');
    refreshData();
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kelola Dompet & Rekening
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Atur rekening bank, e-wallet, dan uang tunai. Tentukan 1 dompet default untuk Telegram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>Transfer Antar Dompet</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Dompet</span>
          </button>
        </div>
      </div>

      {/* Total Balance Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-orange-50/20 to-white">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kekayaan Bersih (Net Worth)</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{formatRupiah(totalBalance)}</h2>
          <p className="text-xs text-slate-500 mt-1">Terbagi ke dalam {wallets.length} rekening aktif.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Default Telegram: {wallets.find(w => w.is_default)?.name || 'Belum dipilih'}</span>
          </span>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map(w => (
          <div
            key={w.id}
            className="glass-card rounded-3xl p-5 border border-slate-200 shadow-card flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top color ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: w.color }}></div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                    {w.type === 'bank' ? <Building2 className="w-5 h-5" /> : w.type === 'ewallet' ? <Smartphone className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{w.name}</h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{w.type}</span>
                  </div>
                </div>

                {w.is_default ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Default Bot</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(w.id)}
                    title="Jadikan default untuk transaksi Telegram"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition text-xs font-semibold"
                  >
                    Set Default
                  </button>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold">Saldo Tersedia:</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{formatRupiah(w.balance)}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">ID: {w.id}</span>
              <button
                onClick={() => handleDeleteWallet(w.id)}
                className="text-slate-400 hover:text-rose-600 p-1 transition"
                title="Hapus dompet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Wallet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Tambah Dompet / Rekening Baru</h3>
              <button onClick={() => { setIsAddModalOpen(false); setAddError(''); }} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddWallet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Dompet / Bank</label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Contoh: Mandiri Livin, ShopeePay, Bibit"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Akun</label>
                <select
                  value={walletType}
                  onChange={(e: any) => setWalletType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="bank">Rekening Bank</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="cash">Uang Tunai / Cash</option>
                  <option value="investment">Investasi (Reksadana, Saham)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Saldo Awal (IDR)</label>
                <input
                  type="text"
                  value={initBalanceStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setInitBalanceStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-glow hover:opacity-95"
              >
                Simpan Dompet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Transfer Antar Dompet</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dari Dompet</label>
                  <select
                    value={fromWalletId}
                    onChange={(e) => setFromWalletId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ke Dompet</label>
                  <select
                    value={toWalletId}
                    onChange={(e) => setToWalletId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Transfer (IDR)</label>
                <input
                  type="text"
                  value={transferAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setTransferAmountStr(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                  }}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-glow hover:opacity-95"
              >
                Konfirmasi Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
