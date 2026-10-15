import * as XLSX from 'xlsx';
import { Transaction } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatIndoLongDate, formatIndoTime } from '@/lib/utils/date-wib';

export interface ReportSummary {
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  topCategories: { name: string; amount: number; percentage: number }[];
  transactions: Transaction[];
}

/**
 * Generate genuine Excel (.xlsx) binary workbook buffer using SheetJS
 */
export function generateXlsxBuffer(summary: ReportSummary): Buffer {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Arus Kas & Top Kategori
  const summaryAoa: any[][] = [
    ['LAPORAN KEUANGAN PRIBADI - TATADANA'],
    ['Periode', summary.periodLabel],
    ['Waktu Export', `${new Date().toLocaleDateString('id-ID')} WIB`],
    [],
    ['RINGKASAN ARUS KAS', 'NOMINAL (IDR)', 'FORMATTED'],
    ['Total Pemasukan', summary.totalIncome, formatRupiah(summary.totalIncome, true)],
    ['Total Pengeluaran', summary.totalExpense, formatRupiah(summary.totalExpense, true)],
    ['Net Cashflow (Selisih)', summary.netCashflow, formatRupiah(summary.netCashflow, true)],
    [],
    ['TOP KATEGORI PENGELUARAN', 'NOMINAL (IDR)', 'PERSENTASE']
  ];

  summary.topCategories.forEach(cat => {
    summaryAoa.push([cat.name, cat.amount, `${cat.percentage.toFixed(1)}%`]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Sheet 2: Daftar Transaksi Lengkap
  const txRows: any[][] = [
    ['No', 'Tanggal', 'Waktu', 'Jenis', 'Kategori / Item', 'Nominal (IDR)', 'Catatan', 'Sumber']
  ];

  summary.transactions.forEach((tx, idx) => {
    const jenisLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';
    const amountVal = tx.type === 'expense' ? -tx.amount : tx.amount;
    const catOrItems = tx.is_receipt_parent && tx.receipt_items?.length
      ? `${tx.receipt_merchant || 'Struk'} (${tx.receipt_items.map(i => `${i.item_name} @${formatRupiah(i.price)}`).join('; ')})`
      : (tx.category_id || 'Umum');

    txRows.push([
      idx + 1,
      formatIndoLongDate(tx.date),
      formatIndoTime(tx.time),
      jenisLabel,
      catOrItems,
      amountVal,
      tx.note || '',
      tx.source
    ]);
  });

  const wsTx = XLSX.utils.aoa_to_sheet(txRows);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Daftar Transaksi');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buf);
}

/**
 * Generate CSV / Excel spreadsheet content with UTF-8 BOM for spreadsheet compatibility
 */
export function generateExcelBuffer(summary: ReportSummary): string {
  const lines: string[] = [];

  // Title & Header
  lines.push('LAPORAN KEUANGAN PRIBADI - TATADANA');
  lines.push(`Periode: ${summary.periodLabel}`);
  lines.push(`Waktu Export: ${new Date().toLocaleString('id-ID')} WIB`);
  lines.push('');

  // Ringkasan Finansial
  lines.push('RINGKASAN ARUS KAS');
  lines.push(`Total Pemasukan,${summary.totalIncome},"${formatRupiah(summary.totalIncome, true)}"`);
  lines.push(`Total Pengeluaran,${summary.totalExpense},"${formatRupiah(summary.totalExpense, true)}"`);
  lines.push(`Net Cashflow (Selisih),${summary.netCashflow},"${formatRupiah(summary.netCashflow, true)}"`);
  lines.push('');

  // Top 5 Pengeluaran
  lines.push('TOP KATEGORI PENGELUARAN');
  lines.push('Kategori,Nominal,Persentase');
  summary.topCategories.forEach(cat => {
    lines.push(`"${cat.name}",${cat.amount},${cat.percentage.toFixed(1)}%`);
  });
  lines.push('');

  // Tabel Transaksi
  lines.push('DAFTAR TRANSAKSI LENGKAP');
  lines.push('No,Tanggal,Waktu,Jenis,Kategori / Item,Nominal (IDR),Catatan,Sumber');

  summary.transactions.forEach((tx, idx) => {
    const jenisLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';
    const amountVal = tx.type === 'expense' ? -tx.amount : tx.amount;
    const catOrItems = tx.is_receipt_parent && tx.receipt_items?.length
      ? `${tx.receipt_merchant || 'Struk'} (${tx.receipt_items.map(i => `${i.item_name} @${formatRupiah(i.price)}`).join('; ')})`
      : (tx.category_id || 'Umum');

    lines.push([
      idx + 1,
      `"${formatIndoLongDate(tx.date)}"`,
      `"${formatIndoTime(tx.time)}"`,
      jenisLabel,
      `"${catOrItems.replace(/"/g, '""')}"`,
      amountVal,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
      tx.source
    ].join(','));
  });

  return '\uFEFF' + lines.join('\r\n');
}
