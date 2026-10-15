'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Cpu,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function AdminOverviewPage() {
  const users = db.profiles;
  const payments = db.payments;
  const aiLogs = db.aiLogs;
  const configs = db.aiConfigs;

  const totalRevenue = payments.filter(p => p.status === 'settlement').reduce((acc, p) => acc + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Superadmin Dashboard</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Pantau status ekosistem TataDana: Pengguna, Multi-AI Failover, Pembayaran Midtrans, dan Keamanan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length}</h3>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{users.filter(u => u.plan === 'pro').length} Pro Lifetime</p>
        </div>

        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatRupiah(totalRevenue)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Midtrans & Manual Transfer</p>
        </div>

        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pembayaran Pending</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingPayments}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Menunggu approval manual</p>
        </div>

        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Multi-Provider Status</span>
          <h3 className="text-2xl font-black text-[#FF6B00] mt-1">{configs.filter(c => c.is_active).length} Aktif</h3>
          <p className="text-[10px] text-slate-500 mt-1">Mode: {db.aiMode === 'parallel' ? 'Failover Paralel' : 'Single'}</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/ai-providers"
          className="glass-card bg-white hover:border-orange-300 border border-slate-200/90 p-5 rounded-3xl shadow-card transition group"
        >
          <Cpu className="w-6 h-6 text-[#FF6B00] mb-3" />
          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#FF6B00] transition">
            Konfigurasi AI Provider
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Atur Gemini, OpenAI, DeepSeek, model yang dipakai, dan mode failover.
          </p>
          <span className="text-xs text-[#FF6B00] font-bold mt-3 inline-flex items-center gap-1">
            Buka Konfigurasi <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="glass-card bg-white hover:border-blue-300 border border-slate-200/90 p-5 rounded-3xl shadow-card transition group"
        >
          <Users className="w-6 h-6 text-blue-500 mb-3" />
          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
            Kelola Pengguna & Impersonasi
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Lihat daftar user, status bot Telegram, dan masuk ke mode impersonasi tanpa re-login.
          </p>
          <span className="text-xs text-blue-600 font-bold mt-3 inline-flex items-center gap-1">
            Kelola Users <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/payments"
          className="glass-card bg-white hover:border-emerald-300 border border-slate-200/90 p-5 rounded-3xl shadow-card transition group"
        >
          <CreditCard className="w-6 h-6 text-emerald-500 mb-3" />
          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600 transition">
            Approval Pembayaran Manual
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Periksa bukti transfer dan setujui upgrade paket user secara instan.
          </p>
          <span className="text-xs text-emerald-600 font-bold mt-3 inline-flex items-center gap-1">
            Lihat Pembayaran <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent AI Invocation Logs */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-sm text-slate-900">Log Panggilan AI Terbaru (Real-Time)</h3>
          <Link href="/admin/logs" className="text-xs font-bold text-[#FF6B00] hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {aiLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <div>
                  <span className="font-bold text-slate-900 uppercase">{log.provider}</span>
                  <span className="text-slate-500 ml-2 font-mono">{log.prompt_type}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
                <span>{log.tokens_used} tokens</span>
                <span>{log.response_time_ms} ms</span>
                <span className="text-emerald-600 font-bold uppercase">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
