import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { generatePdfBuffer } from '@/lib/export/pdf-generator';
import { generateXlsxBuffer, generateExcelBuffer } from '@/lib/export/excel-generator';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('file') || 'Laporan_TataDana.pdf';

  const txs = db.getTransactions(db.activeUserId);
  const totalIncome = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;

  const catMap = new Map<string, number>();
  const allCats = db.getCategories(db.activeUserId);
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

  const summary = {
    periodLabel: 'Semua Transaksi',
    totalIncome,
    totalExpense,
    netCashflow,
    topCategories,
    transactions: txs
  };

  if (fileName.endsWith('.xlsx')) {
    const xlsxBuf = generateXlsxBuffer(summary);
    return new NextResponse(xlsxBuf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } else if (fileName.endsWith('.csv')) {
    const csv = generateExcelBuffer(summary);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } else {
    const pdf = generatePdfBuffer(summary);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  }
}
