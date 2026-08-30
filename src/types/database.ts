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

export type TaskTimeframe = 'daily' | 'weekly' | 'yearly'

export type DebtType = 'debt' | 'receivable'

export type DebtStatus = 'unpaid' | 'partially_paid' | 'paid'

export type WishlistPeriod = 'weekly' | 'monthly' | 'yearly'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type HabitFrequency = 'daily' | 'weekly' | 'custom'

export type UserRole = 'admin' | 'user'

export interface UserPermissions {
  attendance: boolean
  finance: boolean
  todo: boolean
}

export type WishlistPriority = 'high' | 'medium' | 'low'

export type WishlistStatus = 'pending' | 'achieved' | 'cancelled'

export type JournalType = 'note' | 'achievement'

export type JournalPeriod = 'daily' | 'weekly' | 'monthly'

export type SyncOperationType = 'create' | 'update' | 'delete'

export type SyncStatusType = 'pending' | 'processing' | 'failed' | 'completed'

// ─── Row Types ───────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  display_name: string
  role: UserRole
  permissions: UserPermissions
  is_active: boolean
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

export interface Debt {
  id: string
  user_id: string
  type: DebtType
  person_name: string
  group_name?: string | null
  amount: number // BIGINT
  paid_amount: number // BIGINT
  due_date: string | null // DATE
  status: DebtStatus
  is_installment?: boolean
  installment_count?: number | null
  installment_amount?: number | null
  installment_due_day?: number | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  workspace_id?: string | null
  assignee_id?: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  timeframe?: TaskTimeframe
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

export interface WishlistItem {
  id: string
  user_id: string
  title: string
  estimated_price: number // BIGINT
  period: WishlistPeriod
  priority: WishlistPriority
  target_date: string | null // DATE
  url: string | null
  note: string | null
  status: WishlistStatus
  achieved_at: string | null // TIMESTAMPTZ
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  type: JournalType
  period: JournalPeriod
  category: string // 'work' | 'finance' | 'personal' | 'learning' | 'health' | 'other'
  icon_tag: string // 'trophy' | 'party' | 'star' | 'lightbulb' | 'sparkles' | 'target'
  entry_date: string // DATE (YYYY-MM-DD)
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  wallet_id: string
  category_id: string | null
  type: 'income' | 'expense'
  amount: number
  frequency: RecurringFrequency
  interval_count: number
  start_date: string // YYYY-MM-DD
  end_date: string | null // YYYY-MM-DD
  next_due_date: string // YYYY-MM-DD
  last_processed_date: string | null // YYYY-MM-DD
  is_active: boolean
  auto_record: boolean
  note: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  icon: string
  color: string
  frequency: HabitFrequency
  target_days: number[] // 1=Mon, 7=Sun
  target_per_day: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  completed_date: string // YYYY-MM-DD
  count: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type WalletMemberRole = 'editor' | 'viewer'
export type WalletMemberStatus = 'pending' | 'accepted' | 'declined'

export interface WalletMember {
  id: string
  wallet_id: string
  user_id: string | null
  role: WalletMemberRole
  status: WalletMemberStatus
  invited_email: string | null
  created_at: string
  updated_at: string
}

export type WorkspaceRole = 'admin' | 'member' | 'viewer'
export type WorkspaceMemberStatus = 'pending' | 'accepted' | 'declined'

export interface Workspace {
  id: string
  owner_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string | null
  role: WorkspaceRole
  status: WorkspaceMemberStatus
  invited_email: string | null
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
      wallet_members: {
        Row: WalletMember
        Insert: Partial<WalletMember> & Pick<WalletMember, 'wallet_id'>
        Update: Partial<WalletMember>
      }
      workspaces: {
        Row: Workspace
        Insert: Partial<Workspace> & Pick<Workspace, 'owner_id' | 'name'>
        Update: Partial<Workspace>
      }
      workspace_members: {
        Row: WorkspaceMember
        Insert: Partial<WorkspaceMember> & Pick<WorkspaceMember, 'workspace_id'>
        Update: Partial<WorkspaceMember>
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
      debts: {
        Row: Debt
        Insert: Partial<Debt> & Pick<Debt, 'user_id' | 'type' | 'person_name' | 'amount'>
        Update: Partial<Debt>
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
      habits: {
        Row: Habit
        Insert: Partial<Habit> & Pick<Habit, 'user_id' | 'title'>
        Update: Partial<Habit>
      }
      habit_logs: {
        Row: HabitLog
        Insert: Partial<HabitLog> & Pick<HabitLog, 'user_id' | 'habit_id' | 'completed_date'>
        Update: Partial<HabitLog>
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
      debt_type: DebtType
      debt_status: DebtStatus
      sync_operation: SyncOperationType
      sync_status: SyncStatusType
    }
  }
}
