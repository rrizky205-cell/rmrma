'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileBarChart2,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { db, Transaction, ExportRecord, Profile } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatIndoLongDate, formatIndoShortDate } from '@/lib/utils/date-wib';

export default function LaporanPage() {
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [wallets, setWallets] = useState(db.getWallets());
  const [categories, setCategories] = useState(db.getCategories());

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');

  // Sorting (tanggal, nominal, kategori, wallet)
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category' | 'wallet'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Struk Accordion
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Export State
  const [exportLoading, setExportLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const refreshData = () => {
    setUser(db.getCurrentUser());
    setTransactions(db.getTransactions());
    setExports(db.getExports());
    setWallets(db.getWallets());
    setCategories(db.getCategories());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered dataset
  const filteredTxs = transactions.filter(t => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;
    if (selectedWallet !== 'all' && t.wallet_id !== selectedWallet) return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchMerchant = (t.receipt_merchant || '').toLowerCase().includes(q);
      if (!matchNote && !matchMerchant) return false;
    }
    return true;
  });

  // Sorted
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    if (sortField === 'date') {
      const timeA = new Date(`${a.date}T${a.time}`).getTime();
      const timeB = new Date(`${b.date}T${b.time}`).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    } else if (sortField === 'amount') {
      return sortAsc ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortField === 'category') {
      const catA = categories.find(c => c.id === a.category_id)?.name || '';
      const catB = categories.find(c => c.id === b.category_id)?.name || '';
      return sortAsc ? catA.localeCompare(catB) : catB.localeCompare(catA);
    } else if (sortField === 'wallet') {
      const walA = wallets.find(w => w.id === a.wallet_id)?.name || '';
      const walB = wallets.find(w => w.id === b.wallet_id)?.name || '';
      return sortAsc ? walA.localeCompare(walB) : walB.localeCompare(walA);
    }
    return 0;
  });

  // Pagination Slice
  const totalPages = Math.ceil(sortedTxs.length / pageSize) || 1;
  const paginatedTxs = sortedTxs.slice((page - 1) * pageSize, page * pageSize);

  // Summaries
  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;

  // Top 5 categories
  const catMap = new Map<string, number>();
  filteredTxs.filter(t => t.type === 'expense').forEach(t => {
    const c = categories.find(item => item.id === t.category_id);
    const name = c ? `${c.emoji} ${c.name}` : 'Lain-lain';
    catMap.set(name, (catMap.get(name) || 0) + t.amount);
  });
  const topCategories = Array.from(catMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const triggerExport = async (format: 'pdf' | 'xlsx') => {
    if (user.plan !== 'pro') {
      setShowUpgradeModal(true);
      return;
    }

    setExportLoading(true);
    try {
      const endpoint = format === 'pdf' ? '/api/export/pdf' : '/api/export/excel';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodLabel: `${startDate} s.d. ${endDate}`,
          filterCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
          filterWallet: selectedWallet !== 'all' ? selectedWallet : undefined,
          startDate,
          endDate
        })
      });

      const data = await res.json();
      setExportLoading(false);

      if (data.download_url) {
        // Trigger browser download
        window.open(data.download_url, '_blank');
        refreshData();
      } else if (data.file_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.file_base64}`;
        link.download = data.file_name;
        link.click();
        refreshData();
      }
    } catch {
      setExportLoading(false);
      alert('Gagal mendownload export.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Laporan Keuangan</span>
            <span className="text-xs bg-orange-100 text-[#FF6B00] font-bold px-2 py-0.5 rounded-full">
              Real-Time
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Analisis arus kas mendalam, filter multi-dimensi, dan export on-demand ke PDF & Excel.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerExport('pdf')}
            disabled={exportLoading}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 shadow-sm transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Export PDF</span>
            {user.plan !== 'pro' && <Lock className="w-3 h-3 text-slate-400" />}
          </button>

          <button
            onClick={() => triggerExport('xlsx')}
            disabled={exportLoading}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
            {user.plan !== 'pro' && <Lock className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">+{formatRupiah(totalIncome)}</p>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
          <p className="text-2xl font-black text-rose-600 mt-1">-{formatRupiah(totalExpense)}</p>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cashflow</span>
          <p className={`text-2xl font-black mt-1 ${netCashflow >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatRupiah(netCashflow)}
          </p>
        </div>
      </div>

      {/* Top 5 Categories & Filter Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Categories */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">Top 5 Kategori Pengeluaran</h3>
          {topCategories.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Belum ada pengeluaran pada rentang tanggal ini.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((c, i) => (
                <div key={i} className="text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">{c.name}</span>
                    <span className="font-extrabold text-slate-900">{formatRupiah(c.amount)} ({c.pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: `${c.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls (Takes 2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-orange-500" />
              <span>Filter & Parameter Laporan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* Date Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mulai Dari</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Wallet */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Dompet</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">Semua Dompet</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Jenis */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Jenis Transaksi</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick search input */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan catatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Hasil: {sortedTxs.length} transaksi
            </span>
          </div>
        </div>
      </div>

      {/* Main Table with Sortable Columns */}
      <div className="glass-card rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else { setSortField('date'); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal & Waktu</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Deskripsi / Catatan</th>
                <th
                  onClick={() => {
                    if (sortField === 'category') setSortAsc(!sortAsc);
                    else { setSortField('category'); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Kategori</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'wallet') setSortAsc(!sortAsc);
                    else { setSortField('wallet'); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Dompet</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else { setSortField('amount'); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Nominal (IDR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Tidak ada transaksi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedTxs.map(tx => {
                  const cat = categories.find(c => c.id === tx.category_id);
                  const wallet = wallets.find(w => w.id === tx.wallet_id);
                  const isExpanded = expandedTxId === tx.id;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {formatIndoShortDate(tx.date)}
                          <span className="block text-[10px] text-slate-400 font-normal">{tx.time}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {tx.is_receipt_parent ? `🧾 ${tx.receipt_merchant || 'Struk Belanja'}` : (tx.note || 'Transaksi')}
                            </span>
                            {tx.is_receipt_parent && (
                              <button
                                onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                                className="text-[10px] bg-orange-100 text-[#FF6B00] font-bold px-2 py-0.5 rounded-full hover:bg-orange-200 transition"
                              >
                                {isExpanded ? 'Tutup Rincian' : `Lihat ${tx.receipt_items?.length || 0} item`}
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">via {tx.source.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {cat ? `${cat.emoji} ${cat.name}` : (tx.type === 'transfer' ? '🔁 Transfer' : '-')}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          👛 {wallet?.name || 'Dompet'}
                        </td>
                        <td className="py-3 px-4 text-right font-black">
                          <span className={tx.type === 'income' ? 'text-emerald-600' : tx.type === 'transfer' ? 'text-blue-600' : 'text-slate-900'}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatRupiah(tx.amount)}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable items row */}
                      {isExpanded && tx.receipt_items && (
                        <tr className="bg-orange-50/30">
                          <td colSpan={5} className="p-4">
                            <div className="bg-white rounded-2xl p-4 border border-orange-200/80 shadow-sm space-y-2">
                              <p className="font-bold text-xs text-slate-900">
                                🧾 Breakdown Item Struk dari Foto: {tx.receipt_merchant}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {tx.receipt_items.map((it, idx) => (
                                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-slate-800">{it.item_name}</p>
                                      <span className="text-[10px] text-slate-500">Qty: {it.quantity} • {it.category_name}</span>
                                    </div>
                                    <span className="font-extrabold text-slate-900">{formatRupiah(it.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Export Tersimpan (Bisa didownload ulang) */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card">
        <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <span>Riwayat Export Laporan (Tersimpan di Supabase Storage)</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {exports.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">Belum ada riwayat file export.</p>
          ) : (
            exports.map(exp => (
              <div key={exp.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${exp.format === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {exp.format === 'pdf' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{exp.file_name}</h5>
                    <p className="text-[10px] text-slate-400">
                      Periode: {exp.period_label} • {(exp.file_size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <a
                  href={exp.file_url}
                  download={exp.file_name}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ulang</span>
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade Pro Modal if Starter user tries to export */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-lg text-slate-900">Fitur Eksklusif TataDana Pro</h3>
              <p className="text-xs text-slate-600 mt-1">
                Export laporan ke format PDF dan Excel (.xlsx) dengan signed URL hanya tersedia untuk pengguna paket Pro.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Paket Pro — Rp99.000 Sekali Bayar</span>
              </div>
              <ul className="text-slate-600 space-y-1 text-[11px] list-disc list-inside">
                <li>Unlimited export ke PDF dan Excel</li>
                <li>Pindai foto struk otomatis via AI Vision</li>
                <li>AI Financial Advisor aktif</li>
                <li>Unlimited kuota transaksi per bulan</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Nanti Saja
              </button>
              <Link
                href="/#pricing"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white text-xs font-bold text-center shadow-glow hover:opacity-95"
              >
                Upgrade Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
