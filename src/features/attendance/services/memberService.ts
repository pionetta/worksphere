import * as memberRepo from '@/features/attendance/repositories/memberRepository'
import * as attendanceRepo from '@/features/attendance/repositories/attendanceRepository'
import { createMemberSchema, updateMemberSchema } from '@/features/attendance/schemas/memberSchema'
import { validate } from '@/lib/validation'
import type { Member } from '@/types'

export async function getActiveMembers(userId: string): Promise<Member[]> {
  return memberRepo.listActiveMembers(userId)
}

export async function getAllMembers(userId: string): Promise<Member[]> {
  return memberRepo.listMembers(userId)
}

export async function addMember(
  userId: string,
  name: string,
  note: string | null
): Promise<string> {
  const data = validate(createMemberSchema, { name, note: note ?? undefined })

  return memberRepo.createMember({
    user_id: userId,
    name: data.name,
    note: data.note ?? null,
    is_active: true,
  })
}

export async function editMember(
  id: string,
  data: Partial<Pick<Member, 'name' | 'note' | 'is_active'>>
): Promise<void> {
  const parsed = validate(updateMemberSchema, {
    name: data.name,
    note: data.note ?? undefined,
  })

  const updateData: Partial<Pick<Member, 'name' | 'note' | 'is_active'>> = {}
  if (parsed.name !== undefined) updateData.name = parsed.name
  if (data.note !== undefined) updateData.note = parsed.note ?? null
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  return memberRepo.updateMember(id, updateData)
}

export async function deactivateMember(id: string): Promise<void> {
  return memberRepo.updateMember(id, { is_active: false })
}

export async function activateMember(id: string): Promise<void> {
  return memberRepo.updateMember(id, { is_active: true })
}

export async function removeMember(id: string): Promise<void> {
  const member = await memberRepo.getMemberById(id)
  if (!member) return

  const history = await attendanceRepo.listAttendanceByMember(member.user_id, id)
  if (history.length > 0) {
    throw new Error('Anggota memiliki riwayat absensi dan tidak dapat dihapus.')
  }

  return memberRepo.deleteMember(id)
}
