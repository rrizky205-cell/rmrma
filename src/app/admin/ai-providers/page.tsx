'use client';

import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Key,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { db, AiProviderConfig } from '@/lib/mock-db';

export default function AdminAiProvidersPage() {
  const [configs, setConfigs] = useState<AiProviderConfig[]>(db.getAiConfigs());
  const [aiMode, setAiMode] = useState<'single' | 'parallel'>(db.aiMode);
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleProviderActive = (id: string) => {
    const item = configs.find(c => c.id === id);
    if (item) {
      db.updateAiConfig(id, { is_active: !item.is_active });
      setConfigs([...db.getAiConfigs()]);
    }
  };

  const handleModeChange = (mode: 'single' | 'parallel') => {
    setAiMode(mode);
    db.aiMode = mode;
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Multi-Provider AI</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Konfigurasi Gemini, OpenAI, dan DeepSeek. Atur prioritas failover dan kelola token API terenkripsi.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan mode operasi AI berhasil diperbarui!</span>
        </div>
      )}

      {/* Mode Switcher: Single vs Parallel (Failover) */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card">
        <h3 className="font-extrabold text-sm text-slate-900 mb-1">Mode Operasi AI</h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Pilih bagaimana sistem memanggil LLM untuk parsing chat Telegram, OCR struk belanja, dan transkripsi VN.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleModeChange('parallel')}
            className={`p-4 rounded-2xl border text-left transition ${
              aiMode === 'parallel'
                ? 'border-[#FF6B00] bg-orange-50/70 text-slate-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">Mode Paralel (Failover Otomatis)</span>
              {aiMode === 'parallel' && <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jika provider utama mengalami rate limit atau timeout, request otomatis dialihkan ke provider berikutnya (Gemini ➔ GPT-4o ➔ DeepSeek).
            </p>
          </button>

          <button
            onClick={() => handleModeChange('single')}
            className={`p-4 rounded-2xl border text-left transition ${
              aiMode === 'single'
                ? 'border-[#FF6B00] bg-orange-50/70 text-slate-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">Mode Tunggal (Single Provider)</span>
              {aiMode === 'single' && <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hanya menggunakan 1 provider utama terpilih untuk menjaga konsistensi biaya token API.
            </p>
          </button>
        </div>
      </div>

      {/* List Provider Configurations */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-card">
        <h3 className="font-extrabold text-sm text-slate-900">Daftar Provider Terkonfigurasi</h3>

        <div className="divide-y divide-slate-100">
          {configs.map((c) => (
            <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center font-black text-[#FF6B00] text-sm shadow-sm">
                  {c.priority_order}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900 uppercase">{c.provider_name}</h4>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-mono font-bold">
                      {c.model_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>Token Terenkripsi: {c.api_key_masked}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleProviderActive(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    c.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  <span>{c.is_active ? 'Aktif' : 'Nonaktif'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
