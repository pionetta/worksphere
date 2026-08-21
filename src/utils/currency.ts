/**
 * Format angka ke format mata uang IDR.
 * Nominal disimpan sebagai integer (tidak ada decimal untuk IDR).
 *
 * @example
 * formatCurrency(100000) // "Rp100.000"
 * formatCurrency(1500000) // "Rp1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('Rp\u00A0', 'Rp') // hapus non-breaking space
}

/**
 * Format angka ke string nominal tanpa simbol mata uang.
 *
 * @example
 * formatAmount(100000) // "100.000"
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse string nominal ke integer.
 * Menghapus karakter non-digit sebelum parsing.
 *
 * @example
 * parseAmount("100.000") // 100000
 * parseAmount("Rp1.500.000") // 1500000
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}
