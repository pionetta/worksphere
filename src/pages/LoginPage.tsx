import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, User, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, signInDemo } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(
          error.message ||
            'Gagal terhubung ke Google. Pastikan Google Auth sudah aktif di Dashboard Supabase.'
        )
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menghubungkan ke Google.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          const msg = error.message || ''
          if (msg.includes('Invalid login')) {
            setError('Email atau password salah.')
          } else if (msg.includes('network') || msg.includes('fetch')) {
            setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
          } else {
            setError(error.message || 'Terjadi kesalahan saat masuk.')
          }
        }
      } else {
        if (!username.trim()) {
          setError('Nama pengguna / username wajib diisi.')
          return
        }

        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)

        if (password.length < 6 || !hasLetter || !hasNumber) {
          setError('Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka.')
          return
        }

        if (password !== confirmPassword) {
          setError('Konfirmasi password tidak cocok dengan password.')
          return
        }

        const { error, data } = await signUp(email, password, { username })
        if (error) {
          const msg = error.message?.toLowerCase() || ''
          let errText = error.message || 'Gagal mendaftar. Silakan coba lagi.'
          if (msg.includes('rate limit')) {
            errText =
              'Batas pengiriman email Supabase tercapai (rate limit). Tunggu beberapa menit atau matikan "Confirm email" di Dashboard Supabase.'
          } else if (msg.includes('already registered')) {
            errText = 'Email sudah terdaftar. Silakan langsung masuk.'
          } else if (msg.includes('password should be at least')) {
            errText = 'Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka.'
          }
          setError(errText)
          toast.error(errText)
        } else {
          if (data?.session) {
            toast.success('Pendaftaran berhasil! Selamat datang.')
          } else {
            setSuccessMsg('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.')
            toast.success('Pendaftaran berhasil! Silakan periksa email untuk verifikasi.')
            setIsLogin(true)
            setPassword('')
            setConfirmPassword('')
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.')
      toast.error(err?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInDemo()
      toast.success('Masuk sebagai Akun Demo (Offline-First)')
    } catch (err: any) {
      setError('Gagal masuk mode demo.')
      toast.error('Gagal masuk mode demo.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setSuccessMsg(null)
    setUsername('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-[#E2EFFC] via-[#EDF5FD] to-[#DCEBFA] dark:from-[#0b1329] dark:via-[#0f172a] dark:to-[#0b1329] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/25 text-white font-black text-xl mx-auto">
            W
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            WorkSphere
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[26px] shadow-xl shadow-blue-500/10 border border-white/80 dark:border-gray-700/50 p-6 sm:p-7 space-y-4">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{successMsg}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            {/* Username Field (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Nama Pengguna / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white/70 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nama lengkap atau username"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white/70 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white/70 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={isLogin ? 'Masukkan password' : 'Min. 6 karakter (huruf & angka)'}
                />
              </div>
            </div>

            {/* Confirm Password Field (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white/70 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : isLogin ? (
                'Masuk'
              ) : (
                'Daftar Akun Baru'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-400">
                  Atau
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-white dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span>
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-extrabold text-xs sm:text-sm hover:bg-blue-100 border border-blue-200 dark:border-blue-800/50 shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Coba Mode Demo (Akses Instan)</span>
            </button>
          </form>
        </div>

        {/* Footer Toggle */}
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 font-medium">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            onClick={toggleMode}
            className="text-[#2563EB] dark:text-blue-400 hover:underline font-bold focus:outline-none cursor-pointer"
          >
            {isLogin ? 'Daftar sekarang' : 'Masuk ke akun'}
          </button>
        </p>
      </div>
    </div>
  )
}
