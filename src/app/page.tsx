'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  FileSpreadsheet,
  Camera,
  Mic,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Bot,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  HelpCircle
} from 'lucide-react';
import TelegramSimulator from '@/components/TelegramSimulator';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('lifetime');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqList = [
    {
      q: 'Apakah saya bisa menggunakan fitur scan foto struk di paket Starter?',
      a: 'Tidak. Fitur scan foto struk menggunakan AI Vision mutakhir dan hanya tersedia di paket Pro. Di paket Starter, kamu tetap bisa mencatat dengan mengetik teks bahasa natural atau mengirim pesan suara (voice note).'
    },
    {
      q: 'Bagaimana keamanan data transaksi saya di TataDana?',
      a: 'Sangat aman. Seluruh data transaksi kamu 100% diproses dan tersimpan di database PostgreSQL Supabase dengan perlindungan Row Level Security (RLS) serta enkripsi end-to-end. Token bot dan API key disimpan terenkripsi dan tidak ada data yang dijual ke pihak ketiga.'
    },
    {
      q: 'Apakah saya perlu menginstal aplikasi tambahan di handphone saya?',
      a: 'Tidak perlu instal aplikasi baru sama sekali! Cukup gunakan aplikasi Telegram yang sudah ada di smartphone atau laptop kamu. Buka chat dengan bot TataDana, lalu ketik pengeluaranmu seperti sedang chatting biasa.'
    },
    {
      q: 'Bagaimana cara bot mengenali nominal uang bahasa Indonesia?',
      a: 'Engine AI TataDana dilatih khusus untuk memahami bahasa sehari-hari masyarakat Indonesia. Format seperti "15rb", "15ribu", "1.5jt", "500k", hingga "250.000" otomatis dikonversi dengan akurat menjadi angka nominal yang valid.'
    },
    {
      q: 'Bagaimana cara kerja AI Financial Advisor di paket Pro?',
      a: 'AI Advisor bekerja di latar belakang secara cerdas. Jika pengeluaran pada satu pos anggaran naik drastis >50%, atau total pengeluaran mendekati 80% dari pemasukan bulanan, bot akan otomatis mengirimkan analisa personal dan saran actionable agar cashflow kamu tidak jebol sebelum akhir bulan.'
    },
    {
      q: 'Apakah ada batasan jumlah transaksi per bulan?',
      a: 'Di paket Starter, terdapat batas 50 transaksi per bulan. Sedangkan di paket Pro (Rp99.000 sekali bayar), kamu mendapatkan akses unlimited transaksi, unlimited dompet, dan unlimited export laporan selamanya.'
    },
    {
      q: 'Bagaimana jika saya ingin mengekspor laporan keuangan ke format Excel atau PDF?',
      a: 'Kamu bisa mengekspor laporan kapan saja langsung dari dashboard web TataDana. Sistem akan men-generate dokumen resmi dengan filter tanggal yang kamu tentukan dan menyimpannya di Supabase Storage dengan signed download URL yang aman.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. NAVBAR (Sticky) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
              T
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                Tata<span className="text-[#FF6B00]">Dana</span>
              </span>
            </div>
          </Link>

          {/* Nav Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-[#FF6B00] transition">Fitur</a>
            <a href="#demo" className="hover:text-[#FF6B00] transition">Demo Interaktif</a>
            <a href="#pricing" className="hover:text-[#FF6B00] transition">Harga</a>
            <a href="#testimoni" className="hover:text-[#FF6B00] transition">Testimoni</a>
            <a href="#faq" className="hover:text-[#FF6B00] transition">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-600 transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-2xl gradient-orange-btn text-xs sm:text-sm font-bold shadow-glow flex items-center gap-2"
            >
              <span>Coba Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-400/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* 2. Pre-headline badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 shadow-sm text-xs sm:text-sm font-bold text-[#FF6B00]">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>✨ Catat keuangan langsung dari Telegram</span>
          </div>

          {/* 3. Headline (H1) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu{' '}
            <span className="gradient-orange-text">ke mana uangmu pergi.</span>
          </h1>

          {/* 4. Sub-headline */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 font-medium leading-relaxed">
            TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
          </p>

          {/* 5. Hero section video placeholder */}
          {/* TODO: ganti dengan video asli demo aplikasi saat tersedia */}
          <div className="mt-8 relative max-w-4xl mx-auto rounded-3xl overflow-hidden glass-card p-3 shadow-2xl border border-slate-200">
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-white overflow-hidden group">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#FF6B00] to-orange-500 flex items-center justify-center shadow-glow transform group-hover:scale-110 transition duration-300">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
              </div>

              <div className="mt-4 text-center z-10 px-4">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 block mb-1">
                  Video Demo Walkthrough 60 Detik
                </span>
                <h3 className="text-base sm:text-xl font-bold">
                  Lihat Bagaimana TataDana Mengubah Catatan Keuangan Jadi Otomatis
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  (Placeholder Video Demo — Klik untuk simulasi interaktif di bawah)
                </p>
              </div>
            </div>
          </div>

          {/* 6. CTA buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-orange-btn text-base font-extrabold shadow-glow flex items-center justify-center gap-2.5"
            >
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 text-base font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Lihat cara kerjanya</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. BULLET POINT MASALAH USER (PROBLEM AWARE) */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full">
              Realita Yang Sering Terjadi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Apakah kamu sering mengalami ini setiap akhir bulan?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold">
                📱
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                "Buka aplikasi keuangan? Nanti dulu deh..."
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Aplikasi keuangan biasa terlalu banyak form, dropdown berbelit-belit, dan bikin malas mencatat saat kamu lagi sibuk belanja atau makan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold">
                💸
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                "Kok uangnya habis ya? Padahal kayak tidak beli apa-apa..."
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jajan kopi Rp25rb, parkir Rp5rb, cemilan mini market Rp30rb yang tidak dicatat, tiba-tiba saldo ATM berkurang jutaan rupiah tanpa jejak.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                🎯
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                "Udah niat bikin budget, tapi seminggu kemudian lupa..."
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bikin rencana keuangan di spreadsheet yang tidak pernah dibuka lagi. Budget tanpa sistem pengingat otomatis sama saja tidak ada budget.
              </p>
            </div>
          </div>

          {/* 8. SOLUSI DARI BULLET POINT */}
          <div className="mt-14 text-center max-w-2xl mx-auto space-y-3">
            <p className="text-base sm:text-lg font-bold text-slate-600">
              Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Introducing <span className="gradient-orange-text">TataDana</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cukup kirim chat singkat atau foto struk di Telegram, AI kami langsung mencatat nominal, mendeteksi kategori, dan menghitung sisa budgetmu secara instan.
            </p>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE DASHBOARD PREVIEW & LIVE TELEGRAM SIMULATOR */}
      <section id="demo" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
            Coba Langsung di Web
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Simulasi Interaktif Telegram Bot TataDana
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Ketik pesan di simulator bawah ini dan lihat format balasan bot yang sesungguhnya!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chat Simulator */}
          <div className="lg:col-span-6 w-full">
            <TelegramSimulator />
          </div>

          {/* Right Side: What You Get in Web App */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card">
              <h3 className="font-black text-lg text-slate-900 mb-2">
                Setiap Chat Otomatis Jadi Laporan Visual
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Saat kamu mengetik <em>"beli bakso 15rb"</em> di Telegram, sistem Supabase TataDana langsung:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Parsing Bahasa Alami dengan LLM AI</strong>
                    <span className="text-slate-500">Mendeteksi jenis pengeluaran, nominal Rp 15.000, dan kategori Makanan & Minuman tanpa regex kaku.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Kalkulasi Saldo & Budget Real-Time</strong>
                    <span className="text-slate-500">Saldo dompet default langsung berkurang dan progress bar budget kategori diupdate otomatis.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Tersimpan di Laporan Siap Download</strong>
                    <span className="text-slate-500">Bisa di-filter, dilihat di chart web dashboard, dan diekspor ke PDF/Excel kapan saja.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Waktu proses rata-rata: &lt; 500ms</span>
                <Link
                  href="/dashboard"
                  className="text-xs font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <span>Buka Dashboard Penuh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FITUR SECTION (3 Alternating Layout) */}
      <section id="fitur" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24">
          {/* Fitur 1: Catat via Telegram (Teks, Foto, Voice Note) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
                Fitur 01
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Catat Transaksi Semudah Kirim Chat WhatsApp atau Telegram
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Tidak ada login berulang kali. Cukup buka Telegram, ketik dengan bahasa santai, kirim foto struk belanjaan, atau kirim voice note singkat sambil nyetir.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Mendukung teks natural: "kopi janjijiwa 25k", "gajian 8jt"</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Scan Foto Struk dengan AI Vision (Khusus Paket Pro)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Input via Voice Note dengan transkrip otomatis ke teks</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-xl bg-gradient-to-br from-slate-50 to-orange-50/20">
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">User Kirim:</span>
                  "beli nasi padang rendang 25rb sama es teh 5rb"
                </div>
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-sm">
                  <span className="text-[10px] text-orange-200 block font-sans">Bot Reply:</span>
                  💸 Pengeluaran tercatat! Rp30.000 (Makanan & Minuman)
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 2: Laporan & Export Otomatis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 glass-card rounded-3xl p-6 border border-slate-200 shadow-xl bg-gradient-to-br from-slate-50 to-emerald-50/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold">
                  <span>Laporan_Keuangan_Oktober_2026.pdf</span>
                  <span className="text-rose-500 flex items-center gap-1"><FileText className="w-4 h-4" /> PDF</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold">
                  <span>Laporan_Keuangan_Oktober_2026.xlsx</span>
                  <span className="text-emerald-600 flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Excel</span>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Signed URL otomatis expire demi menjaga kerahasiaan data finansialmu.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                Fitur 02
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Laporan In-App Lengkap & Export PDF/Excel On-Demand
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Semua data tersimpan rapi 100% di Supabase Postgres TataDana. Akses ringkasan bulanan, filter transaksi per dompet, dan unduh laporan ke format Excel atau PDF siap cetak.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tabel transaksi real-time dengan filter & multi-sort</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transaksi foto struk multi-item bisa di-expand rinciannya</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Riwayat export tersimpan di Supabase Storage aman</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Fitur 3: AI Financial Advisor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-black text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
                Fitur 03 (Khusus Pro)
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                AI Financial Advisor yang Menjagamu dari Kebocoran Halus
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Bukan sekadar buku catatan pasif. Advisor AI secara proaktif menganalisa jika pos pengeluaranmu melonjak &gt;50% dibanding minggu lalu, dan memberikan saran konkret sebelum uangmu habis.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Otomatis mendeteksi anomali pengeluaran besar mendadak</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Alert saat total belanja sudah melampaui 80% pemasukan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>Bebas ribet tanpa perlu ketik prompt rumit</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-orange-200 shadow-xl bg-orange-50/40">
              <div className="p-4 bg-white rounded-2xl border border-orange-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Bot className="w-4 h-4 text-[#FF6B00]" />
                  <span>🤖 AI Financial Advisor</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  "Hei Rizky! Pengeluaran pos Kopi & Makan Luar minggu ini naik 62% dibanding minggu lalu. Kalau ritme ini berlanjut, budget bulananmu akan habis di tanggal 20."
                </p>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-semibold">
                  💡 Saran: Masak di rumah 2-3 hari ke depan untuk hemat ~Rp180.000!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONI (Dummy Placeholder Grid Masonry) */}
      {/* TODO: ganti dengan testimoni asli setelah ada beta user */}
      <section id="testimoni" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
            Pengalaman Pengguna
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Kata Mereka yang Keuangannya Lebih Terkontrol
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            (Placeholder testimoni tahap awal beta tester TataDana)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "Sebelum pakai TataDana, selalu heran kenapa tiap tanggal 20 saldo tinggal ratusan ribu. Sekarang tiap habis beli apa pun langsung chat di Telegram. Praktis banget!"
            </p>
            <div className="pt-2 border-t border-slate-100">
              <h5 className="font-bold text-xs text-slate-900">Dimas Aditya (26)</h5>
              <span className="text-[10px] text-slate-500">Software Engineer, Jakarta</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "Fitur foto struknya juara! Habis belanja bulanan di Superindo, foto struknya langsung di-breakdown per item. Jadi tahu porsi belanja susu vs belanja sabun."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <h5 className="font-bold text-xs text-slate-900">Nadia Safitri (29)</h5>
              <span className="text-[10px] text-slate-500">Product Manager, Bandung</span>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "Sebagai freelancer yang penghasilannya tidak tetap, AI Financial Advisor-nya ngebantu banget ngingetin kalau pengeluaran udah 80% dari cashflow masuk."
            </p>
            <div className="pt-2 border-t border-slate-100">
              <h5 className="font-bold text-xs text-slate-900">Kevin Pratama (24)</h5>
              <span className="text-[10px] text-slate-500">Freelance Graphic Designer, Surabaya</span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. PRICING SECTION (2 Kolom: Starter vs Pro) */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
              Pilihan Paket Langganan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Investasi Kecil untuk Keuangan Terkendali
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Pilih paket yang paling sesuai dengan kebutuhan pencatatan finansialmu.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Langganan Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'lifetime' ? 'bg-[#FF6B00] text-white shadow-glow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Sekali Bayar (Lifetime)</span>
              <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase">Hemat</span>
            </button>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* STARTER */}
            <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-lg text-slate-900">Paket Starter</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-full">
                    Untuk Pemula
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">Rp 49.000</span>
                    <span className="text-xs text-slate-500 font-semibold">/ bulan</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cocok untuk karyawan muda yang ingin mulai rapi mencatat.</p>
                </div>

                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Catat transaksi via teks & VN Telegram</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Maksimal 50 transaksi / bulan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Maksimal 3 dompet & 5 kategori budget</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Laporan ringkasan bulanan di dashboard web</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span className="line-through">Scan foto struk dengan AI OCR</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span className="line-through">Export laporan ke PDF & Excel</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span className="line-through">AI Financial Advisor proaktif</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/register?plan=starter"
                  className="block text-center py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition"
                >
                  Pilih Starter
                </Link>
              </div>
            </div>

            {/* PRO */}
            <div className="glass-card rounded-3xl p-8 border-2 border-[#FF6B00] shadow-glow flex flex-col justify-between relative bg-gradient-to-b from-white to-orange-50/20">
              <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#FF6B00] to-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                Paling Populer & Hemat
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-lg text-slate-900">Paket Pro</h3>
                  <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-100 px-2.5 py-1 rounded-full">
                    👑 Rekomendasi
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#FF6B00]">Rp 99.000</span>
                    <span className="text-xs text-slate-500 font-semibold">Sekali Bayar (Lifetime)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Akses penuh selamanya tanpa biaya langganan bulanan.</p>
                </div>

                <ul className="space-y-3 text-xs text-slate-800 font-medium">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span><strong>Semua fitur Starter</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span><strong>Unlimited transaksi, dompet & kategori</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span><strong>Input via foto struk belanjaan (AI Vision)</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span><strong>Unlimited export laporan ke PDF & Excel (.xlsx)</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span><strong>AI Financial Advisor aktif otomatis</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                    <span>Reminder kustomisasi & prioritas support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-orange-100">
                <Link
                  href="/register?plan=pro"
                  className="block text-center py-3.5 rounded-2xl gradient-orange-btn text-white text-xs font-black shadow-glow"
                >
                  Dapatkan Akses Pro Sekarang
                </Link>
                <p className="text-[10px] text-slate-600 text-center mt-2">
                  Didukung pembayaran otomatis Midtrans (QRIS, GoPay, VA BCA/Mandiri) & transfer manual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FAQ SECTION (Minimal 7 Pertanyaan) */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Sering Ditanyakan Seputar TataDana
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Punya pertanyaan lain? Kami siap menjawabnya.
          </p>
        </div>

        <div className="space-y-3">
          {faqList.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-slate-900 hover:text-orange-600 transition"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-orange-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 14. FINAL CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#FF6B00] via-orange-500 to-[#EA580C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Mulai kendalikan keuanganmu hari ini.
          </h2>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-orange-100 leading-relaxed">
            Bergabunglah sekarang. Catat transaksi semudah chat langsung dari Telegram kamu dan wujudkan kebebasan finansial tanpa pusing.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm shadow-xl hover:bg-slate-100 transition"
            >
              Daftar Gratis Sekarang
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold text-sm transition"
            >
              Buka Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 15. FOOTER (4 Kolom) */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Kolom 1: Logo & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-base">
                T
              </div>
              <span className="font-extrabold text-xl text-white">
                Tata<span className="text-[#FF6B00]">Dana</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Catat keuangan semudah chat — langsung dari Telegram kamu. Fintech SaaS manajemen keuangan pribadi cerdas untuk Indonesia.
            </p>
            <p className="text-[10px] text-slate-600">
              © {new Date().getFullYear()} TataDana. Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>

          {/* Kolom 2: Produk */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Produk</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#fitur" className="hover:text-white transition">Telegram Bot Integration</a></li>
              <li><a href="#fitur" className="hover:text-white transition">Scan Struk AI Vision</a></li>
              <li><a href="#fitur" className="hover:text-white transition">Voice Note STT</a></li>
              <li><a href="#fitur" className="hover:text-white transition">AI Financial Advisor</a></li>
              <li><Link href="/dashboard/laporan" className="hover:text-white transition">Laporan & Export PDF/Excel</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Perusahaan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Perusahaan</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#" className="hover:text-white transition">Tentang TataDana</a></li>
              <li><a href="#" className="hover:text-white transition">Karir</a></li>
              <li><a href="#" className="hover:text-white transition">Blog Finansial</a></li>
              <li><a href="#" className="hover:text-white transition">Program Afiliasi</a></li>
            </ul>
          </div>

          {/* Kolom 4: Legal & Kontak */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Legal & Kontak</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/privacy" className="hover:text-white transition">Kebijakan Privasi (/privacy)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Syarat & Ketentuan (/terms)</Link></li>
              <li><a href="mailto:support@tatadana.id" className="hover:text-white transition">Kontak (support@tatadana.id)</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
