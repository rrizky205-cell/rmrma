'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Download,
  ShieldCheck,
  UserCheck,
  Send,
  Eye,
  ExternalLink,
  Search
} from 'lucide-react';
import { db, Profile } from '@/lib/mock-db';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>(db.profiles);
  const [search, setSearch] = useState('');

  const handleImpersonate = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      }
    } catch {
      alert('Gagal melakukan impersonasi.');
    }
  };

  const handleExportUsers = () => {
    const csvRows = [
      ['ID', 'Nama', 'Email', 'No HP', 'Plan', 'Role', 'Telegram Chat ID', 'Created At'].join(',')
    ];
    users.forEach(u => {
      csvRows.push([
        u.id,
        `"${u.full_name}"`,
        u.email,
        u.phone_number,
        u.plan,
        u.role,
        u.telegram_chat_id || 'unlinked',
        u.created_at
      ].join(','));
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TataDana_Users_Export_${Date.now()}.csv`;
    a.click();
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone_number.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Daftar user aktif, paket langganan, status bot Telegram, dan aksi impersonasi.
          </p>
        </div>

        <button
          onClick={handleExportUsers}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 border border-slate-200 shadow-sm"
        >
          <Download className="w-4 h-4 text-[#FF6B00]" />
          <span>Export Data Users (.CSV)</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card bg-white border border-slate-200/90 p-4 rounded-3xl flex items-center justify-between shadow-card">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, nomor HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF6B00]"
          />
        </div>
        <span className="text-xs text-slate-600 font-bold">Total: {filtered.length} user</span>
      </div>

      {/* Users Table */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Kontak & HP</th>
                <th className="py-3.5 px-4">Paket & Role</th>
                <th className="py-3.5 px-4">Status Telegram</th>
                <th className="py-3.5 px-4 text-right">Aksi Impersonasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{u.phone_number}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Terverifikasi OTP</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.plan === 'pro'
                          ? 'bg-orange-100 text-[#FF6B00] border border-orange-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.plan}
                      </span>
                      {u.role === 'superadmin' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 font-black uppercase">
                          SUPERADMIN
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.telegram_chat_id ? (
                      <div>
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          🟢 Terhubung
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {u.telegram_chat_id}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold text-[11px]">🔴 Belum Tautkan</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleImpersonate(u.id)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF6B00] font-bold text-xs transition inline-flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Masuk sebagai User</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
