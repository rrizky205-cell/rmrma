import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const { occupation, lifestyleNotes, userId } = await req.json();

    // AI customized category generator based on user occupation and lifestyle
    const role = (occupation || 'karyawan').toLowerCase();

    let recommendations = [
      { name: 'Makanan & Minuman', type: 'expense', emoji: '🍜', color: '#FF6B00' },
      { name: 'Transport & Bensin', type: 'expense', emoji: '🚗', color: '#3B82F6' },
      { name: 'Belanja Harian', type: 'expense', emoji: '🛒', color: '#EC4899' },
      { name: 'Tagihan & Kost/Cicilan', type: 'expense', emoji: '🏠', color: '#8B5CF6' },
      { name: 'Hiburan & Kopi', type: 'expense', emoji: '🎮', color: '#F59E0B' },
      { name: 'Kesehatan & Skincare', type: 'expense', emoji: '💊', color: '#EF4444' },
      { name: 'Gaji Bulanan', type: 'income', emoji: '💰', color: '#10B981' }
    ];

    if (role.includes('mahasiswa') || role.includes('pelajar')) {
      recommendations = [
        { name: 'Makan & Jajan Kampus', type: 'expense', emoji: '🍜', color: '#FF6B00' },
        { name: 'Ongkos & Transport', type: 'expense', emoji: '🛵', color: '#3B82F6' },
        { name: 'Buku & Kuliah', type: 'expense', emoji: '📚', color: '#6366F1' },
        { name: 'Uang Kost & Wifi', type: 'expense', emoji: '🏠', color: '#8B5CF6' },
        { name: 'Nongkrong & Game', type: 'expense', emoji: '🎮', color: '#F59E0B' },
        { name: 'Kiriman Ortu', type: 'income', emoji: '💸', color: '#10B981' },
        { name: 'Beasiswa / Part-Time', type: 'income', emoji: '🎓', color: '#06B6D4' }
      ];
    } else if (role.includes('freelance') || role.includes('designer') || role.includes('developer')) {
      recommendations = [
        { name: 'Kopi & Coworking Space', type: 'expense', emoji: '☕', color: '#FF6B00' },
        { name: 'Software & Cloud Tools', type: 'expense', emoji: '💻', color: '#3B82F6' },
        { name: 'Gadget & Equipment', type: 'expense', emoji: '🎧', color: '#6366F1' },
        { name: 'Makan & Belanja', type: 'expense', emoji: '🍜', color: '#EC4899' },
        { name: 'Internet & Tagihan', type: 'expense', emoji: '⚡', color: '#8B5CF6' },
        { name: 'Invoice Klien', type: 'income', emoji: '💰', color: '#10B981' },
        { name: 'Royalti / Produk Digital', type: 'income', emoji: '💎', color: '#06B6D4' }
      ];
    }

    // Save into user categories if userId provided
    const targetUserId = userId || db.activeUserId;
    if (targetUserId) {
      recommendations.forEach(rec => {
        db.addCategory({
          user_id: targetUserId,
          name: rec.name,
          type: rec.type as 'income' | 'expense',
          emoji: rec.emoji,
          color: rec.color,
          is_system: false
        });
      });
    }

    db.addAiLog({
      user_id: targetUserId,
      provider: 'gemini',
      prompt_type: 'onboarding_recommendation',
      tokens_used: 120,
      response_time_ms: 180,
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
