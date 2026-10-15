/**
 * WIB (Asia/Jakarta, UTC+7) Date and Time Utilities for TataDana
 */

const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

/**
 * Returns current Date adjusted to WIB
 */
export function getNowWIB(): Date {
  const now = new Date();
  // Adjust to UTC+7
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
}

/**
 * Format date into WIB header string:
 * "Senin, 13 Oktober 2026 — 14:35 WIB"
 */
export function formatTelegramReplyDate(date: Date = getNowWIB()): string {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const dayDate = date.getDate();
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `📅 ${dayName}, ${dayDate} ${monthName} ${year} — ${hours}:${minutes} WIB`;
}

/**
 * Format standard date: "13 Okt 2026"
 */
export function formatIndoShortDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()]?.slice(0, 3) || '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format full date: "13 Oktober 2026"
 */
export function formatIndoLongDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const day = d.getDate();
  const month = INDONESIAN_MONTHS[d.getMonth()] || '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Returns YYYY-MM string in WIB (e.g. '2026-10')
 */
export function getCurrentMonthPeriodWIB(): string {
  const d = getNowWIB();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns YYYY-MM-DD string in WIB (e.g. '2026-10-13')
 */
export function getCurrentDateStringWIB(): string {
  const d = getNowWIB();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Format time to HH:mm WIB
 */
export function formatIndoTime(timeStr?: string): string {
  if (!timeStr) {
    const d = getNowWIB();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]} WIB`;
  }
  return `${timeStr} WIB`;
}
