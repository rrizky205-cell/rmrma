'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { db, PaymentTransaction } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(db.getPayments());
  const [actionNotice, setActionNotice] = useState<string>('');

  const handleAction = async (orderId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/payments/manual-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, adminNotes: `Diproses manual oleh admin (${action})` })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setPayments([...db.getPayments()]);
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch {
      alert('Gagal memproses pembayaran.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Pembayaran & Approval</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Verifikasi transaksi Midtrans otomatis serta bukti transfer manual untuk aktivasi paket Pro/Starter.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Payments Table */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & User</th>
                <th className="py-3.5 px-4">Paket Dipilih</th>
                <th className="py-3.5 px-4">Nominal & Metode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Bukti Transfer</th>
                <th className="py-3.5 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-slate-900 text-[11px]">{p.order_id}</p>
                    <p className="text-[11px] text-slate-500">{p.user_name}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full font-black text-[10px] uppercase bg-orange-100 text-[#FF6B00] border border-orange-200">
                      {p.plan_selected}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-black text-slate-900">{formatRupiah(p.amount)}</p>
                    <span className="text-[10px] text-slate-500 uppercase">{p.payment_method}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      p.status === 'settlement'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.proof_image_url ? (
                      <a
                        href={p.proof_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>Lihat Bukti Foto</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Otomatis (Payment Gateway)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(p.order_id, 'approve')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(p.order_id, 'reject')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Selesai</span>
                    )}
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
