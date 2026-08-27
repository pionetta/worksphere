import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, usePermissions, useIsAdmin } from '@/lib/auth'
import type { UserPermissions } from '@/types'
import { ShieldAlert, UserX, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

interface PermissionGuardProps {
  module: keyof UserPermissions
  children: ReactNode
}

export function PermissionGuard({ module, children }: PermissionGuardProps) {
  const { isAuthenticated, loading, isActive, signOut } = useAuth()
  const permissions = usePermissions()
  const isAdmin = useIsAdmin()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Suspended user screen
  if (!isActive && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-sm w-full p-6 rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-rose-200 dark:border-rose-800/50 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
              Akun Ditangguhkan (Suspended)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Akun Anda telah dinonaktifkan sementara oleh Administrator. Silakan hubungi admin untuk mengaktifkan kembali akun Anda.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={signOut}
            icon={<LogOut className="w-4 h-4" />}
            className="w-full font-bold"
          >
            Keluar Akun
          </Button>
        </div>
      </div>
    )
  }

  // Feature permission check
  const hasAccess = isAdmin || permissions[module]
  if (!hasAccess) {
    const moduleNames: Record<keyof UserPermissions, string> = {
      attendance: 'Presensi / Absensi',
      finance: 'Keuangan',
      todo: 'To-Do & Wishlist',
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-sm w-full p-6 rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-amber-200 dark:border-amber-800/50 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
              Akses Modul Dibatasi
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Anda tidak memiliki izin untuk mengakses modul <strong>{moduleNames[module]}</strong>. Hubungi Administrator untuk meminta akses fitur ini.
            </p>
          </div>
          <Link to="/app" className="block">
            <Button
              variant="primary"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="w-full font-bold bg-[#2563EB]"
            >
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const isAdmin = useIsAdmin()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
