import { describe, it, expect } from 'vitest'
import { createHabitSchema, updateHabitSchema, logHabitSchema } from './habitSchema'

describe('habitSchema', () => {
  it('validates and applies defaults for createHabitSchema', () => {
    const res = createHabitSchema.parse({
      title: '  Minum Air 2 Liter  ',
    })

    expect(res.title).toBe('Minum Air 2 Liter')
    expect(res.icon).toBe('🎯')
    expect(res.color).toBe('#4F46E5')
    expect(res.frequency).toBe('daily')
    expect(res.target_days).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(res.target_per_day).toBe(1)
  })

  it('rejects empty title in createHabitSchema', () => {
    expect(() =>
      createHabitSchema.parse({
        title: '   ',
      })
    ).toThrow('Judul kebiasaan wajib diisi')
  })

  it('validates logHabitSchema date and count', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    const res = logHabitSchema.parse({
      habit_id: validUuid,
      completed_date: '2026-08-30',
    })

    expect(res.habit_id).toBe(validUuid)
    expect(res.completed_date).toBe('2026-08-30')
    expect(res.count).toBe(1)
  })

  it('validates updateHabitSchema with partial values', () => {
    const res = updateHabitSchema.parse({
      title: 'Kebiasaan Baru',
      is_archived: true,
    })
    expect(res.title).toBe('Kebiasaan Baru')
    expect(res.is_archived).toBe(true)
  })
})
