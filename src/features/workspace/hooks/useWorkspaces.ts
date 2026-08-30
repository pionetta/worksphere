import { useState, useEffect, useCallback, useMemo } from 'react'
import * as workspaceService from '../services/workspaceService'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types'
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '../schemas/workspaceSchema'

const ACTIVE_WORKSPACE_STORAGE_KEY = 'worksphere_active_workspace_id'

export function useWorkspaces(userId: string | null, userEmail?: string) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY) || null
    } catch {
      return null
    }
  })
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<
    Array<{ membership: WorkspaceMember; workspaceName: string }>
  >([])
  const [loading, setLoading] = useState(false)

  const loadWorkspaces = useCallback(async () => {
    if (!userId) {
      setWorkspaces([])
      return
    }
    try {
      const list = await workspaceService.listUserWorkspaces(userId, userEmail)
      setWorkspaces(list)
    } catch {
      // Ignore
    }
  }, [userId, userEmail])

  const loadPendingInvitations = useCallback(async () => {
    if (!userId) return
    try {
      const list = await workspaceService.listPendingInvitations(userId, userEmail)
      setPendingInvitations(list)
    } catch {
      // Ignore
    }
  }, [userId, userEmail])

  const loadMembers = useCallback(async (wsId: string | null) => {
    if (!wsId) {
      setMembers([])
      return
    }
    try {
      const list = await workspaceService.listWorkspaceMembers(wsId)
      setMembers(list)
    } catch {
      setMembers([])
    }
  }, [])

  useEffect(() => {
    loadWorkspaces()
    loadPendingInvitations()

    const handleSync = () => {
      loadWorkspaces()
      loadPendingInvitations()
      if (activeWorkspaceId) {
        loadMembers(activeWorkspaceId)
      }
    }

    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [loadWorkspaces, loadPendingInvitations, activeWorkspaceId, loadMembers])

  useEffect(() => {
    loadMembers(activeWorkspaceId)
  }, [activeWorkspaceId, loadMembers])

  const activeWorkspace = useMemo(() => {
    if (!activeWorkspaceId) return null
    return workspaces.find(w => w.id === activeWorkspaceId) || null
  }, [workspaces, activeWorkspaceId])

  const setActiveWorkspaceId = useCallback((id: string | null) => {
    setActiveWorkspaceIdState(id)
    try {
      if (id) {
        localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, id)
      } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
      }
    } catch {
      // Ignore
    }
  }, [])

  const addWorkspace = useCallback(
    async (input: CreateWorkspaceInput) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        const id = await workspaceService.createWorkspace(userId, input)
        await loadWorkspaces()
        setActiveWorkspaceId(id)
        return id
      } finally {
        setLoading(false)
      }
    },
    [userId, loadWorkspaces, setActiveWorkspaceId]
  )

  const editWorkspace = useCallback(
    async (id: string, input: UpdateWorkspaceInput) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await workspaceService.updateWorkspace(id, input, userId)
        await loadWorkspaces()
      } finally {
        setLoading(false)
      }
    },
    [userId, loadWorkspaces]
  )

  const removeWorkspace = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await workspaceService.deleteWorkspace(id, userId)
        if (activeWorkspaceId === id) {
          setActiveWorkspaceId(null)
        }
        await loadWorkspaces()
      } finally {
        setLoading(false)
      }
    },
    [userId, activeWorkspaceId, loadWorkspaces, setActiveWorkspaceId]
  )

  const inviteMember = useCallback(
    async (email: string, role: WorkspaceRole) => {
      if (!userId || !activeWorkspaceId) throw new Error('Pilih workspace terlebih dahulu')
      setLoading(true)
      try {
        const id = await workspaceService.inviteMember(userId, {
          workspace_id: activeWorkspaceId,
          invited_email: email,
          role,
        })
        await loadMembers(activeWorkspaceId)
        return id
      } finally {
        setLoading(false)
      }
    },
    [userId, activeWorkspaceId, loadMembers]
  )

  const respondToInvitation = useCallback(
    async (membershipId: string, accept: boolean) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await workspaceService.respondToInvitation(membershipId, userId, accept)
        await loadWorkspaces()
        await loadPendingInvitations()
      } finally {
        setLoading(false)
      }
    },
    [userId, loadWorkspaces, loadPendingInvitations]
  )

  const updateRole = useCallback(
    async (membershipId: string, role: WorkspaceRole) => {
      if (!userId || !activeWorkspaceId) return
      setLoading(true)
      try {
        await workspaceService.updateMemberRole(membershipId, role, userId)
        await loadMembers(activeWorkspaceId)
      } finally {
        setLoading(false)
      }
    },
    [userId, activeWorkspaceId, loadMembers]
  )

  const removeMember = useCallback(
    async (membershipId: string) => {
      if (!userId || !activeWorkspaceId) return
      setLoading(true)
      try {
        await workspaceService.removeMember(membershipId, userId)
        await loadMembers(activeWorkspaceId)
      } finally {
        setLoading(false)
      }
    },
    [userId, activeWorkspaceId, loadMembers]
  )

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    members,
    pendingInvitations,
    loading,
    setActiveWorkspaceId,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
    inviteMember,
    respondToInvitation,
    updateRole,
    removeMember,
    refreshWorkspaces: loadWorkspaces,
    refreshInvitations: loadPendingInvitations,
  }
}
