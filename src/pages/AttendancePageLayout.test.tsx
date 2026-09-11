import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AttendancePage } from '@/pages/AttendancePage'
import type { Member } from '@/types'

// Mock useAuth
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'user@example.com' },
    isAuthenticated: true,
  }),
}))

// Mock Member Data
const mockMembers: Member[] = [
  {
    id: 'm-1',
    user_id: 'user-123',
    name: 'Budi Santoso',
    note: 'Frontend Lead',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    user_id: 'user-123',
    name: 'Siti Rahma',
    note: 'UI Designer',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock useMembers
vi.mock('@/features/attendance/hooks/useMembers', () => ({
  useMembers: () => ({
    members: mockMembers,
    loading: false,
    addMember: vi.fn(),
    editMember: vi.fn(),
    activateMember: vi.fn(),
  }),
}))

// Mock useAttendance
vi.mock('@/features/attendance/hooks/useAttendance', () => ({
  useAttendance: () => ({
    attendance: [
      {
        id: 'att-1',
        user_id: 'user-123',
        member_id: 'm-1',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    loading: false,
    saveBulk: vi.fn().mockResolvedValue(undefined),
  }),
}))

const mockWeeklyRecap = {
  startDate: '2026-09-07',
  endDate: '2026-09-13',
  days: [
    '2026-09-07',
    '2026-09-08',
    '2026-09-09',
    '2026-09-10',
    '2026-09-11',
    '2026-09-12',
    '2026-09-13',
  ],
  recaps: [
    {
      memberId: 'm-1',
      memberName: 'Budi Santoso',
      present: 5,
      absent: 1,
      holiday: 1,
    },
    {
      memberId: 'm-2',
      memberName: 'Siti Rahma',
      present: 4,
      absent: 0,
      holiday: 3,
    },
  ],
  totalPresent: 9,
  totalAbsent: 1,
  totalHoliday: 4,
}

// Mock useWeeklyAttendance
vi.mock('@/features/attendance/hooks/useWeeklyAttendance', () => ({
  useWeeklyAttendance: () => ({
    recap: mockWeeklyRecap,
    attendance: [
      {
        id: 'att-1',
        user_id: 'user-123',
        member_id: 'm-1',
        attendance_date: '2026-09-11',
        status: 'present',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'att-2',
        user_id: 'user-123',
        member_id: 'm-1',
        attendance_date: '2026-09-10',
        status: 'absent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'att-3',
        user_id: 'user-123',
        member_id: 'm-1',
        attendance_date: '2026-09-09',
        status: 'holiday',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    currentDate: new Date('2026-09-11'),
    goNext: vi.fn(),
    goPrev: vi.fn(),
    goToday: vi.fn(),
    loading: false,
  }),
}))

describe('AttendancePage Soft Neumorphism Layout & No Double Card', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sleek single neumorphic bar for Date Navigation without outer double card wrapper', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Verify prev and next buttons
    const prevBtn = screen.getByLabelText('Tanggal sebelumnya')
    const nextBtn = screen.getByLabelText('Tanggal berikutnya')
    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()
    expect(prevBtn.className).toContain('p-1.5 rounded-xl')
    expect(nextBtn.className).toContain('p-1.5 rounded-xl')

    // Verify date navigation container styling (no outer double card)
    const dateContainer = prevBtn.closest('.w-full.flex.items-center.justify-between')
    expect(dateContainer).toBeInTheDocument()
    expect(dateContainer?.className).toContain('rounded-2xl')
    expect(dateContainer?.className).toContain('bg-[#F0F3F8]')
    expect(dateContainer?.className).toContain('shadow-[-4px_-4px_9px_rgba(255,255,255,0.9),4px_4px_9px_rgba(163,177,198,0.28)]')

    // Verify "• Hari Ini" badge
    expect(screen.getByText('• Hari Ini')).toBeInTheDocument()
  })

  it('renders 4 soft neumorphic summary cards with concave icon containers', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Check titles for 4 summary cards (using getAllByText because buttons have sr-only labels)
    const hadirTexts = screen.getAllByText('Hadir')
    expect(hadirTexts.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Absen').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Libur').length).toBeGreaterThan(0)
    expect(screen.getByText('Belum Absen')).toBeInTheDocument()

    // Verify Hadir card styling
    const hadirCard = hadirTexts[0].closest('.rounded-\\[22px\\]')
    expect(hadirCard).toBeInTheDocument()
    expect(hadirCard?.className).toContain('bg-[#F0F3F8]')
    expect(hadirCard?.className).toContain('shadow-[-4px_-4px_8px_rgba(255,255,255,0.85),4px_4px_8px_rgba(163,177,198,0.22)]')

    // Verify concave icon container inside Hadir card
    const concaveIcon = hadirCard?.querySelector('.w-9.h-9.rounded-2xl')
    expect(concaveIcon).toBeInTheDocument()
    expect(concaveIcon?.className).toContain('shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.25)]')
  })

  it('renders soft neumorphic member roster card with quick action pills and squircle status buttons', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Verify main roster card container
    const rosterTitle = screen.getByText('Daftar Anggota Tim')
    const mainContainer = rosterTitle.closest('.rounded-\\[26px\\]')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer?.className).toContain('bg-[#F0F3F8]')
    expect(mainContainer?.className).toContain('shadow-[-5px_-5px_10px_rgba(255,255,255,0.85),5px_5px_10px_rgba(163,177,198,0.22)]')

    // Verify Quick action pills
    const allPresentBtn = screen.getByText('Semua Hadir')
    const allHolidayBtn = screen.getByText('Semua Libur')
    expect(allPresentBtn).toBeInTheDocument()
    expect(allHolidayBtn).toBeInTheDocument()
    expect(allPresentBtn.closest('button')?.className).toContain('shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.25)]')

    // Verify Member avatar badge is rounded-full
    const memberName = screen.getByText('Budi Santoso')
    const row = memberName.closest('.flex.items-center.justify-between')
    const avatarBadge = row?.querySelector('.w-8.h-8.rounded-full')
    expect(avatarBadge).toBeInTheDocument()
    expect(avatarBadge?.className).toContain('bg-indigo-50')

    // Verify squircle status buttons
    const presentButtons = screen.getAllByLabelText('Hadir')
    expect(presentButtons.length).toBeGreaterThan(0)
    expect(presentButtons[0].className).toContain('w-7 h-7 rounded-lg')
  })

  it('toggles member attendance status with concave styling when active', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Member 1 starts as 'present' in mock
    const presentBtns = screen.getAllByLabelText('Hadir')
    expect(presentBtns[0].className).toContain('shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.3)]')

    // Click Absent on Member 1
    const absentBtns = screen.getAllByLabelText('Absen')
    fireEvent.click(absentBtns[0])

    // Should now show unsaved changes bar
    expect(screen.getByText('Perubahan belum disimpan')).toBeInTheDocument()
  })

  it('navigates to previous day and shows inline Hari Ini reset button without external notice row and keeps fixed height', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Today initially shows "• Hari Ini"
    expect(screen.getByText('• Hari Ini')).toBeInTheDocument()
    expect(screen.queryByText('Melihat tanggal kemarin')).not.toBeInTheDocument()

    // Click previous date button
    const prevBtn = screen.getByLabelText('Tanggal sebelumnya')
    fireEvent.click(prevBtn)

    // Should NOT have external notice row "Melihat tanggal kemarin"
    expect(screen.queryByText('Melihat tanggal kemarin')).not.toBeInTheDocument()
    expect(screen.queryByText('Melihat riwayat lampau')).not.toBeInTheDocument()

    // Should have inline reset button "Hari Ini"
    const resetBtn = screen.getByRole('button', { name: /hari ini/i })
    expect(resetBtn).toBeInTheDocument()
    expect(resetBtn.className).toContain('rounded-full')
    expect(resetBtn.className).toContain('text-indigo-600')

    // Verify fixed height container
    const dateContainer = prevBtn.closest('.w-full.flex.items-center.justify-between')
    expect(dateContainer).toHaveClass('h-12')
    expect(dateContainer).toHaveClass('min-h-[48px]')

    // Click reset to today
    fireEvent.click(resetBtn)
    expect(screen.getByText('• Hari Ini')).toBeInTheDocument()
  })

  it('renders revamped Soft Neumorphic layout on Anggota sub-tab with balanced header, metrics, search, and member cards', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Switch to "Anggota" tab
    const anggotaTab = screen.getByRole('tab', { name: /anggota/i })
    fireEvent.click(anggotaTab)

    // 1. Header & Action Row
    const title = screen.getByText('Kelola Anggota')
    expect(title).toBeInTheDocument()
    expect(title.className).toContain('text-base font-bold')

    // Total count badge
    const badge = screen.getByText('2', { selector: 'span' })
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-indigo-50')
    expect(badge.className).toContain('text-indigo-600')

    // "+ Tambah" button
    const tambahBtn = screen.getByRole('button', { name: /tambah/i })
    expect(tambahBtn).toBeInTheDocument()
    expect(tambahBtn.className).toContain('rounded-xl')
    expect(tambahBtn.className).toContain('bg-indigo-600')

    // 2. Quick Stat Badges
    const totalStat = screen.getByText('Total')
    expect(totalStat).toBeInTheDocument()
    const statGrid = totalStat.closest('.grid.grid-cols-3')
    expect(statGrid).toBeInTheDocument()
    expect(statGrid?.className).toContain('gap-2.5')
    expect(statGrid?.className).toContain('my-3')

    expect(statGrid).toHaveTextContent('2 Anggota')
    expect(statGrid).toHaveTextContent('2 Aktif')
    expect(statGrid).toHaveTextContent('0 Nonaktif')

    // 3. Search Bar
    const searchInput = screen.getByPlaceholderText('Cari nama anggota...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput.className).toContain('bg-[#F0F3F8]')
    expect(searchInput.className).toContain('rounded-2xl')

    // 4. Member Cards
    const budiName = screen.getByText('Budi Santoso')
    const budiCard = budiName.closest('.p-3.rounded-2xl')
    expect(budiCard).toBeInTheDocument()
    expect(budiCard?.className).toContain('bg-[#F0F3F8]')
    expect(budiCard?.className).toContain('shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),3px_3px_7px_rgba(163,177,198,0.25)]')

    // Avatar
    const avatar = budiCard?.querySelector('.bg-gradient-to-br.from-indigo-500.to-purple-600')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveTextContent('B')

    // Role text
    expect(screen.getByText('Frontend Lead')).toBeInTheDocument()
    expect(screen.getByText('UI Designer')).toBeInTheDocument()

    // Active status badge inside member card
    const activeBadge = budiCard?.querySelector('.bg-emerald-50')
    expect(activeBadge).toBeInTheDocument()
    expect(activeBadge).toHaveTextContent('Aktif')
    expect(activeBadge?.className).toContain('text-emerald-600')
    expect(activeBadge?.className).toContain('rounded-full')

    // Squircle Action buttons
    const editBtn = screen.getByLabelText('Edit Budi Santoso')
    const deactivateBtn = screen.getByLabelText('Nonaktifkan Budi Santoso')
    expect(editBtn).toBeInTheDocument()
    expect(deactivateBtn).toBeInTheDocument()
    expect(editBtn.className).toContain('w-7 h-7 rounded-lg')
    expect(deactivateBtn.className).toContain('w-7 h-7 rounded-lg')

    // Search filter test
    fireEvent.change(searchInput, { target: { value: 'Siti' } })
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument()
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument()

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
  })

  it('renders revamped Soft Neumorphic Rekap Kehadiran tab with header, week switcher, anti-cutoff table, and legend', () => {
    render(
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    )

    // Switch to "Rekap" tab
    const rekapTab = screen.getByRole('tab', { name: /rekap/i })
    fireEvent.click(rekapTab)

    // 1. Header Rekap
    const rekapTitle = screen.getByText('Rekap Kehadiran')
    expect(rekapTitle).toBeInTheDocument()
    expect(rekapTitle.className).toContain('text-sm font-bold')

    // Export PDF & Excel buttons
    const pdfBtn = screen.getByRole('button', { name: /export pdf/i })
    const excelBtn = screen.getByRole('button', { name: /export excel/i })
    expect(pdfBtn).toBeInTheDocument()
    expect(excelBtn).toBeInTheDocument()
    expect(pdfBtn.className).toContain('rounded-xl')
    expect(pdfBtn.className).toContain('bg-[#F0F3F8]')
    expect(excelBtn.className).toContain('rounded-xl')
    expect(excelBtn.className).toContain('bg-[#F0F3F8]')

    // Week Switcher
    const prevWeekBtn = screen.getByLabelText('Minggu sebelumnya')
    const nextWeekBtn = screen.getByLabelText('Minggu berikutnya')
    expect(prevWeekBtn).toBeInTheDocument()
    expect(nextWeekBtn).toBeInTheDocument()
    const weekContainer = prevWeekBtn.closest('.flex.items-center.justify-between')
    expect(weekContainer).toBeInTheDocument()
    expect(weekContainer?.className).toContain('rounded-xl')
    expect(weekContainer?.className).toContain('bg-white/60')

    // 2. Anti-cutoff table wrapper
    const table = screen.getByRole('table')
    const tableWrapper = table.closest('.overflow-x-auto')
    expect(tableWrapper).toBeInTheDocument()
    expect(tableWrapper?.className).toContain('rounded-2xl')
    expect(tableWrapper?.className).toContain('no-scrollbar')

    // Sticky Left Name Column
    const nameHeader = screen.getByText('Nama')
    expect(nameHeader.className).toContain('sticky')
    expect(nameHeader.className).toContain('left-0')
    expect(nameHeader.className).toContain('bg-[#F0F3F8]/95')

    // Member row with sticky name
    const budiRow = screen.getAllByText('Budi Santoso')[0]
    expect(budiRow.className).toContain('sticky')
    expect(budiRow.className).toContain('left-0')

    // Summary columns H, A, L
    expect(screen.getByTitle('Total Hadir')).toBeInTheDocument()
    expect(screen.getByTitle('Total Absen')).toBeInTheDocument()
    expect(screen.getByTitle('Total Libur')).toBeInTheDocument()

    // 3. Legend
    expect(screen.getByText('Hadir')).toBeInTheDocument()
    expect(screen.getByText('Absen')).toBeInTheDocument()
    expect(screen.getByText('Libur')).toBeInTheDocument()
    expect(screen.getByText('Kosong')).toBeInTheDocument()
  })
})

