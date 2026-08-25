import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import {
  Users,
  Wallet,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Download,
  WifiOff,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
} from 'lucide-react'

export function LandingPage() {
  const { isAuthenticated, signInDemo } = useAuth()
  const { theme, setTheme, resolved } = useTheme()
  const { canInstall, installPwa } = usePwaInstall()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)

  const isDark = resolved === 'dark' || theme === 'dark'

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleDemoClick = async () => {
    setDemoLoading(true)
    await signInDemo()
    navigate('/app')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-[#E2EFFC] via-[#EDF5FD] to-[#DCEBFA] dark:from-[#0b1329] dark:via-[#0f172a] dark:to-[#0b1329] text-gray-900 dark:text-gray-100 selection:bg-blue-500/20 selection:text-blue-600 transition-colors duration-200">
      {/* ─── Main Content (No Sticky Topbar Header) ────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Top Minimal Action Row */}
        <div className="flex items-center justify-between pb-2">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-md shadow-blue-500/25 text-white font-black text-lg tracking-tight">
              W
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent">
                WorkSphere
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-none">
                Mobile All-in-One
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle tema tampilan"
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Buka Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Masuk
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* ─── PWA Install Banner ─────────────────────────────────────────── */}
        {canInstall && (
          <div
            onClick={installPwa}
            className="rounded-[22px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 shadow-sm backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Pasang Aplikasi WorkSphere
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Akses instan di layar utama ponsel Anda
                </p>
              </div>
            </div>
            <button
              onClick={installPwa}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm cursor-pointer shrink-0"
            >
              Instal App
            </button>
          </div>
        )}

        {/* ─── 1. Judul & Deskripsi ───────────────────────────────────────── */}
        <section className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-800/90 border border-blue-200 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Aplikasi All-in-One: Absensi, Keuangan & Tugas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
            Satu Tempat untuk Semua{' '}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              Aktivitas & Produktivitas
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed font-medium">
            Kelola pencatatan kehadiran anggota, pembukuan keuangan kas multi-dompet, serta
            manajemen tugas harian tim secara praktis dengan sinkronisasi instan.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                Masuk ke Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleDemoClick}
                  disabled={demoLoading}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-white shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  {demoLoading ? 'Menyiapkan...' : 'Mode Demo (Cepat)'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* ─── 2. Fitur Aplikasi ──────────────────────────────────────────── */}
        <section className="space-y-4 pt-2">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Fitur Aplikasi
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Semua kebutuhan operasional dan produktivitas dalam satu genggaman
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fitur 1: Absensi */}
            <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-300 dark:hover:border-blue-700/60 border border-white/80 dark:border-gray-700/50 backdrop-blur-md transition-all duration-300 space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                Absensi & Tim
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                Pencatatan presensi harian anggota tim dengan toggle status cepat (*Hadir, Izin, Libur*), grafik kehadiran mingguan, dan ekspor rekap instan ke PDF / Excel.
              </p>
            </div>

            {/* Fitur 2: Keuangan */}
            <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-300 dark:hover:border-blue-700/60 border border-white/80 dark:border-gray-700/50 backdrop-blur-md transition-all duration-300 space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                Keuangan & Multi-Dompet
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                Kelola banyak dompet kas (*Tunai, Bank, E-Wallet*), catat transaksi, pantau visualisasi pengeluaran per kategori, dan unduh laporan kas PDF / Excel.
              </p>
            </div>

            {/* Fitur 3: Tugas */}
            <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-300 dark:hover:border-blue-700/60 border border-white/80 dark:border-gray-700/50 backdrop-blur-md transition-all duration-300 space-y-3 group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                Manajemen Tugas (To-Do)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                Susun prioritas pekerjaan harian, tetapkan tenggat waktu, subtask bertingkat, dan pantau persentase progres penyelesaian tugas secara real-time.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 3. Nilai Tambah ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 p-4 border border-white/60 dark:border-gray-700/40 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-200 cursor-default">
            <WifiOff className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Offline-First & Cepat
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 p-4 border border-white/60 dark:border-gray-700/40 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all duration-200 cursor-default">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Data Aman & Privat
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-gray-800/70 p-4 border border-white/60 dark:border-gray-700/40 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-sm hover:border-amber-300 dark:hover:border-amber-700/50 transition-all duration-200 cursor-default">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Sinkronisasi Cloud Instan
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="w-full py-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-white/40 dark:border-gray-800/60 mt-auto">
        <p>© 2026 WorkSphere Mobile. Hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  )
}
