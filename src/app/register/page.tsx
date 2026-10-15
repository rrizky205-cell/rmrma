'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Smartphone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/mock-db';

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [demoOtpNotice, setDemoOtpNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Masukkan nomor HP yang aktif untuk menerima OTP.');
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

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
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
        setOtpVerified(true);
        setDemoOtpNotice('');
      } else {
        setError(data.error || 'Kode OTP tidak cocok.');
      }
    } catch {
      setLoading(false);
      setError('Terjadi kendala jaringan.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      setError('Nomor HP wajib diverifikasi via OTP terlebih dahulu untuk tautan Telegram.');
      return;
    }

    setLoading(true);

    const newUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const linkCode = 'TATA' + Math.floor(10 + Math.random() * 89);

    // Create user in system
    const newUser = {
      id: newUserId,
      email,
      full_name: fullName,
      phone_number: phoneNumber,
      phone_verified: true,
      plan: 'starter' as const,
      currency: 'IDR',
      role: 'user' as const,
      telegram_chat_id: null,
      telegram_link_code: linkCode,
      reminder_enabled: true,
      reminder_frequency: 1 as const,
      reminder_time_1: '19:00:00',
      reminder_time_2: '21:00:00',
      created_at: new Date().toISOString()
    };

    db.profiles.push(newUser);
    db.setCurrentUser(newUserId);

    // Auto setup default wallets
    db.addWallet({
      user_id: newUserId,
      name: 'Bank BCA',
      type: 'bank',
      balance: 0,
      is_default: true,
      color: '#005EB8',
      icon: 'building-2'
    });
    db.addWallet({
      user_id: newUserId,
      name: 'Dompet Tunai',
      type: 'cash',
      balance: 0,
      is_default: false,
      color: '#10B981',
      icon: 'banknote'
    });

    setLoading(false);
    // Redirect to AI category onboarding
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Kiri (40%) — Branding Panel */}
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
              REGISTRASI AKUN BARU
            </span>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Keuanganmu.<br />
              <span className="gradient-orange-text">Terkontrol.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Mulai kendalikan pengeluaranmu dari sekarang. Verifikasi nomor HP dan langsung sambungkan ke bot Telegram.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-10 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Gratis 50 transaksi bulanan tanpa kartu kredit</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Rekomendasi kategori pintar otomatis dari AI</span>
          </div>
        </div>
      </div>

      {/* Kanan (60%) — Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Akun TataDana
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Catat keuangan semudah chat di Telegram. Nomor HP diperlukan untuk validasi bot.
            </p>
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

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            {/* Nama Lengkap */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rizky Pratama"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rizky@gmail.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>

            {/* Nomor HP dengan verifikasi OTP wajib */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Nomor HP (WhatsApp) — Wajib Diverifikasi OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="081234567890"
                  disabled={otpVerified}
                  required
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                />
                {!otpVerified && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                  >
                    Kirim OTP
                  </button>
                )}
                {otpVerified && (
                  <span className="px-3.5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Terverifikasi</span>
                  </span>
                )}
              </div>
            </div>

            {/* OTP Input Field jika sudah dikirim dan belum verified */}
            {otpSent && !otpVerified && (
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                <label className="block font-bold text-slate-800 text-[11px]">
                  Masukkan Kode OTP 6-Digit:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700"
                  >
                    Verifikasi
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Buat Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="w-full py-3.5 rounded-2xl gradient-orange-btn text-white font-extrabold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Mendaftarkan...' : 'Daftar & Setup Onboarding AI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#FF6B00] font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
