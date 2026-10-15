'use client';

import React, { useState } from 'react';
import {
  ScrollText,
  Activity,
  Cpu,
  Clock,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { db, AiLog } from '@/lib/mock-db';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AiLog[]>(db.aiLogs);
  const [providerFilter, setProviderFilter] = useState('all');

  const filtered = logs.filter(l => {
    if (providerFilter !== 'all' && l.provider !== providerFilter) return false;
    return true;
  });

  const totalTokens = logs.reduce((acc, l) => acc + l.tokens_used, 0);
  const avgLatency = Math.round(logs.reduce((acc, l) => acc + l.response_time_ms, 0) / (logs.length || 1));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Log & Telemetri AI Provider</h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Monitoring penggunaan token LLM, latensi respons, failover, dan audit biaya.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Token Terpakai</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalTokens.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Akumulasi semua provider</p>
        </div>

        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Latensi</span>
          <h3 className="text-2xl font-black text-[#FF6B00] mt-1">{avgLatency} ms</h3>
          <p className="text-[10px] text-slate-500 mt-1">Gemini / GPT / DeepSeek</p>
        </div>

        <div className="glass-card bg-white border border-slate-200/90 p-5 rounded-3xl shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Success Rate</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {Math.round((logs.filter(l => l.status === 'success').length / (logs.length || 1)) * 100)}%
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Zero downtime failover</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Riwayat Eksekusi AI</h3>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="all">Semua Provider</option>
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Jenis Operasi</th>
                <th className="py-3 px-4">Tokens Digunakan</th>
                <th className="py-3 px-4">Latensi (ms)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp WIB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 uppercase">{log.provider}</td>
                  <td className="py-3 px-4 text-slate-600">{log.prompt_type}</td>
                  <td className="py-3 px-4 text-slate-600">{log.tokens_used}</td>
                  <td className="py-3 px-4 text-slate-600">{log.response_time_ms} ms</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                    {new Date(log.created_at).toLocaleString('id-ID')}
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
