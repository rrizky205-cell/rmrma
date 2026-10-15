'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Bot, Sparkles, Check, CheckCheck, RefreshCw } from 'lucide-react';
import { db } from '@/lib/mock-db';

export default function TelegramSimulator({ onNewTransaction }: { onNewTransaction?: () => void }) {
  const user = db.getCurrentUser();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; type?: 'text' | 'photo' | 'voice' }>>([
    {
      sender: 'bot',
      text: `👋 Halo ${user.full_name}!\nTataDana Bot siap mencatat keuanganmu.\n\nCoba ketik transaksi:\n• "beli bakso 15rb"\n• "gajian 8jt"\n• Atau ketik /saldo /hari ini /budget`,
      time: '12:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendToWebhook = async (messagePayload: any, previewText: string, type: 'text' | 'photo' | 'voice' = 'text') => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Add user message to state
    setMessages(prev => [...prev, {
      sender: 'user',
      text: previewText,
      time: timeNow,
      type
    }]);

    setIsTyping(true);

    try {
      const updateId = Math.floor(100000000 + Math.random() * 900000000);
      const res = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: updateId,
          message: {
            message_id: Math.floor(Math.random() * 10000),
            from: { id: user.telegram_chat_id || 987654321, first_name: user.full_name, username: user.telegram_username?.replace('@', '') || 'user' },
            chat: { id: user.telegram_chat_id || 987654321, type: 'private' },
            date: Math.floor(Date.now() / 1000),
            ...messagePayload
          }
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.reply) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }]);
      }

      if (onNewTransaction) {
        onNewTransaction();
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '⚠️ Maaf, koneksi ke webhook gagal. Pastikan server lokal berjalan.',
        time: timeNow
      }]);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    sendToWebhook({ text }, text, 'text');
  };

  const handleSendPhotoDemo = () => {
    sendToWebhook(
      {
        caption: 'Foto Struk Superindo Tebet',
        photo: [{ file_id: 'sample_photo_id', width: 800, height: 1200 }]
      },
      '📸 [Mengirim Foto Struk Superindo]',
      'photo'
    );
  };

  const handleSendVoiceDemo = () => {
    sendToWebhook(
      {
        voice: { file_id: 'sample_voice_id', duration: 4 }
      },
      '🎙️ [Voice Note 4 detik: "Beli nasi padang tiga puluh lima ribu"]',
      'voice'
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Bot Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center font-black text-white text-lg shadow-sm">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-white">TataDana Bot</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[11px] text-slate-300">@TataDanaOfficialBot • Webhook Live</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-700/80 px-2.5 py-1 rounded-full font-semibold text-orange-300">
          Simulasi Interaktif
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2]/30">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm whitespace-pre-line leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-mono text-[11px]'
              }`}
            >
              {m.text}
              <div
                className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                  m.sender === 'user' ? 'text-orange-200' : 'text-slate-600'
                }`}
              >
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 inline" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce delay-200"></span>
            <span className="ml-1 text-[10px]">TataDana sedang mengetik...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => { setInputText('beli bakso 15rb'); }}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 whitespace-nowrap transition"
        >
          🍜 beli bakso 15rb
        </button>
        <button
          onClick={() => { setInputText('gajian 7.5jt'); }}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 whitespace-nowrap transition"
        >
          💰 gajian 7.5jt
        </button>
        <button
          onClick={() => { setInputText('/saldo'); }}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 whitespace-nowrap transition"
        >
          /saldo
        </button>
        <button
          onClick={() => { setInputText('/budget'); }}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 whitespace-nowrap transition"
        >
          /budget
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendText} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSendPhotoDemo}
          title="Kirim Foto Struk (AI Vision)"
          className="p-2 rounded-xl text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 transition"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleSendVoiceDemo}
          title="Kirim Voice Note (Whisper Audio)"
          className="p-2 rounded-xl text-slate-600 hover:text-[#FF6B00] hover:bg-orange-50 transition"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik transaksi... (contoh: beli kopi 25rb)"
          className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6B00] focus:bg-white transition"
        />

        <button
          type="submit"
          className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white shadow-glow hover:opacity-90 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
