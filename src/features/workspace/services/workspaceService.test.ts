import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as workspaceService from './workspaceService'

describe('workspaceService', () => {
  const ownerId = 'user-owner-ws-1'
  const memberId = 'user-member-ws-2'

  beforeEach(async () => {
    await db.workspaces.clear()
    await db.workspace_members.clear()
    await db.tasks.clear()
    await db.sync_queue.clear()
  })

  it('creates a workspace and automatically adds owner as accepted admin', async () => {
    const wsId = await workspaceService.createWorkspace(ownerId, {
      name: 'Design System Team',
      description: 'Ruang kerja desain & UI/UX',
    })

    expect(wsId).toBeDefined()

    const ws = await db.workspaces.get(wsId)
    expect(ws?.name).toBe('Design System Team')
    expect(ws?.owner_id).toBe(ownerId)

    const members = await workspaceService.listWorkspaceMembers(wsId)
    expect(members).toHaveLength(1)
    expect(members[0].user_id).toBe(ownerId)
    expect(members[0].role).toBe('admin')
    expect(members[0].status).toBe('accepted')
  })

  it('invites a team member by email and accepts invitation', async () => {
    const wsId = await workspaceService.createWorkspace(ownerId, {
      name: 'Mobile App Squad',
    })

    const membershipId = await workspaceService.inviteMember(ownerId, {
      workspace_id: wsId,
      invited_email: 'teammate@company.com',
      role: 'member',
    })

    expect(membershipId).toBeDefined()

    const pending = await workspaceService.listPendingInvitations(
      memberId,
      'teammate@company.com'
    )
    expect(pending).toHaveLength(1)
    expect(pending[0].workspaceName).toBe('Mobile App Squad')

    // Accept
    await workspaceService.respondToInvitation(membershipId, memberId, true)

    const member = await db.workspace_members.get(membershipId)
    expect(member?.status).toBe('accepted')
    expect(member?.user_id).toBe(memberId)

    // User workspaces should now list the team workspace
    const userWorkspaces = await workspaceService.listUserWorkspaces(
      memberId,
      'teammate@company.com'
    )
    expect(userWorkspaces).toHaveLength(1)
    expect(userWorkspaces[0].id).toBe(wsId)
  })

  it('updates workspace and removes a member', async () => {
    const wsId = await workspaceService.createWorkspace(ownerId, {
      name: 'Alpha Team',
    })

    await workspaceService.updateWorkspace(
      wsId,
      { name: 'Beta Team' },
      ownerId
    )

    const updated = await db.workspaces.get(wsId)
    expect(updated?.name).toBe('Beta Team')

    const membershipId = await workspaceService.inviteMember(ownerId, {
      workspace_id: wsId,
      invited_email: 'guest@company.com',
      role: 'viewer',
    })

    await workspaceService.removeMember(membershipId, ownerId)
    const members = await workspaceService.listWorkspaceMembers(wsId)
    expect(members).toHaveLength(1) // Only owner left
  })
})
