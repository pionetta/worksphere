import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import {
  createTaskSchema,
  updateTaskSchema,
  taskStatusSchema,
  taskPrioritySchema,
} from './taskSchema'

describe('Task Schemas', () => {
  describe('taskStatusSchema', () => {
    it('should accept all valid statuses', () => {
      for (const status of ['todo', 'in_progress', 'completed', 'cancelled']) {
        expect(taskStatusSchema.parse(status)).toBe(status)
      }
    })

    it('should reject invalid status', () => {
      expect(() => taskStatusSchema.parse('done')).toThrow()
    })
  })

  describe('taskPrioritySchema', () => {
    it('should accept all valid priorities', () => {
      for (const priority of ['urgent', 'high', 'medium', 'low']) {
        expect(taskPrioritySchema.parse(priority)).toBe(priority)
      }
    })

    it('should reject invalid priority', () => {
      expect(() => taskPrioritySchema.parse('critical')).toThrow()
    })
  })

  describe('createTaskSchema', () => {
    it('should accept valid task', () => {
      const result = validate(createTaskSchema, { title: 'Beli beras' })
      expect(result.title).toBe('Beli beras')
      expect(result.status).toBe('todo')
      expect(result.priority).toBe('medium')
    })

    it('should trim title', () => {
      const result = validate(createTaskSchema, { title: '  Beli beras  ' })
      expect(result.title).toBe('Beli beras')
    })

    it('should reject empty title', () => {
      expect(() => validate(createTaskSchema, { title: '' })).toThrow('Judul tugas wajib diisi.')
    })

    it('should reject whitespace-only title', () => {
      expect(() => validate(createTaskSchema, { title: '   ' })).toThrow('Judul tugas wajib diisi.')
    })

    it('should reject title exceeding 200 characters', () => {
      expect(() => validate(createTaskSchema, { title: 'A'.repeat(201) })).toThrow(
        'Judul terlalu panjang.'
      )
    })

    it('should accept title at exactly 200 characters', () => {
      const result = validate(createTaskSchema, { title: 'A'.repeat(200) })
      expect(result.title).toHaveLength(200)
    })

    it('should accept description', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        description: 'Beras 5kg',
      })
      expect(result.description).toBe('Beras 5kg')
    })

    it('should reject description exceeding 2000 characters', () => {
      expect(() =>
        validate(createTaskSchema, {
          title: 'Beli beras',
          description: 'A'.repeat(2001),
        })
      ).toThrow('Deskripsi terlalu panjang.')
    })

    it('should accept valid status', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        status: 'in_progress',
      })
      expect(result.status).toBe('in_progress')
    })

    it('should accept valid priority', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        priority: 'urgent',
      })
      expect(result.priority).toBe('urgent')
    })

    it('should accept category', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        category: 'Belanja',
      })
      expect(result.category).toBe('Belanja')
    })

    it('should reject category exceeding 50 characters', () => {
      expect(() =>
        validate(createTaskSchema, {
          title: 'Beli beras',
          category: 'A'.repeat(51),
        })
      ).toThrow('Kategori terlalu panjang.')
    })

    it('should accept due_date', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        due_date: '2026-08-20',
      })
      expect(result.due_date).toBe('2026-08-20')
    })

    it('should accept null due_date', () => {
      const result = validate(createTaskSchema, {
        title: 'Beli beras',
        due_date: null,
      })
      expect(result.due_date).toBeNull()
    })
  })

  describe('updateTaskSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateTaskSchema, { title: 'Updated title' })
      expect(result.title).toBe('Updated title')
    })

    it('should accept empty update', () => {
      const result = validate(updateTaskSchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty title on update', () => {
      expect(() => validate(updateTaskSchema, { title: '' })).toThrow('Judul tugas wajib diisi.')
    })

    it('should accept status change', () => {
      const result = validate(updateTaskSchema, { status: 'completed' })
      expect(result.status).toBe('completed')
    })

    it('should accept priority change', () => {
      const result = validate(updateTaskSchema, { priority: 'low' })
      expect(result.priority).toBe('low')
    })
  })
})
