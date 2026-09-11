import { useState, useRef, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { resizeImage } from '@/utils/image'
import { User, Lock, Camera, Trash2, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Download, BellRing } from 'lucide-react'
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
            <div className="w-24 h-24 rounded-full overflow-hidden border border-[#E6E6E3] dark:border-[#272727] bg-[#F7F7F5] dark:bg-[#181818] flex items-center justify-center shadow-xs">
              {avatarPreview ? (
                <img src={avatarPreview} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-[#171717] dark:text-[#F5F5F5]">
                  {initials}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#171717] dark:bg-[#F5F5F5] text-white dark:text-[#171717] hover:bg-[#262626] dark:hover:bg-[#E5E5E5] shadow-xs transition-colors focus:outline-none cursor-pointer"
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
              className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline focus:outline-none cursor-pointer"
            >
              Ubah Foto
            </button>
            {avatarPreview && (
              <>
                <span className="text-[#E6E6E3] dark:text-[#272727]">•</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={loading}
                  className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline focus:outline-none flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-[#E6E6E3] dark:border-[#272727]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setErrorMsg(null)
            }}
            className={cn(
              'flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer',
              activeTab === 'profile'
                ? 'border-[#171717] text-[#171717] dark:border-[#F5F5F5] dark:text-[#F5F5F5]'
                : 'border-transparent text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-[#F5F5F5]'
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
              'flex-1 py-2.5 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer',
              activeTab === 'password'
                ? 'border-[#171717] text-[#171717] dark:border-[#F5F5F5] dark:text-[#F5F5F5]'
                : 'border-transparent text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-[#F5F5F5]'
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
                className="block text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] mb-1"
              >
                Email Terdaftar
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="w-full py-2 px-3 bg-[#F1F1EF] dark:bg-[#1C1C1C] border border-[#E6E6E3] dark:border-[#272727] rounded-xl text-[#737373] dark:text-[#A3A3A3] text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="profile-username"
                className="block text-sm font-semibold text-[#171717] dark:text-[#F5F5F5] mb-1.5"
              >
                Nama Lengkap / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A3A3A3]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan nama pengguna"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] rounded-xl text-[#171717] dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] mb-1.5">
                Tema Tampilan
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F1F1EF] dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#272727]">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                    theme === 'light'
                      ? 'bg-white text-[#171717] shadow-xs dark:bg-[#262626] dark:text-[#F5F5F5]'
                      : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
                  )}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Terang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
                    theme === 'dark'
                      ? 'bg-white text-[#171717] shadow-xs dark:bg-[#262626] dark:text-[#F5F5F5]'
                      : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
                  )}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Gelap</span>
                </button>
              </div>
            </div>

            {/* Web Push Notifications Settings */}
            <div>
              <label className="block text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] mb-1.5">
                Notifikasi Web & Pengingat
              </label>
              <div className="p-3 rounded-xl bg-[#F7F7F5] dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#272727] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <p className="text-xs font-bold text-[#171717] dark:text-[#F5F5F5]">Notifikasi Peramban</p>
                      <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">Pengingat presensi, utang, dan tugas</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                    getNotificationPermission() === 'granted'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : getNotificationPermission() === 'denied'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
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
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer text-center"
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
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white dark:bg-[#222222] border border-[#E6E6E3] dark:border-[#333333] text-[#171717] dark:text-[#F5F5F5] text-xs font-semibold hover:border-[#D1D1CD] active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Kirim Notifikasi Tes
                  </button>
                </div>
              </div>
            </div>

            {canInstall && (
              <div>
                <label className="block text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] mb-1.5">
                  Aplikasi Mandiri
                </label>
                <button
                  type="button"
                  onClick={() => void installPwa()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#272727] text-[#171717] dark:text-[#F5F5F5] font-semibold text-sm hover:bg-[#F7F7F5] dark:hover:bg-[#202020] transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#2563EB]" />
                  <span>📲 Pasang / Instal Aplikasi Worksphere</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#F5F5F5] dark:hover:bg-[#E5E5E5] text-white dark:text-[#171717] font-semibold text-sm disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
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
                className="block text-sm font-semibold text-[#171717] dark:text-[#F5F5F5] mb-1.5"
              >
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A3A3A3]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 karakter (huruf & angka)"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] rounded-xl text-[#171717] dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-confirm-password"
                className="block text-sm font-semibold text-[#171717] dark:text-[#F5F5F5] mb-1.5"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A3A3A3]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="profile-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi password baru"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] rounded-xl text-[#171717] dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#F5F5F5] dark:hover:bg-[#E5E5E5] text-white dark:text-[#171717] font-semibold text-sm disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
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
