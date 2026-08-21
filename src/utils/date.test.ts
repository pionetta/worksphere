import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeDate,
  formatDeadline,
  formatOverdue,
  isOverdueDate,
  getWeekRange,
  formatWeekRange,
  getMonthRange,
  formatMonthYear,
  safeParseDate,
  toISODate,
} from './date'

describe('date utilities', () => {
  const fixedDate = new Date('2026-08-18T14:30:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('should format ISO string to Indonesian date', () => {
      expect(formatDate('2026-08-18')).toBe('18 Agustus 2026')
    })

    it('should format Date object to Indonesian date', () => {
      expect(formatDate(new Date('2026-08-18T00:00:00Z'))).toBe('18 Agustus 2026')
    })
  })

  describe('formatDateTime', () => {
    it('should format Date object to Indonesian date and time', () => {
      const date = new Date('2026-08-18T14:30:00Z')
      const formatted = formatDateTime(date)
      expect(formatted).toMatch(/18 Agustus 2026, \d{2}\.30/)
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2026-08-18T14:30:00Z')
      const formatted = formatTime(date)
      expect(formatted).toMatch(/\d{2}\.30/)
    })
  })

  describe('formatRelativeDate', () => {
    it('should format today as Hari ini', () => {
      expect(formatRelativeDate(fixedDate)).toBe('Hari ini')
    })

    it('should format tomorrow as Besok', () => {
      const tomorrow = new Date('2026-08-19T14:30:00Z')
      expect(formatRelativeDate(tomorrow)).toBe('Besok')
    })

    it('should format yesterday as Kemarin', () => {
      const yesterday = new Date('2026-08-17T14:30:00Z')
      expect(formatRelativeDate(yesterday)).toBe('Kemarin')
    })

    it('should format other dates normally', () => {
      const otherDate = new Date('2026-08-25T14:30:00Z')
      expect(formatRelativeDate(otherDate)).toBe('25 Agustus 2026')
    })
  })

  describe('formatDeadline', () => {
    it('should format deadline without time', () => {
      expect(formatDeadline(fixedDate)).toBe('Hari ini')
    })

    it('should format deadline with time', () => {
      const formatted = formatDeadline(fixedDate, true)
      expect(formatted).toMatch(/Hari ini, \d{2}\.30/)
    })
  })

  describe('formatOverdue', () => {
    it('should format overdue duration', () => {
      const pastDate = new Date('2026-08-15T14:30:00Z')
      expect(formatOverdue(pastDate)).toMatch(/Terlambat 3 hari/)
    })
  })

  describe('isOverdueDate', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2026-08-17T14:30:00Z')
      expect(isOverdueDate(pastDate)).toBe(true)
    })

    it('should return false for future dates', () => {
      const futureDate = new Date('2026-08-19T14:30:00Z')
      expect(isOverdueDate(futureDate)).toBe(false)
    })
  })

  describe('getWeekRange', () => {
    it('should return correct week range starting on Monday', () => {
      const { start, end } = getWeekRange(new Date('2026-08-19T14:30:00Z')) // Wednesday
      expect(toISODate(start)).toBe('2026-08-17') // Monday
      expect(toISODate(end)).toBe('2026-08-23') // Sunday
    })
  })

  describe('formatWeekRange', () => {
    it('should format range in same month', () => {
      const start = new Date('2026-08-17T00:00:00Z')
      const end = new Date('2026-08-23T00:00:00Z')
      expect(formatWeekRange(start, end)).toBe('17–23 Agustus')
    })

    it('should format range crossing months', () => {
      const start = new Date('2026-08-31T00:00:00Z')
      const end = new Date('2026-09-06T00:00:00Z')
      expect(formatWeekRange(start, end)).toBe('31 Agt–6 Sep')
    })
  })

  describe('getMonthRange', () => {
    it('should return correct month range', () => {
      const { start, end } = getMonthRange(new Date('2026-08-15T14:30:00Z'))
      expect(toISODate(start)).toBe('2026-08-01')
      expect(toISODate(end)).toBe('2026-08-31')
    })
  })

  describe('formatMonthYear', () => {
    it('should format month and year', () => {
      expect(formatMonthYear(new Date('2026-08-15T14:30:00Z'))).toBe('Agustus 2026')
    })
  })

  describe('safeParseDate', () => {
    it('should return null for invalid inputs', () => {
      expect(safeParseDate(null)).toBeNull()
      expect(safeParseDate(undefined)).toBeNull()
      expect(safeParseDate('')).toBeNull()
      expect(safeParseDate('invalid-date')).toBeNull()
    })

    it('should return Date for valid ISO string', () => {
      const parsed = safeParseDate('2026-08-18')
      expect(parsed).toBeInstanceOf(Date)
      expect(toISODate(parsed!)).toBe('2026-08-18')
    })

    it('should return same Date object if Date passed', () => {
      const d = new Date()
      expect(safeParseDate(d)).toBe(d)
    })
  })

  describe('toISODate', () => {
    it('should format Date to YYYY-MM-DD', () => {
      const date = new Date('2026-08-18T14:30:00Z')
      expect(toISODate(date)).toBe('2026-08-18')
    })
  })
})
