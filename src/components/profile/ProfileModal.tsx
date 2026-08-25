import { useState, useRef, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { resizeImage } from '@/utils/image'
import { User, Lock, Camera, Trash2, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Monitor, Download, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
} from '@/lib/notifications'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
}

type TabType = 'profile' | 'password'

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, updateUserProfile, updateUserPassword } = useAuth()
  const { theme, setTheme } = useTheme()
  const { canInstall, installPwa } = usePwaInstall()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Pengguna'

  const currentAvatar = user?.user_metadata?.avatar_url as string | undefined

  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [username, setUsername] = useState(currentName)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setErrorMsg(null)
      const dataUrl = await resizeImage(file, 300, 300, 0.85)
      setAvatarPreview(dataUrl)

      // Auto update profile avatar
      const { error } = await updateUserProfile({ avatarUrl: dataUrl })
      if (error) {
        setErrorMsg(error.message || 'Gagal menyimpan foto profil.')
        toast.error(error.message || 'Gagal menyimpan foto profil.')
      } else {
        setSuccessMsg('Foto profil berhasil diperbarui!')
        toast.success('Foto profil berhasil diperbarui!')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memproses gambar.')
      toast.error(err?.message || 'Gagal memproses gambar.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      setAvatarPreview(null)
      const { error } = await updateUserProfile({ avatarUrl: null })
      if (error) {
        setErrorMsg(error.message || 'Gagal menghapus foto profil.')
        toast.error(error.message || 'Gagal menghapus foto profil.')
      } else {
        setSuccessMsg('Foto profil berhasil dihapus!')
        toast.info('Foto profil berhasil dihapus')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menghapus foto profil.')
      toast.error(err?.message || 'Gagal menghapus foto profil.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setErrorMsg('Nama pengguna tidak boleh kosong.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await updateUserProfile({
        username: username.trim(),
        avatarUrl: avatarPreview,
      })
      if (error) {
        setErrorMsg(error.message || 'Gagal memperbarui profil.')
        toast.error(error.message || 'Gagal memperbarui profil.')
      } else {
        setSuccessMsg('Profil berhasil diperbarui!')
        toast.success('Profil berhasil diperbarui!')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.')
      toast.error(err?.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)

    if (newPassword.length < 6 || !hasLetter || !hasNumber) {
      setErrorMsg('Password minimal 6 karakter dan wajib mengandung kombinasi huruf dan angka.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru.')
      return
    }

    setLoading(true)
    try {
      const { error } = await updateUserPassword(newPassword)
      if (error) {
        setErrorMsg(error.message || 'Gagal memperbarui password.')
        toast.error(error.message || 'Gagal memperbarui password.')
      } else {
        setSuccessMsg('Password berhasil diubah!')
        toast.success('Password berhasil diubah!')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.')
      toast.error(err?.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  const initials = (username || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <BottomSheet open={open} onClose={onClose} title="Profil Pengguna">
      <div className="space-y-6 max-w-lg mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500/40 dark:border-primary-400/40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {initials}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 shadow-md transition-colors focus:outline-none"
              title="Unggah Foto Profil"
              aria-label="Unggah Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline focus:outline-none"
            >
              Ubah Foto
            </button>
            {avatarPreview && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={loading}
                  className="text-xs text-danger font-medium hover:underline focus:outline-none flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setErrorMsg(null)
            }}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium border-b-2 text-center transition-colors',
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            Informasi Profil
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('password')
              setErrorMsg(null)
            }}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium border-b-2 text-center transition-colors',
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            Ganti Password
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success-light dark:bg-success/20 border border-success/30 text-success text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-light dark:bg-danger/20 border border-danger/30 text-danger text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile Info Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Email Terdaftar
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="profile-username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Nama Lengkap / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan nama pengguna"
                  className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Tema Tampilan
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                    theme === 'light'
                      ? 'bg-white text-amber-600 shadow-xs dark:bg-gray-700 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Terang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                    theme === 'dark'
                      ? 'bg-white text-indigo-600 shadow-xs dark:bg-gray-700 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Gelap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer',
                    theme === 'system'
                      ? 'bg-white text-primary-600 shadow-xs dark:bg-gray-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Monitor className="w-4 h-4 text-primary-500" />
                  <span>Sistem</span>
                </button>
              </div>
            </div>

            {/* Web Push Notifications Settings */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Notifikasi Web & Pengingat
              </label>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Notifikasi Peramban</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Pengingat presensi, utang, dan tugas</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                    getNotificationPermission() === 'granted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : getNotificationPermission() === 'denied'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  )}>
                    {getNotificationPermission() === 'granted' ? 'Aktif' : getNotificationPermission() === 'denied' ? 'Diblokir' : 'Nonaktif'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {getNotificationPermission() !== 'granted' && (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await requestNotificationPermission()
                        if (res === 'granted') {
                          toast.success('Izin notifikasi web berhasil diaktifkan!')
                          await sendTestNotification()
                        } else if (res === 'denied') {
                          toast.error('Izin notifikasi diblokir di peramban Anda.')
                        }
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer text-center"
                    >
                      Aktifkan Notifikasi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await sendTestNotification()
                      if (success) {
                        toast.success('Notifikasi uji coba terkirim!')
                      } else {
                        toast.error('Gagal mengirim notifikasi. Pastikan izin peramban aktif.')
                      }
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Kirim Notifikasi Tes
                  </button>
                </div>
              </div>
            </div>

            {canInstall && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Aplikasi Mandiri
                </label>
                <button
                  type="button"
                  onClick={() => void installPwa()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-300 font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-primary-500" />
                  <span>📲 Pasang / Instal Aplikasi Worksphere</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="profile-new-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 karakter (huruf & angka)"
                  className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="profile-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi password baru"
                  className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  Mengubah Password...
                </>
              ) : (
                'Ubah Password'
              )}
            </button>
          </form>
        )}
      </div>
    </BottomSheet>
  )
}
