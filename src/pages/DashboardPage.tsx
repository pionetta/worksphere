import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, usePermissions, useIsAdmin } from '@/lib/auth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDashboard } from '@/hooks/useDashboard'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatAmount } from '@/utils/currency'
import { cn } from '@/utils/cn'
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckSquare,
  ChevronRight,
  Lock,
} from 'lucide-react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function formatDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const permissions = usePermissions()
  const isAdmin = useIsAdmin()
  const network = useNetworkStatus()
  const { data, loading, error, refresh } = useDashboard(user?.id ?? null)
  
  const canAccessFinance = isAdmin || permissions.finance
  const canAccessAttendance = isAdmin || permissions.attendance
  const canAccessTodo = isAdmin || permissions.todo

  const [activeTab, setActiveTab] = useState<'keuangan' | 'absensi' | 'tugas'>('keuangan')

  useEffect(() => {
    if (!canAccessFinance && canAccessAttendance) {
      setActiveTab('absensi')
    } else if (!canAccessFinance && !canAccessAttendance && canAccessTodo) {
      setActiveTab('tugas')
    }
  }, [canAccessFinance, canAccessAttendance, canAccessTodo])

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'User'

  const netIncome = (data?.finance?.totalIncome ?? 0) - (data?.finance?.totalExpense ?? 0)
  const netIncomeSign = netIncome >= 0 ? '+' : '-'
  const netIncomeDisplay = `${netIncomeSign}Rp ${formatAmount(Math.abs(netIncome))}`

  const recentTransactions = data.finance.recentTransactions || []
  const memberRoster = data.attendance.members || []
  const taskList = data.todo.tasks || []

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Hidden elements for SEO / tests / screen readers */}
      <div className="sr-only">
        <h2>
          {getGreeting()}, {displayName}
        </h2>
        <p>{formatDate()}</p>
        <div>
          {(data?.todo?.overdue ?? 0) > 0 && (
            <div>
              <span>Terlambat</span>
              <span>{data?.todo?.overdue}</span>
            </div>
          )}
        </div>
      </div>

      {network === 'offline' && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
          Offline — perubahan akan disinkronkan saat online.
        </div>
      )}

      {loading ? (
        <div className="space-y-3.5">
          {/* Main Card Skeleton */}
          <div className="animate-pulse rounded-[24px] bg-primary-500/20 p-6 space-y-4 h-48" />
          {/* 2-Col Cards Skeleton */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="animate-pulse rounded-[22px] bg-white/70 dark:bg-gray-800/70 p-5 h-28" />
            <div className="animate-pulse rounded-[22px] bg-white/70 dark:bg-gray-800/70 p-5 h-28" />
          </div>
          {/* Detail Container Skeleton */}
          <div className="animate-pulse rounded-[26px] bg-white/70 dark:bg-gray-800/70 p-5 h-56" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          {/* ─── 1. Main Balance Card (Total Saldo Kas -> Navigasi ke Keuangan) ──── */}
          {canAccessFinance ? (
            <Link
              to="/app/finance"
              className="group block relative overflow-hidden rounded-[24px] bg-gradient-to-tr from-[#3B82F6] via-[#3B7BF2] to-[#5085F8] text-white p-5 sm:p-6 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 animate-fade-in-up cursor-pointer"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-white stroke-[2.2]" />
                  <span className="text-xs sm:text-sm font-medium tracking-wide">Total Saldo Kas</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Rp {formatAmount(data.finance.totalBalance)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-blue-100/90 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                <span>{netIncomeDisplay} bulan ini</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <div className="text-[11px] text-white/75 font-medium">Pemasukan</div>
                  <div className="text-sm sm:text-base font-bold text-[#86EFAC] tracking-tight mt-0.5">
                    +Rp {formatAmount(data.finance.totalIncome)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-white/75 font-medium">Pengeluaran</div>
                  <div className="text-sm sm:text-base font-bold text-[#FCA5A5] tracking-tight mt-0.5">
                    -Rp {formatAmount(data.finance.totalExpense)}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-tr from-gray-500/80 to-gray-600/80 text-white p-5 sm:p-6 shadow-md opacity-75">
              <div className="flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white" />
                  <span className="text-xs sm:text-sm font-medium tracking-wide">Keuangan (Akses Dibatasi)</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-white/80">
                Fitur keuangan belum diaktifkan oleh Administrator untuk akun Anda.
              </div>
            </div>
          )}

          {/* ─── 2. Row of 2 Cards (Absensi & To-Do) ─────────────────────────── */}
          <div className="grid grid-cols-2 gap-3.5 animate-fade-in-up animation-delay-100">
            {/* Left Card: Absensi */}
            {canAccessAttendance ? (
              <Link
                to="/app/attendance"
                className="rounded-[22px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400/50 dark:hover:border-blue-500/50 border border-white/60 dark:border-gray-700/50 backdrop-blur-md transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span>Absensi Hari Ini</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all duration-200" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {data.attendance.present}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      /{data.attendance.totalMembers}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-0.5">
                      Hadir
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {data.attendance.totalMembers === 0
                      ? 'Belum ada anggota'
                      : data.attendance.unrecorded > 0
                      ? `${data.attendance.unrecorded} belum absen`
                      : 'Semua tercatat'}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-[22px] bg-gray-100/70 dark:bg-gray-800/40 p-4 sm:p-5 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col justify-between space-y-2 opacity-60">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>Absensi</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400">Akses dibatasi</div>
              </div>
            )}

            {/* Right Card: To-Do */}
            {canAccessTodo ? (
              <Link
                to="/app/todo"
                className="rounded-[22px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400/50 dark:hover:border-blue-500/50 border border-white/60 dark:border-gray-700/50 backdrop-blur-md transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span>To-Do</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all duration-200" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {data.todo.completed}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      /{data.todo.total}
                    </span>
                    <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 ml-0.5">
                      Selesai
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {data.todo.total === 0
                      ? 'Belum ada tugas'
                      : data.todo.overdue > 0
                      ? `${data.todo.overdue} tugas terlambat`
                      : `${data.todo.todo + data.todo.inProgress} tugas aktif`}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-[22px] bg-gray-100/70 dark:bg-gray-800/40 p-4 sm:p-5 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col justify-between space-y-2 opacity-60">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>To-Do</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400">Akses dibatasi</div>
              </div>
            )}
          </div>

          {/* ─── 3. Detail Item Card with Segmented Tabs ──────────────────────── */}
          {(canAccessFinance || canAccessAttendance || canAccessTodo) && (
            <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm border border-white/60 dark:border-gray-700/50 backdrop-blur-md space-y-3.5 animate-fade-in-up animation-delay-200">
              {/* Segmented Tab Bar */}
              <div className="rounded-2xl border border-gray-400/40 dark:border-gray-600 p-1 flex items-center bg-gray-100/60 dark:bg-gray-900/40">
                {canAccessFinance && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('keuangan')}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                      activeTab === 'keuangan'
                        ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    )}
                  >
                    Keuangan
                  </button>
                )}
                {canAccessAttendance && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('absensi')}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                      activeTab === 'absensi'
                        ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    )}
                  >
                    Absensi
                  </button>
                )}
                {canAccessTodo && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('tugas')}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                      activeTab === 'tugas'
                        ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    )}
                  >
                    Tugas
                  </button>
                )}
              </div>

            {/* Inner Content Box (Dynamic Item Display) */}
            <div className="rounded-2xl border border-gray-400/40 dark:border-gray-600 bg-white/50 dark:bg-gray-900/30 p-4 min-h-[170px] flex flex-col justify-between">
              {/* TAB 1: KEUANGAN */}
              {activeTab === 'keuangan' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Catatan Keuangan Terakhir
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {data.finance.walletCount} Dompet Aktif
                    </span>
                  </div>

                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                      Belum ada catatan transaksi bulan ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                                tx.type === 'income'
                                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : tx.type === 'expense'
                                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                              )}
                            >
                              {tx.type === 'income' ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : tx.type === 'expense' ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                              {tx.note || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'font-bold tracking-tight shrink-0 text-xs',
                              tx.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {tx.type === 'income' ? '+' : '-'}Rp {formatAmount(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/app/finance"
                    className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                  >
                    Buka Catatan Keuangan Lengkap <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* TAB 2: ABSENSI */}
              {activeTab === 'absensi' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Rekap Kehadiran Hari Ini
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      Total {data.attendance.totalMembers} Anggota
                    </span>
                  </div>

                  {/* Status Counters */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/40 text-center">
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                        Hadir
                      </div>
                      <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        {data.attendance.present}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/40 dark:border-rose-800/40 text-center">
                      <div className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
                        Absen / Izin
                      </div>
                      <div className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                        {data.attendance.absent}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold">
                        Belum Absen
                      </div>
                      <div className="text-sm font-extrabold text-gray-700 dark:text-gray-300">
                        {data.attendance.unrecorded}
                      </div>
                    </div>
                  </div>

                  {/* Member Roster Preview */}
                  {memberRoster.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                      Belum ada anggota tim terdaftar.
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-0.5">
                      {memberRoster.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-white/70 dark:bg-gray-800/60"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                            {m.name}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              m.status === 'present'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : m.status === 'absent'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : m.status === 'holiday'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            )}
                          >
                            {m.status === 'present'
                              ? 'Hadir'
                              : m.status === 'absent'
                              ? 'Absen'
                              : m.status === 'holiday'
                              ? 'Libur'
                              : 'Belum'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/app/attendance"
                    className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                  >
                    Buka Lembar & Rekap Absensi <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* TAB 3: TUGAS / TO-DO */}
              {activeTab === 'tugas' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Daftar Tugas Aktif (To-Do)
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {data.todo.total} Total Tugas
                    </span>
                  </div>

                  {taskList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                      Belum ada tugas aktif.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {taskList.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className="w-4 h-4 text-primary-500 shrink-0" />
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                              {task.title}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2',
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            )}
                          >
                            {task.priority === 'high'
                              ? 'Tinggi'
                              : task.priority === 'medium'
                              ? 'Sedang'
                              : 'Rendah'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/app/todo"
                    className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                  >
                    Kelola Semua Tugas To-Do <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  )
}
