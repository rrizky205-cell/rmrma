'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  FileBarChart2,
  PieChart,
  Wallet as WalletIcon,
  Settings,
  ShieldAlert,
  Send,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  BellRing
} from 'lucide-react';
import { db, Profile } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile>(db.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    setUser(db.getCurrentUser());
  }, [pathname]);

  const navItems = [
    { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', href: '/dashboard/transaksi', icon: Receipt },
    { name: 'Laporan', href: '/dashboard/laporan', icon: FileBarChart2 },
    { name: 'Budget', href: '/dashboard/budget', icon: PieChart },
    { name: 'Dompet / Wallet', href: '/dashboard/wallet', icon: WalletIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    router.push('/login');
  };

  const isImpersonating = user.id !== 'usr_tatadana_01';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Impersonation Warning Banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-slate-900 px-4 py-2 z-50 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>Mode Impersonasi Admin: Sedang melihat akun <strong>{user.full_name} ({user.email})</strong></span>
          </div>
          <button
            onClick={() => {
              db.setCurrentUser('usr_tatadana_01');
              router.push('/admin/users');
            }}
            className="bg-slate-900 text-white px-3 py-1 rounded text-xs hover:bg-slate-800 transition"
          >
            Kembali ke Admin
          </button>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className={`md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 ${isImpersonating ? 'mt-8' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            T
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">Tata<span className="text-[#FF6B00]">Dana</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isImpersonating ? 'md:pt-8' : ''}
      `}>
        {/* Top: Logo & Nav items */}
        <div className="p-5">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
              T
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Tata<span className="text-[#FF6B00]">Dana</span></span>
              <p className="text-[10px] text-slate-600 font-medium tracking-wide">FINTECH & TELEGRAM BOT</p>
            </div>
          </Link>

          {/* Quick Telegram Bot Status */}
          <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.telegram_connected_at || user.telegram_chat_id ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-600 font-medium">Telegram Bot</span>
            </div>
            <span className="font-semibold text-slate-700">
              {user.telegram_connected_at || user.telegram_chat_id ? '🟢 Aktif' : '🔴 Belum Konek'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? 'bg-orange-50 text-[#FF6B00] shadow-sm border border-orange-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF6B00]' : 'text-slate-600'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Plan Badge, User Profile & Impersonation / Admin */}
        <div className="p-5 border-t border-slate-200/80 space-y-4">
          {/* Subscription Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/40 border border-slate-200/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Paket Kamu</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.plan === 'pro' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700'}`}>
                {user.plan === 'pro' ? '👑 PRO LIFETIME' : 'STARTER'}
              </span>
            </div>
            {user.plan === 'starter' && (
              <div>
                <p className="text-[11px] text-slate-600 mb-2">Buka fitur foto struk, OCR & unlimited export.</p>
                <Link
                  href="/#pricing"
                  className="block text-center py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#EA580C] transition shadow-sm"
                >
                  Upgrade ke Pro (Rp99rb)
                </Link>
              </div>
            )}
          </div>



          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 ${isImpersonating ? 'md:pt-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}
