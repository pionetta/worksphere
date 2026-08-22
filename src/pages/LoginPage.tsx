import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, User, Loader2 } from 'lucide-react'

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
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message || 'Gagal terhubung ke Google. Pastikan Google Auth sudah aktif di Dashboard Supabase.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('Email atau password salah.')
        } else if (error.message.includes('network')) {
          setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.')
        }
      }
    } else {
      if (!username.trim()) {
        setError('Nama pengguna / username wajib diisi.')
        setLoading(false)
        return
      }

      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)

      if (password.length < 6 || !hasLetter || !hasNumber) {
        setError('Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka.')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok dengan password.')
        setLoading(false)
        return
      }

      const { error, data } = await signUp(email, password, { username })
      if (error) {
        const msg = error.message?.toLowerCase() || ''
        if (msg.includes('rate limit')) {
          setError('Batas pengiriman email Supabase tercapai (rate limit). Tunggu beberapa menit atau matikan "Confirm email" di Dashboard Supabase.')
        } else if (msg.includes('already registered')) {
          setError('Email sudah terdaftar. Silakan langsung masuk.')
        } else if (msg.includes('password should be at least')) {
          setError('Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka.')
        } else {
          setError(error.message || 'Gagal mendaftar. Silakan coba lagi.')
        }
      } else {
        if (data?.session) {
          // Auto login happened
        } else {
          // Requires email confirmation
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.')
          setIsLogin(true) // Switch back to login
          setPassword('')
          setConfirmPassword('')
        }
      }
    }

    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setSuccessMsg(null)
    setUsername('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Worksphere</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-lg bg-success-light dark:bg-success/20 border border-success/30">
                <p className="text-sm text-success">{successMsg}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-danger-light dark:bg-danger/20 border border-danger/30">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Username Field (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Nama Pengguna / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Nama lengkap atau username"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder={isLogin ? 'Masukkan password' : 'Min. 6 karakter (huruf & angka)'}
                />
              </div>
            </div>

            {/* Confirm Password Field (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : isLogin ? (
                'Masuk'
              ) : (
                'Daftar'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Atau
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white dark:bg-gray-700/80 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
              onClick={() => signInDemo()}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors border border-gray-200 dark:border-gray-600"
            >
              Coba Mode Demo (Offline)
            </button>
          </form>
        </div>

        {/* Footer Toggle */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            onClick={toggleMode}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium focus:outline-none"
          >
            {isLogin ? 'Daftar sekarang' : 'Masuk ke akun'}
          </button>
        </p>
      </div>
    </div>
  )
}
