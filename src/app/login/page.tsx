'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/mock-db';

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check email
    const user = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (user) {
      db.setCurrentUser(user.id);
      router.push('/dashboard');
    } else {
      // Allow instant dev login
      db.setCurrentUser('usr_tatadana_01');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Masukkan nomor HP yang valid.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setOtpSent(true);
        if (data.demo_otp) {
          setDemoOtpNotice(`Kode OTP simulasi: ${data.demo_otp}`);
        }
      } else {
        setError(data.error || 'Gagal mengirim OTP');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kendala jaringan.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Kode OTP salah.');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kendala jaringan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Kiri (40%) — Branding Panel (Hilang di Mobile) */}
      <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center font-black text-xl text-white shadow-glow">
              T
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Tata<span className="text-[#FF6B00]">Dana</span>
            </span>
          </Link>

          <div className="space-y-4">
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
              FINTECH SAAS INDONESIA
            </span>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Keuanganmu.<br />
              <span className="gradient-orange-text">Terkontrol.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Satu ekosistem terpadu antara pesan Telegram dan web dashboard untuk pencatatan otomatis tanpa repot.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-10 border-t border-slate-800/80">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>100% Data Tersimpan Aman di PostgreSQL Supabase</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Send className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <span>Terhubung Langsung dengan Telegram Bot Anda</span>
          </div>
        </div>
      </div>

      {/* Kanan (60%) — Form Container (Full Screen di Mobile) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Top Brand */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center font-bold text-white text-base">
              T
            </div>
            <span className="font-extrabold text-xl text-slate-900">Tata<span className="text-[#FF6B00]">Dana</span></span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Masuk untuk memantau catatan transaksi dan budget kamu.
            </p>
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => { setMethod('email'); setError(''); }}
              className={`py-2 rounded-xl transition ${method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Email & Password
            </button>
            <button
              onClick={() => { setMethod('phone'); setError(''); }}
              className={`py-2 rounded-xl transition ${method === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Nomor HP (OTP)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
              {error}
            </div>
          )}

          {demoOtpNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
              {demoOtpNotice}
            </div>
          )}

          {/* Form Method: Email */}
          {method === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rizky@tatadana.id"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Password
                  </label>
                  <a href="#" className="text-[11px] text-[#FF6B00] font-bold hover:underline">
                    Lupa password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl gradient-orange-btn text-white font-extrabold text-sm shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Memproses...' : 'Masuk ke Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form Method: Phone OTP */
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Nomor HP (WhatsApp / SMS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="081234567890"
                    disabled={otpSent}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                    >
                      Kirim OTP
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                      Kode Verifikasi OTP (6 Digit)
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Contoh: 123456"
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center font-mono text-lg font-black tracking-widest focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl gradient-orange-btn text-white font-extrabold text-sm shadow-glow flex items-center justify-center gap-2"
                  >
                    <span>Verifikasi & Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative py-2 text-center text-xs text-slate-400">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-[#F8FAFC] px-3 font-medium">atau masuk dengan</span>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={() => {
              db.setCurrentUser('usr_tatadana_01');
              router.push('/dashboard');
            }}
            type="button"
            className="w-full py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Masuk dengan Google</span>
          </button>

          <p className="text-center text-xs text-slate-500 font-medium">
            Belum punya akun TataDana?{' '}
            <Link href="/register" className="text-[#FF6B00] font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
