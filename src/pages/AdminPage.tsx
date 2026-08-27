import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import {
  getAllUsers,
  updateUserRole,
  updateUserPermissions,
  toggleUserStatus,
} from '@/services/userService'
import type { Profile, UserRole, UserPermissions } from '@/types'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Search,
  Check,
  Shield,
  SlidersHorizontal,
  Mail,
  Wallet,
  ListTodo,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function AdminPage() {
  const { user: currentUser, refreshProfile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Gagal memuat daftar pengguna')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return users
    return users.filter(
      u =>
        u.email?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    )
  }, [users, search])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === 'admin').length
    const active = users.filter(u => u.is_active).length
    const suspended = users.filter(u => !u.is_active).length
    return { total, admins, active, suspended }
  }, [users])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
      if (selectedUser?.id === userId) {
        setSelectedUser(updated)
      }
      if (currentUser?.id === userId) {
        await refreshProfile()
      }
      toast.success(`Role pengguna diubah menjadi "${newRole === 'admin' ? 'Admin' : 'User'}"`)
    } catch {
      toast.error('Gagal memperbarui role pengguna')
    }
  }

  const handlePermissionToggle = async (
    userId: string,
    key: keyof UserPermissions,
    currentValue: boolean
  ) => {
    try {
      const updated = await updateUserPermissions(userId, { [key]: !currentValue })
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
      if (selectedUser?.id === userId) {
        setSelectedUser(updated)
      }
      if (currentUser?.id === userId) {
        await refreshProfile()
      }
      toast.success('Hak akses fitur berhasil diperbarui!')
    } catch {
      toast.error('Gagal memperbarui hak akses')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const updated = await toggleUserStatus(userId, !currentStatus)
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
      if (selectedUser?.id === userId) {
        setSelectedUser(updated)
      }
      toast.success(
        !currentStatus ? 'Akun pengguna diaktifkan' : 'Akun pengguna ditangguhkan (suspended)'
      )
    } catch {
      toast.error('Gagal memperbarui status akun')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
              Panel Otorisasi Admin
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Kelola role dan hak akses fitur pengguna
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={loadUsers}
          className="text-xs h-8 px-2.5 font-bold whitespace-nowrap"
        >
          Refresh
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-gray-800/85 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Total User</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/85 dark:bg-gray-800/85 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{stats.admins}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/85 dark:bg-gray-800/85 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Aktif</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{stats.active}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/85 dark:bg-gray-800/85 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold mb-1">
            <UserX className="w-3.5 h-3.5" />
            <span>Suspended</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{stats.suspended}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari user berdasarkan nama atau email..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <LoadingState text="Memuat daftar pengguna..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-gray-400" />}
          title="Tidak ada pengguna"
          description={
            search
              ? 'Tidak ditemukan pengguna yang cocok dengan pencarian.'
              : 'Belum ada pengguna terdaftar.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(userItem => {
            const isSelf = userItem.id === currentUser?.id
            return (
              <div
                key={userItem.id}
                className={cn(
                  'p-4 rounded-[22px] bg-white/90 dark:bg-gray-800/90 border shadow-xs transition-all space-y-3',
                  userItem.role === 'admin'
                    ? 'border-blue-200/80 dark:border-blue-800/50'
                    : 'border-white/80 dark:border-gray-700/60'
                )}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                      {userItem.display_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate max-w-[160px]">
                          {userItem.display_name}
                        </p>
                        {isSelf && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            Saya
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[170px]">{userItem.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                        userItem.role === 'admin'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {userItem.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        userItem.is_active
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      )}
                    >
                      {userItem.is_active ? 'Aktif' : 'Suspended'}
                    </span>
                  </div>
                </div>

                {/* Permissions Preview Bar */}
                <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    Akses Fitur:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                        userItem.permissions.attendance
                          ? 'bg-blue-100/70 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-200/50 dark:bg-gray-800 text-gray-400 line-through'
                      )}
                    >
                      <Users className="w-2.5 h-2.5" /> Absensi
                    </span>

                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                        userItem.permissions.finance
                          ? 'bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-200/50 dark:bg-gray-800 text-gray-400 line-through'
                      )}
                    >
                      <Wallet className="w-2.5 h-2.5" /> Keuangan
                    </span>

                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                        userItem.permissions.todo
                          ? 'bg-purple-100/70 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                          : 'bg-gray-200/50 dark:bg-gray-800 text-gray-400 line-through'
                      )}
                    >
                      <ListTodo className="w-2.5 h-2.5" /> To-Do
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(userItem)
                      setShowPermissionModal(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Atur Izin</span>
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(userItem.id, userItem.is_active)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        userItem.is_active
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100'
                      )}
                    >
                      {userItem.is_active ? 'Tangguhkan' : 'Aktifkan'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Permission & Role Edit Modal */}
      <BottomSheet
        open={showPermissionModal && !!selectedUser}
        onClose={() => {
          setShowPermissionModal(false)
          setSelectedUser(null)
        }}
        title="Pengaturan Hak Akses & Role"
      >
        {selectedUser && (
          <div className="space-y-4 pb-4">
            {/* User Target Card */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center">
                {selectedUser.display_name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {selectedUser.display_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Pilih Role Akun
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange(selectedUser.id, 'user')}
                  className={cn(
                    'p-3 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between',
                    selectedUser.role === 'user'
                      ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <div>
                    <p className="font-extrabold text-sm">👤 User Biasa</p>
                    <p className="text-[10px] text-gray-500">Akses fitur modular terpilih</p>
                  </div>
                  {selectedUser.role === 'user' && <Check className="w-4 h-4 text-[#2563EB]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                  className={cn(
                    'p-3 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between',
                    selectedUser.role === 'admin'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <div>
                    <p className="font-extrabold text-sm">👑 Administrator</p>
                    <p className="text-[10px] text-gray-500">Akses penuh & kelola user</p>
                  </div>
                  {selectedUser.role === 'admin' && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* Modular Permissions Switches */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Hak Akses Modul Fitur
              </label>

              {selectedUser.role === 'admin' ? (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Administrator secara otomatis memiliki hak akses penuh ke seluruh modul fitur.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Presensi */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          Modul Presensi / Absensi
                        </p>
                        <p className="text-[10px] text-gray-500">Mencatat presensi & anggota tim</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handlePermissionToggle(
                          selectedUser.id,
                          'attendance',
                          selectedUser.permissions.attendance
                        )
                      }
                      className={cn(
                        'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                        selectedUser.permissions.attendance ? 'bg-[#2563EB]' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full bg-white transition-transform absolute top-1',
                          selectedUser.permissions.attendance ? 'right-1' : 'left-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* Keuangan */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          Modul Keuangan & Tabungan
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Dompet, anggaran, tabungan, utang
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handlePermissionToggle(
                          selectedUser.id,
                          'finance',
                          selectedUser.permissions.finance
                        )
                      }
                      className={cn(
                        'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                        selectedUser.permissions.finance ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full bg-white transition-transform absolute top-1',
                          selectedUser.permissions.finance ? 'right-1' : 'left-1'
                        )}
                      />
                    </button>
                  </div>

                  {/* To-Do & Jurnal */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                        <ListTodo className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          Modul To-Do, Wishlist & Jurnal
                        </p>
                        <p className="text-[10px] text-gray-500">Tugas, kanban, wishlist & win</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handlePermissionToggle(
                          selectedUser.id,
                          'todo',
                          selectedUser.permissions.todo
                        )
                      }
                      className={cn(
                        'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                        selectedUser.permissions.todo ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full bg-white transition-transform absolute top-1',
                          selectedUser.permissions.todo ? 'right-1' : 'left-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full font-bold mt-2"
              onClick={() => {
                setShowPermissionModal(false)
                setSelectedUser(null)
              }}
            >
              Selesai
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
