import { db } from '@/lib/db'
import type { Attendance, AttendanceStatus } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getAttendanceById(id: string): Promise<Attendance | undefined> {
  return db.attendance.get(id)
}

export async function getAttendanceByMemberAndDate(
  userId: string,
  memberId: string,
  date: string
): Promise<Attendance | undefined> {
  return db.attendance
    .where('[user_id+member_id+attendance_date]')
    .equals([userId, memberId, date])
    .first()
}

export async function listAttendanceByDate(userId: string, date: string): Promise<Attendance[]> {
  return db.attendance
    .where('user_id')
    .equals(userId)
    .and(a => a.attendance_date === date)
    .toArray()
}

export async function listAttendanceByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Attendance[]> {
  return db.attendance
    .where('user_id')
    .equals(userId)
    .and(a => a.attendance_date >= startDate && a.attendance_date <= endDate)
    .toArray()
}

export async function listAttendanceByMember(
  userId: string,
  memberId: string
): Promise<Attendance[]> {
  return db.attendance
    .where('user_id')
    .equals(userId)
    .and(a => a.member_id === memberId)
    .toArray()
}

export async function createAttendance(
  data: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const existing = await getAttendanceByMemberAndDate(
    data.user_id,
    data.member_id,
    data.attendance_date
  )
  if (existing) {
    throw new Error(
      `Duplikat absensi: anggota ${data.member_id} pada tanggal ${data.attendance_date} sudah ada.`
    )
  }
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.attendance.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'attendance', id, {
    id,
    user_id: data.user_id,
    member_id: data.member_id,
    attendance_date: data.attendance_date,
    status: data.status,
    note: data.note,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateAttendance(
  id: string,
  data: Partial<Pick<Attendance, 'status' | 'note'>>
): Promise<void> {
  const attendance = await db.attendance.get(id)
  if (!attendance) return

  const timestamp = now()
  await db.attendance.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(attendance.user_id, 'attendance', id, {
    ...attendance,
    ...data,
    updated_at: timestamp,
  })
}

export async function upsertAttendance(
  userId: string,
  memberId: string,
  date: string,
  status: AttendanceStatus,
  note?: string
): Promise<string> {
  const existing = await getAttendanceByMemberAndDate(userId, memberId, date)
  if (existing) {
    await updateAttendance(existing.id, { status, note })
    return existing.id
  }
  return createAttendance({
    user_id: userId,
    member_id: memberId,
    attendance_date: date,
    status,
    note: note ?? null,
  })
}

export async function deleteAttendance(id: string): Promise<void> {
  const attendance = await db.attendance.get(id)
  if (!attendance) return

  await db.attendance.delete(id)

  // Queue sync
  await queueDelete(attendance.user_id, 'attendance', id)
}
