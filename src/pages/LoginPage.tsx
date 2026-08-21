import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { Mail, Lock, Loader2 } from 'lucide-react'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

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
      const { error, data } = await signUp(email, password)
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Email sudah terdaftar.')
        } else if (error.message.includes('Password should be at least')) {
          setError('Password minimal 6 karakter.')
        } else {
          setError(error.message || 'Gagal mendaftar. Silakan coba lagi.')
        }
      } else {
        if (data?.session) {
          // Auto login happened
        } else {
          // Requires email confirmation
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi (jika diwajibkan oleh server).')
          setIsLogin(true) // Switch back to login
          setPassword('')
        }
      }
    }

    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setSuccessMsg(null)
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
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

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
