import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'

import * as memberRepo from '@/features/attendance/repositories/memberRepository'
import * as attendanceRepo from '@/features/attendance/repositories/attendanceRepository'
import * as walletRepo from '@/features/finance/repositories/walletRepository'
import * as categoryRepo from '@/features/finance/repositories/categoryRepository'
import * as transactionRepo from '@/features/finance/repositories/transactionRepository'
import * as budgetRepo from '@/features/finance/repositories/budgetRepository'
import * as savingsRepo from '@/features/finance/repositories/savingsRepository'
import * as taskRepo from '@/features/todo/repositories/taskRepository'
import * as subtaskRepo from '@/features/todo/repositories/subtaskRepository'
import * as syncRepo from '@/repositories/syncQueueRepository'

const USER_ID = '00000000-0000-0000-0000-000000000001'
const OTHER_USER = '00000000-0000-0000-0000-000000000002'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

// ─── Member Repository ────────────────────────────────────────────────────────

describe('memberRepository', () => {
  it('should create and retrieve a member', async () => {
    const id = await memberRepo.createMember({
      user_id: USER_ID,
      name: 'Budi',
      note: null,
      is_active: true,
    })
    const member = await memberRepo.getMemberById(id)
    expect(member).toBeDefined()
    expect(member?.name).toBe('Budi')
  })

  it('should list members by user_id', async () => {
    await memberRepo.createMember({
      user_id: USER_ID,
      name: 'A',
      note: null,
      is_active: true,
    })
    await memberRepo.createMember({
      user_id: OTHER_USER,
      name: 'B',
      note: null,
      is_active: true,
    })
    const members = await memberRepo.listMembers(USER_ID)
    expect(members).toHaveLength(1)
    expect(members[0]?.name).toBe('A')
  })

  it('should filter active members only', async () => {
    await memberRepo.createMember({
      user_id: USER_ID,
      name: 'Active',
      note: null,
      is_active: true,
    })
    await memberRepo.createMember({
      user_id: USER_ID,
      name: 'Inactive',
      note: null,
      is_active: false,
    })
    const active = await memberRepo.listActiveMembers(USER_ID)
    expect(active).toHaveLength(1)
    expect(active[0]?.name).toBe('Active')
  })

  it('should update a member', async () => {
    const id = await memberRepo.createMember({
      user_id: USER_ID,
      name: 'Old',
      note: null,
      is_active: true,
    })
    await memberRepo.updateMember(id, { name: 'New' })
    const member = await memberRepo.getMemberById(id)
    expect(member?.name).toBe('New')
  })

  it('should delete a member', async () => {
    const id = await memberRepo.createMember({
      user_id: USER_ID,
      name: 'Delete',
      note: null,
      is_active: true,
    })
    await memberRepo.deleteMember(id)
    const member = await memberRepo.getMemberById(id)
    expect(member).toBeUndefined()
  })
})

// ─── Attendance Repository ────────────────────────────────────────────────────

describe('attendanceRepository', () => {
  const memberId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

  it('should create and retrieve attendance', async () => {
    const id = await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: memberId,
      attendance_date: '2026-08-18',
      status: 'present',
      note: null,
    })
    const record = await attendanceRepo.getAttendanceById(id)
    expect(record?.status).toBe('present')
  })

  it('should upsert attendance (create on first call)', async () => {
    const id = await attendanceRepo.upsertAttendance(USER_ID, memberId, '2026-08-18', 'present')
    const record = await attendanceRepo.getAttendanceById(id)
    expect(record?.status).toBe('present')
  })

  it('should upsert attendance (update on second call)', async () => {
    const id1 = await attendanceRepo.upsertAttendance(USER_ID, memberId, '2026-08-18', 'present')
    const id2 = await attendanceRepo.upsertAttendance(USER_ID, memberId, '2026-08-18', 'absent')
    expect(id1).toBe(id2)
    const record = await attendanceRepo.getAttendanceById(id1)
    expect(record?.status).toBe('absent')
  })

  it('should list attendance by date range', async () => {
    await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: memberId,
      attendance_date: '2026-08-18',
      status: 'present',
      note: null,
    })
    await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: memberId,
      attendance_date: '2026-08-20',
      status: 'absent',
      note: null,
    })
    const records = await attendanceRepo.listAttendanceByDateRange(
      USER_ID,
      '2026-08-17',
      '2026-08-19'
    )
    expect(records).toHaveLength(1)
  })

  it('should reject duplicate attendance for same member and date', async () => {
    await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: memberId,
      attendance_date: '2026-08-18',
      status: 'present',
      note: null,
    })
    await expect(
      attendanceRepo.createAttendance({
        user_id: USER_ID,
        member_id: memberId,
        attendance_date: '2026-08-18',
        status: 'absent',
        note: null,
      })
    ).rejects.toThrow('Duplikat absensi')
  })

  it('should allow different members on the same date', async () => {
    const otherMemberId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: memberId,
      attendance_date: '2026-08-18',
      status: 'present',
      note: null,
    })
    await attendanceRepo.createAttendance({
      user_id: USER_ID,
      member_id: otherMemberId,
      attendance_date: '2026-08-18',
      status: 'absent',
      note: null,
    })
    const records = await attendanceRepo.listAttendanceByDate(USER_ID, '2026-08-18')
    expect(records).toHaveLength(2)
  })
})

// ─── Wallet Repository ────────────────────────────────────────────────────────

describe('walletRepository', () => {
  it('should create and retrieve a wallet', async () => {
    const id = await walletRepo.createWallet({
      user_id: USER_ID,
      name: 'BCA',
      type: 'bank',
      initial_balance: 1000000,
      note: null,
      is_active: true,
    })
    const wallet = await walletRepo.getWalletById(id)
    expect(wallet?.name).toBe('BCA')
    expect(wallet?.initial_balance).toBe(1000000)
  })

  it('should list active wallets only', async () => {
    await walletRepo.createWallet({
      user_id: USER_ID,
      name: 'Active',
      type: 'bank',
      initial_balance: 0,
      note: null,
      is_active: true,
    })
    await walletRepo.createWallet({
      user_id: USER_ID,
      name: 'Inactive',
      type: 'cash',
      initial_balance: 0,
      note: null,
      is_active: false,
    })
    const wallets = await walletRepo.listActiveWallets(USER_ID)
    expect(wallets).toHaveLength(1)
  })

  it('should update wallet', async () => {
    const id = await walletRepo.createWallet({
      user_id: USER_ID,
      name: 'Old',
      type: 'bank',
      initial_balance: 0,
      note: null,
      is_active: true,
    })
    await walletRepo.updateWallet(id, { name: 'New', initial_balance: 500000 })
    const wallet = await walletRepo.getWalletById(id)
    expect(wallet?.name).toBe('New')
    expect(wallet?.initial_balance).toBe(500000)
  })
})

// ─── Category Repository ──────────────────────────────────────────────────────

describe('categoryRepository', () => {
  it('should create and list categories by type', async () => {
    await categoryRepo.createCategory({
      user_id: USER_ID,
      name: 'Makan',
      type: 'expense',
      icon: 'utensils',
      is_active: true,
    })
    await categoryRepo.createCategory({
      user_id: USER_ID,
      name: 'Gaji',
      type: 'income',
      icon: 'wallet',
      is_active: true,
    })
    const expenses = await categoryRepo.listCategoriesByType(USER_ID, 'expense')
    expect(expenses).toHaveLength(1)
    expect(expenses[0]?.name).toBe('Makan')
  })
})

// ─── Transaction Repository ───────────────────────────────────────────────────

describe('transactionRepository', () => {
  const walletId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

  it('should create and retrieve a transaction', async () => {
    const id = await transactionRepo.createTransaction({
      user_id: USER_ID,
      wallet_id: walletId,
      type: 'expense',
      amount: 50000,
      category_id: null,
      transaction_date: '2026-08-18',
      note: 'Makan',
      transfer_group_id: null,
      deleted_at: null,
    })
    const tx = await transactionRepo.getTransactionById(id)
    expect(tx?.amount).toBe(50000)
  })

  it('should soft-delete a transaction', async () => {
    const id = await transactionRepo.createTransaction({
      user_id: USER_ID,
      wallet_id: walletId,
      type: 'expense',
      amount: 50000,
      category_id: null,
      transaction_date: '2026-08-18',
      note: null,
      transfer_group_id: null,
      deleted_at: null,
    })
    await transactionRepo.softDeleteTransaction(id)
    const all = await transactionRepo.listTransactions(USER_ID)
    expect(all).toHaveLength(0)
  })

  it('should create transfer pair', async () => {
    const groupId = crypto.randomUUID()
    await transactionRepo.createTransaction({
      user_id: USER_ID,
      wallet_id: walletId,
      type: 'transfer_out',
      amount: 200000,
      category_id: null,
      transaction_date: '2026-08-18',
      note: null,
      transfer_group_id: groupId,
      deleted_at: null,
    })
    const targetWalletId = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    await transactionRepo.createTransaction({
      user_id: USER_ID,
      wallet_id: targetWalletId,
      type: 'transfer_in',
      amount: 200000,
      category_id: null,
      transaction_date: '2026-08-18',
      note: null,
      transfer_group_id: groupId,
      deleted_at: null,
    })
    const pair = await transactionRepo.listTransactionsByTransferGroup(groupId)
    expect(pair).toHaveLength(2)
  })
})

// ─── Budget Repository ────────────────────────────────────────────────────────

describe('budgetRepository', () => {
  const catId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'

  it('should create and list budgets by month', async () => {
    await budgetRepo.createBudget({
      user_id: USER_ID,
      category_id: catId,
      amount: 500000,
      month: 8,
      year: 2026,
      note: null,
    })
    const budgets = await budgetRepo.listBudgetsByMonth(USER_ID, 8, 2026)
    expect(budgets).toHaveLength(1)
    expect(budgets[0]?.amount).toBe(500000)
  })

  it('should get budget by category and month', async () => {
    await budgetRepo.createBudget({
      user_id: USER_ID,
      category_id: catId,
      amount: 500000,
      month: 8,
      year: 2026,
      note: null,
    })
    const budget = await budgetRepo.getBudgetByCategoryAndMonth(USER_ID, catId, 8, 2026)
    expect(budget).toBeDefined()
  })
})

// ─── Savings Repository ───────────────────────────────────────────────────────

describe('savingsRepository', () => {
  it('should create and update a savings goal', async () => {
    const id = await savingsRepo.createSavingsGoal({
      user_id: USER_ID,
      name: 'Dana Darurat',
      target_amount: 10000000,
      current_amount: 0,
      deadline: '2026-12-31',
      note: null,
    })
    await savingsRepo.updateSavingsGoal(id, { current_amount: 5000000 })
    const goal = await savingsRepo.getSavingsGoalById(id)
    expect(goal?.current_amount).toBe(5000000)
  })
})

// ─── Task Repository ──────────────────────────────────────────────────────────

describe('taskRepository', () => {
  it('should create and retrieve a task', async () => {
    const id = await taskRepo.createTask({
      user_id: USER_ID,
      title: 'Test',
      description: null,
      status: 'todo',
      priority: 'medium',
      category: null,
      due_date: null,
      reminder_at: null,
      completed_at: null,
      deleted_at: null,
    })
    const task = await taskRepo.getTaskById(id)
    expect(task?.title).toBe('Test')
  })

  it('should complete and reopen a task', async () => {
    const id = await taskRepo.createTask({
      user_id: USER_ID,
      title: 'Test',
      description: null,
      status: 'todo',
      priority: 'medium',
      category: null,
      due_date: null,
      reminder_at: null,
      completed_at: null,
      deleted_at: null,
    })
    await taskRepo.completeTask(id)
    let task = await taskRepo.getTaskById(id)
    expect(task?.status).toBe('completed')
    expect(task?.completed_at).not.toBeNull()

    await taskRepo.reopenTask(id)
    task = await taskRepo.getTaskById(id)
    expect(task?.status).toBe('todo')
    expect(task?.completed_at).toBeNull()
  })

  it('should filter overdue tasks', async () => {
    await taskRepo.createTask({
      user_id: USER_ID,
      title: 'Overdue',
      description: null,
      status: 'todo',
      priority: 'high',
      category: null,
      due_date: '2020-01-01',
      reminder_at: null,
      completed_at: null,
      deleted_at: null,
    })
    await taskRepo.createTask({
      user_id: USER_ID,
      title: 'Not overdue',
      description: null,
      status: 'completed',
      priority: 'low',
      category: null,
      due_date: '2020-01-01',
      reminder_at: null,
      completed_at: '2026-08-18',
      deleted_at: null,
    })
    const overdue = await taskRepo.listOverdueTasks(USER_ID)
    expect(overdue).toHaveLength(1)
    expect(overdue[0]?.title).toBe('Overdue')
  })
})

// ─── Subtask Repository ───────────────────────────────────────────────────────

describe('subtaskRepository', () => {
  const taskId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'

  it('should create and complete a subtask', async () => {
    const id = await subtaskRepo.createSubtask({
      task_id: taskId,
      user_id: USER_ID,
      title: 'Step 1',
      is_completed: false,
      position: 0,
    })
    await subtaskRepo.completeSubtask(id)
    const subtask = await subtaskRepo.getSubtaskById(id)
    expect(subtask?.is_completed).toBe(true)
  })

  it('should list subtasks by task', async () => {
    await subtaskRepo.createSubtask({
      task_id: taskId,
      user_id: USER_ID,
      title: 'A',
      is_completed: false,
      position: 0,
    })
    await subtaskRepo.createSubtask({
      task_id: taskId,
      user_id: USER_ID,
      title: 'B',
      is_completed: false,
      position: 1,
    })
    const subtasks = await subtaskRepo.listSubtasksByTask(taskId)
    expect(subtasks).toHaveLength(2)
  })

  it('should delete all subtasks for a task', async () => {
    await subtaskRepo.createSubtask({
      task_id: taskId,
      user_id: USER_ID,
      title: 'A',
      is_completed: false,
      position: 0,
    })
    await subtaskRepo.deleteSubtasksByTask(taskId)
    const subtasks = await subtaskRepo.listSubtasksByTask(taskId)
    expect(subtasks).toHaveLength(0)
  })
})

// ─── Sync Queue Repository ────────────────────────────────────────────────────

describe('syncQueueRepository', () => {
  it('should add and retrieve a sync item', async () => {
    const id = await syncRepo.addSyncItem({
      user_id: USER_ID,
      operation: 'create',
      entity: 'transaction',
      entity_id: crypto.randomUUID(),
      payload: { amount: 50000 },
      status: 'pending',
      retry_count: 0,
      last_error: null,
    })
    const item = await syncRepo.getSyncQueueItemById(id)
    expect(item?.status).toBe('pending')
  })

  it('should list pending items', async () => {
    await syncRepo.addSyncItem({
      user_id: USER_ID,
      operation: 'create',
      entity: 'task',
      entity_id: crypto.randomUUID(),
      payload: null,
      status: 'pending',
      retry_count: 0,
      last_error: null,
    })
    await syncRepo.addSyncItem({
      user_id: USER_ID,
      operation: 'create',
      entity: 'task',
      entity_id: crypto.randomUUID(),
      payload: null,
      status: 'completed',
      retry_count: 0,
      last_error: null,
    })
    const pending = await syncRepo.listPendingItems()
    expect(pending).toHaveLength(1)
  })

  it('should mark completed and delete completed', async () => {
    const id = await syncRepo.addSyncItem({
      user_id: USER_ID,
      operation: 'create',
      entity: 'task',
      entity_id: crypto.randomUUID(),
      payload: null,
      status: 'pending',
      retry_count: 0,
      last_error: null,
    })
    await syncRepo.markCompleted(id)
    const deleted = await syncRepo.deleteCompletedItems()
    expect(deleted).toBe(1)
  })

  it('should mark failed with error and increment retry', async () => {
    const id = await syncRepo.addSyncItem({
      user_id: USER_ID,
      operation: 'update',
      entity: 'wallet',
      entity_id: crypto.randomUUID(),
      payload: null,
      status: 'pending',
      retry_count: 0,
      last_error: null,
    })
    await syncRepo.markFailed(id, 'Network error')
    const item = await syncRepo.getSyncQueueItemById(id)
    expect(item?.status).toBe('failed')
    expect(item?.last_error).toBe('Network error')
    expect(item?.retry_count).toBe(1)
  })
})
