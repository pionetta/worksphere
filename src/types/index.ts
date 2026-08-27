// =============================================
// Worksphere — Global Type Definitions
// =============================================

// Re-export all database types
export type {
  // Enums
  AttendanceStatus,
  WalletType,
  CategoryType,
  TransactionType,
  TaskStatus,
  TaskPriority,
  TaskTimeframe,
  DebtType,
  DebtStatus,
  WishlistPeriod,
  WishlistPriority,
  WishlistStatus,
  JournalType,
  JournalPeriod,
  UserRole,
  UserPermissions,
  SyncOperationType,
  SyncStatusType,
  // Row types
  Profile,
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
  SyncQueueRow,
  // Database schema
  Database,
} from './database'

// Import for local use in this file's interfaces
import type { Wallet, Transaction } from './database'

// ─── Utility Types ───────────────────────────────────────────────────────────

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type ID = string // UUID v4

// ─── Sync UI ─────────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export type SyncOperation = 'create' | 'update' | 'delete'

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'

// ─── Common entity fields ─────────────────────────────────────────────────────

export interface BaseEntity {
  id: ID
  user_id: ID
  created_at: string
  updated_at: string
}

export interface SoftDeletable {
  deleted_at: Nullable<string>
}

// ─── Finance ─────────────────────────────────────────────────────────────────

/**
 * Wallet with calculated balance — derived from initial_balance + transactions.
 * Not stored in database; computed at application layer.
 */
export interface WalletWithBalance extends Wallet {
  balance: number
}

/**
 * Transfer as a logical unit — two linked transactions.
 */
export interface Transfer {
  group_id: string
  source_wallet_id: string
  target_wallet_id: string
  amount: number
  date: string
  note: string | null
  source_transaction: Transaction
  target_transaction: Transaction
}
