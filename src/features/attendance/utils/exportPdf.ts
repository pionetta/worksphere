import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Attendance, Member } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function exportAttendancePdf(
  members: Member[],
  attendance: Attendance[],
  startDate: string,
  endDate: string
): void {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.text('Laporan Absensi', 14, 20)

  doc.setFontSize(10)
  doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 28)
  doc.text(`Dicetak: ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: id })}`, 14, 34)

  // Table data
  const activeMembers = members.filter(m => m.is_active)
  const rows = activeMembers.map(member => {
    const memberAttendance = attendance.filter(a => a.member_id === member.id)
    const present = memberAttendance.filter(a => a.status === 'present').length
    const absent = memberAttendance.filter(a => a.status === 'absent').length
    const holiday = memberAttendance.filter(a => a.status === 'holiday').length

    return [member.name, String(present), String(absent), String(holiday)]
  })

  // Add totals row
  const totalPresent = rows.reduce((sum, r) => sum + Number(r[1]), 0)
  const totalAbsent = rows.reduce((sum, r) => sum + Number(r[2]), 0)
  const totalHoliday = rows.reduce((sum, r) => sum + Number(r[3]), 0)
  rows.push(['Total', String(totalPresent), String(totalAbsent), String(totalHoliday)])

  autoTable(doc, {
    startY: 40,
    head: [['Nama', 'Hadir', 'Absen', 'Libur']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [99, 102, 241] },
  })

  doc.save(`absensi-${startDate}-${endDate}.pdf`)
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: id })
}
