/**
 * Currency Formatting & Indonesian Nominal String Parsing
 */

/**
 * Format number into Indonesian Rupiah format:
 * e.g. 15000 -> "Rp15.000" or "Rp 15.000"
 */
export function formatRupiah(amount: number, withSpace: boolean = false): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return withSpace ? `Rp ${formatted}` : `Rp${formatted}`;
}

/**
 * Parse Indonesian natural language nominal expressions into clean integer:
 * - "15rb" / "15ribu" / "15rebu" -> 15000
 * - "1.5jt" / "1,5jt" / "1.5 juta" -> 1500000
 * - "500k" / "500 k" -> 500000
 * - "250.000" / "250000" -> 250000
 * - "2jt 500rb" -> 2500000
 * - In-context sentences: "beli baju 250.000", "isi bensin 50000", "bayar kosan 1.500.000"
 */
export function parseIndonesianNominal(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.toLowerCase().trim();

  let total = 0;
  let matchedAnySuffix = false;

  // 1. Check for million parts: e.g. "1.5jt", "2 juta", "1,5jt", "2 jt"
  const jtRegex = /(\d+(?:[.,]\d+)?)\s*(?:jt|juta|miliun|mio)\b/g;
  let match: RegExpExecArray | null;
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
  let rawMatch: RegExpExecArray | null;
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
