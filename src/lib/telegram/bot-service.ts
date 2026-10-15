/**
 * Telegram Bot Service - Response Formatting, Command Processing, and Messaging
 */

import { db, Profile, Wallet, Category, Budget, Transaction } from '@/lib/mock-db';
import { formatRupiah } from '@/lib/utils/currency';
import { formatTelegramReplyDate, getNowWIB, formatIndoShortDate } from '@/lib/utils/date-wib';
import { evaluateFinancialAdvisor, FinancialAdvisorAdvice } from '@/lib/ai/providers';

/**
 * Generate 10-char ASCII progress bar: e.g. [██████░░░░]
 */
export function generateProgressBar(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const filledBlocks = Math.round(clamped / 10);
  const emptyBlocks = 10 - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

/**
 * Format reply message for recorded expense (Part 4.4)
 */
export function formatExpenseReply(
  tx: Transaction,
  wallet: Wallet,
  category: Category | undefined,
  budget: Budget | undefined,
  currentCategorySpent: number,
  advisorAdvice?: FinancialAdvisorAdvice,
  transcriptText?: string
): string {
  const lines: string[] = [];

  // Header date in WIB
  lines.push(formatTelegramReplyDate());

  if (transcriptText) {
    lines.push(`🎙️ Transkrip: "${transcriptText}"`);
  }

  lines.push('💸 Pengeluaran tercatat!');
  lines.push(`├ Nominal : ${formatRupiah(tx.amount)}`);
  lines.push(`├ Kategori : ${category ? `${category.emoji} ${category.name}` : '🏷️ Pengeluaran Umum'}`);
  lines.push(`├ Dompet : 👛 ${wallet.name}`);
  lines.push(`├ Catatan : ${tx.note || '-'}`);
  lines.push(`└ Saldo : ${formatRupiah(wallet.balance)}`);

  // Budget status if set
  if (budget) {
    lines.push('');
    const pct = Math.round((currentCategorySpent / budget.monthly_limit) * 100);
    const sisa = Math.max(0, budget.monthly_limit - currentCategorySpent);
    const bar = generateProgressBar(pct);

    lines.push(`📊 Budget ${category?.name || ''} bulan ini:`);
    lines.push(`[${bar}] ${pct}% — sisa ${formatRupiah(sisa)}`);

    if (pct >= 100) {
      lines.push('⚠️ Perhatian: Budget kategori ini sudah melebihi batas 100%!');
    } else if (pct >= 80) {
      lines.push('⚡ Waspada: Budget sudah terpakai 80% ke atas. Rem pengeluaranmu ya!');
    } else {
      lines.push('✨ Tetap hemat dan jaga cashflow tetap positif!');
    }
  }

  // AI Financial Advisor append (Pro users)
  if (advisorAdvice && advisorAdvice.triggered && advisorAdvice.message) {
    lines.push('');
    lines.push(advisorAdvice.message);
  }

  return lines.join('\n');
}

/**
 * Format reply message for recorded income (Part 4.5)
 */
export function formatIncomeReply(
  tx: Transaction,
  wallet: Wallet,
  transcriptText?: string
): string {
  const lines: string[] = [];

  lines.push(formatTelegramReplyDate());

  if (transcriptText) {
    lines.push(`🎙️ Transkrip: "${transcriptText}"`);
  }

  lines.push('💰 Pemasukan tercatat!');
  lines.push(`├ Nominal : ${formatRupiah(tx.amount)}`);
  lines.push(`├ Kategori : 💼 Pemasukan`);
  lines.push(`├ Dompet : 👛 ${wallet.name}`);
  lines.push(`└ Saldo baru : ${formatRupiah(wallet.balance)}`);
  lines.push('');
  lines.push('💪 Semangat terus! Jangan lupa sisihkan untuk tabungan ya.');

  return lines.join('\n');
}

/**
 * Format reply for commands: /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /bantuan, /sheet
 */
export function handleBotCommand(cmd: string, user: Profile): string {
  const cleanCmd = cmd.trim().toLowerCase().replace(/@[a-z0-9_]+/i, '');
  const txs = db.getTransactions(user.id);
  const wallets = db.getWallets(user.id);
  const categories = db.getCategories(user.id);
  const budgets = db.getBudgets(user.id);
  const todayStr = getNowWIB().toISOString().split('T')[0];

  // /saldo
  if (cleanCmd === '/saldo') {
    const totalSaldo = wallets.reduce((acc, w) => acc + w.balance, 0);
    const lines = [
      '👛 Saldo Dompet TataDana:',
      ...wallets.map(w => `├ ${w.is_default ? '⭐ ' : ''}${w.name}: ${formatRupiah(w.balance)}`),
      `└ Total Saldo: ${formatRupiah(totalSaldo)}`
    ];
    return lines.join('\n');
  }

  // /hari ini
  if (cleanCmd === '/hari ini' || cleanCmd === '/hariini') {
    const todayTxs = txs.filter(t => t.date === todayStr);
    const inToday = todayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const outToday = todayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const lines = [
      `📅 Rekap Hari Ini (${formatIndoShortDate(todayStr)}):`,
      `💰 Pemasukan: ${formatRupiah(inToday)}`,
      `💸 Pengeluaran: ${formatRupiah(outToday)}`,
      `📊 Transaksi tercatat: ${todayTxs.length}`,
      ''
    ];

    if (todayTxs.length === 0) {
      lines.push('Belum ada transaksi hari ini. Ketik transaksi pertamamu sekarang!');
    } else {
      todayTxs.slice(0, 5).forEach(t => {
        const sign = t.type === 'income' ? '+' : '-';
        lines.push(`• ${sign}${formatRupiah(t.amount)} (${t.note || 'Transaksi'})`);
      });
    }
    return lines.join('\n');
  }

  // /minggu ini
  if (cleanCmd === '/minggu ini' || cleanCmd === '/mingguini') {
    const sevenDaysAgo = new Date(getNowWIB().getTime() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const weekTxs = txs.filter(t => t.date >= sevenDaysAgo);
    const inWeek = weekTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const outWeek = weekTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return [
      '📅 Rekap 7 Hari Terakhir:',
      `💰 Total Pemasukan: ${formatRupiah(inWeek)}`,
      `💸 Total Pengeluaran: ${formatRupiah(outWeek)}`,
      `📈 Net Cashflow: ${formatRupiah(inWeek - outWeek)}`,
      `🔢 Jumlah Transaksi: ${weekTxs.length}`
    ].join('\n');
  }

  // /bulan ini
  if (cleanCmd === '/bulan ini' || cleanCmd === '/bulanini') {
    const inMonth = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const outMonth = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const lines = [
      '📅 Rekap Bulan Berjalan:',
      `💰 Pemasukan: ${formatRupiah(inMonth)}`,
      `💸 Pengeluaran: ${formatRupiah(outMonth)}`,
      `💼 Net: ${formatRupiah(inMonth - outMonth)}`,
      '',
      '🏷️ Pengeluaran per Kategori:'
    ];

    categories.filter(c => c.type === 'expense').forEach(c => {
      const sum = txs.filter(t => t.category_id === c.id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      if (sum > 0) {
        lines.push(`├ ${c.emoji} ${c.name}: ${formatRupiah(sum)}`);
      }
    });

    return lines.join('\n');
  }

  // /budget
  if (cleanCmd === '/budget') {
    if (budgets.length === 0) {
      return 'Belum ada budget yang diset untuk bulan ini. Kamu bisa atur budget di dashboard web TataDana!';
    }

    const lines = ['🎯 Status Budget Bulan Ini:'];
    budgets.forEach(b => {
      const cat = categories.find(c => c.id === b.category_id);
      const spent = txs.filter(t => t.category_id === b.category_id && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const pct = Math.round((spent / b.monthly_limit) * 100);
      const bar = generateProgressBar(pct);
      lines.push(`${cat?.emoji || '🏷️'} ${cat?.name || 'Kategori'}:`);
      lines.push(`[${bar}] ${pct}% (${formatRupiah(spent)} / ${formatRupiah(b.monthly_limit)})`);
    });
    return lines.join('\n');
  }

  // /sheet or /laporan
  if (cleanCmd === '/sheet' || cleanCmd === '/laporan') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `📊 Dashboard Laporan Pribadi Kamu:\n${appUrl}/dashboard/laporan\n\nBuka link di atas untuk melihat tabel transaksi real-time, filter lengkap, dan download export PDF/Excel.`;
  }

  // /bantuan
  return [
    '✨ Panduan Command TataDana Bot:',
    '• /saldo - Cek saldo semua dompet',
    '• /hari ini - Rekap transaksi hari ini',
    '• /minggu ini - Rekap 7 hari terakhir',
    '• /bulan ini - Rekap bulan berjalan & breakdown kategori',
    '• /budget - Pantau status budget bulanan',
    '• /laporan atau /sheet - Akses dashboard laporan web',
    '• /bantuan - Tampilkan pesan panduan ini',
    '',
    '💬 Atau langsung ketik transaksi dengan bahasa natural:',
    'Contoh: "beli bakso 15rb", "kopi janjijiwa 25k", "gajian 5jt"',
    '📸 Kirim foto struk (Khusus Pro)',
    '🎙️ Kirim voice note catatan keuangan'
  ].join('\n');
}

/**
 * Clear Indonesian error explanation when natural language input fails
 */
export function formatAmbiguousInputError(): string {
  return [
    '⚠️ Maaf, TataDana belum memahami pesanmu.',
    '',
    '💡 Coba ketik dengan menyertakan nominal yang jelas, contoh:',
    '• "Beli bakso 15rb"',
    '• "Kopi kenangan 25k"',
    '• "Bensin pertamax 50ribu"',
    '• "Gajian bulan ini 5jt"',
    '',
    'Atau ketik /bantuan untuk melihat daftar command lengkap.'
  ].join('\n');
}

/**
 * Error when non-Pro user sends photo
 */
export function formatProPhotoRequiredMessage(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return [
    '📸 Fitur Scan Foto Struk dengan AI Vision khusus untuk pengguna TataDana Pro!',
    '',
    'Dengan paket Pro seharga Rp99.000 sekali bayar, kamu bisa:',
    '✨ Kirim foto struk belanjaan langsung rapi tercatat otomatis',
    '✨ Unlimited transaksi bulanan (tanpa batas 50 transaksi)',
    '✨ Export laporan ke PDF dan Excel tanpa batas',
    '✨ AI Financial Advisor aktif memantau keuanganmu',
    '',
    `🚀 Upgrade sekarang di: ${appUrl}/#pricing`
  ].join('\n');
}

/**
 * Message when Starter user hits 50 monthly transactions limit (Part 4.9)
 */
export function formatStarterLimitReachedMessage(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return [
    '🛑 Batas Kuota Transaksi Bulanan Tercapai!',
    '',
    'Kamu telah mencapai batas maksimal 50 transaksi bulan ini pada paket Starter.',
    'Untuk terus mencatat transaksi tanpa batas, yuk beralih ke paket Pro!',
    '',
    `🚀 Upgrade ke Pro: ${appUrl}/#pricing`
  ].join('\n');
}

/**
 * Daily reminder template (Part 4.8)
 */
export function formatDailyReminder(): string {
  return [
    '⏰ Reminder Keuangan!',
    'Jangan lupa catat pengeluaran hari ini ya 📝',
    'Pencatatan rutin = keuangan lebih terkontrol 💪',
    'Ketik transaksimu sekarang!'
  ].join('\n');
}
