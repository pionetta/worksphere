import Dexie, { type EntityTable } from 'dexie'
import type {
  Member,
  Attendance,
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Debt,
  Task,
  Subtask,
  WishlistItem,
  JournalEntry,
  Profile,
  SyncQueueRow,
} from '@/types'

// ─── Database Definition ──────────────────────────────────────────────────────

class WorksphereDB extends Dexie {
  members!: EntityTable<Member, 'id'>
  attendance!: EntityTable<Attendance, 'id'>
  wallets!: EntityTable<Wallet, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  savings_goals!: EntityTable<SavingsGoal, 'id'>
  debts!: EntityTable<Debt, 'id'>
  tasks!: EntityTable<Task, 'id'>
  subtasks!: EntityTable<Subtask, 'id'>
  wishlists!: EntityTable<WishlistItem, 'id'>
  journal_entries!: EntityTable<JournalEntry, 'id'>
  profiles!: EntityTable<Profile, 'id'>
  sync_queue!: EntityTable<SyncQueueRow, 'id'>

  constructor() {
    super('worksphere')

    // Version 2 — full schema
    this.version(2).stores({
      members: 'id, user_id, name, is_active',
      attendance: 'id, user_id, member_id, attendance_date, [user_id+member_id+attendance_date]',
      wallets: 'id, user_id, name, type, is_active',
      categories: 'id, user_id, name, type, is_active',
      transactions:
        'id, user_id, wallet_id, type, category_id, transaction_date, transfer_group_id, deleted_at',
      budgets: 'id, user_id, category_id, month, year',
      savings_goals: 'id, user_id, name, deadline',
      debts: 'id, user_id, type, person_name, status, due_date',
      tasks: 'id, user_id, status, priority, category, due_date, deleted_at',
      subtasks: 'id, task_id, user_id, is_completed',
      sync_queue: 'id, user_id, operation, entity, entity_id, status, created_at',
    })

    // Version 3 — Wishlists, Multi-Horizon Tasks, & Journal Entries
    this.version(3).stores({
      members: 'id, user_id, name, is_active',
      attendance: 'id, user_id, member_id, attendance_date, [user_id+member_id+attendance_date]',
      wallets: 'id, user_id, name, type, is_active',
      categories: 'id, user_id, name, type, is_active',
      transactions:
        'id, user_id, wallet_id, type, category_id, transaction_date, transfer_group_id, deleted_at',
      budgets: 'id, user_id, category_id, month, year',
      savings_goals: 'id, user_id, name, deadline',
      debts: 'id, user_id, type, person_name, status, due_date',
      tasks: 'id, user_id, status, priority, category, timeframe, due_date, deleted_at',
      subtasks: 'id, task_id, user_id, is_completed',
      wishlists: 'id, user_id, period, priority, status, target_date, created_at',
      journal_entries: 'id, user_id, type, period, category, entry_date, created_at',
      sync_queue: 'id, user_id, operation, entity, entity_id, status, created_at',
    })

    // Version 4 — User Profiles & RBAC
    this.version(4).stores({
      members: 'id, user_id, name, is_active',
      attendance: 'id, user_id, member_id, attendance_date, [user_id+member_id+attendance_date]',
      wallets: 'id, user_id, name, type, is_active',
      categories: 'id, user_id, name, type, is_active',
      transactions:
        'id, user_id, wallet_id, type, category_id, transaction_date, transfer_group_id, deleted_at',
      budgets: 'id, user_id, category_id, month, year',
      savings_goals: 'id, user_id, name, deadline',
      debts: 'id, user_id, type, person_name, status, due_date',
      tasks: 'id, user_id, status, priority, category, timeframe, due_date, deleted_at',
      subtasks: 'id, task_id, user_id, is_completed',
      wishlists: 'id, user_id, period, priority, status, target_date, created_at',
      journal_entries: 'id, user_id, type, period, category, entry_date, created_at',
      profiles: 'id, email, role, is_active, created_at',
      sync_queue: 'id, user_id, operation, entity, entity_id, status, created_at',
    })
  }
}

export const db = new WorksphereDB()
