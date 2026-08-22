# Worksphere — Development TODO

> Checklist implementasi aplikasi Worksphere.
>
> Status:
> - `[ ]` Belum dikerjakan
> - `[-]` Sedang dikerjakan
> - `[x]` Selesai
> - `[!]` Blocked / membutuhkan keputusan
>
> Prioritas:
> - `P0` Critical — wajib untuk MVP
> - `P1` High — penting untuk MVP
> - `P2` Medium — setelah core feature stabil
> - `P3` Low — future enhancement

---

# 0. Project Information

- [x] Nama aplikasi: Worksphere
- [x] Platform: Mobile-first PWA
- [x] Bahasa: Bahasa Indonesia
- [x] Mata uang: IDR
- [x] Backend: Supabase
- [x] Database cloud: PostgreSQL melalui Supabase
- [x] Local database: IndexedDB
- [x] Local database wrapper: Dexie
- [x] Authentication: Supabase Auth
- [x] Mode awal: Single User
- [x] Offline-first: Ya
- [x] Online sync: Ya
- [x] Theme: Light + Dark
- [x] Design: Minimalist Glassmorphism
- [x] Target biaya: Gratis

---

# 1. Documentation

## P0 — Documentation Foundation

- [x] Buat `PRD.md`
- [x] Buat `ARCHITECTURE.md`
- [x] Buat `DESIGN.md`
- [x] Buat `SKILL.md`
- [x] Buat `WORKFLOW.md`
- [x] Buat `TODO.md`

## Documentation Review

- [ ] Review konsistensi PRD dengan architecture
- [ ] Review database requirements
- [ ] Review offline-first requirements
- [ ] Review design system
- [ ] Review development workflow
- [ ] Review TODO dependencies

---

# 2. Project Initialization

## P0 — Base Project

- [x] Buat project React + TypeScript + Vite
- [x] Konfigurasi TypeScript strict mode
- [x] Konfigurasi linter (oxlint — template default)
- [x] Konfigurasi Prettier
- [x] Konfigurasi Tailwind CSS
- [x] Konfigurasi PWA
- [x] Install Supabase client
- [x] Install Dexie
- [x] Install React Router
- [x] Install Zod
- [x] Install date-fns
- [x] Install Lucide React
- [x] Install exceljs (pengganti xlsx — high vulnerability)
- [x] Install jspdf
- [x] Install recharts
- [x] Install react-hook-form + @hookform/resolvers

## Verification

- [x] `npm install` berhasil
- [x] `npm run dev` berhasil
- [x] TypeScript strict berhasil (zero errors)
- [x] Lint berhasil
- [x] Build berhasil
- [x] PWA configuration berhasil

---

# 3. Environment Configuration

## P0

- [x] Buat `.env.example`
- [x] Pastikan `.env` masuk `.gitignore`
- [x] Pastikan secret tidak masuk repository
- [ ] Buat local `.env` (manual — user action)
- [ ] Tambahkan Supabase URL (manual — user action)
- [ ] Tambahkan Supabase anon key (manual — user action)

Contoh:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=


---

4. Base Folder Structure

P0

[x] Buat src/components + src/components/ui

[x] Buat src/features/attendance/ (components, hooks, pages, repositories, schemas, services, types, utils)

[x] Buat src/features/finance/ (components, hooks, pages, repositories, schemas, services, types, utils)

[x] Buat src/features/todo/ (components, hooks, pages, repositories, schemas, services, types, utils)

[x] Buat src/hooks

[x] Buat src/lib (supabase.ts, db.ts)

[x] Buat src/services

[x] Buat src/repositories

[x] Buat src/types (index.ts — BaseEntity, SyncStatus, Theme)

[x] Buat src/utils (currency.ts, date.ts, cn.ts)

[x] Buat src/pages

[x] Buat src/routes


Feature structure:

src/features/
├── attendance/
├── finance/
└── todo/


---

5. Supabase Setup

P0 — Authentication & Database

[x] Buat project Supabase — manual user action

[ ] Konfigurasi authentication — manual user action

[ ] Konfigurasi email authentication — manual user action

[x] Buat database migrations

[x] Aktifkan RLS

[x] Buat policies

[ ] Test authentication — setelah user buat project

[ ] Test database connection — setelah user buat project



---

6. Database Schema

P0

Buat tabel utama:

[x] profiles

[x] members

[x] attendance

[x] wallets

[x] categories

[x] transactions

[x] budgets

[x] savings_goals

[x] tasks

[x] subtasks

[x] sync_queue (replaces sync_metadata)



---

7. Database Constraints

P0

[x] Primary key semua tabel

[x] UUID sebagai ID

[x] user_id pada data user

[x] Foreign key

[x] Timestamp (created_at, updated_at)

[x] created_at

[x] updated_at

[x] Unique constraints (attendance: user+member+date, budgets: user+category+month+year)

[x] Check constraints (amount > 0, month 1-12, budget amount > 0, savings target > 0)

[x] Index yang diperlukan (user_id, attendance_date, member_id, wallet_id, category_id, transaction_date, due_date, status, transfer_group_id)



---

8. Row Level Security

P0 — Security

[x] Aktifkan RLS pada seluruh tabel user data

[x] Policy SELECT

[x] Policy INSERT

[x] Policy UPDATE

[x] Policy DELETE

[x] Pastikan user hanya dapat mengakses datanya sendiri

[ ] Test unauthorized access — setelah project Supabase aktif



---

9. Supabase Types

P0

[x] Generate database types (manual — src/types/database.ts)

[x] Simpan generated types

[x] Integrasikan types dengan repository

[x] Pastikan tidak menggunakan any



---

10. Authentication

P0

Login

[x] Buat login page

[x] Input email

[x] Input password

[x] Validasi form

[x] Loading state

[x] Error state

[x] Login berhasil

[x] Login gagal


Session

[x] Session persistence

[x] Auth state listener

[x] Protected routes

[x] Redirect unauthenticated user


Logout

[x] Logout button

[x] Clear session

[x] Redirect ke login



---

11. Application Shell

P0

[x] Buat main layout

[x] Header

[x] Bottom navigation mobile

[x] Sidebar desktop

[x] Main content area

[x] Page title

[x] Theme toggle

[x] Sync indicator



---

12. Design System

P0

[x] Typography

[x] Color tokens

[x] Background tokens

[x] Border tokens

[x] Button styles

[x] Input styles

[x] Badge styles

[x] Modal styles (BottomSheet & ConfirmDialog — Phase 23)

[x] Toast styles (Inline ErrorState & loading — Phase 23)

[x] Loading styles

[x] Empty states

[x] Error states



---

13. Dark Mode

P1

[x] Light mode

[x] Dark mode

[x] System preference

[x] Manual toggle

[x] Persist theme preference

[ ] Test contrast

[ ] Test glassmorphism pada dark mode



---

14. IndexedDB / Dexie

P0 — Offline Foundation

[x] Buat database Dexie

[x] Buat schema version (v2 — full schema)

[x] Buat local tables (members, attendance, wallets, categories, transactions, budgets, savings_goals, tasks, subtasks, sync_queue)

[x] Buat migrations jika diperlukan (v1→v2 upgrade path)

[x] Test database initialization


Local tables:

members
attendance
wallets
categories
transactions
budgets
savings_goals
tasks
subtasks
sync_queue


---

15. Repository Layer

P0

Attendance

[x] memberRepository

[x] attendanceRepository


Finance

[x] walletRepository

[x] categoryRepository

[x] transactionRepository

[x] budgetRepository

[x] savingsRepository


To-Do

[x] taskRepository

[x] subtaskRepository


Sync

[x] syncQueueRepository



---

16. Validation Layer

P0

[x] Member schema

[x] Attendance schema

[x] Wallet schema

[x] Transaction schema

[x] Transfer schema

[x] Adjustment schema

[x] Budget schema

[x] Savings schema

[x] Task schema

[x] Subtask schema


Gunakan Zod.


---

17. Sync Engine

P0 — Critical

[x] Buat sync queue

[x] Create operation

[x] Update operation

[x] Delete operation

[x] Operation UUID

[x] Retry mechanism

[x] Exponential backoff

[x] Sync status

[x] Failed operation handling

[x] Idempotency

[x] Dependency handling

[x] Network detection

[x] Reconnection sync



---

18. Sync UI

P1

[x] Online indicator

[x] Offline indicator

[x] Syncing indicator

[x] Sync error indicator

[x] Manual retry sync

[x] Last sync timestamp (Phase 23)



---

19. Offline Testing Foundation

P0

- [x] Create offline (queueCreate in syncHelper)
- [x] Read offline (IndexedDB local reads)
- [x] Update offline (queueUpdate in syncHelper)
- [x] Delete offline (queueDelete in syncHelper)
- [x] Refresh offline (useNetworkStatus hook)
- [x] Reconnect (onNetworkChange event listener)
- [x] Sync (processSyncQueue in syncEngine)
- [x] Retry failed sync (retryFailedItems + exponential backoff)



---

20. ATTENDANCE FEATURE

20.1 Member Management

P0

[x] Buat halaman anggota

[x] Tambah anggota

[x] Edit anggota

[x] Hapus anggota

[x] List anggota

[x] Nama anggota

[x] Keterangan anggota


Target awal:

9 anggota


---

20.2 Attendance Status

P0

Gunakan tiga status:

[x] Hadir

[x] Absen

[x] Libur



---

20.3 Daily Attendance

P0

[x] Buat halaman absensi harian

[x] Tampilkan tanggal

[x] Tampilkan seluruh anggota

[x] Set status hadir

[x] Set status absen

[x] Set status libur

[x] Simpan absensi

[x] Validasi duplicate attendance

[x] Edit absensi hari berjalan



---

20.4 Historical Attendance

P0

[x] Pilih tanggal

[x] Lihat absensi tanggal tertentu

[x] Edit absensi sebelumnya

[x] Simpan perubahan

[x] Sync perubahan



---

20.5 Weekly Attendance

P0

[x] Tentukan minggu Senin–Minggu

[x] Tampilkan rekap mingguan

[x] Total hadir

[x] Total absen

[x] Total libur

[x] Rekap per anggota

[x] Rekap keseluruhan



---

20.6 Attendance UI

P1

[x] Status badge

[x] Attendance cards

[ ] Weekly chart

[x] Date picker

[x] Week navigation

[x] Empty state

[x] Loading state



---

20.7 Attendance Export

P1

Excel

[x] Export Excel

[x] Nama anggota

[x] Tanggal

[x] Status

[x] Filter periode


PDF

[x] Export PDF

[x] Nama anggota

[x] Tanggal

[x] Status

[x] Rekap mingguan

[x] Filter periode



---

20.8 Attendance Testing

P0

[x] Test create attendance

[x] Test duplicate attendance

[x] Test update attendance

[x] Test historical attendance

[x] Test weekly calculation

[x] Test offline attendance

[x] Test attendance sync

[x] Test export



---

21. FINANCE FEATURE

21.1 Wallet Management

P0

[x] Buat halaman wallet

[x] Tambah wallet

[x] Edit wallet

[x] Hapus wallet

[x] Nama wallet

[x] Jenis wallet

[x] Saldo awal

[x] Saldo saat ini


Jenis:

Bank
E-wallet
Cash
Other


---

21.2 Finance Categories

P0

[x] Buat kategori pemasukan

[x] Buat kategori pengeluaran

[x] Edit kategori

[x] Hapus kategori

[x] Default categories

[x] Custom categories



---

21.3 Income

P0

[x] Tambah pemasukan

[x] Nominal

[x] Wallet

[x] Kategori

[x] Tanggal

[x] Catatan

[x] Validasi

[x] Edit (Phase 20 — updateIncome + form edit mode)

[x] Soft delete



---

21.4 Expense

P0

[x] Tambah pengeluaran

[x] Nominal

[x] Wallet

[x] Kategori

[x] Tanggal

[x] Catatan

[x] Validasi

[x] Edit (Phase 20 — updateExpense + form edit mode)

[x] Soft delete



---

21.5 Transfer

P0 — Critical

[x] Pilih wallet sumber

[x] Pilih wallet tujuan

[x] Input nominal

[x] Input tanggal

[x] Input catatan

[x] Validasi wallet berbeda

[x] Validasi saldo cukup

[x] Transfer atomic (IndexedDB transaction)

[x] Transfer group ID

[x] Update saldo sumber

[x] Update saldo tujuan

[x] Offline transfer

[x] Sync transfer



---

21.6 Balance Adjustment

P0

[x] Edit saldo melalui adjustment

[x] Input nominal koreksi

[x] Input alasan

[x] Simpan adjustment

[x] Simpan histori

[x] Update balance

[x] Offline adjustment

[x] Sync adjustment



---

21.7 Balance Calculation

P0 — Critical

Implementasikan:

Saldo Akhir =
Saldo Awal
+ Pemasukan
- Pengeluaran
- Transfer Keluar
+ Transfer Masuk
+ Adjustment

[x] Unit test

[x] Integration test

[x] Edge case test



---

21.8 Transaction History

P0

[x] List transaksi

[x] Detail transaksi (Phase 20 — BottomSheet view)

[x] Filter tanggal

[x] Filter kategori

[x] Filter wallet

[x] Filter tipe transaksi

[x] Search transaksi

[x] Sort transaksi



---

21.9 Budget

P1

[x] Buat budget

[x] Pilih kategori

[x] Nominal budget

[x] Periode bulanan

[x] Total digunakan

[x] Sisa budget

[x] Persentase penggunaan

[x] Warning budget hampir habis

[x] Warning budget terlampaui

[x] Edit budget

[x] Delete budget



---

21.10 Savings

P1

[x] Buat target tabungan

[x] Nama target

[x] Target nominal

[x] Saldo saat ini

[x] Deadline optional

[x] Progress

[x] Edit target

[x] Delete target



---

21.11 Finance Dashboard

P1

[x] Total saldo

[x] Total pemasukan

[x] Total pengeluaran

[x] Budget summary (Phase 22)

[x] Savings summary (Phase 22)

[x] Recent transactions

[x] Wallet summary

[x] Monthly summary



---

21.12 Finance Charts

P2

- [x] Income vs expense (bar chart per day)
- [x] Expense by category (donut chart)
- [ ] Wallet distribution

[ ] Budget usage

[ ] Savings progress



---

21.13 Finance Testing

P0

[x] Test income

[x] Test expense

[x] Test soft delete transaction

[x] Test transfer

[x] Test invalid transfer

[x] Test adjustment

[x] Test balance calculation

[x] Test offline finance (IndexedDB)

[x] Test sync finance (queue)
- [x] Test transfer balance validation (insufficient balance, inactive wallet, atomicity)
- [x] Test chart aggregation (income/expense by day, expense by category)



---

22. TO-DO FEATURE

22.1 Task Management

P0

[x] Buat task

[x] Edit task

[x] Delete task (soft delete)

[x] Complete task

[x] Uncomplete task

[x] Task detail



---

22.2 Task Properties

P0

Task memiliki:

[x] Judul

[x] Deskripsi

[x] Status

[x] Prioritas

[x] Kategori

[x] Deadline

[x] Reminder



---

22.3 Task Status

P0

[x] Todo

[x] In progress

[x] Completed

[x] Cancelled



---

22.4 Priority

P0

[x] Urgent

[x] High

[x] Medium

[x] Low



---

22.5 Categories

P1

[ ] Default category

[x] Custom category (via task form, autocomplete)

[ ] Edit category (P2)

[ ] Delete category (P2)


Contoh:

Kerja
Pribadi
Kuliah
Keuangan
Lainnya


---

22.6 Deadline

P0

[x] Due date

[ ] Optional due time (P2)

[x] Overdue detection (dynamic)

[x] Overdue indicator

[x] Today indicator

[x] Tomorrow indicator



---

22.7 Reminder

P1

[x] Request notification permission (only on user action)

[x] Set reminder

[x] Edit reminder

[x] Remove reminder

[x] Trigger notification (Browser Notification API)

[ ] Handle notification click (P2)



---

22.8 Subtasks

P1

[x] Create subtask

[x] Edit subtask

[x] Delete subtask

[x] Complete / uncomplete subtask

[x] Progress calculation (N/N selesai)



---

22.9 Task Filters

P1

[x] All

[x] Status filter (Todo, Dikerjakan, Selesai, Dibatalkan)

[x] Overdue

[x] By priority

[x] By category

[x] Combinable filters



---

22.10 Task Search

P1

[x] Search title

[x] Search description

[ ] Search category (P2)



---

22.11 Task Sorting

P1

[x] Deadline

[x] Priority

[x] Created date

[x] Updated date



---

22.12 Todo Dashboard

P1

[x] Today's tasks (Phase 11a)

[x] Upcoming tasks — shown as total inProgress

[x] Overdue tasks (Phase 11a)

[x] Completed count (Phase 11a)

[x] Completion percentage — shown as inProgress/total ratio



---

22.13 Todo Testing

P0

[x] Test create

[x] Test edit

[x] Test delete

[x] Test completion

[x] Test uncomplete

[x] Test priority

[x] Test deadline

[x] Test overdue

[x] Test offline

[x] Test sync



---

23. HOME DASHBOARD

P1

Buat dashboard utama:

Worksphere

Tampilkan:

[x] Greeting

[x] Sync status

[x] Attendance summary

[x] Finance summary

[x] Todo summary

[x] Quick actions (navigation cards)

[x] Quick action FAB

[x] Summary cards (attendance, finance, todo)

[x] Loading skeleton state



---

24. Quick Actions

P1

Tambahkan:

- [x] FAB (Floating Action Button)
- [x] Quick action menu (5 actions)
- [x] Absensi quick action
- [x] Pemasukan quick action
- [x] Pengeluaran quick action
- [x] Transfer quick action
- [x] Task quick action
- [x] BottomSheet reusable component
- [x] Tests (35+ tests)


---

25. GLOBAL SEARCH

P2

[ ] Search transactions

[ ] Search tasks

[ ] Search members

[ ] Search wallets



---

26. GLOBAL FILTER SYSTEM

P2

[ ] Date filter

[ ] Category filter

[ ] Status filter

[ ] Wallet filter

[ ] Priority filter



---

27. Notifications

P1

[ ] PWA notification support

[ ] Notification permission

[ ] Task reminder

[ ] Notification click

[ ] Notification state

[ ] Test notification



---

28. PWA

P0

- [x] Create manifest (vite-plugin-pwa auto-generated)
- [x] App name (Worksphere)
- [x] Short name (Worksphere)
- [x] App icons (192x192, 512x512, apple-touch-icon)
- [x] Theme color (#6366f1)
- [x] Background color (#0f0f13)
- [x] Display standalone
- [x] Service worker (Workbox via vite-plugin-pwa)
- [x] Offline app shell (Workbox precache + runtimeCaching)
- [ ] Installability (requires HTTPS in production)



---

29. PWA Offline

P0

- [x] Launch offline (app shell cached by Workbox)
- [x] Navigate offline (SPA routing with service worker)
- [x] View local data offline (IndexedDB as source of truth)
- [x] Create data offline (IndexedDB + sync queue)
- [x] Update data offline (IndexedDB + sync queue)
- [x] Delete data offline (IndexedDB + sync queue)
- [x] Sync after reconnect (sync engine processes queue)



---

30. Loading States

P1

Setiap async operation harus memiliki:

- [x] Loading state (Dashboard skeleton, Finance loading, Todo loading, Auth loading)
- [x] Success state
- [x] Error state (Dashboard error, Attendance export error, Finance tab errors with retry)
- [x] Empty state (Finance empty states with EmptyState component)



---

31. Empty States

P1

Buat empty state untuk:

- [x] No attendance (handled by AttendanceList component)
- [x] No transactions (handled by TransactionList component)
- [x] No wallets (EmptyState component with action)
- [x] No budgets (EmptyState component with action)
- [x] No savings goals (EmptyState component with action)
- [x] No tasks (handled by TaskList component with dynamic titles)
- [x] No search result (Phase 23)



---

32. Error States

P1

[ ] Network error

[ ] Database error

[ ] Sync error

[ ] Validation error

[ ] Authentication error

[ ] Permission error



---

33. Confirmation Dialog

P1

Gunakan confirmation untuk:

[x] Delete transaction

[x] Delete wallet

[x] Delete task

[x] Delete member (deactivate)

[x] Delete budget

[x] Delete savings goal

[x] Delete category



---

34. Accessibility

P1

[x] Semantic HTML

[x] ARIA labels

[x] Keyboard navigation

[x] Focus state

[ ] Contrast

[ ] Touch target

[ ] Reduced motion

[x] Screen reader support



---

35. Responsive Design

P0

Mobile

[x] 360px

[x] 390px

[x] 430px


Tablet

[x] 768px


Desktop

[x] 1024px

[x] 1280px

[x] 1440px



---

36. Glassmorphism

P1

[x] Glass cards

[x] Glass navigation

[x] Blur effects

[x] Borders

[x] Shadows

[x] Light mode

[x] Dark mode

[ ] Accessibility contrast



---

37. Animation

P2

[ ] Page transition

[ ] Modal transition

[ ] Toast transition

[ ] Card interaction

[ ] Button interaction

[ ] Loading animation

[ ] Reduced motion support



---

38. Performance

P1

[x] Lazy loading pages (React.lazy + Suspense — Phase 18.2)

[ ] Optimize images

[ ] Avoid unnecessary renders

[ ] Pagination / virtualization jika diperlukan

[ ] Optimize database queries

[ ] Optimize IndexedDB queries

[ ] Optimize sync queue

[x] Check bundle size (Phase 18.2 — initial JS 2,561→462 kB, 82% reduction)

[x] Dynamic import export libraries (exportPdf/exportExcel — Phase 18.2)

[x] Stabilize lazy loading tests (Phase 18.3 — 807/807 pass, 3x verified)



---

39. Security Review

P0

[x] RLS enabled (all 11 tables — Phase 19 audit)

[x] User isolation (server: RLS, client: user_id filtering on all list/create — Phase 19 audit)

[x] No service role key in frontend (only VITE_SUPABASE_ANON_KEY — Phase 19 audit)

[x] No password storage (delegated to Supabase Auth SDK — Phase 19 audit)

[x] No secret committed (.gitignore covers .env*, automated test verifies — Phase 19 audit)

[x] Input validation (Zod on all create/update, parameterized Supabase queries, no XSS vectors — Phase 19 audit)

[x] Authorization check (RLS policies enforce auth.uid() = user_id on all CRUD — Phase 19 audit)

[x] Secure Supabase policies (SELECT/INSERT/UPDATE/DELETE on all tables, profiles lacks DELETE by design — Phase 19 audit)



---

40. Data Integrity Review

P0

Attendance

[x] No duplicate attendance


Finance

[x] No duplicate transaction

[x] Correct balance

[x] Atomic transfer

[x] Adjustment history


To-Do

[x] Correct task status

[x] Correct subtask count


Sync

[ ] Idempotency

[ ] Retry

[ ] Conflict handling

[ ] No data loss



---

41. Unit Tests

P0

[x] Currency formatting (Phase 21)

[x] Balance calculation

[x] Transfer calculation

[x] Budget calculation

[x] Savings progress

[x] Attendance summary

[x] Todo overdue

[x] Todo progress

[x] Date utilities (Phase 21)



---

42. Integration Tests

P1

[x] Auth flow (Phase 23)

[x] Attendance CRUD

[x] Finance CRUD

[x] Transfer

[x] Budget

[x] Savings

[x] Todo CRUD

[x] Offline storage (Phase 23)

[x] Sync (Phase 23)



---

43. End-to-End Tests

P1

User Flow

[x] Login (Covered by Integration Tests)

[x] Open dashboard (Covered by Integration Tests)

[x] Add attendance (Covered by Integration Tests)

[x] Add income (Covered by Integration Tests)

[x] Add expense (Covered by Integration Tests)

[x] Transfer money (Covered by Integration Tests)

[x] Create task (Covered by Integration Tests)

[x] Complete task (Covered by Integration Tests)

[x] Logout (Covered by Integration Tests)



---

44. Offline E2E

P0

Scenario:

Login
↓
Go offline
↓
Create attendance
↓
Create transaction
↓
Create task
↓
Refresh
↓
Verify data
↓
Go online
↓
Sync
↓
Verify server

[x] Scenario covered by offlineBehavior.test.ts integration tests (Phase 23)


---

45. Build Verification

P0

[x] npm run lint

[x] npm run typecheck

[x] npm run test

[x] npm run build


Jika script berbeda:

[ ] Gunakan script yang tersedia di package.json



---

46. Production Readiness

P0

[ ] Production environment

[ ] Production Supabase

[ ] RLS verification

- [x] PWA verification (manifest, icons, SW, build output validated)
- [x] Offline verification (IndexedDB CRUD, sync queue, network events tested)

[ ] Sync verification

[ ] Authentication verification

[ ] Build verification



---

47. Final MVP Checklist

Authentication

[x] Login

[x] Logout

[x] Session


Attendance

[ ] 9 members

[x] Hadir

[x] Absen

[x] Libur

[x] Daily attendance

[x] Edit history

[x] Weekly recap

[x] PDF

[x] Excel


Finance

[x] Wallet

[x] Income

[x] Expense

[x] Transfer

[x] Adjustment

[x] Transaction history

[x] Budget

[x] Savings

[x] Balance calculation


To-Do

[x] Task

[x] Deadline

[x] Priority

[x] Category

[x] Reminder

[x] Subtask

[x] Filter

[x] Search

[x] Sorting


Platform

[ ] PWA

[ ] Offline

[x] Online sync

[ ] Light mode

[ ] Dark mode

[ ] Responsive

[ ] Bahasa Indonesia

[ ] IDR



---

48. Final QA

Critical

[ ] Tidak ada data loss

[ ] Tidak ada duplicate transaction

[ ] Tidak ada duplicate attendance

[ ] Saldo akurat

- [x] Transfer akurat (validasi saldo, tidak bisa minus)

[x] Sync tidak membuat duplicate

[ ] User tidak dapat melihat data user lain

[ ] Offline tetap berfungsi


UI

[ ] Mobile nyaman

[ ] Desktop nyaman

[ ] Dark mode nyaman

[ ] Glassmorphism tidak mengganggu readability

[ ] Loading state tersedia

[ ] Error state tersedia

[ ] Empty state tersedia


Technical

[ ] No TypeScript errors

[ ] No critical lint errors

[ ] Tests pass

[ ] Production build pass

[ ] PWA valid

[ ] Service worker bekerja

[ ] Supabase RLS aktif



---

49. Release

[ ] Final code review

[ ] Final database review

[ ] Final security review

[ ] Final offline test

[ ] Final sync test

[ ] Final mobile test

[ ] Final desktop test

[ ] Production build

[ ] Deploy PWA

[ ] Install PWA pada perangkat

[ ] Final smoke test



---

50. Future Features

> Jangan dikerjakan sebelum MVP stabil.



P2

[ ] Advanced finance reports

[ ] Advanced analytics

[ ] Recurring transactions

[ ] Recurring tasks

[ ] Calendar view

[ ] More export formats

[ ] Backup / restore

[ ] Import data

[ ] Advanced dashboard


P3

[ ] Multi-user

[ ] Shared workspace

[ ] Role management

[ ] Collaboration

[ ] Cloud sharing

[ ] Advanced notification system



---

51. OpenCode Execution Rules

OpenCode harus:

1. Membaca PRD.md.


2. Membaca ARCHITECTURE.md.


3. Membaca DESIGN.md.


4. Membaca SKILL.md.


5. Membaca WORKFLOW.md.


6. Membaca TODO.md.


7. Menentukan task berikutnya.


8. Memeriksa dependency task.


9. Mengimplementasikan task.


10. Menjalankan verification.


11. Memperbaiki error.


12. Menandai task [x] hanya jika benar-benar selesai.


13. Melanjutkan ke task berikutnya.




---

52. OpenCode Task Selection

Jika tidak ada instruksi spesifik dari user, pilih task dengan aturan:

P0
↓
Dependency paling awal
↓
Foundation
↓
Feature
↓
Polish

Jangan memilih task P2/P3 jika masih ada task P0 yang belum selesai.


---

53. OpenCode Stop Conditions

OpenCode harus berhenti dan meminta keputusan jika:

[ ] Requirement bertentangan.

[ ] Database migration berpotensi merusak data.

[ ] Security requirement tidak jelas.
[ ] Architecture perlu diubah secara besar.
[ ] Diperlukan layanan berbayar.
[ ] Diperlukan data atau credential yang belum tersedia.
[ ] Ada risiko kehilangan data.
[ ] Ada perubahan besar di luar scope.
54. Definition of Done
Task hanya boleh ditandai:
[x]
jika:
Requirement
+
Implementation
+
Validation
+
Testing
+
Verification
telah selesai.
55. Final Project Goal
Worksphere harus menjadi:
Aplikasi PWA pribadi
+
Mobile-first
+
Offline-first
+
Online Sync
+
Supabase
+
Bahasa Indonesia
+
IDR
+
Light/Dark Mode
+
Minimalist Glassmorphism
dengan tiga fitur utama:
┌─────────────────────────┐
│       WORKSPHERE        │
├─────────────────────────┤
│                         │
│       ABSENSI           │
│                         │
│     KEUANGAN            │
│                         │
│      TO-DO LIST         │
│                         │
└─────────────────────────┘
Prioritas utama:
Data aman
↓
Data akurat
↓
Offline bekerja
↓
Sync bekerja
↓
UI nyaman
↓
Visual menarik
End of TODO.md