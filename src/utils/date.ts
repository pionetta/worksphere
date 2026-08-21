import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format tanggal ke format Indonesia panjang.
 *
 * @example
 * formatDate('2026-08-18') // "18 Agustus 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy', { locale: id })
}

/**
 * Format tanggal + waktu ke format Indonesia.
 *
 * @example
 * formatDateTime('2026-08-18T20:00:00') // "18 Agustus 2026, 20.00"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy, HH.mm', { locale: id })
}

/**
 * Format waktu saja.
 *
 * @example
 * formatTime('2026-08-18T20:00:00') // "20.00"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH.mm', { locale: id })
}

/**
 * Format tanggal relatif dalam Bahasa Indonesia.
 * Digunakan untuk menampilkan deadline task.
 *
 * @example
 * formatRelativeDate('2026-08-18') // "Hari ini"
 * formatRelativeDate('2026-08-19') // "Besok"
 * formatRelativeDate('2026-08-17') // "Kemarin"
 * formatRelativeDate('2026-08-20') // "20 Agustus 2026"
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hari ini'
  if (isTomorrow(d)) return 'Besok'
  if (isYesterday(d)) return 'Kemarin'
  return formatDate(d)
}

/**
 * Format deadline task — relatif jika dekat, absolut jika jauh.
 */
export function formatDeadline(date: string | Date, includeTime = false): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const base = formatRelativeDate(d)
  if (!includeTime) return base
  return `${base}, ${formatTime(d)}`
}

/**
 * Format overdue — berapa hari terlambat.
 *
 * @example
 * formatOverdue('2026-08-15') // "Terlambat 3 hari"
 */
export function formatOverdue(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return `Terlambat ${formatDistanceToNow(d, { locale: id })}`
}

/**
 * Cek apakah tanggal sudah lewat.
 */
export function isOverdueDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isPast(d)
}

/**
 * Dapatkan range minggu (Senin–Minggu) dari tanggal tertentu.
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Senin
    end: endOfWeek(date, { weekStartsOn: 1 }), // Minggu
  }
}

/**
 * Format range minggu untuk tampilan UI.
 *
 * @example
 * formatWeekRange(start, end) // "11–17 Agustus" atau "28 Juli–3 Agustus"
 */
export function formatWeekRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${format(start, 'd', { locale: id })}–${format(end, 'd MMMM', { locale: id })}`
  }
  return `${format(start, 'd MMM', { locale: id })}–${format(end, 'd MMM', { locale: id })}`
}

/**
 * Dapatkan range bulan dari tanggal tertentu.
 */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

/**
 * Format nama bulan dan tahun.
 *
 * @example
 * formatMonthYear(new Date()) // "Agustus 2026"
 */
export function formatMonthYear(date: Date = new Date()): string {
  return format(date, 'MMMM yyyy', { locale: id })
}

/**
 * Konversi ISO string ke objek Date dengan aman.
 */
export function safeParseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date
  try {
    const parsed = parseISO(date)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

/**
 * Format tanggal ke ISO date string (YYYY-MM-DD) — untuk penyimpanan.
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
