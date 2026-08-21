import ExcelJS from 'exceljs'
import type { Attendance, Member } from '@/types'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const STATUS_MAP: Record<string, string> = {
  present: 'Hadir',
  absent: 'Absen',
  holiday: 'Libur',
}

export async function exportAttendanceExcel(
  members: Member[],
  attendance: Attendance[],
  startDate: string,
  endDate: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Worksphere'
  workbook.created = new Date()

  // Sheet 1: Data Absensi
  const sheet1 = workbook.addWorksheet('Data Absensi')

  sheet1.columns = [
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Nama', key: 'name', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Keterangan', key: 'note', width: 25 },
  ]

  // Style header
  sheet1.getRow(1).font = { bold: true }
  sheet1.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '6366F1' },
  }
  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }

  // Sort attendance by date then name
  const sorted = [...attendance].sort((a, b) => {
    if (a.attendance_date !== b.attendance_date) {
      return a.attendance_date.localeCompare(b.attendance_date)
    }
    const memberA = members.find(m => m.id === a.member_id)
    const memberB = members.find(m => m.id === b.member_id)
    return (memberA?.name ?? '').localeCompare(memberB?.name ?? '')
  })

  for (const record of sorted) {
    const member = members.find(m => m.id === record.member_id)
    sheet1.addRow({
      date: format(parseISO(record.attendance_date), 'd MMMM yyyy', { locale: id }),
      name: member?.name ?? '-',
      status: STATUS_MAP[record.status] ?? record.status,
      note: record.note ?? '',
    })
  }

  // Sheet 2: Rekap Mingguan
  const sheet2 = workbook.addWorksheet('Rekap Mingguan')

  sheet2.columns = [
    { header: 'Nama', key: 'name', width: 20 },
    { header: 'Hadir', key: 'present', width: 10 },
    { header: 'Absen', key: 'absent', width: 10 },
    { header: 'Libur', key: 'holiday', width: 10 },
  ]

  sheet2.getRow(1).font = { bold: true }
  sheet2.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '6366F1' },
  }
  sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }

  const activeMembers = members.filter(m => m.is_active)
  for (const member of activeMembers) {
    const memberAttendance = attendance.filter(a => a.member_id === member.id)
    sheet2.addRow({
      name: member.name,
      present: memberAttendance.filter(a => a.status === 'present').length,
      absent: memberAttendance.filter(a => a.status === 'absent').length,
      holiday: memberAttendance.filter(a => a.status === 'holiday').length,
    })
  }

  // Save
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `absensi-${startDate}-${endDate}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
