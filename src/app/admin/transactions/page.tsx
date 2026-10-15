'use client';

import React, { useState } from 'react';
import {
  Eye,
  ShieldAlert,
  Search,
  Lock,
  FileCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { db, Transaction, Profile, AdminAuditLog } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function AdminTransactionsInspectorPage() {
  const users = db.profiles;
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [auditReason, setAuditReason] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unlockedUserTxs, setUnlockedUserTxs] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(db.auditLogs);

  const handleUnlockTransactions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !auditReason.trim()) return;

    const targetUser = users.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    // Strict privacy audit log
    db.logAdminAction(
      'superadmin@tatadana.id',
      selectedUserId,
      'VIEW_USER_TRANSACTIONS',
      { reason: auditReason, targetEmail: targetUser.email, targetName: targetUser.full_name }
    );

    setUnlockedUserTxs(db.getTransactions(selectedUserId));
    setIsUnlocked(true);
    setAuditLogs([...db.auditLogs]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inspeksi Transaksi Pengguna</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Akses transaksi pengguna untuk keperluan customer support & troubleshooting dengan pencatatan audit log ketat.
        </p>
      </div>

      {/* Audit Log Authorization Card */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Prosedur Privasi & Akses Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Setiap kali admin membuka data transaksi pengguna, sistem secara permanen mencatat identitas admin, alasan akses, alamat IP, dan timestamp ke dalam <code>admin_audit_logs</code>.
            </p>
          </div>
        </div>

        <form onSubmit={handleUnlockTransactions} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Pengguna</label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setIsUnlocked(false);
              }}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">-- Pilih User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan Akses / No. Tiket Support</label>
            <input
              type="text"
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              placeholder="Contoh: Tiket #304 - Troubleshooting saldo"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white font-bold text-xs shadow-glow hover:opacity-95 transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Otorisasi & Buka Data</span>
            </button>
          </div>
        </form>
      </div>

      {/* Unlocked Transactions View */}
      {isUnlocked && (
        <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-card animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Data Transaksi Pengguna: {users.find(u => u.id === selectedUserId)?.full_name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Akses terotorisasi dengan alasan: "{auditReason}"
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Audit Log Dicatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Jenis</th>
                  <th className="py-2.5 px-3">Nominal</th>
                  <th className="py-2.5 px-3">Catatan / Detail</th>
                  <th className="py-2.5 px-3">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unlockedUserTxs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Pengguna ini belum memiliki riwayat transaksi.
                    </td>
                  </tr>
                ) : (
                  unlockedUserTxs.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">{t.date} {t.time?.slice(0, 5)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(t.amount)}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {t.note}
                        {t.receipt_items && t.receipt_items.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {t.receipt_items.map(i => `${i.item_name} (Rp${i.price.toLocaleString('id-ID')})`).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500">{t.source}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Audit History Table */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-card">
        <h3 className="font-extrabold text-sm text-slate-900">Riwayat Audit Akses Transaksi (Permanen)</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.map(log => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.admin_email}</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-600">
                    {log.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Target: <strong>{log.target_user_id}</strong> • Alasan: "{log.details?.reason || 'Tidak ada alasan'}"
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-mono">
                {new Date(log.created_at).toLocaleString('id-ID')} WIB
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
