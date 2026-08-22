# Worksphere — Development Skills & Coding Rules

## 1. Purpose

Dokumen ini berisi aturan dan standar yang wajib diikuti ketika mengembangkan Worksphere.

File ini menjadi panduan bagi AI coding agent seperti OpenCode agar:

- Tidak membuat implementasi secara sembarangan.
- Tidak mengubah arsitektur tanpa alasan.
- Menulis kode yang konsisten.
- Menjaga kualitas kode.
- Menjaga keamanan data.
- Menjaga offline-first architecture.
- Menjaga integritas data keuangan.
- Tidak menambahkan dependency yang tidak diperlukan.
- Tidak mengimplementasikan fitur di luar scope tanpa persetujuan.

---

# 2. Core Development Principles

Prioritas utama:

```text
Correctness
>
Data Safety
>
Security
>
Maintainability
>
Performance
>
UX
>
Visual Polish

Jika terdapat konflik antara dua requirement, gunakan urutan prioritas di atas.

Contoh:

Jika efek glassmorphism membuat teks sulit dibaca:

Readability > Glassmorphism

Jika animasi menyebabkan aplikasi lambat:

Performance > Animation

Jika optimasi membuat data keuangan berisiko hilang:

Data Safety > Performance


---

3. Golden Rules

OpenCode WAJIB mengikuti aturan berikut:

1. Jangan mengubah requirement utama tanpa persetujuan.


2. Jangan mengubah database schema secara sembarangan.


3. Jangan menghapus data pengguna tanpa konfirmasi.


4. Jangan mengabaikan offline mode.


5. Jangan membuat Supabase menjadi satu-satunya sumber data UI.


6. Jangan menyimpan password secara manual.


7. Jangan memasukkan secret ke source code.


8. Jangan menonaktifkan RLS.


9. Jangan menggunakan floating point untuk uang.


10. Jangan membuat duplicate transaction.


11. Jangan membuat duplicate attendance.


12. Jangan menambahkan dependency jika tidak diperlukan.


13. Jangan membuat component raksasa.


14. Jangan menaruh business logic kompleks di UI component.


15. Jangan memperbaiki bug dengan workaround yang merusak arsitektur.


16. Jangan menghapus test hanya agar test berhasil.


17. Jangan mengubah file yang tidak berkaitan dengan task tanpa alasan.


18. Jangan mengimplementasikan fitur future sebelum fitur core selesai.


19. Jangan menganggap task selesai hanya karena aplikasi dapat di-build.


20. Selalu verifikasi perubahan.




---

4. Technology Rules

Gunakan stack:

React
TypeScript
Vite
Tailwind CSS
Supabase
PostgreSQL
IndexedDB
Dexie
React Router
Zod
date-fns
Lucide React

Gunakan library tambahan hanya jika:

1. Ada kebutuhan nyata.


2. Library tersebut stabil.


3. Library tidak menggandakan fungsi library yang sudah digunakan.


4. Ukurannya masuk akal.


5. Tidak merusak offline-first architecture.




---

5. TypeScript Rules

TypeScript wajib digunakan.

Hindari:

any

kecuali benar-benar diperlukan.

Jika menggunakan any, harus ada alasan yang jelas.

Lebih baik:

unknown

kemudian lakukan type narrowing.


---

6. Strict Typing

Gunakan TypeScript strict mode.

Contoh:

{
  "compilerOptions": {
    "strict": true
  }
}

Jangan mematikan strict mode untuk menyelesaikan error.


---

7. Type Definitions

Type domain harus jelas.

Contoh:

type TransactionType =
  | "income"
  | "expense"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";

Jangan menggunakan:

type Transaction = {
  type: string;
};

jika nilai sebenarnya sudah diketahui.


---

8. Database Types

Jika menggunakan generated Supabase types, gunakan generated types tersebut.

Jangan membuat type database yang bertentangan dengan schema.

Jika schema berubah:

Database
↓
Regenerate Types
↓
Update Application


---

9. Naming Convention

Gunakan:

PascalCase

untuk React component.

Contoh:

WalletCard
TransactionForm
AttendanceTable
TaskItem

Gunakan:

camelCase

untuk:

Function.

Variable.

Hook.

Service.


Contoh:

createTransaction()
getAttendance()
useWallets()


---

10. File Naming

Component:

WalletCard.tsx
TransactionForm.tsx

Hook:

useWallets.ts
useAttendance.ts

Service:

attendanceService.ts
financeService.ts

Repository:

attendanceRepository.ts
financeRepository.ts

Schema:

transactionSchema.ts
taskSchema.ts


---

11. Folder Organization

Gunakan feature-based architecture.

Contoh:

src/features/finance/

berisi:

components/
pages/
hooks/
services/
repositories/
schemas/
types/
utils/

Jangan mencampur semua file ke satu folder besar.


---

12. Component Rules

Component harus memiliki satu tanggung jawab utama.

Buruk:

Dashboard.tsx

yang menangani:

Fetch database.

Sync.

Authentication.

Calculation.

Modal.

Form.

Chart.

Navigation.


Lebih baik:

Dashboard
├── DashboardHeader
├── FinancialSummary
├── AttendanceSummary
├── TodoSummary
└── QuickActions


---

13. Component Size

Jika sebuah component menjadi terlalu panjang atau memiliki terlalu banyak responsibility, pecah menjadi component yang lebih kecil.

Tidak ada angka baris kode yang mutlak.

Gunakan prinsip:

> Jika sulit dibaca atau sulit diuji, pecah component tersebut.




---

14. Business Logic

Business logic tidak boleh ditempatkan langsung di JSX.

Buruk:

<div>
  {transactions.reduce((total, transaction) => {
    // complex calculation
  }, 0)}
</div>

Lebih baik:

const balance = calculateWalletBalance(transactions);

Kemudian:

<div>{formatCurrency(balance)}</div>


---

15. Utility Functions

Logic yang reusable harus berada di utility/service.

Contoh:

formatCurrency()
calculateBalance()
getWeekRange()
isOverdue()
calculateBudgetUsage()


---

16. Financial Rules

Fitur keuangan adalah bagian paling sensitif.

Semua operasi keuangan harus mempertahankan integritas saldo.

Jangan:

Mengubah saldo secara langsung

kecuali melalui:

Initial Balance
Adjustment
Transaction


---

17. Money Representation

Semua nominal IDR harus disimpan sebagai integer.

Contoh:

100000

bukan:

100000.00

Jangan menggunakan:

number

untuk operasi yang membutuhkan decimal precision.

Untuk IDR integer aman digunakan selama nominal berada dalam batas JavaScript safe integer.


---

18. Currency Formatting

Buat satu formatter terpusat.

Contoh:

formatCurrency(100000)

menghasilkan:

Rp100.000

Jangan membuat formatter berbeda di setiap component.


---

19. Transaction Rules

Setiap transaction harus memiliki:

id
user_id
type
amount
transaction_date
created_at
updated_at

Transaction ID harus dibuat secara deterministic dari client UUID.


---

20. Transaction Creation

Flow:

Validate
↓
Create Local Record
↓
Update UI
↓
Create Sync Queue
↓
Sync Server

Jangan:

Send Server
↓
Wait
↓
Show UI

untuk operasi offline-first normal.


---

21. Transaction Editing

Saat transaction diedit:

1. Validasi data.


2. Update local record.


3. Update dependent calculation.


4. Add sync operation.


5. Sync ketika online.



Jangan membuat transaction tambahan hanya untuk menyimpan hasil edit kecuali memang diperlukan oleh domain model.


---

22. Transaction Deletion

Jika transaction dihapus:

soft delete

lebih disukai.

Saldo harus dihitung ulang setelah penghapusan.


---

23. Transfer Rules

Transfer terdiri dari dua sisi:

transfer_out
transfer_in

Keduanya harus memiliki:

transfer_group_id

Contoh:

Transfer UUID:
abc-123

BCA:
transfer_out
-200000

DANA:
transfer_in
+200000


---

24. Transfer Atomicity

Transfer harus atomic.

Jika satu bagian gagal:

Source tidak boleh berubah
atau
seluruh operasi harus berhasil.

Jika memungkinkan, gunakan PostgreSQL RPC/function untuk operasi server-side.


---

25. Transfer Validation

Sebelum transfer:

amount > 0
sourceWallet !== destinationWallet
sourceWallet exists
destinationWallet exists
balance >= amount

Jika salah satu gagal, jangan melakukan perubahan.


---

26. Adjustment Rules

Adjustment harus memiliki alasan.

Contoh:

+Rp50.000
Koreksi saldo

Jangan menyediakan tombol:

Set saldo = Rp1.000.000

tanpa membuat histori.


---

27. Attendance Rules

Attendance menggunakan:

present
absent
holiday

Satu anggota:

1 tanggal
=
1 record

Gunakan database constraint:

UNIQUE(member_id, attendance_date)


---

28. Attendance Editing

Tanggal sebelumnya boleh diedit.

Jangan membuat rule:

Hanya hari ini

karena requirement mengizinkan koreksi histori.


---

29. Weekly Attendance

Gunakan minggu:

Senin
-
Minggu

Perhitungan harus menggunakan timezone lokal user.


---

30. Task Rules

Task minimal:

title
status
priority
category
due_date
reminder_at

Status:

todo
in_progress
completed
cancelled


---

31. Overdue Rules

Task dianggap overdue jika:

due_date < now
AND
status != completed
AND
status != cancelled

Gunakan timezone lokal.


---

32. Task Completion

Ketika task diselesaikan:

status = completed
completed_at = current timestamp

Jika task dibuka kembali:

status != completed
completed_at = null


---

33. Reminder Rules

Reminder hanya aktif jika:

reminder_at != null

Permission notification harus diminta ketika user mengaktifkan reminder.

Jangan meminta permission notification pada initial page load.


---

34. Offline Rules

Setiap feature utama harus mendukung offline.

Minimal:

Create
Read
Update

harus bekerja offline.

Delete juga harus bekerja offline jika fitur delete tersedia.


---

35. Local Database

Gunakan Dexie sebagai wrapper IndexedDB.

Buat satu database instance utama.

Jangan membuat:

new Dexie()

di setiap component.


---

36. Local Database Access

Component tidak boleh langsung memanggil IndexedDB.

Gunakan:

Component
↓
Hook
↓
Repository
↓
Dexie


---

37. Sync Queue Rules

Setiap perubahan offline harus menghasilkan sync operation.

Contoh:

create
update
delete

Sync queue harus dapat:

Retry.

Menangani error.

Menghindari duplicate.

Menyimpan status.



---

38. Sync Idempotency

Setiap entity memiliki UUID yang dibuat client.

Jika operasi yang sama dikirim dua kali:

Server state tetap sama.

Jangan membuat duplicate.


---

39. Sync Retry

Gunakan retry dengan batas yang wajar.

Contoh:

1
2
4
8
16

Jika gagal terus:

status = failed

dan tampilkan informasi kepada user.


---

40. Sync Error

Jangan menghapus data lokal jika sync gagal.

Contoh:

Local:
Expense berhasil dibuat

Server:
Sync gagal

Maka:

Expense tetap ada di local database.


---

41. Conflict Resolution

Versi awal:

Last Write Wins

berdasarkan:

updated_at

Namun jangan menggunakan Last Write Wins untuk menggabungkan transaksi yang sebenarnya berbeda.


---

42. Network Handling

Gunakan:

navigator.onLine

sebagai indikator awal.

Namun jangan menganggap:

navigator.onLine === true

berarti server pasti dapat diakses.

Request nyata tetap harus menangani error.


---

43. Supabase Rules

Supabase digunakan sebagai:

Cloud Database
Authentication
Sync Target

Jangan menambahkan backend lain kecuali requirement berubah.


---

44. RLS

RLS wajib aktif.

Setiap tabel user data harus memastikan:

auth.uid() = user_id

Tidak boleh ada endpoint yang memungkinkan user mengakses data user lain.


---

45. Secrets

Jangan pernah commit:

.env
.env.local
service_role_key
database_password
private_key

ke repository.


---

46. Environment Variables

Gunakan:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Public frontend environment variables tidak boleh berisi secret.


---

47. Validation

Gunakan Zod untuk validation.

Contoh:

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  walletId: z.string().uuid(),
});

Validation dilakukan:

UI
+
Repository/Service

Jangan hanya mengandalkan client validation.


---

48. Error Handling

Semua asynchronous operation harus memiliki error handling.

Jangan:

try {
  ...
} catch {}

Error tidak boleh ditelan tanpa alasan.


---

49. Error Messages

User-facing error harus menggunakan Bahasa Indonesia.

Contoh:

"Nominal harus lebih dari Rp0."

bukan:

"Invalid amount"

Technical error tetap boleh menggunakan Bahasa Inggris di log.


---

50. Logging

Development logging diperbolehkan.

Contoh:

console.error(error);

Tetapi:

Jangan log password.

Jangan log access token.

Jangan log secret.

Jangan log informasi sensitif.


Production logging harus diminimalkan.


---

51. Accessibility

Setiap button harus memiliki accessible name.

Contoh:

<button aria-label="Hapus transaksi">

Icon-only button wajib memiliki aria-label.


---

52. Forms

Setiap input harus memiliki label.

Jangan mengandalkan placeholder sebagai label.

Buruk:

[ Masukkan nominal... ]

Lebih baik:

Nominal
[ Rp100.000 ]


---

53. Touch Target

Interactive element harus memiliki ukuran yang nyaman pada mobile.

Target:

≈ 44px

Jangan membuat tombol kecil hanya demi estetika.


---

54. Responsive Rules

Semua halaman harus diuji pada:

360px
390px
430px
768px
1024px
1280px

Minimal.


---

55. Dark Mode

Jangan hard-code warna yang hanya bekerja di Light Mode.

Gunakan semantic design tokens.

Contoh:

background
foreground
muted
card
border
primary
destructive


---

56. Glassmorphism Rules

Glassmorphism tidak boleh:

Mengurangi contrast.

Mengganggu scrolling.

Menyebabkan performa buruk.

Digunakan pada setiap element.


Prioritaskan:

readability
performance
accessibility


---

57. Animation Rules

Animation harus:

subtle
fast
purposeful

Durasi:

150–300ms

Hormati:

prefers-reduced-motion


---

58. Dependency Rules

Sebelum memasang dependency baru, tanyakan:

Apakah fungsi ini sudah tersedia?
Apakah dependency benar-benar diperlukan?
Apakah dependency aktif dipelihara?
Apakah ukurannya masuk akal?
Apakah cocok dengan PWA/offline-first?

Jika tidak ada alasan kuat:

Jangan install dependency.


---

59. No Duplicate Libraries

Jangan menggunakan dua library untuk fungsi yang sama.

Contoh:

Jangan menggunakan:

date-fns
moment
dayjs

secara bersamaan.

Pilih satu.


---

60. API Access

UI tidak boleh memanggil Supabase secara acak.

Gunakan:

Repository
Service
Hook


---

61. Hooks

Custom hooks digunakan untuk:

Mengambil data.

Menyimpan state feature.

Menangani UI logic.

Menyediakan reusable behavior.


Contoh:

useAttendance()
useTransactions()
useWallets()
useTasks()
useSyncStatus()


---

62. Services

Service digunakan untuk business operation.

Contoh:

createTransfer()
calculateBalance()
syncPendingChanges()
exportAttendance()


---

63. Repository

Repository menangani akses data.

Contoh:

attendanceRepository
walletRepository
transactionRepository
taskRepository

Repository tidak boleh mengetahui detail UI.


---

64. Separation of Concerns

Gunakan:

UI
↓
Hooks
↓
Services
↓
Repositories
↓
Database

Jangan:

UI
↓
Everything


---

65. Testing Rules

Setiap business logic penting harus dapat diuji.

Prioritas:

calculateBalance()
createTransfer()
calculateBudgetUsage()
calculateAttendanceSummary()
isOverdue()
syncQueue()


---

66. Financial Tests

Wajib menguji:

initial balance
income
expense
transfer
adjustment
edit
delete

Contoh:

Initial = 1.000.000
Income = 500.000
Expense = 100.000

Expected = 1.400.000


---

67. Transfer Tests

Test:

Source = 1.000.000
Destination = 500.000
Transfer = 200.000

Expected:

Source = 800.000
Destination = 700.000

Test juga:

Insufficient balance
Same wallet
Zero amount
Negative amount


---

68. Attendance Tests

Test:

Create
Update
Duplicate
Weekly summary

Pastikan duplicate tidak mungkin terjadi.


---

69. To-Do Tests

Test:

Create
Update
Complete
Uncomplete
Overdue
Reminder
Subtask


---

70. Offline Tests

Test:

Open app offline
Create data offline
Edit data offline
Delete data offline
Reconnect
Sync
Retry


---

71. Build Verification

Setelah perubahan besar:

npm run build

harus berhasil.

Jika tersedia:

npm run lint
npm run test

juga harus berhasil.


---

72. Type Verification

Jalankan TypeScript check.

Contoh:

npx tsc --noEmit

Tidak boleh ada TypeScript error yang sengaja diabaikan.


---

73. Lint

Lint error harus diperbaiki.

Jangan menonaktifkan ESLint rule secara global hanya untuk menghilangkan error.

Jika rule benar-benar perlu di-disable:

gunakan secara lokal

dan berikan alasan.


---

74. Before Marking Task Complete

Sebelum task dianggap selesai:

[ ] Requirement sudah dipenuhi
[ ] TypeScript tidak error
[ ] Build berhasil
[ ] Lint berhasil
[ ] Test terkait berhasil
[ ] Mobile UI diperiksa
[ ] Dark mode diperiksa
[ ] Offline behavior diperiksa
[ ] Error handling diperiksa
[ ] Tidak ada regression


---

75. Change Scope

Jika user meminta:

"Perbaiki tampilan tombol"

jangan sekaligus:

mengubah database
mengubah routing
mengubah authentication
mengubah sync

kecuali memang diperlukan.


---

76. Refactoring Rules

Refactoring boleh dilakukan jika:

Memperbaiki maintainability.

Mengurangi duplicate code.

Memperbaiki bug.

Diperlukan untuk feature baru.


Jangan melakukan massive refactor tanpa kebutuhan.


---

77. Existing Code

Sebelum mengubah file:

1. Baca file.


2. Pahami dependency.


3. Cari penggunaan function/component.


4. Periksa apakah ada test.


5. Baru lakukan perubahan.



Jangan mengganti seluruh file hanya karena perubahan kecil diperlukan.


---

78. Database Migration

Perubahan database harus dibuat melalui migration.

Jangan mengubah schema produksi secara manual tanpa migration.

Setiap migration harus:

Terurut.

Dapat dilacak.

Tidak merusak data existing.



---

79. Database Migration Safety

Sebelum migration destructive:

backup
review
migration
verification

Jangan melakukan:

DROP TABLE

atau operasi destructive lain tanpa alasan yang sangat jelas.


---

80. Seed Data

Development dapat menggunakan seed data.

Contoh:

9 anggota
2–3 wallet
beberapa transaksi
beberapa task

Seed data tidak boleh masuk ke production secara otomatis.


---

81. Dummy Data

Dummy data harus mudah dibedakan dari data pengguna.

Gunakan environment development.


---

82. Data Formatting

Tanggal user-facing harus Bahasa Indonesia.

Contoh:

18 Agustus 2026

Bukan:

August 18, 2026


---

83. Relative Date

Gunakan format natural:

Hari ini
Besok
Kemarin
2 hari lagi
Terlambat 3 hari

jika sesuai konteks.


---

84. Currency Formatting

Gunakan:

Rp5.000
Rp100.000
Rp1.000.000

Jangan:

IDR 1000000.00

di UI utama.


---

85. Indonesian Language Rules

UI harus menggunakan Bahasa Indonesia yang natural.

Gunakan:

Simpan
Batal
Hapus
Edit
Tambah
Cari
Filter
Selesai
Terlambat
Sinkronkan

Hindari terjemahan yang kaku.


---

86. Commit Rules

Jika menggunakan Git, commit harus fokus.

Contoh:

feat: add attendance management
feat: add transaction form
fix: prevent duplicate attendance
fix: correct wallet balance calculation
refactor: extract finance repository
style: improve dark mode
test: add transfer tests

Jangan membuat commit:

update
fix
changes
asdf


---

87. Commit Scope

Satu commit sebaiknya memiliki satu tujuan utama.

Buruk:

feat: attendance + finance + todo + redesign

Lebih baik:

feat: add attendance records
feat: add wallet management
feat: add task management


---

88. Git Safety

Jangan menjalankan operasi destructive seperti:

git reset --hard
git clean -fd

tanpa alasan yang jelas dan persetujuan jika dapat menghapus perubahan pengguna.


---

89. Documentation

Jika behavior penting berubah:

Update dokumentasi terkait.

Contoh:

PRD.md
ARCHITECTURE.md
DESIGN.md
TODO.md

Tidak semua perubahan membutuhkan update semua dokumen.


---

90. Do Not Invent Requirements

Jika requirement tidak disebutkan:

Jangan langsung membuat asumsi besar.

Gunakan:

PRD
ARCHITECTURE
DESIGN

sebagai sumber kebenaran.

Jika keputusan teknis kecil diperlukan:

Pilih solusi yang:

simple
safe
maintainable
consistent


---

91. Feature Priority

Prioritas implementasi:

P0
Authentication
Offline database
Sync

P1
Attendance
Finance
To-Do

P2
Budget
Savings
Reports
Export

P3
Notifications
Backup
Advanced features

Jangan mengerjakan P3 sebelum P0/P1 stabil.


---

92. No Premature Optimization

Jangan melakukan optimasi sebelum ada masalah nyata.

Contoh:

Jangan membuat sistem caching kompleks jika:

IndexedDB

sudah cukup.

93. No Premature Abstraction
Jangan membuat abstraction hanya karena:
"mungkin nanti diperlukan"
Buat abstraction ketika:
Ada duplicate logic.
Ada pola yang jelas.
Ada kebutuhan testing.
Ada kebutuhan architecture.
94. AI Coding Behavior
OpenCode harus bekerja secara bertahap.
Untuk setiap task:
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
Jangan langsung mengubah banyak file tanpa memahami project.
95. Before Coding
Sebelum mengimplementasikan task:
Baca requirement terkait.
Cari file yang berhubungan.
Pahami architecture.
Tentukan file yang perlu diubah.
Implementasikan perubahan minimum yang diperlukan.
96. After Coding
Setelah coding:
Run type check.
Run lint.
Run tests terkait.
Run build.
Periksa UI.
Periksa responsive behavior.
Periksa dark mode.
Periksa offline behavior jika relevan.
97. Bug Fixing
Ketika menemukan bug:
Reproduce
↓
Find root cause
↓
Fix root cause
↓
Add regression test
↓
Verify
Jangan hanya menutupi gejala.
98. Regression Prevention
Setiap bug penting harus memiliki test jika memungkinkan.
Contoh:
Bug:
Transfer membuat saldo duplicate
Maka tambahkan:
Transfer idempotency test
99. Performance Budget
Hindari:
Bundle terlalu besar.
Library yang tidak diperlukan.
Image berukuran besar.
Animation berat.
Query berulang.
Render yang tidak diperlukan.
PWA harus tetap terasa cepat pada perangkat mobile kelas menengah.
100. PWA Requirements
Pastikan:
Manifest tersedia
Service Worker aktif
Offline shell tersedia
Icons tersedia
Installable
HTTPS pada production
101. Service Worker
Service Worker harus digunakan untuk:
Cache app shell.
Cache static assets.
Mendukung offline loading.
Jangan menyimpan data sensitif user secara sembarangan di Cache Storage.
Data aplikasi utama tetap menggunakan IndexedDB.
102. Cache Strategy
Static assets:
Cache First
Data dinamis:
Network / Local DB strategy
Data user tidak boleh diperlakukan sama seperti asset statis.
103. Offline Data Priority
Ketika offline, prioritas:
IndexedDB
↓
UI
bukan:
Network
↓
Error
↓
Empty UI
104. Data Synchronization Priority
Urutan sync:
Authentication
↓
Core entities
↓
Dependent entities
Contoh:
Wallet
↓
Transaction
atau:
Task
↓
Subtask
105. Sync Dependency
Jika entity membutuhkan parent:
Parent harus tersedia terlebih dahulu.
Contoh:
wallet
↓
transaction
Jangan sync transaction jika wallet belum tersedia di server.
106. UUID Strategy
Gunakan client-generated UUID.
Contoh:
crypto.randomUUID()
UUID harus dibuat sebelum data disimpan ke IndexedDB.
107. Timestamp Strategy
Setiap entity harus memiliki:
created_at
updated_at
Gunakan timestamp yang konsisten.
Jangan mengandalkan timestamp client sepenuhnya untuk security.
Server tetap memiliki authority pada data server.
108. Data Ownership
Semua repository harus selalu memfilter berdasarkan user yang sedang login.
Jangan menerima:
user_id
dari input UI sebagai sumber authority.
Gunakan authenticated user.
109. Authorization
Authentication:
"Siapa user ini?"
Authorization:
"Data apa yang boleh diakses?"
Keduanya wajib diterapkan.
110. Security Priority
Jika terdapat konflik antara:
Convenience
vs
Security
pilih:
Security
111. User Experience Priority
Jika terdapat konflik:
Fancy UI
vs
Simple UX
pilih:
Simple UX
112. Final Quality Standard
Worksphere dianggap berkualitas jika:
Tidak mudah kehilangan data
Tidak mudah membuat duplicate data
Offline tetap berfungsi
Sync dapat dipulihkan
Saldo akurat
UI konsisten
Responsive
Accessible
Secure
Maintainable
113. Final Rule
Jika ragu ketika melakukan implementasi:
Gunakan urutan keputusan:
1. PRD.md
2. ARCHITECTURE.md
3. DESIGN.md
4. SKILL.md
5. TODO.md
Jika masih tidak jelas:
Jangan membuat perubahan arsitektur besar secara asumsi.
Pilih solusi yang paling sederhana, aman, dan konsisten dengan sistem yang sudah ada.
End of SKILL.md