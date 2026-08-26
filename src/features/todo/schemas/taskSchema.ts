import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'completed', 'cancelled'])
export const taskPrioritySchema = z.enum(['urgent', 'high', 'medium', 'low'])
export const taskTimeframeSchema = z.enum(['daily', 'weekly', 'yearly'])

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Judul tugas wajib diisi.').max(200, 'Judul terlalu panjang.'),
  description: z.string().trim().max(2000, 'Deskripsi terlalu panjang.').optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  timeframe: taskTimeframeSchema.default('daily').optional(),
  category: z.string().trim().max(50, 'Kategori terlalu panjang.').optional(),
  due_date: z.string().nullable().optional(),
  reminder_at: z.string().nullable().optional(),
})

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul tugas wajib diisi.')
    .max(200, 'Judul terlalu panjang.')
    .optional(),
  description: z.string().trim().max(2000, 'Deskripsi terlalu panjang.').nullable().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  timeframe: taskTimeframeSchema.optional(),
  category: z.string().trim().max(50, 'Kategori terlalu panjang.').nullable().optional(),
  due_date: z.string().nullable().optional(),
  reminder_at: z.string().nullable().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
