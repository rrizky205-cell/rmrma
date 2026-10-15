import { Transaction } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatIndoLongDate } from '@/lib/utils/date-wib';
import { ReportSummary } from './excel-generator';

/**
 * Generate a 100% valid standalone PDF 1.4 document for TataDana Financial Reports
 */
export function generatePdfBuffer(summary: ReportSummary): Buffer {
  const contentLines: string[] = [];

  // Stream drawing commands
  contentLines.push('BT');

  // Title: TataDana Financial Report
  contentLines.push('/F1 20 Tf');
  contentLines.push('50 740 Td');
  contentLines.push('(TATADANA - LAPORAN KEUANGAN) Tj');

  // Tagline & Period
  contentLines.push('/F2 10 Tf');
  contentLines.push('0 -18 Td');
  contentLines.push(`(Periode: ${escapePdfText(summary.periodLabel)} | Tanggal Cetak: ${escapePdfText(new Date().toLocaleDateString('id-ID'))} WIB) Tj`);

  // Divider line
  contentLines.push('0 -15 Td');
  contentLines.push('(_____________________________________________________________________________) Tj');

  // Financial Summary Section
  contentLines.push('/F1 13 Tf');
  contentLines.push('0 -25 Td');
  contentLines.push('(RINGKASAN ARUS KAS) Tj');

  contentLines.push('/F2 10 Tf');
  contentLines.push('0 -16 Td');
  contentLines.push(`(Total Pemasukan: ${escapePdfText(formatRupiah(summary.totalIncome, true))}) Tj`);
  contentLines.push('0 -14 Td');
  contentLines.push(`(Total Pengeluaran: ${escapePdfText(formatRupiah(summary.totalExpense, true))}) Tj`);
  contentLines.push('0 -14 Td');
  contentLines.push(`(Net Cashflow / Selisih: ${escapePdfText(formatRupiah(summary.netCashflow, true))}) Tj`);

  // Top 5 Categories Section
  contentLines.push('/F1 13 Tf');
  contentLines.push('0 -25 Td');
  contentLines.push('(PENGELUARAN TERBESAR PER KATEGORI) Tj');

  contentLines.push('/F2 10 Tf');
  if (summary.topCategories.length === 0) {
    contentLines.push('0 -14 Td');
    contentLines.push('(Belum ada pengeluaran pada periode ini.) Tj');
  } else {
    summary.topCategories.slice(0, 5).forEach(cat => {
      contentLines.push('0 -14 Td');
      contentLines.push(`(- ${escapePdfText(cat.name)}: ${escapePdfText(formatRupiah(cat.amount, true))} [${cat.percentage.toFixed(1)}%]) Tj`);
    });
  }

  // Transactions Table Header
  contentLines.push('/F1 13 Tf');
  contentLines.push('0 -25 Td');
  contentLines.push('(DAFTAR TRANSAKSI TERAKHIR) Tj');

  contentLines.push('/F2 9 Tf');
  contentLines.push('0 -15 Td');
  contentLines.push('(TGL         JENIS          NOMINAL         CATATAN) Tj');

  // List up to 15 transactions
  summary.transactions.slice(0, 15).forEach(tx => {
    const tgl = tx.date;
    const jenis = tx.type === 'income' ? '+MASUK ' : tx.type === 'expense' ? '-KELUAR' : 'TRF   ';
    const nom = formatRupiah(tx.amount).padEnd(14, ' ');
    const note = escapePdfText((tx.note || '').slice(0, 35));

    contentLines.push('0 -13 Td');
    contentLines.push(`(${tgl}   ${jenis}   ${nom}  ${note}) Tj`);
  });

  // Footer
  contentLines.push('/F2 8 Tf');
  contentLines.push('0 -30 Td');
  contentLines.push('(TataDana Fintech Indonesia - Catat keuangan semudah chat langsung dari Telegram) Tj');

  contentLines.push('ET');

  const streamContent = contentLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  // Build PDF 1.4 objects
  const objects: string[] = [];
  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj';
  objects[2] = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj';
  objects[3] = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj';
  objects[4] = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj';
  objects[5] = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj';
  objects[6] = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`;

  let pdfString = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 1; i <= 6; i++) {
    offsets[i] = Buffer.byteLength(pdfString, 'utf-8');
    pdfString += objects[i] + '\n';
  }

  const startXref = Buffer.byteLength(pdfString, 'utf-8');
  pdfString += 'xref\n0 7\n';
  pdfString += '0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    pdfString += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  pdfString += 'trailer\n<< /Size 7 /Root 1 0 R >>\n';
  pdfString += 'startxref\n' + startXref + '\n';
  pdfString += '%%EOF\n';

  return Buffer.from(pdfString, 'utf-8');
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}
