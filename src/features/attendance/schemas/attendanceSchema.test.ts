import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  bulkAttendanceSchema,
} from './attendanceSchema'

const validUUID = '550e8400-e29b-41d4-a716-446655440000'

describe('Attendance Schemas', () => {
  describe('createAttendanceSchema', () => {
    it('should accept valid attendance', () => {
      const result = validate(createAttendanceSchema, {
        member_id: validUUID,
        attendance_date: '2026-08-20',
        status: 'present',
      })
      expect(result.status).toBe('present')
    })

    it('should accept all valid statuses', () => {
      for (const status of ['present', 'absent', 'holiday']) {
        const result = validate(createAttendanceSchema, {
          member_id: validUUID,
          attendance_date: '2026-08-20',
          status,
        })
        expect(result.status).toBe(status)
      }
    })

    it('should reject invalid status', () => {
      expect(() =>
        validate(createAttendanceSchema, {
          member_id: validUUID,
          attendance_date: '2026-08-20',
          status: 'late',
        })
      ).toThrow('Status absensi tidak valid.')
    })

    it('should reject empty member_id', () => {
      expect(() =>
        validate(createAttendanceSchema, {
          member_id: '',
          attendance_date: '2026-08-20',
          status: 'present',
        })
      ).toThrow('ID tidak valid.')
    })

    it('should reject invalid date format', () => {
      expect(() =>
        validate(createAttendanceSchema, {
          member_id: validUUID,
          attendance_date: '20-08-2026',
          status: 'present',
        })
      ).toThrow()
    })

    it('should reject non-existent date', () => {
      expect(() =>
        validate(createAttendanceSchema, {
          member_id: validUUID,
          attendance_date: '2026-02-30',
          status: 'present',
        })
      ).toThrow('Tanggal tidak valid.')
    })

    it('should accept note', () => {
      const result = validate(createAttendanceSchema, {
        member_id: validUUID,
        attendance_date: '2026-08-20',
        status: 'absent',
        note: 'Sakit',
      })
      expect(result.note).toBe('Sakit')
    })
  })

  describe('updateAttendanceSchema', () => {
    it('should accept valid status update', () => {
      const result = validate(updateAttendanceSchema, { status: 'holiday' })
      expect(result.status).toBe('holiday')
    })

    it('should accept empty update', () => {
      const result = validate(updateAttendanceSchema, {})
      expect(result).toEqual({})
    })

    it('should reject invalid status on update', () => {
      expect(() => validate(updateAttendanceSchema, { status: 'late' })).toThrow()
    })
  })

  describe('bulkAttendanceSchema', () => {
    it('should accept valid bulk attendance', () => {
      const result = validate(bulkAttendanceSchema, {
        date: '2026-08-20',
        entries: [{ member_id: validUUID, status: 'present' }],
      })
      expect(result.entries).toHaveLength(1)
    })

    it('should reject empty entries', () => {
      expect(() =>
        validate(bulkAttendanceSchema, {
          date: '2026-08-20',
          entries: [],
        })
      ).toThrow('Minimal satu data absensi.')
    })

    it('should reject invalid entry status', () => {
      expect(() =>
        validate(bulkAttendanceSchema, {
          date: '2026-08-20',
          entries: [{ member_id: validUUID, status: 'unknown' }],
        })
      ).toThrow()
    })
  })
})
