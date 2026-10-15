'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Laptop,
  Store,
  ArrowRight,
  Send,
  Loader2
} from 'lucide-react';
import { db } from '@/lib/mock-db';

export default function OnboardingPage() {
  const router = useRouter();
  const user = db.getCurrentUser();

  const [occupation, setOccupation] = useState('karyawan');
  const [lifestyle, setLifestyle] = useState('sering_ngopi');
  const [loading, setLoading] = useState(false);
  const [recommendedCats, setRecommendedCats] = useState<any[]>([]);

  const handleGenerateCategories = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/recommend-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation,
          lifestyleNotes: lifestyle,
          userId: user.id
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.recommendations) {
        setRecommendedCats(data.recommendations);
      }
    } catch {
      setLoading(false);
      // Fallback
      router.push('/dashboard');
    }
  };

  const handleFinishOnboarding = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personalisasi AI TataDana
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Halo {user.full_name}! Ceritakan sedikit tentang aktivitasmu agar AI menyiapkan kategori anggaran yang pas.
          </p>
        </div>

        {recommendedCats.length === 0 ? (
          <form onSubmit={handleGenerateCategories} className="space-y-6 text-xs">
            {/* Profil Pekerjaan */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Apa Profesi atau Status Kamu Saat Ini?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'karyawan', label: 'Karyawan Swasta / BUMN', icon: Briefcase },
                  { id: 'mahasiswa', label: 'Mahasiswa / Pelajar', icon: GraduationCap },
                  { id: 'freelance', label: 'Freelancer / Remote Worker', icon: Laptop },
                  { id: 'pengusaha', label: 'Wirausaha / Bisnis', icon: Store }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOccupation(item.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                        occupation === item.id
                          ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gaya Hidup / Pos Prioritas */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                Fokus Pengeluaran Harian Kamu:
              </label>
              <select
                value={lifestyle}
                onChange={(e) => setLifestyle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs text-slate-800 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="sering_ngopi">Sering jajan kopi, kuliner, dan pesan ojek online</option>
                <option value="kost_tagihan">Banyak tagihan rutin (kost, listrik, internet, cicilan)</option>
                <option value="belanja_keluarga">Belanja harian supermarket dan kebutuhan dapur</option>
                <option value="digital_tools">Langganan software, gadget, dan tools kerja digital</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl gradient-orange-btn text-white font-extrabold text-sm shadow-glow flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'AI Sedang Menganalisa...' : 'Buat Rekomendasi Kategori Otomatis'}</span>
            </button>
          </form>
        ) : (
          /* Rekomendasi AI Siap */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Rekomendasi Kategori Berhasil Dibuat!</span>
              </div>
              <p className="text-emerald-700 text-[11px]">
                Berikut set kategori khusus yang telah disesuaikan dengan profil kamu. Kamu tetap bisa menambah atau mengubahnya nanti di menu Settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {recommendedCats.map((cat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <h5 className="font-bold text-slate-900">{cat.name}</h5>
                    <span className="text-[10px] text-slate-400 capitalize">{cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3.5 rounded-2xl gradient-orange-btn text-white font-extrabold text-sm shadow-glow flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Dashboard & Mulai Catat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
