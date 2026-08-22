# Worksphere — Development Workflow

## 1. Purpose

Dokumen ini mendefinisikan workflow pengembangan Worksphere.

Workflow ini digunakan oleh OpenCode sebagai panduan utama dalam:

- Memahami project.
- Membaca dokumentasi.
- Membuat struktur project.
- Mengembangkan fitur.
- Mengembangkan database.
- Mengimplementasikan offline-first.
- Mengimplementasikan sinkronisasi.
- Melakukan testing.
- Melakukan debugging.
- Melakukan verifikasi.
- Menyelesaikan task.

OpenCode harus mengikuti workflow ini secara bertahap.

---

# 2. Core Workflow

Setiap pekerjaan harus mengikuti:

```text
Understand
↓
Inspect
↓
Plan
↓
Implement
↓
Test
↓
Verify
↓
Document

Jangan langsung melakukan implementasi sebelum memahami requirement dan struktur project.


---

3. Source of Truth

Urutan prioritas dokumentasi:

PRD.md
↓
ARCHITECTURE.md
↓
DESIGN.md
↓
SKILL.md
↓
TODO.md

Jika terdapat konflik:

PRD.md

menjadi sumber requirement utama.


---

4. Initial Project Inspection

Sebelum membuat atau mengubah kode, OpenCode harus memeriksa:

package.json
src/
supabase/
public/
configuration files
environment files
existing documentation

Jika project sudah memiliki kode:

Jangan menghapus kode existing tanpa alasan.

Jangan mengganti architecture secara keseluruhan.

Cari implementation yang sudah ada sebelum membuat yang baru.



---

5. Requirement Analysis

Sebelum mengerjakan task, tentukan:

Feature
Goal
Input
Output
Dependencies
Database impact
Offline impact
Sync impact
UI impact
Testing requirement

Contoh:

Feature:
Tambah transaksi

Input:
Nominal
Jenis
Wallet
Kategori
Tanggal
Catatan

Output:
Transaction tersimpan

Database:
transactions

Offline:
Yes

Sync:
Yes

Testing:
Required


---

6. Task Scope

Setiap task harus memiliki scope yang jelas.

Contoh:

Task:
Implement wallet management

Included:
- List wallet
- Create wallet
- Edit wallet
- Delete wallet
- Balance display

Not Included:
- Budget
- Savings
- Transfer

Jangan mengerjakan fitur di luar scope kecuali diperlukan.


---

7. Planning

Sebelum coding, buat rencana singkat:

1. Files to modify
2. Files to create
3. Database changes
4. UI changes
5. Business logic
6. Tests

Rencana harus sesederhana mungkin.


---

8. Implementation Order

Untuk feature baru, gunakan urutan:

Database
↓
Types
↓
Validation
↓
Repository
↓
Service
↓
Hooks
↓
Components
↓
Pages
↓
Tests

Tidak semua feature membutuhkan seluruh layer.

Jika layer tidak diperlukan, jangan membuatnya hanya demi mengikuti struktur.


---

9. Database First

Jika feature membutuhkan database:

1. Tentukan entity.


2. Tentukan field.


3. Tentukan relationship.


4. Tentukan constraint.


5. Tentukan index.


6. Tentukan RLS.


7. Buat migration.


8. Test database.




---

10. Database Migration Workflow

Gunakan:

Create migration
↓
Review SQL
↓
Apply migration
↓
Verify schema
↓
Generate types
↓
Update application

Jangan mengubah schema production secara manual.


---

11. Database Design Checklist

Sebelum migration selesai:

[ ] Primary key
[ ] user_id
[ ] Foreign key
[ ] Required fields
[ ] Default values
[ ] Unique constraints
[ ] Index
[ ] RLS
[ ] Policies
[ ] Timestamps


---

12. Authentication First

Authentication harus diselesaikan sebelum data user dibuat.

Flow:

App
↓
Auth
↓
Session
↓
User
↓
Application Data


---

13. Authentication Workflow

Implementasikan:

Register
Login
Logout
Session persistence
Auth state
Protected routes

Jika hanya login yang diperlukan pada MVP, jangan membuat fitur authentication tambahan yang belum diperlukan.


---

14. Protected Application

Jika user belum login:

Login Page

Jika user sudah login:

Application Shell

Jangan menampilkan data user ketika session belum tervalidasi.


---

15. Local Database Initialization

Setelah authentication tersedia:

Initialize Dexie
↓
Create local tables
↓
Check schema version
↓
Initialize repositories

Local database harus siap digunakan sebelum feature offline dibuat.


---

16. Offline-First Foundation

Implementasikan infrastructure sebelum feature utama.

Urutan:

IndexedDB
↓
Repository
↓
Sync Queue
↓
Network Detection
↓
Sync Engine
↓
Conflict Handling

Setelah infrastructure stabil, baru feature mulai dikembangkan.


---

17. Local-First Data Flow

Data normal:

User Action
↓
Validation
↓
Local DB
↓
UI Update
↓
Sync Queue
↓
Supabase

Bukan:

User Action
↓
Supabase
↓
Wait
↓
UI


---

18. Online Data Flow

Saat online:

User Action
↓
Local DB
↓
Sync Queue
↓
Supabase
↓
Sync Success
↓
Mark Operation Synced

UI tidak perlu menunggu server untuk operasi normal.


---

19. Offline Data Flow

Saat offline:

User Action
↓
Validation
↓
Local DB
↓
UI Update
↓
Queue Operation

Tidak ada error hanya karena user sedang offline.


---

20. Reconnection Workflow

Ketika koneksi kembali:

Detect Online
↓
Start Sync
↓
Process Queue
↓
Retry Failed Operations
↓
Update Local Data
↓
Update Sync Status


---

21. Sync Queue Processing

Queue diproses:

oldest → newest

kecuali dependency membutuhkan urutan lain.

Contoh:

Create Wallet
↓
Create Transaction

Wallet harus sync terlebih dahulu.


---

22. Sync Retry

Jika gagal:

Retry 1
↓
Retry 2
↓
Retry 3
↓
Failed

Gunakan exponential backoff.

Contoh:

1s
2s
4s
8s

Batas maksimum harus diterapkan.


---

23. Failed Sync

Jika operasi gagal setelah retry:

sync_status = failed

Data lokal tetap dipertahankan.

User harus mendapatkan feedback.


---

24. Sync Status

Global sync state:

synced
syncing
offline
error

Contoh:

● Tersinkron

↻ Menyinkronkan...

○ Offline

⚠ Sinkronisasi gagal


---

25. Development Phase Overview

Urutan pembangunan Worksphere:

Phase 0
Documentation

Phase 1
Project Setup

Phase 2
Authentication

Phase 3
Database

Phase 4
Offline Infrastructure

Phase 5
Sync Engine

Phase 6
App Shell

Phase 7
Attendance

Phase 8
Finance

Phase 9
To-Do

Phase 10
Reports & Export

Phase 11
Notifications

Phase 12
Polish

Phase 13
Testing

Phase 14
Production


---

26. Phase 0 — Documentation

Pastikan tersedia:

PRD.md
ARCHITECTURE.md
DESIGN.md
SKILL.md
WORKFLOW.md
TODO.md

OpenCode harus membaca file tersebut sebelum implementasi.


---

27. Phase 1 — Project Setup

Buat:

React
TypeScript
Vite
Tailwind CSS
PWA
Supabase client
Dexie
React Router
Zod
date-fns
Lucide React

Kemudian:

Install
↓
Configure
↓
Run
↓
Build


---

28. Phase 1 Verification

Checklist:

[ ] npm install berhasil
[ ] npm run dev berhasil
[ ] npm run build berhasil
[ ] TypeScript berhasil
[ ] Tailwind berhasil
[ ] PWA configuration berhasil

Jangan lanjut ke phase berikutnya jika project dasar belum dapat berjalan.


---

29. Phase 2 — Authentication

Implementasikan:

Login
Logout
Session
Protected Routes

Testing:

[ ] Login berhasil
[ ] Login gagal ditangani
[ ] Session tersimpan
[ ] Logout berhasil
[ ] Protected route bekerja


---

30. Phase 3 — Database

Buat schema utama:

profiles
members
attendance
wallets
transactions
categories
budgets
savings_goals
tasks
subtasks
sync metadata

Gunakan migration.


---

31. Phase 3 Verification

Pastikan:

[ ] Schema berhasil
[ ] Foreign key benar
[ ] Constraint benar
[ ] RLS aktif
[ ] Policy benar
[ ] Generated types berhasil


---

32. Phase 4 — Offline Database

Buat IndexedDB schema.

Minimal:

members
attendance
wallets
transactions
categories
budgets
savings_goals
tasks
subtasks
sync_queue


---

33. Phase 4 Verification

Test:

Create
Read
Update
Delete

secara offline.

Pastikan data tetap ada setelah:

Refresh


---

34. Phase 5 — Sync Engine

Implementasikan:

Queue
Processor
Retry
Idempotency
Error handling
Network detection


---

35. Phase 5 Verification

Simulasi:

Online
↓
Create data
↓
Sync

dan:

Offline
↓
Create data
↓
Reconnect
↓
Sync

Keduanya harus berhasil.


---

36. Phase 6 — Application Shell

Buat:

App Layout
Header
Bottom Navigation
Desktop Sidebar
Theme
Sync Indicator
Loading
Toast
Modal


---

37. Phase 6 Verification

Test:

Mobile
Tablet
Desktop
Light Mode
Dark Mode
Offline
Online


---

38. Phase 7 — Attendance

Implementasi bertahap:

Members
↓
Daily Attendance
↓
Edit Attendance
↓
Weekly Summary
↓
Attendance History
↓
PDF Export
↓
Excel Export


---

39. Attendance — Members

Member hanya memiliki:

name
description

Jangan menambahkan detail personal yang belum diperlukan.


---

40. Attendance — Daily Record

Status:

present
absent
holiday

Constraint:

one member
+
one date
=
one attendance


---

41. Attendance — Editing

User dapat memilih tanggal sebelumnya.

Flow:

Select Week
↓
Select Date
↓
Edit Member Status
↓
Save
↓
Local Update
↓
Sync


---

42. Attendance — Weekly Summary

Perhitungan:

Present Count
Absent Count
Holiday Count

Per member dan keseluruhan.


---

43. Attendance — Export

PDF dan Excel harus:

Tanggal
Nama Anggota
Status

Dapat menggunakan filter:

Tanggal
Minggu
Rentang tanggal


---

44. Attendance Verification

Checklist:

[ ] 9 anggota dapat ditampilkan
[ ] Status hadir
[ ] Status absen
[ ] Status libur
[ ] Edit histori
[ ] Weekly summary
[ ] Offline
[ ] Sync
[ ] PDF
[ ] Excel


---

45. Phase 8 — Finance

Urutan:

Wallets
↓
Categories
↓
Transactions
↓
Transfer
↓
Adjustment
↓
Budget
↓
Savings
↓
Reports


---

46. Finance — Wallets

Implementasikan:

Create
Read
Update
Delete
Initial Balance

Jenis wallet dapat berupa:

Bank
E-wallet
Cash
Other


---

47. Finance — Categories

Pisahkan:

Income Categories
Expense Categories

Contoh income:

Gaji
Bonus
Freelance
Lainnya

Contoh expense:

Makanan
Transportasi
Belanja
Tagihan
Pendidikan
Lainnya


---

48. Finance — Transactions

Implementasikan:

Income
Expense

Data:

amount
category
wallet
date
note


---

49. Finance — Transfer

Implementasikan:

Source Wallet
Destination Wallet
Amount
Date
Note

Transfer harus atomic.


---

50. Finance — Balance Adjustment

Implementasikan:

Wallet
Current Balance
Adjustment
Reason

Adjustment harus memiliki history.


---

51. Finance — Budget

Implementasikan:

Budget
Category
Period
Amount
Used
Remaining

Periode awal:

Monthly

Jika requirement berkembang, tambahkan:

Weekly
Yearly
Custom


---

52. Finance — Savings Goals

Implementasikan:

Goal
Target Amount
Current Amount
Deadline optional

Progress:

current / target


---

53. Finance Verification

Checklist:

[ ] Wallet
[ ] Income
[ ] Expense
[ ] Transfer
[ ] Adjustment
[ ] Edit transaction
[ ] Delete transaction
[ ] Budget
[ ] Savings
[ ] Balance calculation
[ ] Offline
[ ] Sync


---

54. Finance Integrity Testing

Wajib melakukan test:

Initial Balance
+
Income
-
Expense
-
Transfer Out
+
Transfer In
+
Adjustment
=
Expected Balance


---

55. Phase 9 — To-Do

Urutan:

Task
↓
Priority
↓
Category
↓
Deadline
↓
Reminder
↓
Subtask
↓
Filtering
↓
Sorting


---

56. To-Do — Task

Implementasikan:

Create
Read
Update
Delete
Complete
Uncomplete


---

57. To-Do — Priority

Gunakan:

Urgent
High
Medium
Low


---

58. To-Do — Category

User dapat membuat kategori.

Contoh:

Work
Personal
Study
Finance
Other

Namun UI menggunakan Bahasa Indonesia.

Contoh:

Kerja
Pribadi
Kuliah
Keuangan
Lainnya


---

59. To-Do — Deadline

Task dapat memiliki:

Due Date
Due Time optional

Task overdue harus ditampilkan dengan jelas.


---

60. To-Do — Reminder

Reminder:

Optional

Permission notification hanya diminta ketika diperlukan.


---

61. To-Do — Subtasks

Task dapat memiliki beberapa subtask.

Progress:

completed_subtasks / total_subtasks


---

62. To-Do Verification

Checklist:

[ ] Create
[ ] Edit
[ ] Delete
[ ] Complete
[ ] Priority
[ ] Category
[ ] Deadline
[ ] Reminder
[ ] Subtask
[ ] Filter
[ ] Search
[ ] Offline
[ ] Sync


---

63. Phase 10 — Reports & Export

Implementasikan setelah feature utama stabil.

Attendance:

PDF
Excel

Finance dapat memiliki:

Summary
Charts
Transaction report

To-Do dapat memiliki:

Completion statistics


---

64. Phase 11 — Notifications

Implementasikan setelah task/reminder stabil.

Urutan:

Permission
↓
Notification
↓
Reminder scheduling
↓
Reminder handling


---

65. Phase 12 — UI Polish

Setelah functionality stabil:

Spacing
Typography
Colors
Glassmorphism
Animations
Loading
Empty State
Error State
Dark Mode
Responsive

Jangan melakukan visual polish besar sebelum core functionality stabil.


---

66. Phase 13 — Testing

Testing dilakukan pada:

Unit
Integration
UI
Offline
Sync
Responsive
PWA


---

67. Unit Testing

Prioritas:

Finance calculations
Attendance calculations
Todo calculations
Date utilities
Currency utilities
Sync utilities


---

68. Integration Testing

Test:

UI
↓
Service
↓
Repository
↓
Local DB

dan:

Sync
↓
Supabase


---

69. Offline Testing

Matikan network.

Test:

Attendance
Finance
To-Do

Semua operasi core harus tetap berjalan.


---

70. Sync Testing

Scenario:

Offline
↓
Create
↓
Update
↓
Delete
↓
Online
↓
Sync

Pastikan server sesuai dengan local state.


---

71. Conflict Testing

Simulasikan:

Local updated
+
Server updated

Pastikan conflict strategy bekerja sesuai architecture.


---

72. PWA Testing

Test:

Install
Launch
Refresh
Offline launch
Online
Offline
Reconnect


---

73. Mobile Testing

Minimal:

360px
390px
430px

Periksa:

Navigation
Forms
Modal
Bottom sheet
Keyboard
Scrolling
FAB


---

74. Desktop Testing

Minimal:

1024px
1280px
1440px

Periksa:

Sidebar
Tables
Cards
Charts
Forms
Spacing


---

75. Dark Mode Testing

Periksa:

Background
Card
Text
Border
Button
Input
Chart
Modal
Toast
Navigation

Tidak boleh ada text yang tidak terbaca.


---

76. Accessibility Testing

Periksa:

Keyboard navigation
Focus
ARIA
Contrast
Touch target
Screen reader labels
Reduced motion


---

77. Performance Testing

Periksa:

Initial load
Route navigation
Database query
Rendering
Sync
Large transaction list
Large task list


---

78. Build Verification

Sebelum release:

npm run lint
npm run typecheck
npm run test
npm run build

Semua harus berhasil.

Jika command berbeda di project:

Gunakan script yang tersedia di package.json.


---

79. Production Verification

Checklist:

[ ] Environment variables benar
[ ] Supabase URL benar
[ ] Supabase anon key benar
[ ] RLS aktif
[ ] Production build berhasil
[ ] PWA manifest valid
[ ] Service worker aktif
[ ] Offline mode bekerja
[ ] Authentication bekerja
[ ] Sync bekerja


---

80. Release Workflow

Gunakan:

Development
↓
Testing
↓
Bug Fix
↓
Production Build
↓
Final Verification
↓
Release

Jangan langsung deploy setelah coding.


---

81. Bug Workflow

Jika bug ditemukan:

Report
↓
Reproduce
↓
Identify Root Cause
↓
Fix
↓
Regression Test
↓
Verify


---

82. Critical Bug

Critical bug adalah bug yang menyebabkan:

Data loss
Incorrect balance
Duplicate transaction
Authentication failure
Unauthorized data access
Sync corruption

Critical bug harus diprioritaskan di atas UI polish.


---

83. Finance Bug Priority

Prioritas:

Incorrect balance
>
Duplicate transaction
>
Lost transaction
>
Sync issue
>
UI issue


---

84. Offline Bug Priority

Prioritas:

Data loss
>
Duplicate data
>
Sync corruption
>
Offline read failure
>
UI inconsistency


---

85. TODO.md Integration

Setiap task harus diambil dari TODO.md.

Ketika task selesai:

[ ] Task

menjadi:

[x] Task

Jangan menandai task selesai sebelum verification.


---

86. Task Status

Gunakan:

TODO
IN PROGRESS
BLOCKED
DONE

Jika task membutuhkan dependency:

BLOCKED


---

87. Task Dependency

Contoh:

Authentication
    ↓
Database
    ↓
Offline DB
    ↓
Sync
    ↓
Attendance
    ↓
Finance
    ↓
To-Do

Jangan mengerjakan dependent task sebelum foundation tersedia.


---

88. Documentation Update

Jika implementasi mengubah:

Architecture
Database
UI
Workflow

update dokumentasi terkait.


---

89. Final Review

Sebelum menyatakan project selesai:

PRD
↓
Architecture
↓
Implementation
↓
Tests
↓
Design
↓
Security
↓
Performance
↓
PWA

Semua harus diperiksa.


---

90. Definition of Done

Sebuah feature dianggap DONE jika:

[ ] Requirement terpenuhi
[ ] UI selesai
[ ] Responsive
[ ] Dark mode
[ ] Offline
[ ] Sync
[ ] Validation
[ ] Error handling
[ ] Tests
[ ] Build
[ ] Documentation

Tidak semua item harus diterapkan jika feature memang tidak membutuhkan item tersebut.


---

91. MVP Definition

Worksphere MVP harus memiliki:

Authentication
+
Offline-first database
+
Sync
+
Attendance
+
Finance
+
To-Do

Dengan:

Light Mode
Dark Mode
PWA
Responsive UI
Bahasa Indonesia
IDR


---

92. MVP Tidak Termasuk

Jangan mengimplementasikan secara default:

Multi-user collaboration
Chat
Social features
Advanced analytics
AI assistant
Subscription
Payment system
Advertising
Complex role management

Fitur tersebut dapat ditambahkan pada versi berikutnya.


---

93. Single User Mode

Versi awal:

Single User

Namun schema harus tetap menggunakan:

user_id

agar aplikasi dapat berkembang menjadi multi-user di masa depan.


---

94. Future Multi-User

Jika suatu saat aplikasi dibagikan kepada anggota:

Single User
↓
Multi User
↓
Roles
↓
Shared Workspace

Jangan membangun sistem multi-user penuh pada MVP.

Namun architecture tidak boleh membuat migrasi masa depan menjadi mustahil.


---

95. Free-Only Requirement

Worksphere harus menggunakan teknologi yang tersedia secara gratis untuk kebutuhan MVP.

Prioritas:

Open Source
Free Tier
Self-hostable
No mandatory paid service


---

96. Supabase

Gunakan Supabase sesuai free tier untuk tahap awal.

Jangan menambahkan layanan berbayar yang wajib digunakan aplikasi.

Jika sebuah fitur membutuhkan layanan berbayar:

Jangan langsung mengimplementasikan.

Cari alternatif gratis terlebih dahulu.


---

97. No Vendor Lock-in

Sebisa mungkin:

Business Logic

tidak bergantung langsung pada API vendor.

Contoh:

UI
↓
Repository
↓
Supabase

bukan:

UI
↓
Supabase everywhere

Hal ini memudahkan penggantian backend di masa depan.


---

98. Development Sequence

Urutan final:

01 Documentation
02 Project Setup
03 Authentication
04 Supabase Database
05 IndexedDB
06 Repository Layer
07 Sync Queue
08 Sync Engine
09 App Shell
10 Attendance
11 Finance
12 To-Do
13 Reports
14 Notifications
15 UI Polish
16 Testing
17 Security Review
18 Performance Review
19 PWA Review
20 Production


---

99. Important Rule

Jangan melompati foundation.

Contoh:

Jangan langsung membuat:

Finance UI

jika:

Offline DB

belum tersedia.

Jangan membuat:

Sync UI

jika:

Sync Engine

belum tersedia.


---

100. Final Development Loop

Setiap feature:

Requirement
↓
Plan
↓
Database
↓
Types
↓
Validation
↓
Repository
↓
Service
↓
Hook
↓
UI
↓
Offline
↓
Sync
↓
Test
↓
Build
↓
Review
↓
Done


---

101. Final Instruction for OpenCode

OpenCode harus bertindak sebagai software engineer, bukan sekadar code generator.

Sebelum melakukan perubahan:

Understand the system.

Sebelum membuat architecture:

Check existing architecture.

Sebelum membuat database:

Check existing schema.

Sebelum membuat component:

Check existing design system.

Sebelum menyelesaikan task:

Test the implementation.

Jika terdapat ketidakpastian yang berdampak besar terhadap:

Database
Security
Authentication
Data integrity
Sync
Architecture

jangan membuat asumsi besar.

Gunakan requirement yang tersedia dan pilih solusi yang paling aman.

End of WORKFLOW.md