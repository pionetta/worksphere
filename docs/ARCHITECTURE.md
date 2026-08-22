# Worksphere — Architecture Document

## 1. Tujuan Dokumen

Dokumen ini menjelaskan arsitektur teknis aplikasi Worksphere.

Dokumen ini menjadi acuan utama dalam menentukan:

- Struktur project.
- Teknologi.
- Struktur database.
- Alur data.
- Offline-first architecture.
- Sinkronisasi dengan Supabase.
- Authentication.
- State management.
- Pemisahan frontend dan data layer.
- Keamanan.
- Struktur kode.

Implementasi harus mengikuti dokumen ini kecuali terdapat alasan teknis yang kuat untuk melakukan perubahan.

Jika arsitektur perlu diubah, perubahan harus dilakukan secara konsisten terhadap seluruh project.

---

# 2. Gambaran Arsitektur

Worksphere menggunakan arsitektur:

```text
Mobile PWA
     │
     ▼
React Application
     │
     ├── UI Layer
     │
     ├── State Layer
     │
     ├── Service Layer
     │
     └── Data Layer
             │
             ├── IndexedDB / Dexie
             │
             └── Supabase
                     │
                     ├── PostgreSQL
                     └── Supabase Auth

Pendekatan utama:

Local First
+
Cloud Sync

Aplikasi tidak boleh bergantung sepenuhnya pada koneksi internet untuk operasi utama.


---

3. Technology Stack

3.1 Frontend

Gunakan:

React
TypeScript
Vite

Alasan:

Ekosistem matang.

Cocok untuk PWA.

TypeScript meningkatkan keamanan kode.

Vite memberikan development experience yang cepat.



---

4. PWA

Gunakan:

vite-plugin-pwa

PWA harus menyediakan:

Web App Manifest.

Service Worker.

Offline asset caching.

Installable application.

Standalone display mode.

Update mechanism.



---

5. Styling

Gunakan:

Tailwind CSS

Design system harus dibuat berdasarkan token.

Contoh:

spacing
radius
font-size
shadow
blur
opacity
surface
border

Jangan membuat nilai styling yang tidak konsisten di setiap component.


---

6. UI Components

Gunakan component-based architecture.

Contoh:

Button
Input
Select
Modal
Drawer
Card
Badge
Tabs
Dropdown
Toast
DatePicker
ConfirmDialog
EmptyState
LoadingState
ErrorState

Component reusable harus ditempatkan di:

src/components/


---

7. Icon

Gunakan:

Lucide React

Jangan menggunakan emoji sebagai icon utama UI.


---

8. Routing

Gunakan:

React Router

Struktur route:

/
├── /login
├── /dashboard
├── /attendance
├── /attendance/members
├── /attendance/history
├── /finance
├── /finance/wallets
├── /finance/transactions
├── /finance/budget
├── /finance/savings
├── /todos
└── /settings

Route yang membutuhkan authentication harus dilindungi.


---

9. Authentication Architecture

Gunakan:

Supabase Auth

Metode authentication awal:

Email
Password

Flow:

User
 ↓
Login
 ↓
Supabase Auth
 ↓
Session
 ↓
Application

Session harus dipersist agar user tidak perlu login setiap kali membuka aplikasi.


---

10. Authentication Guard

Route private harus menggunakan authentication guard.

Contoh:

User belum login
        ↓
      /login

User sudah login
        ↓
     /dashboard

Jangan hanya menyembunyikan UI.

Authorization harus tetap dilakukan pada database melalui RLS.


---

11. Database

Database cloud menggunakan:

Supabase PostgreSQL

Database harus menggunakan UUID sebagai primary key.

Contoh:

id uuid primary key

Jangan menggunakan auto-increment integer untuk entity utama yang perlu disinkronkan secara offline.


---

12. User Ownership

Setiap data milik user harus memiliki:

user_id uuid

Contoh:

attendance_members
    id
    user_id
    name
    note

RLS harus memastikan:

auth.uid() = user_id


---

13. Database Tables

Minimal terdapat tabel:

profiles
attendance_members
attendance_records

wallets
categories
transactions
budgets
savings_goals

tasks
task_subtasks

sync_queue

Jika diperlukan tabel tambahan dapat dibuat tanpa merusak struktur utama.


---

14. Profiles

Tabel:

profiles

Kolom:

id
email
display_name
created_at
updated_at

id harus sama dengan:

auth.users.id


---

15. Attendance Members

Tabel:

attendance_members

Struktur:

id
user_id
name
note
is_active
created_at
updated_at

Keterangan:

id          UUID
user_id     UUID
name        TEXT
note        TEXT nullable
is_active   BOOLEAN
created_at  TIMESTAMP
updated_at  TIMESTAMP


---

16. Attendance Records

Tabel:

attendance_records

Struktur:

id
user_id
member_id
attendance_date
status
note
created_at
updated_at

Status:

present
absent
holiday

Constraint penting:

UNIQUE(member_id, attendance_date)

Tujuannya memastikan satu anggota hanya mempunyai satu absensi dalam satu hari.


---

17. Attendance Query

Untuk mendapatkan absensi mingguan:

attendance_date >= week_start
AND
attendance_date <= week_end

Minggu dimulai:

Senin

dan berakhir:

Minggu


---

18. Wallets

Tabel:

wallets

Struktur:

id
user_id
name
type
initial_balance
note
is_active
created_at
updated_at

Type:

bank
ewallet
cash
savings
other

Nominal:

BIGINT

Jangan menggunakan floating point untuk nilai uang.


---

19. Categories

Tabel:

categories

Struktur:

id
user_id
name
type
icon
is_active
created_at
updated_at

Type:

income
expense

Category tidak boleh digunakan jika tidak sesuai dengan tipe transaksi.


---

20. Transactions

Tabel:

transactions

Struktur:

id
user_id
wallet_id
type
amount
category_id
transaction_date
note
transfer_group_id
created_at
updated_at
deleted_at

Type:

income
expense
transfer_in
transfer_out
adjustment


---

21. Money Rules

Nominal harus:

BIGINT

Contoh:

Rp100.000

disimpan:

100000

Jangan menyimpan:

100000.50

karena IDR tidak membutuhkan decimal dalam versi awal.


---

22. Transaction Rules

Income

Menambah saldo wallet.

balance += amount

Expense

Mengurangi saldo wallet.

balance -= amount

Transfer Out

Mengurangi wallet sumber.

source -= amount

Transfer In

Menambah wallet tujuan.

destination += amount

Adjustment

Dapat bernilai positif atau negatif.

balance += adjustment


---

23. Transfer Architecture

Transfer antar wallet harus dianggap sebagai satu logical operation.

Contoh:

BCA
Rp1.000.000

       ↓ Rp200.000

DANA
Rp100.000

Setelah transfer:

BCA
Rp800.000

DANA
Rp300.000

Gunakan:

transfer_group_id

untuk menghubungkan:

transfer_out
transfer_in

Kedua transaksi harus memiliki:

transfer_group_id = UUID yang sama


---

24. Transfer Consistency

Transfer harus atomic.

Tidak boleh terjadi:

Source berhasil dikurangi
Destination gagal ditambahkan

Jika memungkinkan, gunakan PostgreSQL function/RPC untuk operasi transfer.


---

25. Adjustment

Adjustment harus dibuat sebagai transaksi.

Contoh:

type = adjustment
amount = 50000

Untuk pengurangan:

type = adjustment
amount = -50000

Adjustment harus menyimpan catatan.

Contoh:

note = "Koreksi saldo"


---

26. Soft Delete

Data transaksi sebaiknya menggunakan:

deleted_at

daripada langsung menghapus data dari database.

Contoh:

deleted_at = 2026-08-18T10:00:00

Data dengan:

deleted_at IS NOT NULL

tidak ditampilkan pada UI normal.


---

27. Budget

Tabel:

budgets

Struktur:

id
user_id
category_id
amount
start_date
end_date
note
created_at
updated_at

Budget dihitung berdasarkan transaksi pengeluaran dalam periode tersebut.


---

28. Savings Goals

Tabel:

savings_goals

Struktur:

id
user_id
name
target_amount
current_amount
deadline
note
created_at
updated_at

Jika target tabungan menggunakan transaksi khusus di masa depan, arsitektur dapat diperluas tanpa mengubah struktur dasar.


---

29. Tasks

Tabel:

tasks

Struktur:

id
user_id
title
description
status
priority
category
due_date
reminder_at
is_recurring
recurrence_rule
completed_at
created_at
updated_at
deleted_at

Status:

todo
in_progress
completed
cancelled

Priority:

urgent
high
medium
low


---

30. Task Subtasks

Tabel:

task_subtasks

Struktur:

id
task_id
user_id
title
is_completed
position
created_at
updated_at

position digunakan untuk menentukan urutan subtask.


---

31. Local Database

Gunakan:

IndexedDB

dengan wrapper:

Dexie

Database lokal harus memiliki tabel yang mencerminkan data utama.

Contoh:

local database
├── profiles
├── attendance_members
├── attendance_records
├── wallets
├── categories
├── transactions
├── budgets
├── savings_goals
├── tasks
├── task_subtasks
└── sync_queue


---

32. Source of Truth

Untuk UI, local database menjadi source of truth utama.

Flow:

UI
 ↓
Local Database
 ↓
UI Update
 ↓
Sync Queue
 ↓
Supabase

Jangan membuat UI menunggu server untuk menampilkan perubahan lokal.


---

33. Offline Create

Ketika user membuat data saat offline:

User
 ↓
Create Entity
 ↓
Save to IndexedDB
 ↓
Show result immediately
 ↓
Add sync operation

Contoh:

Create Expense

langsung terlihat di UI meskipun tidak ada internet.


---

34. Offline Update

Flow:

User Edit
 ↓
Update IndexedDB
 ↓
Update UI
 ↓
Create Sync Queue Item


---

35. Offline Delete

Jika data dapat dihapus:

Soft Delete Local
 ↓
Sync Queue
 ↓
Server Soft Delete


---

36. Sync Queue

Tabel lokal:

sync_queue

Struktur:

id
entity
entity_id
operation
payload
created_at
retry_count
last_error
status

Operation:

create
update
delete

Status:

pending
processing
failed
completed


---

37. Sync Process

Ketika online:

Detect Online
      ↓
Read Pending Queue
      ↓
Process Operation
      ↓
Send to Supabase
      ↓
Success?
   /       \
 Yes       No
 ↓          ↓
Complete   Retry


---

38. Retry

Jika sync gagal:

retry_count += 1

Gunakan exponential backoff jika diperlukan.

Contoh:

1s
2s
4s
8s
16s

Jangan melakukan request tanpa batas secara cepat.


---

39. Idempotency

Setiap entity harus memiliki UUID yang dibuat client.

Contoh:

crypto.randomUUID()

Ketika operasi dikirim ulang, server harus mengenali ID yang sama.

Tujuannya mencegah:

Duplicate transaction
Duplicate attendance
Duplicate task


---

40. Conflict Resolution

Versi awal menggunakan:

Last Write Wins

berdasarkan:

updated_at

Namun transaksi keuangan harus menggunakan operasi yang aman dan idempotent.

Jangan membuat dua transaksi berbeda menjadi satu hanya karena timestamp sama.


---

41. Network Detection

Aplikasi harus mendeteksi:

online
offline

Gunakan:

navigator.onLine

ditambah mekanisme request verification bila diperlukan.

Status:

Online
Offline
Syncing
Synced
Sync Error


---

42. Sync Indicator

UI harus memberikan indikator kecil.

Contoh:

● Tersinkron
○ Offline
↻ Menyinkronkan
⚠ Gagal sinkron

Indikator tidak boleh mengganggu penggunaan aplikasi.


---

43. State Management

Gunakan state management hanya jika diperlukan.

Prioritaskan:

React state
Context
TanStack Query

Jika menggunakan TanStack Query, jangan menjadikan server cache sebagai satu-satunya tempat data aplikasi.

Local database tetap menjadi sumber data utama untuk offline-first.


---

44. Data Access Layer

UI tidak boleh mengakses Supabase secara langsung di setiap component.

Gunakan service/repository.

Contoh:

AttendanceRepository
FinanceRepository
TodoRepository

Contoh:

attendanceRepository.create()
attendanceRepository.update()
attendanceRepository.list()


---

45. Repository Pattern

Struktur:

UI
 ↓
Hooks
 ↓
Repository
 ↓
Local DB
 ↓
Sync
 ↓
Supabase

Tujuan:

Memisahkan UI dari database.

Mempermudah testing.

Mempermudah perubahan storage.

Memudahkan offline implementation.



---

46. Folder Structure

Struktur awal:

src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layout/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── feedback/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── attendance/
│   ├── finance/
│   └── todos/
│
├── lib/
│   ├── supabase/
│   ├── db/
│   ├── sync/
│   ├── utils/
│   └── notifications/
│
├── hooks/
│
├── types/
│
├── styles/
│
├── App.tsx
└── main.tsx


---

47. Feature Structure

Setiap feature sebaiknya terisolasi.

Contoh:

features/finance/

├── components/
├── pages/
├── hooks/
├── services/
├── repositories/
├── schemas/
├── types/
└── utils/


---

48. Validation

Gunakan:

Zod

Validasi harus dilakukan sebelum data disimpan.

Contoh:

amount > 0
name tidak kosong
date valid
wallet berbeda pada transfer


---

49. Error Handling

Error harus memiliki tiga level:

User Error
Network Error
System Error

Contoh user error:

"Nominal harus lebih dari Rp0."

Network error:

"Tidak ada koneksi. Data disimpan secara offline."

System error:

"Terjadi kesalahan. Silakan coba lagi."

Jangan menampilkan stack trace kepada user.


---

50. Loading State

Gunakan loading state hanya ketika benar-benar diperlukan.

Local database harus memberikan response secepat mungkin.

Gunakan:

Skeleton
Spinner
Progress indicator

secara proporsional.


---

51. Empty State

Setiap halaman harus memiliki empty state.

Contoh:

Belum ada transaksi

Mulai catat pemasukan atau pengeluaran Anda.

Sediakan CTA jika memungkinkan.


---

52. Confirmation

Operasi destruktif harus meminta konfirmasi.

Contoh:

Hapus transaksi?
Data ini akan dihapus dari daftar transaksi.

Untuk transaksi keuangan, gunakan pesan yang jelas karena berdampak pada saldo.


---

53. Financial Integrity

Saldo harus selalu dapat dijelaskan dari histori transaksi.

Jangan membuat:

balance = nilai random yang diubah langsung

kecuali melalui:

initial_balance

atau:

adjustment transaction


---

54. Financial Calculation

Saldo:

balance =
initial_balance
+ income
- expense
+ transfer_in
- transfer_out
+ adjustment

Gunakan integer.

Contoh:

initial = 1000000
income = 500000
expense = 100000
transfer_in = 200000
transfer_out = 50000
adjustment = 10000

Maka:

balance = 1560000


---

55. Date Handling

Simpan timestamp dalam format yang konsisten.

Untuk transaksi dan absensi, perhatikan timezone lokal pengguna.

Absensi harus menggunakan tanggal lokal, bukan UTC date secara langsung.

Contoh:

2026-08-18


---

56. Timezone

Versi awal menggunakan timezone perangkat/user.

Indonesia umumnya:

Asia/Jakarta
Asia/Makassar
Asia/Jayapura

Jangan hard-code satu timezone jika tidak diperlukan.

Tanggal lokal harus dihitung menggunakan timezone perangkat.


---

57. Notifications

Reminder To-Do menggunakan Web Notifications jika tersedia.

Permission:

default
granted
denied

Jangan meminta notification permission saat first load.


---

58. Security

Jangan pernah memasukkan:

SUPABASE_SERVICE_ROLE_KEY

ke frontend.

Frontend hanya boleh menggunakan:

SUPABASE_URL
SUPABASE_ANON_KEY

RLS wajib aktif.


---

59. Environment Variables

Gunakan:

.env
.env.local

Contoh:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Jangan commit secret.


---

60. Supabase RLS

Semua tabel user data wajib memiliki RLS.

Contoh:

user_id = auth.uid()

Policy minimal:

SELECT
INSERT
UPDATE
DELETE

sesuai kebutuhan tabel.


---

61. Index Database

Tambahkan index pada kolom yang sering digunakan.

Contoh:

user_id
attendance_date
member_id
transaction_date
wallet_id
category_id
status
due_date
updated_at

Jangan menambahkan index secara berlebihan.


---

62. Performance

Hindari:

N+1 queries

Gunakan:

batch operation
bulk insert
proper indexes
pagination

jika diperlukan.


---

63. Export Architecture

Export dilakukan di client jika ukuran data masih kecil.

Absensi:

IndexedDB
 ↓
Generate Excel/PDF
 ↓
Download

Tidak membutuhkan server tambahan.


---

64. Backup Architecture

Jika fitur backup diterapkan:

IndexedDB
 ↓
Serialize
 ↓
JSON
 ↓
User download

Restore:

JSON
 ↓
Validate
 ↓
Preview
 ↓
Confirm
 ↓
IndexedDB
 ↓
Sync


---

65. Testing

Testing harus mencakup:

Unit Test
Integration Test
E2E Test

Prioritas testing:

1. Financial calculation.


2. Transfer.


3. Attendance uniqueness.


4. Offline storage.


5. Sync.


6. Authentication.


7. Task deadline.




---

66. Critical Test Cases

Attendance

Create attendance
Duplicate attendance
Edit attendance
Weekly calculation

Finance

Income
Expense
Transfer
Adjustment
Edit transaction
Delete transaction
Balance calculation

To-Do

Create task
Edit task
Complete task
Deadline
Overdue
Reminder

Sync

Offline create
Offline update
Offline delete
Reconnect
Retry
Duplicate prevention


---

67. Architecture Rules

OpenCode wajib mengikuti aturan berikut:

1. Jangan membuat backend tambahan selain Supabase.


2. Jangan membuat server Express/Node tambahan tanpa alasan yang disetujui.


3. Jangan menyimpan data utama hanya di memory.


4. Jangan menjadikan Supabase sebagai satu-satunya sumber data.


5. Jangan mengabaikan offline mode.


6. Jangan menggunakan floating point untuk uang.


7. Jangan mengubah saldo secara diam-diam.


8. Jangan menonaktifkan RLS.


9. Jangan menyimpan secret di frontend.


10. Jangan membuat component besar yang menangani seluruh fitur.


11. Pisahkan business logic dari UI.


12. Gunakan TypeScript secara konsisten.


13. Jangan menambahkan library jika tidak diperlukan.


14. Jangan mengimplementasikan fitur future sebelum core feature selesai.




---

68. Development Priority

Urutan implementasi:

1. Project setup
2. PWA
3. Supabase
4. Authentication
5. IndexedDB
6. Sync engine
7. App shell
8. Dashboard
9. Attendance
10. Finance
11. To-Do
12. Export
13. Notifications
14. Testing
15. Performance
16. Polish


---

69. Final Architecture

Arsitektur akhir yang diharapkan:

┌───────────────────┐
                 │    Worksphere     │
                 │      PWA          │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │    React + TS     │
                 └─────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐        ┌────────────────┐
      │   UI Layer    │        │ Business Logic │
      └───────────────┘        └───────┬────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Repository     │
                              └────────┬─────────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                          ▼                         ▼
                  ┌──────────────┐          ┌──────────────┐
                  │ IndexedDB    │          │   Supabase   │
                  │   Dexie      │◄────────►│ PostgreSQL   │
                  └──────┬───────┘          └──────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Sync Queue   │
                  └──────────────┘


---

70. Architecture Goal

Arsitektur Worksphere harus menghasilkan aplikasi yang:

Fast
Offline-first
Reliable
Secure
Maintainable
Scalable
Free
Mobile-first

Namun tetap sederhana untuk dikembangkan oleh satu developer.

End of ARCHITECTURE.md