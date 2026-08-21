import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import type {
  Member,
  Attendance,
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Task,
  Subtask,
  SyncQueueRow,
} from '@/types'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

function randomId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// ─── Database Initialization ──────────────────────────────────────────────────

describe('Database Initialization', () => {
  it('should open database successfully', async () => {
    expect(db.isOpen()).toBe(true)
  })

  it('should have correct database name', () => {
    expect(db.name).toBe('worksphere')
  })

  it('should have all tables defined', () => {
    expect(db.members).toBeDefined()
    expect(db.attendance).toBeDefined()
    expect(db.wallets).toBeDefined()
    expect(db.categories).toBeDefined()
    expect(db.transactions).toBeDefined()
    expect(db.budgets).toBeDefined()
    expect(db.savings_goals).toBeDefined()
    expect(db.tasks).toBeDefined()
    expect(db.subtasks).toBeDefined()
    expect(db.sync_queue).toBeDefined()
  })
})

// ─── Members CRUD ─────────────────────────────────────────────────────────────

describe('Members', () => {
  const member: Member = {
    id: randomId(),
    user_id: TEST_USER_ID,
    name: 'Budi Santoso',
    note: null,
    is_active: true,
    created_at: now(),
    updated_at: now(),
  }

  it('should create a member', async () => {
    await db.members.add(member)
    const result = await db.members.get(member.id)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Budi Santoso')
  })

  it('should read members by user_id', async () => {
    await db.members.add(member)
    const results = await db.members.where('user_id').equals(TEST_USER_ID).toArray()
    expect(results).toHaveLength(1)
  })

  it('should update a member', async () => {
    await db.members.add(member)
    await db.members.update(member.id, { name: 'Budi Santoso Jr.' })
    const result = await db.members.get(member.id)
    expect(result?.name).toBe('Budi Santoso Jr.')
  })

  it('should delete a member', async () => {
    await db.members.add(member)
    await db.members.delete(member.id)
    const result = await db.members.get(member.id)
    expect(result).toBeUndefined()
  })
})

// ─── Attendance CRUD ──────────────────────────────────────────────────────────

describe('Attendance', () => {
  const attendance: Attendance = {
    id: randomId(),
    user_id: TEST_USER_ID,
    member_id: randomId(),
    attendance_date: '2026-08-18',
    status: 'present',
    note: null,
    created_at: now(),
    updated_at: now(),
  }

  it('should create an attendance record', async () => {
    await db.attendance.add(attendance)
    const result = await db.attendance.get(attendance.id)
    expect(result).toBeDefined()
    expect(result?.status).toBe('present')
  })

  it('should query attendance by member and date', async () => {
    await db.attendance.add(attendance)
    const result = await db.attendance
      .where('[user_id+member_id+attendance_date]')
      .equals([TEST_USER_ID, attendance.member_id, attendance.attendance_date])
      .first()
    expect(result).toBeDefined()
    expect(result?.id).toBe(attendance.id)
  })

  it('should update attendance status', async () => {
    await db.attendance.add(attendance)
    await db.attendance.update(attendance.id, { status: 'absent' })
    const result = await db.attendance.get(attendance.id)
    expect(result?.status).toBe('absent')
  })

  it('should allow different members on the same date', async () => {
    await db.attendance.add(attendance)
    await db.attendance.add({
      ...attendance,
      id: randomId(),
      member_id: randomId(),
    })
    const count = await db.attendance
      .where('attendance_date')
      .equals(attendance.attendance_date)
      .count()
    expect(count).toBe(2)
  })

  it('should allow same member on different dates', async () => {
    await db.attendance.add(attendance)
    await db.attendance.add({
      ...attendance,
      id: randomId(),
      attendance_date: '2026-08-19',
    })
    const count = await db.attendance.where('member_id').equals(attendance.member_id).count()
    expect(count).toBe(2)
  })
})

// ─── Wallets CRUD ─────────────────────────────────────────────────────────────

describe('Wallets', () => {
  const wallet: Wallet = {
    id: randomId(),
    user_id: TEST_USER_ID,
    name: 'BCA',
    type: 'bank',
    initial_balance: 1000000,
    note: null,
    is_active: true,
    created_at: now(),
    updated_at: now(),
  }

  it('should create a wallet', async () => {
    await db.wallets.add(wallet)
    const result = await db.wallets.get(wallet.id)
    expect(result).toBeDefined()
    expect(result?.name).toBe('BCA')
    expect(result?.type).toBe('bank')
  })

  it('should read wallets by user_id', async () => {
    await db.wallets.add(wallet)
    const results = await db.wallets.where('user_id').equals(TEST_USER_ID).toArray()
    expect(results).toHaveLength(1)
  })

  it('should update wallet initial_balance', async () => {
    await db.wallets.add(wallet)
    await db.wallets.update(wallet.id, { initial_balance: 500000 })
    const result = await db.wallets.get(wallet.id)
    expect(result?.initial_balance).toBe(500000)
  })

  it('should filter active wallets', async () => {
    await db.wallets.add(wallet)
    await db.wallets.add({
      ...wallet,
      id: randomId(),
      name: 'Inactive',
      is_active: false,
    })
    const active = await db.wallets
      .where('user_id')
      .equals(TEST_USER_ID)
      .and(w => w.is_active)
      .toArray()
    expect(active).toHaveLength(1)
    expect(active[0]?.name).toBe('BCA')
  })
})

// ─── Categories CRUD ──────────────────────────────────────────────────────────

describe('Categories', () => {
  const category: Category = {
    id: randomId(),
    user_id: TEST_USER_ID,
    name: 'Makanan',
    type: 'expense',
    icon: 'utensils',
    is_active: true,
    created_at: now(),
    updated_at: now(),
  }

  it('should create a category', async () => {
    await db.categories.add(category)
    const result = await db.categories.get(category.id)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Makanan')
  })

  it('should filter categories by type', async () => {
    await db.categories.add(category)
    await db.categories.add({
      ...category,
      id: randomId(),
      name: 'Gaji',
      type: 'income',
    })
    const expenses = await db.categories
      .where('user_id')
      .equals(TEST_USER_ID)
      .and(c => c.type === 'expense')
      .toArray()
    expect(expenses).toHaveLength(1)
  })
})

// ─── Transactions CRUD ────────────────────────────────────────────────────────

describe('Transactions', () => {
  const walletId = randomId()
  const categoryId = randomId()

  const transaction: Transaction = {
    id: randomId(),
    user_id: TEST_USER_ID,
    wallet_id: walletId,
    type: 'expense',
    category_id: categoryId,
    amount: 50000,
    transaction_date: '2026-08-18',
    note: 'Makan siang',
    transfer_group_id: null,
    created_at: now(),
    updated_at: now(),
    deleted_at: null,
  }

  it('should create a transaction', async () => {
    await db.transactions.add(transaction)
    const result = await db.transactions.get(transaction.id)
    expect(result).toBeDefined()
    expect(result?.amount).toBe(50000)
    expect(result?.type).toBe('expense')
  })

  it('should read transactions by wallet_id', async () => {
    await db.transactions.add(transaction)
    const results = await db.transactions.where('wallet_id').equals(walletId).toArray()
    expect(results).toHaveLength(1)
  })

  it('should soft-delete a transaction', async () => {
    await db.transactions.add(transaction)
    const deletedAt = now()
    await db.transactions.update(transaction.id, { deleted_at: deletedAt })
    const result = await db.transactions.get(transaction.id)
    expect(result?.deleted_at).toBe(deletedAt)
  })

  it('should create transfer pair with group_id', async () => {
    const groupId = randomId()
    const source: Transaction = {
      ...transaction,
      id: randomId(),
      type: 'transfer_out',
      transfer_group_id: groupId,
      amount: 200000,
    }
    const target: Transaction = {
      ...transaction,
      id: randomId(),
      wallet_id: randomId(),
      type: 'transfer_in',
      transfer_group_id: groupId,
      amount: 200000,
    }
    await db.transactions.bulkAdd([source, target])
    const results = await db.transactions.where('transfer_group_id').equals(groupId).toArray()
    expect(results).toHaveLength(2)
  })
})

// ─── Budgets CRUD ─────────────────────────────────────────────────────────────

describe('Budgets', () => {
  const budget: Budget = {
    id: randomId(),
    user_id: TEST_USER_ID,
    category_id: randomId(),
    amount: 500000,
    month: 8,
    year: 2026,
    note: 'Budget makan Agustus',
    created_at: now(),
    updated_at: now(),
  }

  it('should create a budget', async () => {
    await db.budgets.add(budget)
    const result = await db.budgets.get(budget.id)
    expect(result).toBeDefined()
    expect(result?.amount).toBe(500000)
  })

  it('should read budgets by month and year', async () => {
    await db.budgets.add(budget)
    const results = await db.budgets
      .where('user_id')
      .equals(TEST_USER_ID)
      .and(b => b.month === 8 && b.year === 2026)
      .toArray()
    expect(results).toHaveLength(1)
  })
})

// ─── Savings Goals CRUD ───────────────────────────────────────────────────────

describe('Savings Goals', () => {
  const goal: SavingsGoal = {
    id: randomId(),
    user_id: TEST_USER_ID,
    name: 'Dana Darurat',
    target_amount: 10000000,
    current_amount: 2500000,
    deadline: '2026-12-31',
    note: null,
    created_at: now(),
    updated_at: now(),
  }

  it('should create a savings goal', async () => {
    await db.savings_goals.add(goal)
    const result = await db.savings_goals.get(goal.id)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Dana Darurat')
    expect(result?.target_amount).toBe(10000000)
  })

  it('should update current amount', async () => {
    await db.savings_goals.add(goal)
    await db.savings_goals.update(goal.id, { current_amount: 5000000 })
    const result = await db.savings_goals.get(goal.id)
    expect(result?.current_amount).toBe(5000000)
  })
})

// ─── Tasks CRUD ───────────────────────────────────────────────────────────────

describe('Tasks', () => {
  const task: Task = {
    id: randomId(),
    user_id: TEST_USER_ID,
    title: 'Selesaikan laporan',
    description: 'Laporan bulanan Agustus',
    status: 'todo',
    priority: 'high',
    category: 'Kerja',
    due_date: '2026-08-20',
    reminder_at: null,
    completed_at: null,
    created_at: now(),
    updated_at: now(),
    deleted_at: null,
  }

  it('should create a task', async () => {
    await db.tasks.add(task)
    const result = await db.tasks.get(task.id)
    expect(result).toBeDefined()
    expect(result?.title).toBe('Selesaikan laporan')
  })

  it('should update task status to completed', async () => {
    await db.tasks.add(task)
    const completedAt = now()
    await db.tasks.update(task.id, {
      status: 'completed',
      completed_at: completedAt,
    })
    const result = await db.tasks.get(task.id)
    expect(result?.status).toBe('completed')
    expect(result?.completed_at).toBe(completedAt)
  })

  it('should reopen a completed task', async () => {
    await db.tasks.add(task)
    await db.tasks.update(task.id, {
      status: 'completed',
      completed_at: now(),
    })
    await db.tasks.update(task.id, {
      status: 'todo',
      completed_at: null,
    })
    const result = await db.tasks.get(task.id)
    expect(result?.status).toBe('todo')
    expect(result?.completed_at).toBeNull()
  })

  it('should filter tasks by priority', async () => {
    await db.tasks.add(task)
    await db.tasks.add({
      ...task,
      id: randomId(),
      title: 'Low priority task',
      priority: 'low',
    })
    const urgentTasks = await db.tasks
      .where('user_id')
      .equals(TEST_USER_ID)
      .and(t => t.priority === 'high')
      .toArray()
    expect(urgentTasks).toHaveLength(1)
  })

  it('should not have is_recurring or recurrence_rule fields', async () => {
    await db.tasks.add(task)
    const result = await db.tasks.get(task.id)
    expect(result).toBeDefined()
    expect('is_recurring' in result!).toBe(false)
    expect('recurrence_rule' in result!).toBe(false)
  })
})

// ─── Subtasks CRUD ────────────────────────────────────────────────────────────

describe('Subtasks', () => {
  const taskId = randomId()

  const subtask: Subtask = {
    id: randomId(),
    task_id: taskId,
    user_id: TEST_USER_ID,
    title: 'Kumpulkan data',
    is_completed: false,
    position: 0,
    created_at: now(),
    updated_at: now(),
  }

  it('should create a subtask', async () => {
    await db.subtasks.add(subtask)
    const result = await db.subtasks.get(subtask.id)
    expect(result).toBeDefined()
    expect(result?.title).toBe('Kumpulkan data')
  })

  it('should read subtasks by task_id', async () => {
    await db.subtasks.add(subtask)
    await db.subtasks.add({
      ...subtask,
      id: randomId(),
      title: 'Buat presentasi',
      position: 1,
    })
    const results = await db.subtasks.where('task_id').equals(taskId).toArray()
    expect(results).toHaveLength(2)
  })

  it('should complete a subtask', async () => {
    await db.subtasks.add(subtask)
    await db.subtasks.update(subtask.id, { is_completed: true })
    const result = await db.subtasks.get(subtask.id)
    expect(result?.is_completed).toBe(true)
  })

  it('should delete all subtasks for a task', async () => {
    await db.subtasks.add(subtask)
    await db.subtasks.add({
      ...subtask,
      id: randomId(),
      title: 'Subtask 2',
    })
    await db.subtasks.where('task_id').equals(taskId).delete()
    const results = await db.subtasks.where('task_id').equals(taskId).toArray()
    expect(results).toHaveLength(0)
  })
})

// ─── Sync Queue ───────────────────────────────────────────────────────────────

describe('Sync Queue', () => {
  const queueItem: SyncQueueRow = {
    id: randomId(),
    user_id: TEST_USER_ID,
    operation: 'create',
    entity: 'transaction',
    entity_id: randomId(),
    payload: { amount: 50000, type: 'expense' },
    status: 'pending',
    retry_count: 0,
    last_error: null,
    created_at: now(),
    updated_at: now(),
  }

  it('should add item to sync queue', async () => {
    await db.sync_queue.add(queueItem)
    const result = await db.sync_queue.get(queueItem.id)
    expect(result).toBeDefined()
    expect(result?.status).toBe('pending')
  })

  it('should read pending items', async () => {
    await db.sync_queue.add(queueItem)
    await db.sync_queue.add({
      ...queueItem,
      id: randomId(),
      status: 'completed',
    })
    const pending = await db.sync_queue.where('status').equals('pending').toArray()
    expect(pending).toHaveLength(1)
  })

  it('should update status to processing', async () => {
    await db.sync_queue.add(queueItem)
    await db.sync_queue.update(queueItem.id, { status: 'processing' })
    const result = await db.sync_queue.get(queueItem.id)
    expect(result?.status).toBe('processing')
  })

  it('should update status to failed with error', async () => {
    await db.sync_queue.add(queueItem)
    await db.sync_queue.update(queueItem.id, {
      status: 'failed',
      last_error: 'Network error',
      retry_count: 1,
    })
    const result = await db.sync_queue.get(queueItem.id)
    expect(result?.status).toBe('failed')
    expect(result?.last_error).toBe('Network error')
    expect(result?.retry_count).toBe(1)
  })

  it('should update status to completed', async () => {
    await db.sync_queue.add(queueItem)
    await db.sync_queue.update(queueItem.id, { status: 'completed' })
    const result = await db.sync_queue.get(queueItem.id)
    expect(result?.status).toBe('completed')
  })

  it('should delete completed items', async () => {
    await db.sync_queue.add(queueItem)
    await db.sync_queue.add({
      ...queueItem,
      id: randomId(),
      status: 'completed',
    })
    await db.sync_queue.where('status').equals('completed').delete()
    const remaining = await db.sync_queue.toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.status).toBe('pending')
  })

  it('should increment retry_count', async () => {
    await db.sync_queue.add(queueItem)
    const item = await db.sync_queue.get(queueItem.id)
    expect(item).toBeDefined()
    await db.sync_queue.update(queueItem.id, {
      retry_count: (item?.retry_count ?? 0) + 1,
    })
    const updated = await db.sync_queue.get(queueItem.id)
    expect(updated?.retry_count).toBe(1)
  })

  it('should store payload as JSON', async () => {
    const payload = {
      amount: 100000,
      wallet_id: randomId(),
      category_id: randomId(),
    }
    await db.sync_queue.add({ ...queueItem, payload })
    const result = await db.sync_queue.get(queueItem.id)
    expect(result?.payload).toEqual(payload)
  })
})

// ─── UUID Strategy ────────────────────────────────────────────────────────────

describe('UUID Strategy', () => {
  it('should use client-generated UUID for members', async () => {
    const id = crypto.randomUUID()
    await db.members.add({
      id,
      user_id: TEST_USER_ID,
      name: 'Test',
      note: null,
      is_active: true,
      created_at: now(),
      updated_at: now(),
    })
    const result = await db.members.get(id)
    expect(result?.id).toBe(id)
  })

  it('should generate valid UUID v4 format', () => {
    const id = crypto.randomUUID()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(id).toMatch(uuidRegex)
  })
})

// ─── Timestamps ───────────────────────────────────────────────────────────────

describe('Timestamps', () => {
  it('should store created_at and updated_at as ISO strings', async () => {
    const timestamp = now()
    await db.wallets.add({
      id: randomId(),
      user_id: TEST_USER_ID,
      name: 'Cash',
      type: 'cash',
      initial_balance: 0,
      note: null,
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    })
    const wallet = await db.wallets.where('user_id').equals(TEST_USER_ID).first()
    expect(wallet?.created_at).toBe(timestamp)
    expect(wallet?.updated_at).toBe(timestamp)
  })
})

// ─── Bulk Operations ──────────────────────────────────────────────────────────

describe('Bulk Operations', () => {
  it('should bulk-add members', async () => {
    const members: Member[] = Array.from({ length: 5 }, (_, i) => ({
      id: randomId(),
      user_id: TEST_USER_ID,
      name: `Anggota ${i + 1}`,
      note: null,
      is_active: true,
      created_at: now(),
      updated_at: now(),
    }))
    await db.members.bulkAdd(members)
    const count = await db.members.where('user_id').equals(TEST_USER_ID).count()
    expect(count).toBe(5)
  })

  it('should clear all data with db.delete()', async () => {
    await db.members.add({
      id: randomId(),
      user_id: TEST_USER_ID,
      name: 'Test',
      note: null,
      is_active: true,
      created_at: now(),
      updated_at: now(),
    })
    expect(await db.members.count()).toBe(1)
    await db.delete()
    await db.open()
    expect(await db.members.count()).toBe(0)
  })
})
