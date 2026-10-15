'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Cpu,
  CreditCard,
  ScrollText,
  Eye,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { db } from '@/lib/mock-db';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = db.getCurrentUser();

  const navItems = [
    { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Kelola AI Providers', href: '/admin/ai-providers', icon: Cpu },
    { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
    { name: 'Inspeksi Transaksi', href: '/admin/transactions', icon: Eye },
    { name: 'Pembayaran & Midtrans', href: '/admin/payments', icon: CreditCard },
    { name: 'Log & Monitoring AI', href: '/admin/logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 p-5 flex flex-col justify-between shadow-sm">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6 px-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center font-black text-white text-base shadow-glow">
              T
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>Tata<span className="text-[#FF6B00]">Dana</span></span>
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full border border-orange-200 uppercase font-black">
                  ADMIN
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Superadmin Control Center</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition
                    ${isActive
                      ? 'bg-orange-50 text-[#FF6B00] border border-orange-200/80 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to User Dashboard */}
        <div className="pt-6 border-t border-slate-200/80 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke App User</span>
          </Link>
          <div className="text-[10px] text-slate-400 text-center">
            Logged in as {currentUser.email}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
