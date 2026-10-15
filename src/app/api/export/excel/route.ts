import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { generateXlsxBuffer } from '@/lib/export/excel-generator';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || db.activeUserId;
    const user = db.profiles.find(p => p.id === userId);

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Enforcement limit paket: Starter cannot export PDF/Excel
    if (user.plan !== 'pro') {
      return NextResponse.json({
        error: 'Export laporan ke Excel (.xlsx) adalah fitur khusus Pro. Silakan upgrade paket TataDana Anda.',
        plan_restricted: true
      }, { status: 403 });
    }

    const { periodLabel = 'Bulan Ini', filterCategory, filterWallet, startDate, endDate } = body;

    // Filter transactions
    let txs = db.getTransactions(userId);
    if (filterCategory) txs = txs.filter(t => t.category_id === filterCategory);
    if (filterWallet) txs = txs.filter(t => t.wallet_id === filterWallet);
    if (startDate) txs = txs.filter(t => t.date >= startDate);
    if (endDate) txs = txs.filter(t => t.date <= endDate);

    // Calculate Summary
    const totalIncome = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netCashflow = totalIncome - totalExpense;

    // Top categories
    const catMap = new Map<string, number>();
    const allCats = db.getCategories(userId);
    txs.filter(t => t.type === 'expense').forEach(t => {
      const c = allCats.find(item => item.id === t.category_id);
      const name = c ? `${c.emoji} ${c.name}` : 'Lain-lain';
      catMap.set(name, (catMap.get(name) || 0) + t.amount);
    });

    const topCategories = Array.from(catMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const xlsxBuffer = generateXlsxBuffer({
      periodLabel,
      totalIncome,
      totalExpense,
      netCashflow,
      topCategories,
      transactions: txs
    });

    const fileName = `Laporan_TataDana_${periodLabel.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    const storagePath = `exports/${userId}/${fileName}`;

    let signedUrl = `/api/export/download?file=${encodeURIComponent(fileName)}`;
    try {
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'tatadana-exports';
      const { error: uploadErr } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(storagePath, xlsxBuffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: true
        });

      if (!uploadErr) {
        const { data: signedData } = await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl(storagePath, 3600);
        if (signedData?.signedUrl) {
          signedUrl = signedData.signedUrl;
        }
      }
    } catch {
      // Fallback to local streaming download route
    }

    // Save in export history
    const record = db.addExport({
      user_id: userId,
      file_name: fileName,
      format: 'xlsx',
      period_label: periodLabel,
      file_url: signedUrl,
      storage_path: storagePath,
      file_size_bytes: xlsxBuffer.length
    });

    return NextResponse.json({
      success: true,
      record,
      download_url: signedUrl,
      file_base64: xlsxBuffer.toString('base64'),
      file_name: fileName
    });
  } catch (err: any) {
    console.error('Excel export error:', err);
    return NextResponse.json({ error: err.message || 'Gagal generate Excel' }, { status: 500 });
  }
}
