import { useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  Plus,
  Settings,
  User,
  Check,
  Users,
} from 'lucide-react'
import type { Workspace } from '@/types'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  onSelectWorkspace: (id: string | null) => void
  onOpenManager: () => void
  onCreateNew: () => void
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenManager,
  onCreateNew,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all cursor-pointer text-xs font-bold"
      >
        <div className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          {activeWorkspace ? (
            <Users className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
          {activeWorkspace ? activeWorkspace.name : 'Personal'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 p-1.5 space-y-1 animate-scale-in">
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Pilih Ruang Kerja
            </div>

            {/* Personal Workspace */}
            <button
              type="button"
              onClick={() => {
                onSelectWorkspace(null)
                setOpen(false)
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                activeWorkspace === null
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-gray-500" />
                <span className="truncate">Personal (Pribadi)</span>
              </div>
              {activeWorkspace === null && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Team Workspaces */}
            {workspaces.map(ws => (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  onSelectWorkspace(ws.id)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                  activeWorkspace?.id === ws.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{ws.name}</span>
                </div>
                {activeWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}

            <div className="pt-1 border-t border-gray-100 dark:border-gray-700/80 space-y-0.5">
              {activeWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenManager()
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                  <span>Kelola Workspace Tim</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCreateNew()
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Workspace Baru</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
