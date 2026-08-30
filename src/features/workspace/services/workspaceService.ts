import * as workspaceRepo from '../repositories/workspaceRepository'
import { db } from '@/lib/db'
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteWorkspaceMemberSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
  type InviteWorkspaceMemberInput,
} from '../schemas/workspaceSchema'
import { validate } from '@/lib/validation'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types'

export async function createWorkspace(
  ownerUserId: string,
  input: CreateWorkspaceInput
): Promise<string> {
  const data = validate(createWorkspaceSchema, input)
  const now = new Date().toISOString()

  const workspace: Workspace = {
    id: crypto.randomUUID(),
    owner_id: ownerUserId,
    name: data.name,
    description: data.description ?? null,
    created_at: now,
    updated_at: now,
  }

  const workspaceId = await workspaceRepo.createWorkspace(workspace, ownerUserId)

  // Automatically add owner as accepted admin member
  const ownerMember: WorkspaceMember = {
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    user_id: ownerUserId,
    role: 'admin',
    status: 'accepted',
    invited_email: null,
    created_at: now,
    updated_at: now,
  }

  await workspaceRepo.createWorkspaceMember(ownerMember, ownerUserId)

  return workspaceId
}

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput,
  operatorUserId: string
): Promise<void> {
  const data = validate(updateWorkspaceSchema, input)
  await workspaceRepo.updateWorkspace(workspaceId, data, operatorUserId)
}

export async function deleteWorkspace(
  workspaceId: string,
  operatorUserId: string
): Promise<void> {
  // Cascading cleanup of workspace members & task associations locally
  const members = await workspaceRepo.getWorkspaceMembers(workspaceId)
  for (const m of members) {
    await workspaceRepo.deleteWorkspaceMember(m.id, operatorUserId)
  }

  // Detach tasks from deleted workspace
  const tasks = await db.tasks.where('workspace_id').equals(workspaceId).toArray()
  for (const t of tasks) {
    await db.tasks.update(t.id, { workspace_id: null })
  }

  await workspaceRepo.deleteWorkspace(workspaceId, operatorUserId)
}

export async function inviteMember(
  operatorUserId: string,
  input: InviteWorkspaceMemberInput
): Promise<string> {
  const data = validate(inviteWorkspaceMemberSchema, input)

  const workspace = await workspaceRepo.getWorkspaceById(data.workspace_id)
  if (!workspace) {
    throw new Error('Workspace tidak ditemukan')
  }

  // Check duplicate invitation
  const existingMembers = await workspaceRepo.getWorkspaceMembers(data.workspace_id)
  const duplicate = existingMembers.find(
    m => m.invited_email?.toLowerCase() === data.invited_email.toLowerCase()
  )

  if (duplicate) {
    if (duplicate.status === 'declined') {
      await workspaceRepo.updateWorkspaceMember(
        duplicate.id,
        { status: 'pending', role: data.role },
        operatorUserId
      )
      return duplicate.id
    }
    throw new Error('Email tersebut sudah diundang ke workspace ini')
  }

  const now = new Date().toISOString()
  const member: WorkspaceMember = {
    id: crypto.randomUUID(),
    workspace_id: data.workspace_id,
    user_id: null,
    role: data.role,
    status: 'pending',
    invited_email: data.invited_email,
    created_at: now,
    updated_at: now,
  }

  return workspaceRepo.createWorkspaceMember(member, operatorUserId)
}

export async function respondToInvitation(
  membershipId: string,
  userId: string,
  accept: boolean
): Promise<void> {
  const status = accept ? 'accepted' : 'declined'
  await workspaceRepo.updateWorkspaceMember(
    membershipId,
    { status, user_id: userId },
    userId
  )
}

export async function updateMemberRole(
  membershipId: string,
  role: WorkspaceRole,
  operatorUserId: string
): Promise<void> {
  await workspaceRepo.updateWorkspaceMember(membershipId, { role }, operatorUserId)
}

export async function removeMember(
  membershipId: string,
  operatorUserId: string
): Promise<void> {
  await workspaceRepo.deleteWorkspaceMember(membershipId, operatorUserId)
}

export async function listUserWorkspaces(
  userId: string,
  userEmail?: string
): Promise<Workspace[]> {
  return workspaceRepo.getWorkspacesForUser(userId, userEmail)
}

export async function listWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  return workspaceRepo.getWorkspaceMembers(workspaceId)
}

export async function listPendingInvitations(
  userId: string,
  userEmail?: string
): Promise<Array<{ membership: WorkspaceMember; workspaceName: string }>> {
  const invitations = await workspaceRepo.getPendingInvitationsForEmail(userId, userEmail)
  const results: Array<{ membership: WorkspaceMember; workspaceName: string }> = []

  for (const inv of invitations) {
    const ws = await workspaceRepo.getWorkspaceById(inv.workspace_id)
    results.push({
      membership: inv,
      workspaceName: ws?.name || 'Workspace Tim',
    })
  }

  return results
}
