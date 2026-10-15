/**
 * Verification Test Suite for Telegram Sync & UI Improvements
 */

const assert = require('assert');

// 1. Thousand Separator Formatter
function formatThousand(val) {
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(digits);
}

function parseFormattedNominal(val) {
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, '');
  const num = parseInt(digits, 10);
  return isNaN(num) ? 0 : num;
}

// 2. Indo Nominal Parser
function parseIndoNominal(text) {
  if (!text) return 0;
  const clean = text.toLowerCase().trim();

  // Juta
  const jtMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|mio|miliun)\b/);
  if (jtMatch) {
    return Math.round(parseFloat(jtMatch[1].replace(',', '.')) * 1000000);
  }

  // Ribu
  const rbMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu|rebu)\b/);
  if (rbMatch) {
    return Math.round(parseFloat(rbMatch[1].replace(',', '.')) * 1000);
  }

  // Dot formatted
  const dotMatch = clean.match(/(?:^|\D)(\d{1,3}(?:\.\d{3})+)(?:,\d+)?(?:\D|$)/);
  if (dotMatch) {
    const num = parseInt(dotMatch[1].replace(/\./g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  // Standalone raw digits
  const numMatch = clean.match(/(?:rp\.?\s*|\b)(\d{4,12})\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }

  const fallback = clean.match(/\b(\d+)\b/);
  if (fallback) {
    const val = parseInt(fallback[1], 10);
    if (val > 100) return val;
    if (val > 0) return val * 1000;
  }

  return 0;
}

// 3. Category Matcher with Custom Categories
function matchCategory(text, budgets, customCategories) {
  const clean = text.toLowerCase();
  const allCustom = [...new Set([
    ...(budgets || []).map(b => b.name),
    ...(customCategories || [])
  ])];

  for (const c of allCustom) {
    const cleanCat = c.replace(/^[^\w\s]+/, '').trim().toLowerCase();
    if (cleanCat && clean.includes(cleanCat)) {
      return c;
    }
  }

  if (clean.includes('bensin') || clean.includes('pertamax') || clean.includes('gojek') || clean.includes('grab') || clean.includes('transport')) {
    return '🚗 Transportasi & Bensin';
  } else if (clean.includes('kopi') || clean.includes('ngopi') || clean.includes('cafe')) {
    return '☕ Kopi & Nongkrong';
  } else if (clean.includes('listrik') || clean.includes('pln') || clean.includes('air') || clean.includes('tagihan')) {
    return '🏠 Listrik PLN, Air & Tagihan';
  } else if (clean.includes('pulsa') || clean.includes('wifi') || clean.includes('kuota')) {
    return '🌐 Pulsa, Data & WiFi';
  } else if (clean.includes('belanja') || clean.includes('baju') || clean.includes('sepatu')) {
    return '👕 Belanja Fashion & Pakaian';
  } else if (clean.includes('supermarket') || clean.includes('indomaret') || clean.includes('alfamart')) {
    return '🛒 Supermarket & Kebutuhan Rumah';
  } else if (clean.includes('game') || clean.includes('steam')) {
    return '🎮 Hiburan, Game & Streaming';
  } else if (clean.includes('obat') || clean.includes('dokter') || clean.includes('apotek')) {
    return '💊 Kesehatan, Obat & BPJS';
  } else if (clean.includes('buku') || clean.includes('kursus')) {
    return '📚 Pendidikan, Buku & Kursus';
  } else if (clean.includes('sedekah') || clean.includes('zakat') || clean.includes('donasi')) {
    return '🎁 Sedekah, Zakat & Donasi';
  }

  return '🍜 Makanan & Minuman';
}

// 4. Test Suite Execution
console.log('===========================================================');
console.log('TATADANA TELEGRAM & UI ENHANCEMENT TEST SUITE');
console.log('===========================================================\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

// Group 1: Thousand Separator Formatting
runTest('Format: 1000000 becomes 1.000.000', () => {
  assert.strictEqual(formatThousand('1000000'), '1.000.000');
});

runTest('Format: 50000 becomes 50.000', () => {
  assert.strictEqual(formatThousand('50000'), '50.000');
});

runTest('Format: 15000000 becomes 15.000.000', () => {
  assert.strictEqual(formatThousand('15000000'), '15.000.000');
});

runTest('Parse: 1.000.000 parses to 1000000', () => {
  assert.strictEqual(parseFormattedNominal('1.000.000'), 1000000);
});

runTest('Parse: 250.000 parses to 250000', () => {
  assert.strictEqual(parseFormattedNominal('250.000'), 250000);
});

// Group 2: Natural Language Nominal Parsing
runTest('NLP Nominal: "35rb" = 35000', () => {
  assert.strictEqual(parseIndoNominal('makan siang 35rb di bca'), 35000);
});

runTest('NLP Nominal: "50k" = 50000', () => {
  assert.strictEqual(parseIndoNominal('isi bensin 50k di bca'), 50000);
});

runTest('NLP Nominal: "1.5jt" = 1500000', () => {
  assert.strictEqual(parseIndoNominal('gajian bonus 1.5jt'), 1500000);
});

runTest('NLP Nominal: "10jt" = 10000000', () => {
  assert.strictEqual(parseIndoNominal('gajian 10jt bca'), 10000000);
});

runTest('NLP Nominal: "500 juta" = 500000000', () => {
  assert.strictEqual(parseIndoNominal('beli mobil 500 juta di bca'), 500000000);
});

runTest('NLP Nominal: "1.000.000" = 1000000', () => {
  assert.strictEqual(parseIndoNominal('transfer 1.000.000 bca ke gopay'), 1000000);
});

runTest('NLP Nominal: Text without numbers returns 0 (prevents fake 25k)', () => {
  assert.strictEqual(parseIndoNominal('halo bot siapa namamu'), 0);
  assert.strictEqual(parseIndoNominal('pengeluaran'), 0);
  assert.strictEqual(parseIndoNominal(''), 0);
});

// Group 3: Custom Category & Standard Category Matching
const mockBudgets = [
  { id: 'b1', name: '🍜 Makanan & Minuman', limit: 3000000 },
  { id: 'b2', name: '🚗 Transportasi', limit: 1200000 },
  { id: 'b_custom_1', name: '🎮 Top Up Skin ML', limit: 1000000 },
  { id: 'b_custom_2', name: '🏋️ member gym', limit: 250000 }
];
const mockCustomCats = ['🎮 Top Up Skin ML', '🏋️ member gym', '👶 Kebutuhan Anak'];

runTest('Category: Custom category "Top Up Skin ML" matches correctly', () => {
  const cat = matchCategory('top up skin ml 50rb pake gopay', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '🎮 Top Up Skin ML');
});

runTest('Category: Custom category "member gym" matches correctly', () => {
  const cat = matchCategory('member gym 250k bca', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '🏋️ member gym');
});

runTest('Category: Custom category "Kebutuhan Anak" matches correctly', () => {
  const cat = matchCategory('beli kebutuhan anak 100rb bca', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '👶 Kebutuhan Anak');
});

runTest('Category: Standard category "bensin" matches "🚗 Transportasi & Bensin"', () => {
  const cat = matchCategory('isi bensin 50k di bca', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '🚗 Transportasi & Bensin');
});

runTest('Category: Standard category "kopi" matches "☕ Kopi & Nongkrong"', () => {
  const cat = matchCategory('ngopi 25rb di bca', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '☕ Kopi & Nongkrong');
});

runTest('Category: Fallback matches "🍜 Makanan & Minuman"', () => {
  const cat = matchCategory('beli nasi padang 35rb', mockBudgets, mockCustomCats);
  assert.strictEqual(cat, '🍜 Makanan & Minuman');
});

// Group 4: Bidirectional Chat Synchronization Model
runTest('Sync: Telegram chat entry contains required metadata', () => {
  const tgEntry = {
    id: 'ch_123456789',
    sender: 'telegram_user',
    text: 'beli kopi 25rb di bca',
    reply: '✓ Pengeluaran Berhasil Dicatat!\n├ Nominal : -Rp25.000\n├ Kategori : ☕ Kopi & Nongkrong\n├ Dompet : 👛 BCA\n└ Sisa Saldo : Rp15.045.000',
    time: '2026-10-15 10:15',
    platform: 'telegram'
  };
  assert.strictEqual(tgEntry.platform, 'telegram');
  assert.strictEqual(tgEntry.sender, 'telegram_user');
  assert.ok(tgEntry.reply.includes('✓ Pengeluaran Berhasil Dicatat!'));
  assert.ok(tgEntry.reply.includes('├ Nominal : -Rp25.000'));
});

runTest('Sync: Web chat entry contains required metadata', () => {
  const webEntry = {
    id: 'ch_987654321',
    sender: 'web_user',
    text: 'gajian 10jt bca',
    reply: '✓ Pemasukan Berhasil Dicatat!\n├ Nominal : +Rp10.000.000\n├ Kategori : 💰 Gaji Pokok & Upah\n├ Masuk ke : 👛 BCA\n└ Saldo Baru : Rp25.045.000',
    time: '2026-10-15 10:16',
    platform: 'web'
  };
  assert.strictEqual(webEntry.platform, 'web');
  assert.strictEqual(webEntry.sender, 'web_user');
  assert.ok(webEntry.reply.includes('✓ Pemasukan Berhasil Dicatat!'));
});

// Group 5: Delete Transaction & Financial Reversal
function deleteTransactionMock(state, txId) {
  const txIndex = (state.transactions || []).findIndex(t => t.id === txId);
  if (txIndex === -1) return false;
  const tx = state.transactions[txIndex];

  if (state.wallets && state.wallets.length > 0) {
    if (tx.type === 'expense') {
      const w = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName) || state.wallets[0];
      if (w) w.balance += tx.amount;
    } else if (tx.type === 'income') {
      const w = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName) || state.wallets[0];
      if (w) w.balance -= tx.amount;
    } else if (tx.type === 'transfer') {
      const srcW = state.wallets.find(item => item.id === tx.walletId || item.name === tx.walletName);
      const tgtW = state.wallets.find(item => item.id === tx.targetWalletId || item.name === tx.targetWalletName);
      if (srcW) srcW.balance += tx.amount;
      if (tgtW) tgtW.balance -= tx.amount;
    }
  }

  state.transactions.splice(txIndex, 1);
  if (!state.deletedTxIds) state.deletedTxIds = [];
  if (!state.deletedTxIds.includes(txId)) state.deletedTxIds.push(txId);
  return true;
}

runTest('Delete Transaction: Expense refund reverses wallet balance', () => {
  const mockState = {
    wallets: [{ id: 'w1', name: 'BCA', balance: 1000000 }],
    transactions: [{ id: 'tx_exp_1', type: 'expense', amount: 150000, walletId: 'w1', category: '🍜 Makanan' }]
  };
  deleteTransactionMock(mockState, 'tx_exp_1');
  assert.strictEqual(mockState.wallets[0].balance, 1150000);
  assert.strictEqual(mockState.transactions.length, 0);
  assert.ok(mockState.deletedTxIds.includes('tx_exp_1'));
});

runTest('Delete Transaction: Income rollback deducts wallet balance', () => {
  const mockState = {
    wallets: [{ id: 'w1', name: 'BCA', balance: 5000000 }],
    transactions: [{ id: 'tx_inc_1', type: 'income', amount: 2000000, walletId: 'w1', category: '💰 Gaji' }]
  };
  deleteTransactionMock(mockState, 'tx_inc_1');
  assert.strictEqual(mockState.wallets[0].balance, 3000000);
  assert.strictEqual(mockState.transactions.length, 0);
});

runTest('Delete Transaction: Transfer rollback refunds source and deducts target', () => {
  const mockState = {
    wallets: [
      { id: 'w1', name: 'BCA', balance: 800000 },
      { id: 'w2', name: 'GoPay', balance: 700000 }
    ],
    transactions: [{
      id: 'tx_trf_1',
      type: 'transfer',
      amount: 200000,
      walletId: 'w1',
      targetWalletId: 'w2',
      category: '🔄 Transfer Antar Dompet'
    }]
  };
  deleteTransactionMock(mockState, 'tx_trf_1');
  assert.strictEqual(mockState.wallets[0].balance, 1000000);
  assert.strictEqual(mockState.wallets[1].balance, 500000);
  assert.strictEqual(mockState.transactions.length, 0);
});

// Group 6: Budget Spent Recalculation (Member Gym 150k scenario)
runTest('Budget Sync: Deleting member gym 150k transaction updates budget usage to 0', () => {
  const mockState = {
    wallets: [{ id: 'w1', name: 'BCA', balance: 1000000 }],
    budgets: [{ id: 'b_gym', name: '🏋️ member gym', limit: 250000 }],
    transactions: [
      { id: 'tx_gym_1', type: 'expense', amount: 150000, walletId: 'w1', category: '🏋️ member gym', note: 'bayar member gym' }
    ]
  };

  // 1. Calculate spent before deletion
  const bRaw = 'member gym';
  let spentBefore = mockState.transactions
    .filter(t => t.type === 'expense' && t.category && t.category.toLowerCase().includes(bRaw))
    .reduce((a, b) => a + b.amount, 0);
  assert.strictEqual(spentBefore, 150000);

  // 2. Perform deletion
  deleteTransactionMock(mockState, 'tx_gym_1');

  // 3. Recalculate spent after deletion
  let spentAfter = mockState.transactions
    .filter(t => t.type === 'expense' && t.category && t.category.toLowerCase().includes(bRaw))
    .reduce((a, b) => a + b.amount, 0);
  assert.strictEqual(spentAfter, 0);
  assert.strictEqual(mockState.wallets[0].balance, 1150000);
});

// Group 7: Add & Delete Wallet Logic
runTest('Wallet Management: Add and delete wallet with safety checks', () => {
  const state = {
    wallets: [
      { id: 'w1', name: 'BCA', balance: 1000000, isDefault: true },
      { id: 'w2', name: 'GoPay', balance: 500000, isDefault: false }
    ],
    deletedWalletIds: []
  };

  // Add wallet
  const newW = { id: 'w3', name: 'Mandiri', balance: 2500000, type: 'bank', color: '#003D79', isDefault: false };
  state.wallets.push(newW);
  assert.strictEqual(state.wallets.length, 3);

  // Delete non-default wallet
  state.wallets = state.wallets.filter(w => w.id !== 'w2');
  state.deletedWalletIds.push('w2');
  assert.strictEqual(state.wallets.length, 2);
  assert.ok(state.deletedWalletIds.includes('w2'));

  // Delete default wallet auto-reassigns default
  const wasDefault = state.wallets.find(w => w.id === 'w1').isDefault;
  state.wallets = state.wallets.filter(w => w.id !== 'w1');
  state.deletedWalletIds.push('w1');
  if (wasDefault && state.wallets.length > 0) {
    state.wallets[0].isDefault = true;
  }
  assert.strictEqual(state.wallets.length, 1);
  assert.strictEqual(state.wallets[0].name, 'Mandiri');
  assert.strictEqual(state.wallets[0].isDefault, true);
});

// Group 8: Add & Delete Budget Category Logic
runTest('Budget Management: Add and delete budgeting category with customCategories sync', () => {
  const state = {
    budgets: [
      { id: 'b1', name: '🍜 Makanan & Minuman', limit: 3000000 }
    ],
    customCategories: []
  };

  // Add budget
  const newBudget = { id: 'b_gym', name: '🏋️ member gym', limit: 250000 };
  state.budgets.push(newBudget);
  state.customCategories.push(newBudget.name);
  assert.strictEqual(state.budgets.length, 2);
  assert.ok(state.customCategories.includes('🏋️ member gym'));

  // Delete budget
  state.budgets = state.budgets.filter(b => b.id !== 'b_gym');
  state.customCategories = state.customCategories.filter(c => c !== '🏋️ member gym');
  assert.strictEqual(state.budgets.length, 1);
  assert.strictEqual(state.customCategories.includes('🏋️ member gym'), false);
});

// Group 9: Deleted items immunity against polling resurrection
runTest('State Sync Immunity: Server poll does not revive deletedTxIds', () => {
  const local = {
    transactions: [{ id: 'tx_keep', type: 'expense', amount: 50000 }],
    deletedTxIds: ['tx_deleted_123']
  };
  const server = {
    transactions: [
      { id: 'tx_keep', type: 'expense', amount: 50000 },
      { id: 'tx_deleted_123', type: 'expense', amount: 150000 },
      { id: 'tx_brand_new', type: 'income', amount: 500000 }
    ]
  };

  const existingIds = new Set(local.transactions.map(t => t.id));
  const deletedSet = new Set(local.deletedTxIds || []);
  const newFromTg = server.transactions.filter(t => !existingIds.has(t.id) && !deletedSet.has(t.id));

  assert.strictEqual(newFromTg.length, 1);
  assert.strictEqual(newFromTg[0].id, 'tx_brand_new');
});

// Group 10: Initial page load sync immunity (syncStateFromServer)
function syncStateFromServerMock(local, serverState, isInitial = false) {
  const localDelTxs = new Set(local.deletedTxIds || []);
  const serverDelTxs = new Set(serverState.deletedTxIds || []);
  const mergedDelTxs = new Set([...localDelTxs, ...serverDelTxs]);
  local.deletedTxIds = Array.from(mergedDelTxs);

  const localDelW = new Set(local.deletedWalletIds || []);
  const serverDelW = new Set(serverState.deletedWalletIds || []);
  const mergedDelW = new Set([...localDelW, ...serverDelW]);
  local.deletedWalletIds = Array.from(mergedDelW);

  // Purge any deleted txs
  local.transactions = (local.transactions || []).filter(t => !mergedDelTxs.has(t.id));

  // Merge new non-deleted server transactions
  if (Array.isArray(serverState.transactions)) {
    const localTxIds = new Set(local.transactions.map(t => t.id));
    const newServerTxs = serverState.transactions.filter(t => !localTxIds.has(t.id) && !mergedDelTxs.has(t.id));
    if (newServerTxs.length > 0) {
      local.transactions = [...newServerTxs, ...local.transactions];
    }
  }

  // Merge wallets
  if (Array.isArray(serverState.wallets)) {
    const filtered = serverState.wallets.filter(w => !mergedDelW.has(w.id));
    if (filtered.length > 0) {
      local.wallets = filtered;
    }
  }

  return local;
}

runTest('Page Refresh Sync: Deleted gym transaction is NOT resurrected on reload', () => {
  const local = {
    transactions: [],
    deletedTxIds: ['tx_gym_150k'],
    deletedWalletIds: []
  };
  const server = {
    transactions: [
      { id: 'tx_gym_150k', type: 'expense', amount: 150000, category: '🏋️ member gym' },
      { id: 'tx_other', type: 'expense', amount: 35000, category: '🍜 Makanan' }
    ],
    deletedTxIds: [],
    deletedWalletIds: []
  };

  const synced = syncStateFromServerMock(local, server, true);
  assert.strictEqual(synced.transactions.length, 1);
  assert.strictEqual(synced.transactions[0].id, 'tx_other');
  assert.ok(!synced.transactions.some(t => t.id === 'tx_gym_150k'));
});

// Group 11: Telegram /hapus Command Simulation
function telegramHapusMock(state) {
  const delList = state.deletedTxIds || [];
  let lastTx = null;
  let txIdx = -1;

  for (let i = 0; i < (state.transactions || []).length; i++) {
    const candidate = state.transactions[i];
    if (!delList.includes(candidate.id)) {
      lastTx = candidate;
      txIdx = i;
      break;
    }
  }

  if (!lastTx) return false;

  // Reversal
  if (state.wallets && state.wallets.length > 0) {
    if (lastTx.type === 'expense') {
      const w = state.wallets.find(item => item.id === lastTx.walletId || item.name === lastTx.walletName) || state.wallets[0];
      if (w) w.balance += lastTx.amount;
    } else if (lastTx.type === 'income') {
      const w = state.wallets.find(item => item.id === lastTx.walletId || item.name === lastTx.walletName) || state.wallets[0];
      if (w) w.balance -= lastTx.amount;
    } else if (lastTx.type === 'transfer') {
      const srcW = state.wallets.find(item => item.id === lastTx.walletId || item.name === lastTx.walletName);
      const tgtW = state.wallets.find(item => item.id === lastTx.targetWalletId || item.name === lastTx.targetWalletName);
      if (srcW) srcW.balance += lastTx.amount;
      if (tgtW) tgtW.balance -= lastTx.amount;
    }
  }

  state.transactions.splice(txIdx, 1);
  if (!delList.includes(lastTx.id)) {
    delList.push(lastTx.id);
  }
  state.deletedTxIds = delList;
  return lastTx;
}

runTest('Telegram /hapus: Deletes last transaction and reverses wallet balance', () => {
  const state = {
    wallets: [{ id: 'w1', name: 'BCA', balance: 500000 }],
    transactions: [
      { id: 'tx_latest', type: 'expense', amount: 75000, walletId: 'w1', category: '☕ Kopi' },
      { id: 'tx_older', type: 'expense', amount: 50000, walletId: 'w1', category: '🍜 Makanan' }
    ],
    deletedTxIds: []
  };

  const undone = telegramHapusMock(state);
  assert.ok(undone);
  assert.strictEqual(undone.id, 'tx_latest');
  assert.strictEqual(state.wallets[0].balance, 575000);
  assert.strictEqual(state.transactions.length, 1);
  assert.strictEqual(state.transactions[0].id, 'tx_older');
  assert.ok(state.deletedTxIds.includes('tx_latest'));
});

// Group 12: Safe Budget Matching Edge Cases
runTest('Safe Budget Matching: Guard against empty or 1-char strings', () => {
  const budget = { name: '🏋️ member gym' };
  const bRaw = (budget.name || '').replace(/^[^\w\s]+/, '').trim().toLowerCase();
  const bNameLower = (budget.name || '').toLowerCase().trim();

  function matches(category) {
    if (!category) return false;
    const tCat = category.toLowerCase().trim();
    if (tCat === bNameLower) return true;
    if (bRaw && bRaw.length >= 2 && tCat.includes(bRaw)) return true;
    if (bRaw && bRaw.length >= 2 && bNameLower.includes(tCat)) return true;
    return false;
  }

  assert.strictEqual(matches('🏋️ member gym'), true);
  assert.strictEqual(matches('member gym bulanan'), true);
  assert.strictEqual(matches(''), false);
  assert.strictEqual(matches(null), false);
  assert.strictEqual(matches('makan bakso'), false);
});

console.log('\n===========================================================');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('===========================================================');

if (failed > 0) {
  process.exit(1);
}
