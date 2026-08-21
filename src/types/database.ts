// =============================================
// Worksphere — Database Types
// =============================================
// Manual types — will be replaced by Supabase CLI generated types
// when `supabase gen types typescript` is available.
// Keep this file in sync with supabase/migrations/20260818000000_initial_schema.sql

// ─── Enums ───────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'holiday'

export type WalletType = 'bank' | 'e_wallet' | 'cash' | 'other'

export type CategoryType = 'income' | 'expense'

export type TransactionType = 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'adjustment'

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export type SyncOperationType = 'create' | 'update' | 'delete'

export type SyncStatusType = 'pending' | 'processing' | 'failed' | 'completed'

// ─── Row Types ───────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  display_name: string
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  user_id: string
  name: string
  note: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  user_id: string
  member_id: string
  attendance_date: string // DATE stored as 'YYYY-MM-DD'
  status: AttendanceStatus
  note: string | null
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  type: WalletType
  initial_balance: number // BIGINT
  note: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  type: TransactionType
  amount: number // BIGINT — always positive
  category_id: string | null
  transaction_date: string // DATE stored as 'YYYY-MM-DD'
  note: string | null
  transfer_group_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null // soft delete
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number // BIGINT
  month: number // 1–12
  year: number
  note: string | null
  created_at: string
  updated_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number // BIGINT
  current_amount: number // BIGINT
  deadline: string | null // DATE
  note: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  category: string | null
  due_date: string | null // TIMESTAMPTZ
  reminder_at: string | null // TIMESTAMPTZ
  completed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Subtask {
  id: string
  task_id: string
  user_id: string
  title: string
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface SyncQueueRow {
  id: string
  user_id: string
  operation: SyncOperationType
  entity: string
  entity_id: string
  payload: Record<string, unknown> | null
  status: SyncStatusType
  retry_count: number
  last_error: string | null
  created_at: string
  updated_at: string
}

// ─── Database Schema ─────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & Pick<Profile, 'id'>
        Update: Partial<Profile>
      }
      members: {
        Row: Member
        Insert: Partial<Member> & Pick<Member, 'user_id' | 'name'>
        Update: Partial<Member>
      }
      attendance: {
        Row: Attendance
        Insert: Partial<Attendance> &
          Pick<Attendance, 'user_id' | 'member_id' | 'attendance_date' | 'status'>
        Update: Partial<Attendance>
      }
      wallets: {
        Row: Wallet
        Insert: Partial<Wallet> & Pick<Wallet, 'user_id' | 'name' | 'type'>
        Update: Partial<Wallet>
      }
      categories: {
        Row: Category
        Insert: Partial<Category> & Pick<Category, 'user_id' | 'name' | 'type'>
        Update: Partial<Category>
      }
      transactions: {
        Row: Transaction
        Insert: Partial<Transaction> &
          Pick<Transaction, 'user_id' | 'wallet_id' | 'type' | 'amount' | 'transaction_date'>
        Update: Partial<Transaction>
      }
      budgets: {
        Row: Budget
        Insert: Partial<Budget> &
          Pick<Budget, 'user_id' | 'category_id' | 'amount' | 'month' | 'year'>
        Update: Partial<Budget>
      }
      savings_goals: {
        Row: SavingsGoal
        Insert: Partial<SavingsGoal> & Pick<SavingsGoal, 'user_id' | 'name' | 'target_amount'>
        Update: Partial<SavingsGoal>
      }
      tasks: {
        Row: Task
        Insert: Partial<Task> & Pick<Task, 'user_id' | 'title'>
        Update: Partial<Task>
      }
      subtasks: {
        Row: Subtask
        Insert: Partial<Subtask> & Pick<Subtask, 'task_id' | 'user_id' | 'title'>
        Update: Partial<Subtask>
      }
      sync_queue: {
        Row: SyncQueueRow
        Insert: Partial<SyncQueueRow> &
          Pick<SyncQueueRow, 'id' | 'user_id' | 'operation' | 'entity' | 'entity_id'>
        Update: Partial<SyncQueueRow>
      }
    }
    Enums: {
      attendance_status: AttendanceStatus
      wallet_type: WalletType
      category_type: CategoryType
      transaction_type: TransactionType
      task_status: TaskStatus
      task_priority: TaskPriority
      sync_operation: SyncOperationType
      sync_status: SyncStatusType
    }
  }
}
