/**
 * Utility untuk menggabungkan class names secara kondisional.
 * Menggunakan template literal pattern tanpa library tambahan.
 */
export function cn(...classes: Array<string | boolean | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
