import { describe, it, expect, vi } from 'vitest'
import { exportAttendanceExcel } from '@/features/attendance/utils/exportExcel'
import type { Member, Attendance } from '@/types'

const userId = 'test-export'

function makeMember(id: string, name: string): Member {
  return {
    id,
    user_id: userId,
    name,
    note: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function makeAttendance(
  memberId: string,
  date: string,
  status: 'present' | 'absent' | 'holiday'
): Attendance {
  return {
    id: `att-${memberId}-${date}`,
    user_id: userId,
    member_id: memberId,
    attendance_date: date,
    status,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('Excel Export', () => {
  it('should export Excel without errors', async () => {
    const members = [makeMember('m1', 'Anggota 1')]
    const attendance = [makeAttendance('m1', '2026-08-18', 'present')]

    const originalCreateElement = document.createElement.bind(document)
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick })
      }
      return el
    })

    await expect(
      exportAttendanceExcel(members, attendance, '2026-08-18', '2026-08-18')
    ).resolves.not.toThrow()

    vi.restoreAllMocks()
  })
})
