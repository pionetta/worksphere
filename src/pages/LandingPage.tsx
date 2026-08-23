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
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react'

export function LandingPage() {
  const { isAuthenticated, signInDemo } = useAuth()
  const { theme, setTheme } = useTheme()
  const { canInstall, installPwa } = usePwaInstall()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleDemoClick = async () => {
    setDemoLoading(true)
    await signInDemo()
    navigate('/app')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-text selection:bg-primary-500/20 selection:text-primary-600 transition-colors duration-200">
      {/* ─── Navigation Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-surface/80 border-b border-border transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-md shadow-primary-500/20 text-white font-bold text-lg tracking-tight">
              W
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
                WorkSphere
              </span>
              <span className="text-[10px] text-text-muted font-medium leading-none">
                Produktivitas Terpadu
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle tema tampilan"
              className="p-2 rounded-xl text-text-secondary hover:text-text hover:bg-surface-2 transition-colors duration-150"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* PWA Install Button (If available) */}
            {canInstall && (
              <button
                onClick={installPwa}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 hover:bg-primary-100 transition-colors animate-pulse-subtle"
              >
                <Download className="w-3.5 h-3.5" />
                Instal App
              </button>
            )}

            {/* Auth CTA */}
            {isAuthenticated ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/25 active:scale-95 transition-all duration-150"
              >
                Buka Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/25 active:scale-95 transition-all duration-150"
              >
                Masuk
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        {/* ─── Hero Section ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6">
          {/* Subtle background glow decorative elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary-500/10 dark:bg-primary-500/15 blur-[100px] pointer-events-none -z-10 rounded-full" />

          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-50 border border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800/50 dark:text-primary-300 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Aplikasi All-in-One: Absensi, Keuangan & Tugas</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.15] animate-fade-in-up">
              Satu Tempat untuk Semua{' '}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-500 to-primary-500 bg-clip-text text-transparent">
                Aktivitas & Produktivitas
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Kelola pencatatan kehadiran anggota, pembukuan keuangan multi-dompet, target tabungan,
              hingga manajemen tugas harian secara offline-first dengan sinkronisasi cloud instan.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto animate-fade-in-up">
              {isAuthenticated ? (
                <Link
                  to="/app"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 active:scale-95 transition-all duration-150"
                >
                  Masuk ke Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 active:scale-95 transition-all duration-150"
                  >
                    Mulai Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleDemoClick}
                    disabled={demoLoading}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-surface hover:bg-surface-2 border border-border text-text active:scale-95 transition-all duration-150 shadow-sm"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    {demoLoading ? 'Menyiapkan Demo...' : 'Coba Mode Demo'}
                  </button>
                </>
              )}
            </div>

            {/* Mobile PWA Install Banner if applicable */}
            {canInstall && (
              <div className="pt-2 sm:hidden animate-fade-in">
                <button
                  onClick={installPwa}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Pasang Aplikasi di Layar Utama (PWA)
                </button>
              </div>
            )}
          </div>

          {/* ─── Visual Preview Mockup Card ───────────────────────────────── */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 animate-scale-in">
            <div className="rounded-2xl border border-border/80 bg-surface/90 shadow-2xl shadow-primary-500/5 p-4 sm:p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-xs text-text-muted font-mono ml-2">
                    worksphere.app/dashboard
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  ● Offline-Ready
                </span>
              </div>

              {/* Grid Mini Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
                {/* Mini Card 1 */}
                <div className="p-4 rounded-xl bg-background border border-border/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                      Absensi Hari Ini
                    </div>
                    <div className="text-sm font-bold text-text">98% Hadir Tepat Waktu</div>
                  </div>
                </div>

                {/* Mini Card 2 */}
                <div className="p-4 rounded-xl bg-background border border-border/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                      Saldo Terkelola
                    </div>
                    <div className="text-sm font-bold text-text">Rp 16.720.000</div>
                  </div>
                </div>

                {/* Mini Card 3 */}
                <div className="p-4 rounded-xl bg-background border border-border/60 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                      Tugas Selesai
                    </div>
                    <div className="text-sm font-bold text-text">12 dari 14 Selesai</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features Showcase ──────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-surface-2/40 border-y border-border px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Fitur Lengkap
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
                Tiga Pilar Utama untuk Efisiensi Anda
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                Didesain khusus untuk memenuhi kebutuhan produktivitas harian secara fleksibel dan
                menyeluruh.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1: Absensi */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-primary-500/40 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text">Absensi & Tim</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Pencatatan kehadiran harian real-time dengan status Hadir, Izin, Sakit, atau
                    Alpa.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Manajemen anggota & status aktif
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Rekap mingguan & kalender absensi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ekspor laporan PDF & Excel siap cetak
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-border/50 mt-6">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Pencatatan Cepat <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Feature 2: Keuangan */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-primary-500/40 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text">Keuangan & Multi-Dompet</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Kelola arus kas, rekening bank, e-wallet, anggaran belanja, tabungan, dan utang
                    piutang.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Transfer antar dompet & penyesuaian saldo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Target tabungan & batas anggaran
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Pencatatan utang & pelunasan bertahap
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-border/50 mt-6">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Laporan Lengkap <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Feature 3: To-Do */}
              <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-primary-500/40 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text">Manajemen Tugas (To-Do)</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Atur prioritas tugas harian, deadline dengan jam presisi, dan checklist
                    sub-tugas.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-text-secondary">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Filter prioritas (Tinggi, Sedang, Rendah)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Sub-tugas bertingkat & indikator progres
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pengingat tenggat waktu terintegrasi
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-border/50 mt-6">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Fokus & Terarah <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Value Propositions ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
                Mengapa Memilih WorkSphere?
              </h2>
              <p className="text-sm text-text-secondary">
                Dibangun dengan teknologi modern untuk kenyamanan dan keandalan maksimal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <WifiOff className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text">Offline-First</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Tetap bisa mencatat absensi dan keuangan tanpa internet. Data tersimpan di
                  IndexedDB lokal.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text">Sinkronisasi Cloud</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Tersambung aman dengan database Supabase saat online. Data Anda selalu terbarui di
                  semua perangkat.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text">PWA Mandiri</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Pasang langsung dari browser tanpa Play Store/App Store. Ringan, cepat, dan hemat
                  memori.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text">Responsif & Intuitif</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Tampilan nyaman di HP, tablet, maupun laptop dengan dukungan tema Terang dan
                  Gelap.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA Banner ──────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-primary-700 via-indigo-600 to-primary-600 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-primary-500/20 relative overflow-hidden">
            <div className="space-y-2 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Siap Meningkatkan Produktivitas Anda?
              </h3>
              <p className="text-sm sm:text-base text-white/85">
                Mulai gunakan Worksphere hari ini secara gratis. Tanpa ribet, langsung siap pakai.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? '/app' : '/login'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-primary-700 hover:bg-white/95 shadow-md active:scale-95 transition-all"
              >
                {isAuthenticated ? 'Buka Dashboard' : 'Mulai Sekarang'}
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={handleDemoClick}
                  disabled={demoLoading}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white active:scale-95 transition-all"
                >
                  Coba Mode Demo (Instan)
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-6 text-center text-xs text-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              WorkSphere
            </span>
            <span>&copy; {new Date().getFullYear()} — Hak Cipta Dilindungi</span>
          </div>
          <div className="flex items-center gap-4 text-text-muted">
            <span>Offline-First PWA</span>
            <span>•</span>
            <span>Supabase Integrated</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
