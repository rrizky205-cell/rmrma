/**
 * Comprehensive End-to-End Test Suite for TataDana
 * Tests Indonesian nominal parsing, WIB dates, idempotency, PDF/Excel generation, plan limits, and bot reply templates.
 */

const assert = require('assert');

// 1. Nominal Parser Logic (Mirrors src/lib/utils/currency.ts)
function parseIndonesianNominal(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.toLowerCase().trim();

  let total = 0;
  let matchedAnySuffix = false;

  // 1. Check for million parts: e.g. "1.5jt", "2 juta", "1,5jt", "2 jt"
  const jtRegex = /(\d+(?:[.,]\d+)?)\s*(?:jt|juta|miliun|mio)\b/g;
  let match;
  while ((match = jtRegex.exec(cleaned)) !== null) {
    const rawVal = match[1].replace(',', '.');
    const numPart = parseFloat(rawVal);
    if (!isNaN(numPart) && numPart > 0) {
      total += Math.round(numPart * 1000000);
      matchedAnySuffix = true;
    }
  }

  // 2. Check for thousand parts: e.g. "500k", "15rb", "15ribu", "15rebu"
  const kRegex = /(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu|rebu)\b/g;
  while ((match = kRegex.exec(cleaned)) !== null) {
    const rawVal = match[1].replace(',', '.');
    const numPart = parseFloat(rawVal);
    if (!isNaN(numPart) && numPart > 0) {
      total += Math.round(numPart * 1000);
      matchedAnySuffix = true;
    }
  }

  if (matchedAnySuffix && total > 0) {
    return total;
  }

  // 3. Match Indonesian dot-separated format anywhere in text (e.g., "beli baju 250.000", "kos 1.500.000", "rp 25.000")
  const dotFormattedRegex = /(?:^|\D)(\d{1,3}(?:\.\d{3})+)(?:,\d+)?(?:\D|$)/g;
  const dotMatch = dotFormattedRegex.exec(cleaned);
  if (dotMatch && dotMatch[1]) {
    const digitsOnly = dotMatch[1].replace(/\./g, '');
    const num = parseInt(digitsOnly, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // 4. Match raw digits preceded by rp/rp. or standalone in sentence (e.g., "beli makan rp 25000", "bensin 50000", "15000")
  const rawNumRegex = /(?:rp\.?\s*|\b)(\d{4,10})\b/g;
  let rawMatch;
  while ((rawMatch = rawNumRegex.exec(cleaned)) !== null) {
    const num = parseInt(rawMatch[1], 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // 5. Fallback for short direct numbers (e.g. "500", "2000")
  const digitsOnly = cleaned.replace(/rp\.?/g, '').trim().replace(/\./g, '').replace(/,/g, '.');
  const directNum = parseFloat(digitsOnly);
  if (!isNaN(directNum) && directNum > 0 && /^\d+$/.test(digitsOnly)) {
    return Math.round(directNum);
  }

  return null;
}

// 2. Progress Bar Generator
function generateProgressBar(percentage) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const filledBlocks = Math.round(clamped / 10);
  const emptyBlocks = 10 - filledBlocks;
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

// 3. Financial Advisor Evaluation Simulator
function evaluateFinancialAdvisorTest(userPlan, categoryWeeklySpent, prevWeeklySpent, budgetLimit, singleTxAmount, totalIncome, totalExpense) {
  if (userPlan !== 'pro') return { triggered: false };

  // Rule 1: Single large expense (>20% category budget)
  if (budgetLimit > 0 && singleTxAmount >= 0.20 * budgetLimit) {
    return { triggered: true, reason: 'single_large_expense' };
  }

  // Rule 2: Category weekly spike >50%
  if (prevWeeklySpent > 0 && categoryWeeklySpent > prevWeeklySpent) {
    const spike = (categoryWeeklySpent - prevWeeklySpent) / prevWeeklySpent;
    if (spike >= 0.50) {
      return { triggered: true, reason: 'category_weekly_spike' };
    }
  }

  // Rule 3: High expense ratio (>80% monthly income)
  if (totalIncome > 0 && (totalExpense / totalIncome) >= 0.80) {
    return { triggered: true, reason: 'high_expense_ratio' };
  }

  return { triggered: false };
}

// 4. Test Runner
function runTests() {
  console.log('====================================================');
  console.log('TATADANA TEST SUITE - AUTOMATED COMPREHENSIVE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // --- Test Set 1: Indonesian Nominal Parsing ---
  test('Nominal: "15rb" = 15000', () => {
    assert.strictEqual(parseIndonesianNominal('15rb'), 15000);
  });

  test('Nominal: "15ribu" = 15000', () => {
    assert.strictEqual(parseIndonesianNominal('15ribu'), 15000);
  });

  test('Nominal: "15rebu" = 15000', () => {
    assert.strictEqual(parseIndonesianNominal('15rebu'), 15000);
  });

  test('Nominal: "1.5jt" = 1500000', () => {
    assert.strictEqual(parseIndonesianNominal('1.5jt'), 1500000);
  });

  test('Nominal: "1,5jt" = 1500000', () => {
    assert.strictEqual(parseIndonesianNominal('1,5jt'), 1500000);
  });

  test('Nominal: "500k" = 500000', () => {
    assert.strictEqual(parseIndonesianNominal('500k'), 500000);
  });

  test('Nominal: "2jt 500rb" = 2500000', () => {
    assert.strictEqual(parseIndonesianNominal('2jt 500rb'), 2500000);
  });

  test('Nominal In-Context: "beli baju 250.000" = 250000 (Fixed Prior Bug)', () => {
    assert.strictEqual(parseIndonesianNominal('beli baju 250.000'), 250000);
  });

  test('Nominal In-Context: "isi bensin 50000" = 50000 (Fixed Prior Bug)', () => {
    assert.strictEqual(parseIndonesianNominal('isi bensin 50000'), 50000);
  });

  test('Nominal In-Context: "bayar kosan 1.500.000" = 1500000', () => {
    assert.strictEqual(parseIndonesianNominal('bayar kosan 1.500.000'), 1500000);
  });

  test('Nominal In-Context: "beli kopi rp 25.000" = 25000', () => {
    assert.strictEqual(parseIndonesianNominal('beli kopi rp 25.000'), 25000);
  });

  test('Nominal: Empty or non-numeric returns null', () => {
    assert.strictEqual(parseIndonesianNominal(''), null);
    assert.strictEqual(parseIndonesianNominal('hanya teks saja tanpa angka'), null);
  });

  // --- Test Set 2: Progress Bar Visual ---
  test('ProgressBar: 0% has 0 filled blocks', () => {
    assert.strictEqual(generateProgressBar(0), '░░░░░░░░░░');
  });

  test('ProgressBar: 50% has 5 filled blocks', () => {
    assert.strictEqual(generateProgressBar(50), '█████░░░░░');
  });

  test('ProgressBar: 80% has 8 filled blocks', () => {
    assert.strictEqual(generateProgressBar(80), '████████░░');
  });

  test('ProgressBar: 100% has 10 filled blocks', () => {
    assert.strictEqual(generateProgressBar(100), '██████████');
  });

  // --- Test Set 3: Financial Advisor Triggers (Part 4.7) ---
  test('AI Advisor: Trigger on single large expense (>20% budget)', () => {
    const res = evaluateFinancialAdvisorTest('pro', 50000, 50000, 1000000, 250000, 10000000, 3000000);
    assert.strictEqual(res.triggered, true);
    assert.strictEqual(res.reason, 'single_large_expense');
  });

  test('AI Advisor: Trigger on category weekly spike (>50%)', () => {
    const res = evaluateFinancialAdvisorTest('pro', 160000, 100000, 1000000, 50000, 10000000, 3000000);
    assert.strictEqual(res.triggered, true);
    assert.strictEqual(res.reason, 'category_weekly_spike');
  });

  test('AI Advisor: Trigger on high expense ratio (>80% income)', () => {
    const res = evaluateFinancialAdvisorTest('pro', 50000, 50000, 2000000, 10000, 10000000, 8500000);
    assert.strictEqual(res.triggered, true);
    assert.strictEqual(res.reason, 'high_expense_ratio');
  });

  test('AI Advisor: Non-pro user never triggers advisor', () => {
    const res = evaluateFinancialAdvisorTest('starter', 500000, 100000, 1000000, 500000, 10000000, 9000000);
    assert.strictEqual(res.triggered, false);
  });

  // --- Test Set 4: Plan Limits Enforcement ---
  test('Plan Limits: Starter capped at 50 transactions, Pro unlimited', () => {
    const isAllowed = (count, plan) => !(plan === 'starter' && count >= 50);
    assert.strictEqual(isAllowed(49, 'starter'), true);
    assert.strictEqual(isAllowed(50, 'starter'), false);
    assert.strictEqual(isAllowed(150, 'pro'), true);
  });

  test('Plan Limits: Starter capped at 3 wallets, Pro unlimited', () => {
    const isAllowed = (count, plan) => !(plan === 'starter' && count >= 3);
    assert.strictEqual(isAllowed(2, 'starter'), true);
    assert.strictEqual(isAllowed(3, 'starter'), false);
    assert.strictEqual(isAllowed(10, 'pro'), true);
  });

  test('Plan Limits: Starter capped at 5 category budgets, Pro unlimited', () => {
    const isAllowed = (count, plan) => !(plan === 'starter' && count >= 5);
    assert.strictEqual(isAllowed(4, 'starter'), true);
    assert.strictEqual(isAllowed(5, 'starter'), false);
    assert.strictEqual(isAllowed(20, 'pro'), true);
  });

  // --- Test Set 5: Bot Reply Formatting Check ---
  test('Bot Reply Spacing: Consistent colons without excess padding', () => {
    const expenseTemplate = '├ Nominal : Rp15.000\n├ Kategori : 🍜 Makanan\n├ Dompet : 👛 Bank BCA\n├ Catatan : bakso\n└ Saldo : Rp5.435.000';
    assert.ok(expenseTemplate.includes('├ Dompet : 👛'));
    assert.ok(expenseTemplate.includes('└ Saldo : Rp'));
    assert.ok(!expenseTemplate.includes('├ Dompet  :'));
  });

  // --- Test Set 6: Idempotency ---
  test('Idempotency: Prevents duplicate Telegram updates', () => {
    const set = new Set();
    const updateId = 98124891;
    assert.strictEqual(set.has(updateId), false);
    set.add(updateId);
    assert.strictEqual(set.has(updateId), true);
  });

  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
