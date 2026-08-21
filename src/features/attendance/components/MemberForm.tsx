import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface MemberFormProps {
  initialName?: string
  initialNote?: string
  onSubmit: (name: string, note: string | null) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function MemberForm({
  initialName = '',
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: MemberFormProps) {
  const [name, setName] = useState(initialName)
  const [note, setNote] = useState(initialNote)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Nama wajib diisi.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(name.trim(), note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nama Anggota"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Masukkan nama"
        error={error}
        autoFocus
      />
      <Input
        label="Keterangan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Contoh: Ketua, Sekretaris"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
