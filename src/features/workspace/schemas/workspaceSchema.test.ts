import { describe, it, expect } from 'vitest'
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteWorkspaceMemberSchema,
  updateWorkspaceMemberSchema,
} from './workspaceSchema'

describe('workspaceSchema', () => {
  it('validates and trims createWorkspaceSchema', () => {
    const res = createWorkspaceSchema.parse({
      name: '  Tech Innovators Team  ',
      description: '  Tim pengembangan produk  ',
    })

    expect(res.name).toBe('Tech Innovators Team')
    expect(res.description).toBe('Tim pengembangan produk')
  })

  it('rejects empty workspace name', () => {
    expect(() =>
      createWorkspaceSchema.parse({
        name: '   ',
      })
    ).toThrow('Nama workspace wajib diisi')
  })

  it('validates inviteWorkspaceMemberSchema', () => {
    const res = inviteWorkspaceMemberSchema.parse({
      workspace_id: 'ws-100',
      invited_email: 'DEV@COMPANY.COM',
      role: 'admin',
    })

    expect(res.workspace_id).toBe('ws-100')
    expect(res.invited_email).toBe('dev@company.com')
    expect(res.role).toBe('admin')
  })

  it('validates partial update on member status', () => {
    const res = updateWorkspaceMemberSchema.parse({
      status: 'accepted',
    })

    expect(res.status).toBe('accepted')
  })

  it('validates updateWorkspaceSchema', () => {
    const res = updateWorkspaceSchema.parse({
      name: 'Updated Name',
    })

    expect(res.name).toBe('Updated Name')
  })
})
