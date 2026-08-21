import { z } from 'zod'
import { dateStringSchema, idSchema, optionalNoteSchema } from './shared'

export const attendanceStatusSchema = z.enum(['present', 'absent', 'holiday'], {
  message: 'Status absensi tidak valid.',
})

export const createAttendanceSchema = z.object({
  member_id: idSchema,
  attendance_date: dateStringSchema,
  status: attendanceStatusSchema,
  note: optionalNoteSchema,
})

export const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema.optional(),
  note: optionalNoteSchema,
})

export const bulkAttendanceEntrySchema = z.object({
  member_id: idSchema,
  status: attendanceStatusSchema,
  note: optionalNoteSchema,
})

export const bulkAttendanceSchema = z.object({
  date: dateStringSchema,
  entries: z.array(bulkAttendanceEntrySchema).min(1, 'Minimal satu data absensi.'),
})

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
export type BulkAttendanceEntry = z.infer<typeof bulkAttendanceEntrySchema>
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>
