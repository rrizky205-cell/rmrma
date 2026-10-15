import { NextRequest, NextResponse } from 'next/server';
import { db, Transaction, Wallet, Category, Budget } from '@/lib/mock-db';
import {
  formatExpenseReply,
  formatIncomeReply,
  handleBotCommand,
  formatAmbiguousInputError,
  formatProPhotoRequiredMessage,
  formatStarterLimitReachedMessage,
  formatDailyReminder
} from '@/lib/telegram/bot-service';
import {
  parseTransactionWithAI,
  parseReceiptPhotoWithAI,
  transcribeVoiceNote,
  evaluateFinancialAdvisor
} from '@/lib/ai/providers';
import { getCurrentDateStringWIB, getCurrentMonthPeriodWIB, getNowWIB } from '@/lib/utils/date-wib';
import { decryptText } from '@/lib/utils/crypto';
import { formatRupiah } from '@/lib/utils/currency';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const updateId = update.update_id;

    if (!updateId) {
      return NextResponse.json({ ok: false, error: 'update_id missing' }, { status: 400 });
    }

    // 1. IDEMPOTENCY CHECK: skip if update_id was already processed
    if (db.isUpdateProcessed(updateId)) {
      return NextResponse.json({ ok: true, duplicate: true, message: 'Update already processed' });
    }
    db.markUpdateProcessed(updateId);

    const message = update.message;
    if (!message || !message.chat) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const chatId = message.chat.id;
    const fromUsername = message.from?.username ? `@${message.from.username}` : undefined;

    // 2. USER LOOKUP OR ACCOUNT LINKING
    let user = db.profiles.find(p => p.telegram_chat_id === chatId);

    // Check for /start [code]
    const text: string = (message.text || message.caption || '').trim();
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const code = parts[1]?.trim().toUpperCase();

      if (code) {
        const targetUser = db.profiles.find(p => p.telegram_link_code === code);
        if (targetUser) {
          targetUser.telegram_chat_id = chatId;
          targetUser.telegram_username = fromUsername;
          targetUser.telegram_connected_at = new Date().toISOString();

          const replyMsg = `🎉 Akun TataDana Berhasil Terhubung!\n\nHalo ${targetUser.full_name}! Akunmu sudah resmi tertaut dengan bot ini.\nSekarang kamu bisa langsung mencatat keuangan semudah kirim pesan chat:\n\n• Ketik: "beli nasi goreng 20rb"\n• Ketik: "gajian 6jt"\n• Ketik /bantuan untuk melihat daftar fitur lainnya.`;
          const customToken = targetUser.telegram_bot_token_encrypted ? decryptText(targetUser.telegram_bot_token_encrypted) : undefined;
          await sendTelegramMessage(chatId, replyMsg, customToken);
          return NextResponse.json({ ok: true, linked: true, reply: replyMsg });
        }
      }

      if (!user) {
        const welcomeUnlinked = `👋 Selamat datang di TataDana Bot!\n\nUntuk mulai mencatat, tautkan akun TataDana kamu terlebih dahulu.\n\nCara menautkan:\n1. Buka web TataDana di menu Settings → Tab Telegram Bot\n2. Dapatkan Kode Tautan (contoh: TATA88)\n3. Ketik perintah: /start KODE_KAMU di sini.`;
        await sendTelegramMessage(chatId, welcomeUnlinked);
        return NextResponse.json({ ok: true, reply: welcomeUnlinked });
      }
    }

    // If user is still not linked, fallback to default active user for seamless testing
    if (!user) {
      user = db.getCurrentUser();
      user.telegram_chat_id = chatId;
    }

    const userToken = user.telegram_bot_token_encrypted ? decryptText(user.telegram_bot_token_encrypted) : undefined;

    // 3. MONTHLY LIMIT CHECK (Part 4.9: Starter max 50 transactions/month)
    const currentPeriod = getCurrentMonthPeriodWIB();
    const userMonthlyTxs = db.getTransactions(user.id).filter(t => t.date.startsWith(currentPeriod));

    if (user.plan === 'starter' && userMonthlyTxs.length >= 50) {
      const limitReply = formatStarterLimitReachedMessage();
      await sendTelegramMessage(chatId, limitReply, userToken);
      return NextResponse.json({ ok: true, limit_reached: true, reply: limitReply });
    }

    const defaultWallet = db.getDefaultWallet(user.id) || db.getWallets(user.id)[0];
    const dateStr = getCurrentDateStringWIB();
    const timeStr = `${String(getNowWIB().getHours()).padStart(2, '0')}:${String(getNowWIB().getMinutes()).padStart(2, '0')}:00`;

    // Helper to check and notify budget alerts
    const checkBudgetAlert = async (catId?: string) => {
      if (!catId) return;
      const budget = db.getBudgets(user.id).find(b => b.category_id === catId);
      if (!budget || budget.monthly_limit <= 0) return;

      const spentSoFar = db.getTransactions(user.id)
        .filter(t => t.category_id === catId && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const pct = Math.round((spentSoFar / budget.monthly_limit) * 100);
      const cat = db.getCategories(user.id).find(c => c.id === catId);

      if (pct >= 100 && !budget.alert_100_sent) {
        budget.alert_100_sent = true;
        const alertMsg = `⚠️ ALERT BUDGET 100%: Pengeluaran ${cat?.name || 'kategori ini'} telah mencapai ${pct}% (${formatRupiah(spentSoFar)} / ${formatRupiah(budget.monthly_limit)}). Mohon rem pengeluaranmu!`;
        await sendTelegramMessage(chatId, alertMsg, userToken);
      } else if (pct >= 80 && !budget.alert_80_sent) {
        budget.alert_80_sent = true;
        const alertMsg = `⚡ ALERT BUDGET 80%: Pengeluaran ${cat?.name || 'kategori ini'} sudah mencapai ${pct}% (${formatRupiah(spentSoFar)} / ${formatRupiah(budget.monthly_limit)}). Waspada sebelum akhir bulan!`;
        await sendTelegramMessage(chatId, alertMsg, userToken);
      }
    };

    // 4. COMMAND HANDLER
    if (text.startsWith('/')) {
      const commandReply = handleBotCommand(text, user);
      await sendTelegramMessage(chatId, commandReply, userToken);
      return NextResponse.json({ ok: true, command: true, reply: commandReply });
    }

    // 5. RECEIPT PHOTO HANDLER (Part 4.2: Pro only)
    if (message.photo && message.photo.length > 0) {
      if (user.plan !== 'pro') {
        const proOnlyReply = formatProPhotoRequiredMessage();
        await sendTelegramMessage(chatId, proOnlyReply, userToken);
        return NextResponse.json({ ok: true, pro_required: true, reply: proOnlyReply });
      }

      // Process Receipt Photo with AI Vision
      const photoResult = await parseReceiptPhotoWithAI('telegram_photo', user.id);
      const cat = db.getCategories(user.id).find(c => c.name === 'Belanja Harian') || db.getCategories(user.id)[0];

      const newTx = db.addTransaction({
        user_id: user.id,
        wallet_id: defaultWallet.id,
        category_id: cat?.id,
        type: 'expense',
        amount: photoResult.total,
        note: `Struk: ${photoResult.merchant}`,
        date: photoResult.date,
        time: timeStr,
        source: 'telegram_photo',
        receipt_merchant: photoResult.merchant,
        is_receipt_parent: true,
        receipt_items: photoResult.items.map((item, idx) => ({
          id: `item_${Date.now()}_${idx}`,
          transaction_id: '',
          item_name: item.item_name,
          quantity: item.quantity,
          price: item.price,
          category_name: item.category_name
        }))
      });

      await checkBudgetAlert(cat?.id);

      const itemsDetail = photoResult.items.map(i => `• ${i.item_name}: Rp${i.price.toLocaleString('id-ID')}`).join('\n');
      const photoReply = `📅 ${dateStr} — ${timeStr.slice(0, 5)} WIB\n📸 Struk Belanja Terdeteksi!\n├ Merchant : 🏪 ${photoResult.merchant}\n├ Total    : Rp${photoResult.total.toLocaleString('id-ID')}\n├ Dompet   : 👛 ${defaultWallet.name}\n└ Saldo    : Rp${defaultWallet.balance.toLocaleString('id-ID')}\n\n🧾 Rincian Item:\n${itemsDetail}\n\n✨ Semua rincian item telah tersimpan dan bisa di-expand di dashboard Laporan!`;

      await sendTelegramMessage(chatId, photoReply, userToken);
      return NextResponse.json({ ok: true, receipt: true, reply: photoReply, transaction: newTx });
    }

    // 6. VOICE NOTE / AUDIO HANDLER (Part 4.3: All plans)
    if (message.voice || message.audio) {
      const voiceObj = message.voice || message.audio;
      const duration = voiceObj.duration || 5;

      const transcribeResult = await transcribeVoiceNote(duration, user.id);
      if (!transcribeResult.success || !transcribeResult.transcript) {
        const errorReply = transcribeResult.error || formatAmbiguousInputError();
        await sendTelegramMessage(chatId, errorReply, userToken);
        return NextResponse.json({ ok: true, voice_error: true, reply: errorReply });
      }

      // Process transcript through natural language parser
      const parsed = await parseTransactionWithAI(transcribeResult.transcript, user.id);
      if (parsed.isAmbiguous || parsed.nominal <= 0) {
        const ambiguousReply = formatAmbiguousInputError();
        await sendTelegramMessage(chatId, ambiguousReply, userToken);
        return NextResponse.json({ ok: true, ambiguous: true, reply: ambiguousReply });
      }

      const category = db.getCategories(user.id).find(c => c.name.toLowerCase() === parsed.kategori.toLowerCase()) || db.getCategories(user.id)[0];

      const newTx = db.addTransaction({
        user_id: user.id,
        wallet_id: defaultWallet.id,
        category_id: category?.id,
        type: parsed.jenis,
        amount: parsed.nominal,
        note: parsed.catatan,
        date: dateStr,
        time: timeStr,
        source: 'telegram_voice'
      });

      if (parsed.jenis === 'expense') {
        await checkBudgetAlert(category?.id);
      }

      let botReply = '';
      if (parsed.jenis === 'expense') {
        const budget = db.getBudgets(user.id).find(b => b.category_id === category?.id);
        const spentSoFar = db.getTransactions(user.id)
          .filter(t => t.category_id === category?.id && t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);

        const advisor = evaluateFinancialAdvisor(user.id, parsed.nominal, parsed.kategori);
        botReply = formatExpenseReply(newTx, defaultWallet, category, budget, spentSoFar, advisor, transcribeResult.transcript);
      } else {
        botReply = formatIncomeReply(newTx, defaultWallet, transcribeResult.transcript);
      }

      await sendTelegramMessage(chatId, botReply, userToken);
      return NextResponse.json({ ok: true, voice: true, reply: botReply, transaction: newTx });
    }

    // 7. NATURAL LANGUAGE TEXT HANDLER (Part 4.1)
    if (!text) {
      return NextResponse.json({ ok: true, empty: true });
    }

    const parsed = await parseTransactionWithAI(text, user.id);
    if (parsed.isAmbiguous || parsed.nominal <= 0) {
      const ambiguousReply = formatAmbiguousInputError();
      await sendTelegramMessage(chatId, ambiguousReply, userToken);
      return NextResponse.json({ ok: true, ambiguous: true, reply: ambiguousReply });
    }

    const category = db.getCategories(user.id).find(c => c.name.toLowerCase() === parsed.kategori.toLowerCase()) || db.getCategories(user.id)[0];

    const newTx = db.addTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      category_id: category?.id,
      type: parsed.jenis,
      amount: parsed.nominal,
      note: parsed.catatan,
      date: dateStr,
      time: timeStr,
      source: 'telegram_text'
    });

    if (parsed.jenis === 'expense') {
      await checkBudgetAlert(category?.id);
    }

    let botReply = '';
    if (parsed.jenis === 'expense') {
      const budget = db.getBudgets(user.id).find(b => b.category_id === category?.id);
      const spentSoFar = db.getTransactions(user.id)
        .filter(t => t.category_id === category?.id && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const advisor = evaluateFinancialAdvisor(user.id, parsed.nominal, parsed.kategori);
      botReply = formatExpenseReply(newTx, defaultWallet, category, budget, spentSoFar, advisor);
    } else {
      botReply = formatIncomeReply(newTx, defaultWallet);
    }

    await sendTelegramMessage(chatId, botReply, userToken);
    return NextResponse.json({ ok: true, success: true, reply: botReply, transaction: newTx });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string, customToken?: string) {
  const token = customToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.startsWith('demo_') || token.startsWith('your_')) {
    // In mock or simulator mode, log without erroring
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
  } catch {
    // Ignore network error during offline test
  }
}
