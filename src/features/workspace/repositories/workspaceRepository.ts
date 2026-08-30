import { db } from '@/lib/db'
import type { Workspace, WorkspaceMember } from '@/types'
import { queueCreate, queueUpdate, queueDelete, ENTITY_NAMES } from '@/lib/sync/syncHelper'

// ─── Workspace CRUD ─────────────────────────────────────────────────────────

export async function getWorkspaceById(id: string): Promise<Workspace | undefined> {
  return db.workspaces.get(id)
}

export async function getWorkspacesForUser(
  userId: string,
  userEmail?: string
): Promise<Workspace[]> {
  // 1. Workspaces owned by user
  const owned = await db.workspaces.where('owner_id').equals(userId).toArray()

  // 2. Workspaces where user is an accepted member
  const memberships = await db.workspace_members
    .filter(
      m =>
        m.status === 'accepted' &&
        (m.user_id === userId ||
          (!!userEmail && m.invited_email?.toLowerCase() === userEmail.toLowerCase()))
    )
    .toArray()

  const memberWorkspaceIds = memberships.map(m => m.workspace_id)
  const memberWorkspaces = await db.workspaces
    .where('id')
    .anyOf(memberWorkspaceIds)
    .toArray()

  const map = new Map<string, Workspace>()
  owned.forEach(w => map.set(w.id, w))
  memberWorkspaces.forEach(w => map.set(w.id, w))

  return Array.from(map.values())
}

export async function createWorkspace(
  workspace: Workspace,
  operatorUserId: string
): Promise<string> {
  await db.workspaces.put(workspace)

  await queueCreate(
    operatorUserId,
    ENTITY_NAMES.workspace,
    workspace.id,
    workspace as unknown as Record<string, unknown>
  )

  return workspace.id
}

export async function updateWorkspace(
  id: string,
  data: Partial<Workspace>,
  operatorUserId: string
): Promise<void> {
  const existing = await db.workspaces.get(id)
  if (!existing) return

  const updated: Workspace = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  }

  await db.workspaces.put(updated)

  await queueUpdate(
    operatorUserId,
    ENTITY_NAMES.workspace,
    id,
    data as Record<string, unknown>
  )
}

export async function deleteWorkspace(id: string, operatorUserId: string): Promise<void> {
  await db.workspaces.delete(id)
  await queueDelete(operatorUserId, ENTITY_NAMES.workspace, id)
}

// ─── Workspace Members CRUD ─────────────────────────────────────────────────

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return db.workspace_members.where('workspace_id').equals(workspaceId).toArray()
}

export async function getWorkspaceMemberById(id: string): Promise<WorkspaceMember | undefined> {
  return db.workspace_members.get(id)
}

export async function getPendingInvitationsForEmail(
  userId: string,
  userEmail?: string
): Promise<WorkspaceMember[]> {
  return db.workspace_members
    .filter(
      m =>
        m.status === 'pending' &&
        (m.user_id === userId ||
          (!!userEmail && m.invited_email?.toLowerCase() === userEmail.toLowerCase()))
    )
    .toArray()
}

export async function createWorkspaceMember(
  member: WorkspaceMember,
  operatorUserId: string
): Promise<string> {
  await db.workspace_members.put(member)

  await queueCreate(
    operatorUserId,
    ENTITY_NAMES.workspace_member,
    member.id,
    member as unknown as Record<string, unknown>
  )

  return member.id
}

export async function updateWorkspaceMember(
  id: string,
  data: Partial<WorkspaceMember>,
  operatorUserId: string
): Promise<void> {
  const existing = await db.workspace_members.get(id)
  if (!existing) return

  const updated: WorkspaceMember = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  }

  await db.workspace_members.put(updated)

  await queueUpdate(
    operatorUserId,
    ENTITY_NAMES.workspace_member,
    id,
    data as Record<string, unknown>
  )
}

export async function deleteWorkspaceMember(
  id: string,
  operatorUserId: string
): Promise<void> {
  await db.workspace_members.delete(id)
  await queueDelete(operatorUserId, ENTITY_NAMES.workspace_member, id)
}
