# Worksphere — AI Agent Instructions

## 1. Project Identity

Nama aplikasi:

Worksphere

Jenis aplikasi:

Mobile-first Progressive Web App (PWA)

Bahasa aplikasi:

Bahasa Indonesia

Mata uang:

IDR

Mode:

Light Mode dan Dark Mode

Design:

Minimalist Glassmorphism

Backend:

Supabase

Database cloud:

PostgreSQL melalui Supabase

Local database:

IndexedDB menggunakan Dexie

Authentication:

Supabase Auth

Architecture:

Offline-first

Target pengguna:

Single user pada versi awal

Target biaya:

Sepenuhnya gratis untuk penggunaan awal.

---

# 2. Mandatory Documentation

Sebelum melakukan perubahan pada project, agent WAJIB membaca dokumentasi:

1. `PRD.md`
2. `ARCHITECTURE.md`
3. `DESIGN.md`
4. `SKILL.md`
5. `WORKFLOW.md`
6. `TODO.md`

Dokumentasi tersebut merupakan sumber informasi utama project.

Jangan mengabaikan requirement yang sudah ditentukan di dalam dokumentasi.

---

# 3. Documentation Priority

Jika terdapat konflik antar dokumentasi, gunakan prioritas:

```text
PRD.md
↓
ARCHITECTURE.md
↓
DESIGN.md
↓
SKILL.md
↓
WORKFLOW.md
↓
TODO.md

Jika konflik berdampak besar terhadap:

Database

Security

Authentication

Data integrity

Synchronization

Architecture


agent harus berhenti dan meminta keputusan.

Jangan membuat asumsi besar.


---

4. General Agent Behavior

Agent harus bertindak sebagai software engineer.

Agent tidak boleh hanya menghasilkan kode tanpa memahami architecture.

Sebelum melakukan implementasi:

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


---

5. Inspect Before Modify

Sebelum membuat file baru:

1. Periksa apakah file tersebut sudah ada.


2. Periksa apakah functionality serupa sudah tersedia.


3. Periksa struktur project.


4. Gunakan kembali code yang sudah ada jika sesuai.



Jangan membuat duplicate implementation.


---

6. Minimal Changes

Gunakan prinsip:

Smallest correct change

Jangan melakukan perubahan besar jika task hanya membutuhkan perubahan kecil.

Contoh:

Jika user meminta memperbaiki button:

Jangan:

Rewrite entire page

Lakukan:

Modify button component


---

7. Do Not Overengineer

Jangan menambahkan:

Library yang tidak diperlukan.

Abstraction berlebihan.

Design pattern yang tidak dibutuhkan.

Service tambahan.

Backend tambahan.

AI service.

Payment service.

Analytics service.


Gunakan solusi paling sederhana yang memenuhi requirement.


---

8. Technology Rules

Technology utama:

React
TypeScript
Vite
Tailwind CSS
Supabase
Dexie
IndexedDB
React Router
Zod
date-fns
Lucide React

Jangan mengganti technology utama tanpa alasan yang jelas.


---

9. TypeScript Rules

Gunakan TypeScript secara strict.

Hindari:

any

kecuali benar-benar diperlukan dan memiliki alasan yang jelas.

Prefer:

unknown

kemudian lakukan type narrowing.

Gunakan type yang jelas untuk:

Database entity

API response

Form data

Component props

Service result

Repository result



---

10. React Rules

Gunakan functional components.

Prefer:

function Component() {
  ...
}

Hindari component yang terlalu besar.

Jika component mulai menangani banyak tanggung jawab:

UI
+
Business Logic
+
Database
+
Sync

pisahkan menjadi layer yang sesuai.


---

11. Component Rules

Component harus memiliki tanggung jawab yang jelas.

Contoh:

Button
Card
Modal
Input
Select
Badge

adalah reusable components.

Feature-specific components diletakkan pada feature masing-masing.

Contoh:

src/features/attendance/components/
src/features/finance/components/
src/features/todo/components/


---

12. Business Logic Rules

Business logic tidak boleh diletakkan langsung di UI jika logic tersebut kompleks atau reusable.

Contoh:

Jangan menghitung saldo langsung di JSX.

Gunakan:

service
utility
selector

atau layer yang sesuai architecture.


---

13. Data Access Rules

UI tidak boleh langsung mengakses Supabase atau IndexedDB secara sembarangan.

Gunakan:

UI
↓
Hook
↓
Service
↓
Repository
↓
Database

Repository bertanggung jawab terhadap data access.


---

14. Offline-First Rule

Worksphere harus tetap dapat digunakan ketika offline.

Untuk operasi data utama:

User Action
↓
Validation
↓
Local Database
↓
UI Update
↓
Sync Queue
↓
Supabase

Jangan membuat UI bergantung pada response Supabase untuk operasi normal.


---

15. Local Database Rule

IndexedDB adalah sumber data lokal utama ketika aplikasi berjalan offline.

Gunakan Dexie.

Data penting harus tersedia secara lokal agar dapat digunakan tanpa internet.


---

16. Supabase Rule

Supabase digunakan sebagai cloud backend dan synchronization target.

Jangan menjadikan Supabase sebagai satu-satunya sumber data untuk operasi UI normal.


---

17. Sync Rules

Setiap perubahan data yang perlu disinkronkan harus dapat dilacak.

Minimal operasi:

create
update
delete

Sync harus mendukung:

retry
failure handling
idempotency
network detection
reconnection


---

18. Sync Queue Rules

Queue harus menjaga urutan operasi jika dependency diperlukan.

Contoh:

Create Wallet
↓
Create Transaction

Transaction tidak boleh diproses sebelum Wallet tersedia jika transaction bergantung pada wallet tersebut.


---

19. Duplicate Prevention

Agent harus mencegah duplicate data.

Gunakan identifier/idempotency key jika diperlukan.

Hal ini sangat penting untuk:

Transactions

Transfers

Attendance

Sync operations



---

20. Data Integrity

Jangan mengorbankan data integrity demi UI atau kecepatan implementasi.

Prioritas:

Data integrity
>
Security
>
Correctness
>
Reliability
>
UX
>
Visual polish


---

21. Finance Critical Rule

Keuangan merupakan fitur sensitif terhadap kesalahan data.

Agent harus memastikan:

Saldo Akhir =
Saldo Awal
+ Pemasukan
- Pengeluaran
- Transfer Keluar
+ Transfer Masuk
+ Adjustment

Setiap perubahan transaksi harus menghasilkan saldo yang konsisten.


---

22. Transfer Rule

Transfer antar wallet harus diperlakukan sebagai satu operasi logis.

Transfer:

Source Wallet
↓
Decrease
+
Destination Wallet
↓
Increase

Jangan menghasilkan kondisi di mana hanya satu wallet yang berubah.


---

23. Balance Adjustment Rule

Adjustment saldo harus memiliki alasan/history.

Jangan mengubah saldo secara diam-diam tanpa jejak.


---

24. Attendance Rules

Status absensi hanya:

Hadir
Absen
Libur

Satu anggota hanya boleh memiliki satu record absensi untuk satu tanggal.

Constraint:

member + date = unique


---

25. Attendance History

User harus dapat mengedit absensi tanggal sebelumnya.

Jangan membatasi edit hanya pada hari berjalan kecuali requirement berubah.


---

26. Finance Currency

Semua nilai uang menggunakan:

IDR

Jangan menggunakan floating-point untuk operasi uang jika dapat menyebabkan masalah presisi.

Gunakan representasi integer untuk nilai terkecil yang sesuai, atau pendekatan decimal yang aman.


---

27. Date & Time

Gunakan utility terpusat untuk tanggal.

Gunakan date-fns jika diperlukan.

Jangan membuat berbagai format tanggal manual di seluruh component.

UI menggunakan format tanggal Indonesia.

Contoh:

18 Agustus 2026


---

28. Todo Rules

Task harus mendukung:

Judul
Deskripsi
Status
Prioritas
Kategori
Deadline
Reminder
Subtask

Prioritas:

Urgent
High
Medium
Low


---

29. Validation

Gunakan Zod untuk validasi input penting.

Validasi harus dilakukan sebelum:

Local DB write

dan sebelum:

Supabase write


---

30. Error Handling

Jangan menggunakan:

try {
  ...
} catch {
}

tanpa menangani error.

Error harus:

1. Dicatat jika diperlukan.


2. Ditangani.


3. Memberikan feedback kepada user jika relevan.




---

31. User Feedback

Operasi penting harus memberikan feedback:

Loading
Success
Error

Contoh:

Menyimpan...
Berhasil disimpan
Gagal menyimpan


---

32. Offline Feedback

Jika offline, user harus mengetahui kondisi tersebut.

Contoh:

Offline

Namun offline bukan berarti aplikasi tidak dapat digunakan.


---

33. Sync Feedback

Gunakan status:

Tersinkron
Menyinkronkan...
Offline
Sinkronisasi gagal

Jangan membuat user menebak apakah data sudah tersimpan.


---

34. UI Language

Semua UI menggunakan Bahasa Indonesia.

Hindari mencampur bahasa Inggris pada UI kecuali:

Nama teknologi.

Istilah teknis yang memang diperlukan.

Brand.

Identifier internal.


Contoh UI:

Tambah Transaksi
Simpan
Batal
Hapus
Edit
Tanggal
Kategori
Saldo


---

35. Design Rules

Design harus mengikuti:

Minimalist
Glassmorphism
Modern
Clean
Mobile-first

Gunakan whitespace yang cukup.

Jangan membuat UI terlalu padat.


---

36. Glassmorphism Rules

Glassmorphism digunakan secara terkontrol.

Jangan menerapkan blur pada semua element.

Gunakan terutama pada:

Cards

Navigation

Modal

Floating elements


Pastikan text tetap mudah dibaca.


---

37. Dark Mode

Semua component harus mendukung:

Light
Dark

Jangan membuat component yang hanya terlihat baik pada light mode.


---

38. Responsive Rules

Prioritas:

Mobile
↓
Tablet
↓
Desktop

Mobile adalah target utama.

Desktop harus tetap nyaman digunakan.


---

39. Accessibility

Minimal:

Semantic HTML

Label form

Focus state

Keyboard support

ARIA jika diperlukan

Kontras cukup

Touch target yang cukup


Jangan menggunakan warna sebagai satu-satunya indikator status.


---

40. PWA Rules

PWA harus mendukung:

Install
Launch
Offline
Online
Refresh
Reconnect

Service worker tidak boleh menyebabkan data aplikasi hilang.


---

41. Dependency Rules

Jangan menambahkan dependency baru tanpa alasan.

Sebelum install library:

1. Periksa apakah functionality dapat dibuat dengan library yang sudah ada.


2. Jika tidak, pilih library yang ringan dan maintained.


3. Pastikan gratis/open source jika memungkinkan.




---

42. No Paid Services

Jangan menambahkan layanan yang mengharuskan user membayar untuk menggunakan MVP.

Jika sebuah fitur membutuhkan layanan berbayar:

Stop
↓
Cari alternatif gratis


---

43. No Secrets

Jangan pernah memasukkan:

password
service role key
private API key
secret token

ke source code frontend.


---

44. Supabase Security

Frontend hanya boleh menggunakan credential yang aman untuk frontend.

Jangan memasukkan:

SUPABASE_SERVICE_ROLE_KEY

ke aplikasi client.


---

45. RLS

Semua data user harus dilindungi dengan Row Level Security.

User hanya boleh:

SELECT own data
INSERT own data
UPDATE own data
DELETE own data

sesuai requirement.


---

46. Database Changes

Jangan mengubah schema database secara sembarangan.

Gunakan migration.

Sebelum migration:

Inspect
↓
Plan
↓
Implement
↓
Verify


---

47. Migration Safety

Migration tidak boleh menyebabkan data hilang tanpa persetujuan eksplisit.

Hindari destructive migration jika tidak diperlukan.


---

48. Testing Rules

Setiap feature penting harus diuji.

Prioritas test:

Finance calculations
Attendance calculations
Sync
Authentication
Data access


---

49. Test Before Done

Jangan menandai task selesai hanya karena:

Code compiles

Task harus:

Implemented
+
Tested
+
Verified


---

50. Build Rules

Sebelum menyelesaikan task besar, jalankan:

lint
typecheck
test
build

Gunakan script yang tersedia di package.json.


---

51. TODO.md Rules

TODO.md adalah daftar task utama.

Saat mulai:

[ ] Task

ubah menjadi:

[-] Task

Saat benar-benar selesai:

[x] Task

Jangan menandai task selesai sebelum verification.


---

52. Task Scope

Agent harus mengerjakan task yang diminta.

Jangan memperluas scope secara tidak perlu.

Jika menemukan improvement tambahan:

Tambahkan ke TODO.md

bukan langsung mengerjakannya, kecuali improvement tersebut diperlukan agar task saat ini bekerja dengan benar.


---

53. Refactoring

Refactoring boleh dilakukan jika:

Memperbaiki bug.

Mengurangi duplication.

Memperbaiki maintainability.

Diperlukan oleh architecture.


Jangan melakukan refactoring besar tanpa alasan.


---

54. Existing Code

Jika code existing sudah benar:

Keep it.

Jangan mengganti hanya karena agent memiliki preferensi berbeda.


---

55. Generated Files

Jangan mengedit generated files secara manual jika file tersebut dihasilkan oleh tool.

Perbaiki source yang menghasilkan file tersebut.


---

56. Comments

Gunakan comment hanya jika membantu memahami:

Business logic

Complex algorithm

Non-obvious workaround

Security consideration


Jangan memberikan comment untuk code yang sudah jelas.


---

57. Naming

Gunakan nama yang jelas.

Contoh:

attendanceRepository
transactionRepository
calculateBalance
createTransfer
syncQueue

Hindari:

data1
temp
foo
bar
thing


---

58. File Naming

Gunakan naming convention yang konsisten.

Contoh:

attendance.service.ts
attendance.repository.ts
attendance.types.ts
AttendancePage.tsx
AttendanceCard.tsx


---

59. Feature Isolation

Feature-specific code harus berada di feature masing-masing.

Contoh:

src/features/attendance/
src/features/finance/
src/features/todo/

Jangan mencampur business logic antar feature tanpa alasan.


---

60. Shared Code

Code yang benar-benar digunakan oleh beberapa feature dapat ditempatkan di:

src/components/
src/hooks/
src/lib/
src/utils/

Jangan membuat shared abstraction terlalu dini.


---

61. State Management

Gunakan state lokal jika cukup.

Jangan menambahkan global state management library kecuali memang diperlukan.

Prioritas:

Local State
↓
Context
↓
Existing architecture
↓
Global state library


---

62. Forms

Form harus memiliki:

Validation
Loading
Error
Success

Input harus memiliki label yang jelas.


---

63. Destructive Actions

Action seperti delete harus memiliki confirmation.

Contoh:

Apakah Anda yakin ingin menghapus transaksi ini?


---

64. Loading

Hindari blank screen saat loading.

Gunakan:

Skeleton
Spinner
Loading text

sesuai konteks.


---

65. Empty State

Jika tidak ada data, tampilkan informasi yang jelas.

Contoh:

Belum ada transaksi

Tambahkan transaksi pertama Anda.


---

66. Error State

Error harus actionable jika memungkinkan.

Contoh:

Sinkronisasi gagal.

Coba lagi.


---

67. Mobile Interaction

Prioritaskan:

Touch
Swipe
Tap
Bottom Sheet
FAB

jika sesuai kebutuhan.

Jangan membuat interaction yang hanya nyaman menggunakan mouse.


---

68. Desktop Interaction

Pada layar besar, gunakan:

Sidebar
Grid
Table
Multi-column layout

jika meningkatkan usability.


---

69. Performance

Hindari:

Rendering ulang yang tidak diperlukan.

Query database berulang.

Fetch data yang tidak digunakan.

Bundle besar tanpa alasan.

Menyimpan data besar di React state.



---

70. Security Priority

Jika ada trade-off:

Security
>
Convenience

Jangan mengurangi security hanya untuk mempermudah implementation.


---

71. Data Loss Priority

Jika terdapat risiko:

Data Loss

agent harus menghentikan perubahan berisiko dan mengevaluasi kembali approach.


---

72. Conflict Handling

Jika terjadi konflik data:

Local
vs
Server

gunakan strategy yang telah ditentukan dalam ARCHITECTURE.md.

Jangan membuat conflict resolution baru secara spontan.


---

73. No Silent Data Modification

Jangan:

Menghapus data tanpa user action.

Mengubah nominal tanpa alasan.

Mengubah status absensi tanpa alasan.

Mengubah task tanpa user action.


Sync juga tidak boleh secara diam-diam mengubah data tanpa mekanisme yang jelas.


---

74. Finance Accuracy

Untuk operasi keuangan:

Correctness > Performance

Perhitungan harus deterministic dan testable.


---

75. Attendance Accuracy

Perhitungan mingguan harus berdasarkan data aktual.

Jangan menghitung berdasarkan UI state sementara.


---

76. Todo Accuracy

Deadline harus memperhitungkan timezone yang digunakan aplikasi.

Jangan menggunakan perbandingan tanggal yang tidak konsisten.


---

77. Before Adding a Feature

Sebelum membuat feature:

1. Read PRD
2. Check architecture
3. Check TODO
4. Inspect existing code
5. Plan
6. Implement
7. Test
8. Verify


---

78. Before Modifying Database

Wajib:

1. Inspect current schema
2. Check relationships
3. Check RLS
4. Plan migration
5. Apply migration
6. Verify


---

79. Before Modifying Sync

Wajib:

1. Understand current sync architecture
2. Inspect queue
3. Inspect retry mechanism
4. Inspect idempotency
5. Test offline
6. Test reconnect


---

80. Before UI Changes

Wajib membaca:

DESIGN.md

dan mengikuti design system yang sudah ditentukan.


---

81. When Requirements Are Ambiguous

Jika ambiguity kecil dan tidak berdampak pada:

database
security
architecture
data integrity

agent boleh memilih solusi yang paling sederhana dan konsisten.

Jika ambiguity besar:

STOP

dan minta klarifikasi.


---

82. When an Error Occurs

Gunakan workflow:

Reproduce
↓
Read error
↓
Identify root cause
↓
Inspect related code
↓
Fix root cause
↓
Run test
↓
Run build

Jangan melakukan random changes sampai error hilang.


---

83. When Tests Fail

Jangan menghapus atau melemahkan test hanya agar test pass.

Cari root cause.


---

84. When Build Fails

Prioritas:

TypeScript
↓
Import
↓
Configuration
↓
Dependency
↓
Runtime

Perbaiki penyebab sebenarnya.


---

85. When a Dependency Is Missing

Periksa:

package.json

Jika dependency memang diperlukan:

Install
↓
Update package.json
↓
Test

Jangan menggunakan package tanpa dependency yang benar.


---

86. Git Safety

Jangan melakukan:

git reset --hard
git clean -fd

atau operasi destructive lainnya tanpa instruksi eksplisit.

Jangan menghapus perubahan user.


---

87. User Changes

Jika menemukan perubahan yang dibuat user:

Preserve them.

Jangan overwrite tanpa alasan.


---

88. Git Commit

Jika user meminta commit:

Gunakan commit message yang jelas.

Satu commit sebaiknya mewakili satu logical change.

Jangan memasukkan file rahasia.

Jangan commit generated artifacts yang tidak diperlukan.



---

89. No Unrequested Deployment

Jangan melakukan deployment tanpa instruksi eksplisit.


---

90. No Unrequested External Services

Jangan membuat akun atau menggunakan service eksternal baru tanpa kebutuhan dan persetujuan yang jelas.


---

91. Free-Only Principle

Worksphere harus tetap dapat digunakan tanpa layanan berbayar pada MVP.

Jika ada kebutuhan:

Paid service

cari:

Open source
Free tier
Browser API
Supabase
Local implementation

terlebih dahulu.


---

92. Feature Priority

Jika harus memilih:

1. Data correctness
2. Offline capability
3. Sync reliability
4. Security
5. Core functionality
6. UX
7. Visual polish
8. Nice-to-have features


---

93. MVP Boundary

MVP hanya berfokus pada:

Authentication
Attendance
Finance
To-Do
Offline
Sync
PWA
Light/Dark
Responsive

Jangan mengembangkan fitur masa depan sebelum MVP stabil.


---

94. Future Features

Fitur seperti:

Multi-user
Shared workspace
Advanced analytics
AI
Collaboration

tidak boleh mengganggu MVP.

Jika diperlukan:

Add to TODO.md


---

95. Completion Rule

Agent tidak boleh mengatakan:

Done

hanya karena code telah dibuat.

Gunakan:

Implemented
Tested
Verified

sebelum menyatakan task selesai.


---

96. Final Response Format

Setelah menyelesaikan task, agent harus memberikan ringkasan:

## Completed

- Task yang selesai
- File yang dibuat/diubah
- Perubahan utama

## Testing

- Test yang dijalankan
- Build status

## Notes

- Hal penting
- Known limitation jika ada

## Next

- Task berikutnya dari TODO.md


---

97. Important Rule

Jangan membuat seluruh aplikasi sekaligus kecuali user secara eksplisit meminta demikian.

Gunakan incremental development.

Contoh:

Foundation
↓
Verify
↓
Authentication
↓
Verify
↓
Offline
↓
Verify
↓
Sync
↓
Verify
↓
Feature


---

98. Golden Rule

Selalu ikuti prinsip:

Understand before coding.
Inspect before modifying.
Plan before implementing.
Test before completing.
Protect user data above all else.
99. Final Instruction
Jika terdapat konflik antara keinginan untuk:
menyelesaikan task dengan cepat
dan:
menjaga correctness, security, data integrity, dan maintainability
selalu prioritaskan:
Correctness
Security
Data Integrity
Maintainability
End of AGENTS.md