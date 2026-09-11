import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { MemberForm } from './MemberForm'
import { Users, Plus, Pencil, UserMinus, UserCheck, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Member } from '@/types'
import { cn } from '@/lib/utils'

interface MemberListProps {
  members: Member[]
  loading?: boolean
  onAdd: (name: string, note: string | null) => Promise<void>
  onEdit: (id: string, data: Partial<Pick<Member, 'name' | 'note'>>) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
}

export function MemberList({ members, loading, onAdd, onEdit, onToggleActive }: MemberListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const editingMember = members.find(m => m.id === editingId)

  // Quick Stat Metrics
  const totalCount = members.length
  const activeCount = members.filter(m => m.is_active).length
  const inactiveCount = totalCount - activeCount

  // Search Filter
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const q = searchQuery.toLowerCase().trim()
    return members.filter(
      m => m.name.toLowerCase().includes(q) || (m.note && m.note.toLowerCase().includes(q))
    )
  }, [members, searchQuery])

  return (
    <div>
      {/* 1. Baris Header & Aksi yang Seimbang */}
      <div className="flex items-center justify-between pb-3 border-b border-white/80 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Kelola Anggota
          </h2>
          <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-semibold">
            {totalCount}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* 2. Ringkasan Metrik Anggota (Quick Stat Badges) */}
      <div className="grid grid-cols-3 gap-2.5 my-3">
        {/* Total */}
        <div className="p-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.85),3px_3px_6px_rgba(163,177,198,0.22)] text-center">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {totalCount} <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Anggota</span>
          </p>
        </div>

        {/* Status / Aktif */}
        <div className="p-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.85),3px_3px_6px_rgba(163,177,198,0.22)] text-center">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Status</p>
          <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {activeCount} <span className="text-[10px] sm:text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">Aktif</span>
          </p>
        </div>

        {/* Nonaktif */}
        <div className="p-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.85),3px_3px_6px_rgba(163,177,198,0.22)] text-center">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Nonaktif</p>
          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {inactiveCount} <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">Nonaktif</span>
          </p>
        </div>
      </div>

      {/* 3. Kolom Pencarian Cepat (Search Bar) */}
      {totalCount > 0 && (
        <div className="relative w-full mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama anggota..."
            className="w-full bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 rounded-2xl py-2 pl-9 pr-8 text-xs shadow-inner focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 4. Penyempurnaan Kartu Anggota (Lebih Berisi & Neumorphic) */}
      {totalCount === 0 && !loading ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-slate-400" />}
          title="Belum ada anggota"
          description="Tambahkan anggota untuk mulai mencatat absensi."
          action={
            <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah Anggota
            </Button>
          }
        />
      ) : filteredMembers.length === 0 ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          Tidak ada anggota yang cocok dengan "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-0">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className={cn(
                'p-3 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/90 dark:border-white/10 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),3px_3px_7px_rgba(163,177,198,0.25)] flex items-center justify-between mb-2.5 transition-all',
                !member.is_active && 'opacity-60'
              )}
            >
              {/* Sisi Kiri */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {member.note?.trim() || 'Anggota Tim'}
                  </p>
                </div>
              </div>

              {/* Sisi Kanan */}
              <div className="flex items-center shrink-0">
                {member.is_active ? (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[11px] font-semibold px-2 py-0.5 rounded-full mr-2 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                    Aktif
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-full mr-2 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/40">
                    Nonaktif
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingId(member.id)}
                    className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm active:scale-90 transition-transform cursor-pointer"
                    aria-label={`Edit ${member.name}`}
                    title="Edit nama/peran"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(member.id, member.is_active)}
                    className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 shadow-sm active:scale-90 transition-transform cursor-pointer"
                    aria-label={member.is_active ? `Nonaktifkan ${member.name}` : `Aktifkan ${member.name}`}
                    title={member.is_active ? "Nonaktifkan Anggota" : "Aktifkan Anggota"}
                  >
                    {member.is_active ? (
                      <UserMinus className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah Anggota */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Tambah Anggota Baru"
      >
        <div className="pb-4">
          <MemberForm
            onSubmit={async (name, note) => {
              try {
                await onAdd(name, note)
                toast.success(`Anggota "${name}" berhasil ditambahkan`)
                setShowForm(false)
              } catch {
                toast.error('Gagal menambahkan anggota')
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </BottomSheet>

      {/* Modal Form Edit Anggota */}
      <BottomSheet
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title={`Edit Anggota: ${editingMember?.name || ''}`}
      >
        <div className="pb-4">
          {editingMember && (
            <MemberForm
              key={editingMember.id}
              initialName={editingMember.name}
              initialNote={editingMember.note ?? ''}
              onSubmit={async (name, note) => {
                try {
                  await onEdit(editingMember.id, { name, note })
                  toast.success(`Anggota "${name}" berhasil diperbarui`)
                  setEditingId(null)
                } catch {
                  toast.error('Gagal memperbarui anggota')
                }
              }}
              onCancel={() => setEditingId(null)}
              submitLabel="Simpan Perubahan"
            />
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
