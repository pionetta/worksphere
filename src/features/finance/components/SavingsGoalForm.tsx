import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SavingsGoalFormProps {
  initialName?: string
  initialTarget?: number
  initialDeadline?: string
  initialNote?: string
  onSubmit: (
    name: string,
    target: number,
    deadline: string | null,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function SavingsGoalForm({
  initialName = '',
  initialTarget,
  initialDeadline = '',
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: SavingsGoalFormProps) {
  const [name, setName] = useState(initialName)
  const [target, setTarget] = useState(initialTarget ? String(initialTarget) : '')
  const [deadline, setDeadline] = useState(initialDeadline)
  const [note, setNote] = useState(initialNote)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Nama tujuan tabungan wajib diisi.')
      return
    }
    const parsedTarget = parseInt(target.replace(/[^\d]/g, ''), 10)
    if (!parsedTarget || parsedTarget <= 0) {
      setError('Target tabungan harus lebih dari 0.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(name.trim(), parsedTarget, deadline || null, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nama Tujuan"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contoh: Dana Darurat, Liburan"
        error={error}
        autoFocus
      />
      <Input
        label="Target Tabungan"
        type="number"
        value={target}
        onChange={e => setTarget(e.target.value)}
        placeholder="0"
      />
      <Input
        label="Deadline (opsional)"
        type="date"
        value={deadline}
        onChange={e => setDeadline(e.target.value)}
      />
      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Keterangan tujuan tabungan"
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
