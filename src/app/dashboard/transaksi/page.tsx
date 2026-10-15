'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { db, Transaction } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatIndoLongDate, formatIndoTime } from '@/lib/utils/date-wib';
import TransactionModal from '@/components/TransactionModal';

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState(db.getWallets());
  const [categories, setCategories] = useState(db.getCategories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const refreshData = () => {
    setTransactions(db.getTransactions());
    setWallets(db.getWallets());
    setCategories(db.getCategories());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan otomatis.')) {
      db.deleteTransaction(id);
      refreshData();
    }
  };

  // Filter logic
  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterWallet !== 'all' && t.wallet_id !== filterWallet) return false;
    if (filterCategory !== 'all' && t.category_id !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchMerchant = (t.receipt_merchant || '').toLowerCase().includes(q);
      const matchItem = t.receipt_items?.some(i => i.item_name.toLowerCase().includes(q));
      if (!matchNote && !matchMerchant && !matchItem) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Catatan Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Kelola seluruh riwayat pemasukan, pengeluaran, dan transfer antar dompet.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white text-xs font-bold shadow-glow hover:opacity-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Transaksi Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, merchant, item struk..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        {/* Filter Type */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">Semua Jenis</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Filter Wallet */}
          <select
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">Semua Dompet</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Filter Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Menampilkan {filtered.length} transaksi</span>
          <span className="text-[11px] font-medium text-slate-400">Diperbarui real-time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Tidak ada transaksi ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const cat = categories.find(c => c.id === tx.category_id);
              const wallet = wallets.find(w => w.id === tx.wallet_id);
              const toWallet = wallets.find(w => w.id === tx.to_wallet_id);
              const isExpanded = expandedTxId === tx.id;

              return (
                <div key={tx.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : tx.type === 'transfer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-[#FF6B00]'
                      }`}>
                        {cat?.emoji || (tx.type === 'transfer' ? '🔁' : '💰')}
                      </div>

                      {/* Title & Metadata */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {tx.is_receipt_parent ? tx.receipt_merchant || 'Struk Belanja' : tx.note || 'Transaksi'}
                          </h4>
                          {tx.is_receipt_parent && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6B00] text-[10px] font-extrabold">
                              Struk AI ({tx.receipt_items?.length || 0} items)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold capitalize">
                            {tx.source.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>{formatIndoLongDate(tx.date)}</span>
                          <span>•</span>
                          <span>{formatIndoTime(tx.time)}</span>
                          <span>•</span>
                          <span>👛 {wallet?.name || 'Dompet'}</span>
                          {tx.type === 'transfer' && toWallet && (
                            <span>➔ {toWallet.name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-sm sm:text-base font-black ${
                          tx.type === 'income' ? 'text-emerald-600' : tx.type === 'transfer' ? 'text-blue-600' : 'text-slate-900'
                        }`}>
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatRupiah(tx.amount)}
                        </span>
                      </div>

                      {/* Expand Button for Struk items */}
                      {tx.is_receipt_parent && tx.receipt_items && tx.receipt_items.length > 0 && (
                        <button
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
                          title="Lihat rincian item struk"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Receipt Items Breakdown */}
                  {isExpanded && tx.receipt_items && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 bg-slate-50/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>🧾 Rincian Item Struk Belanja</span>
                        <span>Total: {formatRupiah(tx.amount)}</span>
                      </div>
                      <div className="divide-y divide-slate-200/60 text-xs">
                        {tx.receipt_items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{item.item_name}</p>
                              <span className="text-[10px] text-slate-500">Kategori: {item.category_name || 'Belanja'}</span>
                            </div>
                            <span className="font-bold text-slate-800">{formatRupiah(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
