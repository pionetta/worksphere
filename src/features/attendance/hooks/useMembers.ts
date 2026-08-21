import { useState, useEffect, useCallback } from 'react'
import * as memberService from '@/features/attendance/services/memberService'
import type { Member } from '@/types'

export function useMembers(userId: string | null) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await memberService.getAllMembers(userId)
      setMembers(data)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addMember = useCallback(
    async (name: string, note: string | null) => {
      if (!userId) return
      await memberService.addMember(userId, name, note)
      await refresh()
    },
    [userId, refresh]
  )

  const editMember = useCallback(
    async (id: string, data: Partial<Pick<Member, 'name' | 'note' | 'is_active'>>) => {
      await memberService.editMember(id, data)
      await refresh()
    },
    [refresh]
  )

  const deactivateMember = useCallback(
    async (id: string) => {
      await memberService.deactivateMember(id)
      await refresh()
    },
    [refresh]
  )

  const activateMember = useCallback(
    async (id: string) => {
      await memberService.activateMember(id)
      await refresh()
    },
    [refresh]
  )

  return {
    members,
    loading,
    refresh,
    addMember,
    editMember,
    deactivateMember,
    activateMember,
  }
}
