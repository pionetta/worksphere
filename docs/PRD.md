# Worksphere — Product Requirements Document (PRD)

## 1. Informasi Produk

**Nama Aplikasi:** Worksphere

**Jenis Aplikasi:** Progressive Web App (PWA)

**Platform Utama:** Mobile

**Bahasa:** Bahasa Indonesia

**Mata Uang:** IDR (Rupiah Indonesia)

**Mode Tampilan:**
- Light Mode
- Dark Mode

**Target Pengguna:** Single User

**Backend:** Supabase

**Model Penyimpanan:** Offline-first dengan sinkronisasi online

**Biaya:** Gratis

---

# 2. Ringkasan Produk

Worksphere adalah aplikasi produktivitas pribadi berbasis Progressive Web App (PWA) yang menggabungkan tiga kebutuhan utama dalam satu aplikasi:

1. Absensi anggota.
2. Catatan keuangan.
3. To-Do List.

Aplikasi dirancang untuk penggunaan pribadi terlebih dahulu. Pada tahap awal, hanya satu pengguna yang mengelola seluruh data.

Di masa depan, aplikasi dapat dikembangkan agar dapat digunakan bersama anggota yang tercatat dalam sistem absensi. Namun, fitur multi-user collaboration bukan bagian dari versi awal.

Worksphere harus menggunakan pendekatan **offline-first**, sehingga pengguna tetap dapat membaca dan mengubah data ketika tidak memiliki koneksi internet. Data akan disimpan secara lokal dan disinkronkan ke Supabase ketika koneksi kembali tersedia.

---

# 3. Tujuan Produk

Worksphere dibuat untuk:

- Mengelola absensi beberapa anggota secara sederhana.
- Mencatat pemasukan dan pengeluaran pribadi.
- Mengelola berbagai dompet atau rekening.
- Memindahkan dana antar dompet.
- Memperbaiki saldo jika terjadi kesalahan input.
- Mengelola budget dan target tabungan.
- Mengelola tugas pribadi.
- Menyimpan deadline dan pengingat tugas.
- Menyediakan dashboard informasi yang ringkas.
- Tetap dapat digunakan tanpa koneksi internet.
- Menyinkronkan data secara otomatis ketika online.
- Menyediakan pengalaman penggunaan yang sederhana dan modern.

---

# 4. Prinsip Utama Produk

Worksphere harus mengikuti prinsip berikut:

### 4.1 Simple

Aplikasi harus mudah dipahami tanpa membutuhkan tutorial panjang.

### 4.2 Mobile First

Prioritas utama adalah penggunaan melalui smartphone.

### 4.3 Offline First

Koneksi internet bukan merupakan syarat untuk melakukan operasi utama.

### 4.4 Data Safety

Data keuangan, absensi, dan tugas harus memiliki mekanisme penyimpanan yang aman dan dapat dipulihkan.

### 4.5 Fast

Operasi lokal harus terasa instan.

### 4.6 Minimalist

UI tidak boleh terlalu kompleks.

### 4.7 Free

Prioritaskan teknologi open-source dan free tier.

### 4.8 Maintainable

Struktur aplikasi harus mudah dikembangkan di masa depan.

---

# 5. Target Pengguna

## 5.1 Pengguna Versi Awal

Worksphere digunakan oleh satu pengguna.

Pengguna tersebut memiliki akses penuh terhadap:

- Absensi.
- Keuangan.
- To-Do List.
- Pengaturan.
- Data pribadi miliknya.

Tidak diperlukan sistem role pada versi awal.

---

# 6. Platform

Worksphere harus berbentuk Progressive Web App.

Aplikasi harus dapat:

- Dibuka melalui browser.
- Di-install ke home screen.
- Berjalan dalam mode standalone.
- Berfungsi pada smartphone.
- Responsive pada tablet.
- Tetap dapat digunakan pada desktop.

Target utama:

- Android.
- iOS.
- Desktop browser sebagai tambahan.

---

# 7. Fitur Utama

Worksphere memiliki tiga fitur utama:

```text
1. Absensi
2. Keuangan
3. To-Do List

Selain itu terdapat:

Dashboard
Authentication
Settings
Offline & Sync
Export


---

8. Dashboard

Dashboard merupakan halaman utama aplikasi.

Dashboard harus memberikan informasi penting secara cepat.

8.1 Informasi Dashboard

Dashboard minimal menampilkan:

Keuangan

Total saldo seluruh wallet.

Total pemasukan.

Total pengeluaran.

Net cash flow.


Absensi

Ringkasan absensi minggu berjalan.

Jumlah hadir.

Jumlah absen.

Jumlah libur.


To-Do

Jumlah task hari ini.

Task yang mendekati deadline.

Task overdue.


System

Status online/offline.

Status sinkronisasi.



---

9. Fitur Absensi

9.1 Tujuan

Fitur absensi digunakan untuk mencatat kehadiran anggota.

Pada versi awal, absensi dilakukan sepenuhnya oleh pengguna aplikasi.


---

9.2 Jumlah Anggota

Sistem harus mendukung minimal 9 anggota.

Tidak perlu membatasi sistem hanya pada 9 anggota secara teknis jika penambahan anggota di masa depan diperlukan.

Default penggunaan awal adalah 9 anggota.


---

9.3 Data Anggota

Data anggota dibuat sederhana.

Informasi yang diperlukan:

Nama
Keterangan

Tidak perlu:

NIK.

Alamat.

Nomor telepon.

Email.

Foto.

Data pribadi lainnya.



---

9.4 Status Absensi

Hanya terdapat tiga status:

Hadir
Absen
Libur

Representasi internal dapat menggunakan:

present
absent
holiday


---

9.5 Perhitungan Absensi

Absensi dihitung berdasarkan hari.

Tidak terdapat sistem shift.

Setiap anggota hanya dapat memiliki satu status absensi pada satu tanggal.

Contoh:

12 Agustus 2026
Rusdi      → Hadir
Anggota 2  → Hadir
Anggota 3  → Libur
Anggota 4  → Absen

Satu anggota tidak boleh memiliki dua record absensi untuk tanggal yang sama.


---

10. Input Absensi

Pengguna dapat:

1. Memilih tanggal.


2. Melihat seluruh anggota.


3. Menentukan status masing-masing anggota.


4. Menyimpan absensi.



Sistem harus memudahkan pengguna melakukan input untuk banyak anggota sekaligus.


---

11. Edit Absensi

Pengguna dapat mengubah absensi pada:

Hari ini.

Hari sebelumnya.

Tanggal lain yang sudah memiliki data.


Tidak boleh ada batasan bahwa absensi hanya dapat diedit pada hari berjalan.


---

12. Rekap Absensi

Rekap utama menggunakan periode mingguan.

Minggu menggunakan:

Senin – Minggu

Rekap harus menampilkan:

Nama anggota
Jumlah Hadir
Jumlah Absen
Jumlah Libur
Persentase Kehadiran

Pengguna dapat berpindah:

Minggu sebelumnya
Minggu berjalan
Minggu berikutnya


---

13. Export Absensi

Data absensi harus dapat diekspor ke:

PDF
Excel (.xlsx)

Export harus dapat dilakukan berdasarkan periode yang dipilih.

Minimal mendukung export rekap mingguan.

Export harus tetap dapat dilakukan ketika perangkat sedang offline karena data dapat diambil dari local database.


---

14. Fitur Keuangan

Fitur keuangan digunakan untuk mengelola keuangan pribadi.

Fitur ini harus mendukung:

Pemasukan.

Pengeluaran.

Dompet/rekening.

Transfer antar dompet.

Penyesuaian saldo.

Kategori.

Budget.

Tabungan.

Riwayat transaksi.

Ringkasan keuangan.



---

15. Wallet / Dompet / Rekening

Pengguna dapat membuat beberapa tempat penyimpanan dana.

Contoh:

BCA
DANA
Cash
BRI
Tabungan

Jenis wallet dapat berupa:

Bank
E-Wallet
Cash
Savings
Other

Nama jenis dapat ditampilkan dalam Bahasa Indonesia pada UI.


---

16. Data Wallet

Setiap wallet minimal memiliki:

Nama
Jenis
Saldo awal
Keterangan

Pengguna dapat:

Menambah wallet.

Mengedit wallet.

Mengarsipkan wallet.

Melihat detail wallet.

Melihat saldo wallet.

Melihat transaksi wallet.



---

17. Saldo

Saldo wallet dihitung berdasarkan:

Saldo Awal
+ Pemasukan
- Pengeluaran
+ Penyesuaian
+ Transfer Masuk
- Transfer Keluar

Saldo tidak boleh hanya bergantung pada satu nilai saldo final yang dapat berubah tanpa histori.


---

18. Pemasukan

Pengguna dapat mencatat pemasukan.

Data pemasukan minimal:

Nominal
Wallet
Kategori
Tanggal
Catatan

Contoh:

Gaji
Rp5.000.000
BCA


---

19. Pengeluaran

Pengguna dapat mencatat pengeluaran.

Data pengeluaran minimal:

Nominal
Wallet
Kategori
Tanggal
Catatan

Contoh:

Makan
Rp25.000
Cash


---

20. Kategori Keuangan

Pengguna dapat menggunakan kategori untuk mengelompokkan transaksi.

Contoh kategori pengeluaran:

Makanan
Transportasi
Belanja
Tagihan
Hiburan
Kesehatan
Pendidikan
Lainnya

Contoh kategori pemasukan:

Gaji
Bonus
Freelance
Hadiah
Lainnya

Kategori dapat dibuat, diedit, dan diarsipkan.


---

21. Transfer Antar Wallet

Pengguna dapat memindahkan dana dari satu wallet ke wallet lain.

Contoh:

BCA
Rp1.000.000

Transfer Rp200.000

↓

DANA

Hasil:

BCA = Rp800.000
DANA = saldo sebelumnya + Rp200.000


---

22. Aturan Transfer

Transfer harus memiliki:

Wallet sumber
Wallet tujuan
Nominal
Tanggal
Catatan

Validasi:

Nominal harus lebih dari 0.

Wallet sumber dan tujuan tidak boleh sama.

Saldo sumber harus mencukupi.

Transfer harus diproses sebagai satu operasi.

Transfer harus memiliki histori.



---

23. Penyesuaian Saldo

Pengguna dapat mengedit saldo jika terjadi kesalahan input.

Contoh:

Saldo sistem:

Rp950.000

Saldo sebenarnya:

Rp1.000.000

Pengguna dapat membuat:

Adjustment +Rp50.000

Sebaliknya jika saldo sistem terlalu besar:

Adjustment -Rp50.000


---

24. Aturan Penyesuaian Saldo

Penyesuaian saldo tidak boleh mengubah saldo secara diam-diam.

Setiap penyesuaian harus dicatat sebagai histori transaksi.

Minimal:

Nominal
Tanggal
Wallet
Alasan/Catatan

Contoh:

Penyesuaian saldo
+Rp50.000
BCA
"Koreksi saldo"


---

25. Riwayat Transaksi

Pengguna dapat melihat seluruh transaksi.

Riwayat harus mendukung:

Pencarian.

Filter.

Pengurutan.

Filter berdasarkan wallet.

Filter berdasarkan kategori.

Filter berdasarkan jenis transaksi.

Filter berdasarkan periode.


Jenis transaksi:

Pemasukan
Pengeluaran
Transfer
Penyesuaian


---

26. Edit Transaksi

Pengguna dapat mengedit transaksi yang telah dibuat.

Ketika transaksi diedit, sistem harus menghitung ulang dampaknya terhadap saldo.

Contoh:

Sebelumnya:

Pengeluaran = Rp25.000

Diubah menjadi:

Rp30.000

Maka saldo harus berkurang tambahan:

Rp5.000


---

27. Hapus Transaksi

Penghapusan transaksi harus aman.

Jika memungkinkan, gunakan soft delete sehingga histori dapat dipulihkan.

Penghapusan tidak boleh menyebabkan saldo menjadi tidak konsisten.


---

28. Budget

Pengguna dapat membuat budget.

Contoh:

Makanan
Budget: Rp1.000.000
Periode: Agustus 2026

Sistem menghitung:

Budget
Penggunaan
Sisa
Persentase penggunaan

Contoh:

Rp750.000 / Rp1.000.000
75%

Jika penggunaan melebihi budget, sistem menampilkan status peringatan.


---

29. Tabungan

Pengguna dapat membuat target tabungan.

Contoh:

Dana Darurat
Target: Rp10.000.000
Terkumpul: Rp4.000.000

Informasi:

Nama
Target
Saldo terkumpul
Deadline (opsional)
Progress

Progress:

current_amount / target_amount


---

30. Laporan Keuangan

Aplikasi harus menyediakan ringkasan:

Total Saldo
Total Pemasukan
Total Pengeluaran
Net Cash Flow
Pengeluaran berdasarkan kategori
Saldo setiap wallet
Budget
Progress tabungan

Laporan dapat menggunakan chart jika membantu pemahaman.


---

31. Fitur To-Do List

To-Do List digunakan untuk mengelola pekerjaan dan aktivitas pribadi.


---

32. Task

Setiap task minimal memiliki:

Judul
Deskripsi
Status
Prioritas
Kategori
Deadline
Reminder

Fitur tambahan:

Subtask
Recurrence
Completed At


---

33. Status Task

Status:

To Do
In Progress
Completed
Cancelled

Representasi internal:

todo
in_progress
completed
cancelled


---

34. Prioritas

Prioritas:

Urgent
High
Medium
Low

Prioritas digunakan untuk membantu pengguna menentukan pekerjaan yang harus diselesaikan terlebih dahulu.


---

35. Kategori Task

Pengguna dapat mengelompokkan task.

Contoh:

Work
Personal
Study
Project
Important
Other

UI menggunakan Bahasa Indonesia.


---

36. Deadline

Task dapat memiliki:

Tanggal deadline

atau:

Tanggal + waktu deadline

Task yang telah melewati deadline dan belum selesai dianggap:

Overdue


---

37. Reminder

Task dapat memiliki pengingat.

Contoh:

Deadline:
20 Agustus 2026 20:00

Reminder:
20 Agustus 2026 18:00

Notification API browser dapat digunakan jika didukung.

Aplikasi tidak boleh meminta permission notification secara agresif ketika pertama kali dibuka.

Permission sebaiknya diminta ketika pengguna mengaktifkan reminder.


---

38. Subtask

Task dapat memiliki subtask.

Contoh:

Mengerjakan Skripsi

☑ Membuat outline
☑ Menulis Bab 1
☐ Menulis Bab 2
☐ Review

Subtask dapat diselesaikan secara individual.


---

39. Recurring Task

Jika diaktifkan dalam implementasi versi awal, task dapat memiliki pengulangan:

Harian
Mingguan
Bulanan
Custom

Fitur recurrence bukan prioritas lebih tinggi daripada fungsi dasar To-Do.

Jika implementasinya memperbesar kompleksitas secara signifikan, fitur ini dapat dikerjakan setelah fitur dasar selesai.


---

40. To-Do Dashboard

Halaman To-Do minimal memiliki:

Hari Ini
Overdue
Mendatang
Semua Task


---

41. Quick Add Task

Pengguna harus dapat membuat task dengan cepat.

Contoh:

[ Apa yang harus dilakukan? ] [+]

Informasi tambahan dapat diisi setelah task dibuat.


---

42. Pencarian dan Filter To-Do

Task dapat difilter berdasarkan:

Status
Prioritas
Kategori
Deadline

Task juga dapat dicari berdasarkan judul.


---

43. Offline-First

Worksphere harus tetap dapat digunakan ketika offline.

Ketika offline, pengguna dapat:

Membaca data.

Menambah data.

Mengedit data.

Menghapus data yang diizinkan.

Membuat transaksi.

Mengubah absensi.

Membuat task.

Mengubah task.


Perubahan disimpan ke local database.


---

44. Local Database

Gunakan IndexedDB sebagai penyimpanan lokal.

Library yang direkomendasikan:

Dexie

Data utama harus tersedia di local database agar aplikasi tetap berguna ketika offline.


---

45. Sinkronisasi

Ketika koneksi internet tersedia:

Local Data
↓
Sync Queue
↓
Supabase

Perubahan dari server juga harus dapat disinkronkan kembali ke local database.


---

46. Sync Queue

Perubahan offline harus memiliki queue.

Contoh:

Create Attendance
Update Task
Create Expense
Create Transfer

Ketika online, queue diproses.

Jika terjadi kegagalan:

retry,

jangan kehilangan data,

jangan membuat duplicate.



---

47. Conflict Resolution

Untuk versi awal gunakan strategi sederhana:

Last Write Wins

berdasarkan:

updated_at

Namun data keuangan tidak boleh kehilangan transaksi berbeda hanya karena conflict.

Gunakan UUID untuk setiap record agar operasi dapat dibuat idempotent.


---

48. Authentication

Gunakan:

Supabase Auth

Versi awal menggunakan:

Email
Password

User harus login sebelum mengakses data pribadi.


---

49. Data Ownership

Semua data user harus memiliki:

user_id

Database menggunakan Row Level Security (RLS).

User hanya boleh membaca dan mengubah datanya sendiri.


---

50. Design Requirements

Worksphere harus memiliki desain:

Minimalis
Modern
Glassmorphism
Mobile-first

Dua tema:

Light Mode
Dark Mode

Glassmorphism harus digunakan secara moderat.

Jangan menggunakan blur berlebihan karena dapat menurunkan performa dan keterbacaan.


---

51. Navigation

Mobile menggunakan bottom navigation:

Home
Absensi
Keuangan
To-Do

Settings dapat ditempatkan melalui profile/menu.

Pada desktop dapat menggunakan sidebar.


---

52. Bahasa

Semua teks yang terlihat oleh pengguna harus menggunakan:

Bahasa Indonesia

Contoh:

Dashboard
Absensi
Keuangan
Tugas
Pengaturan
Simpan
Batal
Hapus
Edit

Kode internal boleh menggunakan Bahasa Inggris.


---

53. Mata Uang

Mata uang:

IDR

Format:

Rp100.000
Rp1.500.000
Rp10.000.000

Tidak perlu menampilkan decimal untuk IDR.

Data nominal sebaiknya disimpan sebagai integer.


---

54. Export

Minimal export:

Absensi

PDF
Excel

Export harus dapat dilakukan secara offline.


---

55. Backup

Backup data secara keseluruhan merupakan fitur yang direkomendasikan untuk keamanan data.

Jika diterapkan, format awal yang direkomendasikan:

JSON

Backup harus dapat:

Export data.

Validasi backup.

Preview sebelum restore.

Restore data setelah konfirmasi.



---

56. Settings

Settings minimal memiliki:

Tema
Notifikasi
Sinkronisasi
Akun
Logout

Tema:

Light
Dark
System


---

57. Performance Requirements

Aplikasi harus:

Cepat saat membuka halaman.

Mengutamakan local read.

Tidak menampilkan loading berlebihan.

Tidak melakukan request network yang tidak diperlukan.

Tidak menggunakan animasi berat.

Tidak menggunakan blur berlebihan.

Tidak melakukan query database yang tidak diperlukan.



---

58. Accessibility

Aplikasi harus memperhatikan:

Kontras warna.

Keyboard navigation.

Focus state.

Screen reader.

Label form.

Aria label.

Touch target yang cukup besar.


Status tidak boleh hanya dibedakan berdasarkan warna.


---

59. Security Requirements

Aplikasi tidak boleh:

Menyimpan password secara manual.

Mengekspos Supabase service role key.

Menyimpan secret di source code.

Membocorkan token.

Membaca data user lain.

Mengabaikan RLS.

Menggunakan unsafe HTML tanpa sanitasi.



---

60. Teknologi yang Direkomendasikan

Frontend:

React
TypeScript
Vite
Tailwind CSS

PWA:

vite-plugin-pwa

Backend:

Supabase
PostgreSQL
Supabase Auth

Local database:

IndexedDB
Dexie

Form:

React Hook Form
Zod

Date:

date-fns

Chart:

Recharts

Icon:

Lucide React

Export:

jsPDF
SheetJS


---

61. Non-Goals

Fitur berikut tidak termasuk dalam versi awal:

Multi-user collaboration.

Chat.

Sistem role yang kompleks.

Team management.

Invitation system.

Realtime collaboration.

Sistem shift.

Integrasi rekening bank otomatis.

Payment gateway.

Integrasi e-wallet.

Backend server tambahan.

Fitur berbayar.

Sistem payroll.

Sistem HR kompleks.



---

62. Future Development

Fitur berikut dapat dipertimbangkan di masa depan:

Multi-user.

Anggota dapat melakukan absensi sendiri.

Role Admin/Member.

Invitation.

Realtime sync.

Notifikasi push.

Backup otomatis.

Import data Excel.

Export laporan keuangan.

Recurring transaction.

Kalender.

Habit tracker.

Statistik produktivitas.


Fitur tersebut tidak boleh diimplementasikan sebelum requirement versi awal selesai.


---

63. Acceptance Criteria

Worksphere versi awal dianggap berhasil jika:

Authentication

[ ] User dapat login.

[ ] User dapat logout.

[ ] Data hanya dapat diakses user yang bersangkutan.


Absensi

[ ] User dapat menambahkan anggota.

[ ] User dapat mencatat Hadir.

[ ] User dapat mencatat Absen.

[ ] User dapat mencatat Libur.

[ ] Satu anggota hanya memiliki satu absensi per hari.

[ ] Absensi sebelumnya dapat diedit.

[ ] Rekap mingguan tersedia.

[ ] Export PDF tersedia.

[ ] Export Excel tersedia.


Keuangan

[ ] User dapat membuat wallet.

[ ] User dapat mencatat pemasukan.

[ ] User dapat mencatat pengeluaran.

[ ] User dapat membuat kategori.

[ ] User dapat melihat histori.

[ ] User dapat transfer antar wallet.

[ ] User dapat melakukan adjustment saldo.

[ ] Saldo selalu konsisten.

[ ] User dapat membuat budget.

[ ] User dapat membuat target tabungan.

[ ] Laporan keuangan tersedia.


To-Do

[ ] User dapat membuat task.

[ ] User dapat mengedit task.

[ ] User dapat menyelesaikan task.

[ ] User dapat menentukan prioritas.

[ ] User dapat menentukan kategori.

[ ] User dapat menentukan deadline.

[ ] User dapat menentukan reminder.

[ ] User dapat membuat subtask.

[ ] Task overdue dapat dikenali.


Offline

[ ] Aplikasi dapat dibuka ketika offline setelah pernah di-load.

[ ] Data lokal tetap tersedia.

[ ] User dapat membuat data ketika offline.

[ ] User dapat mengedit data ketika offline.

[ ] Perubahan masuk sync queue.

[ ] Data disinkronkan ketika online.

[ ] Tidak terjadi duplicate data setelah sync.


UI

[ ] Mobile responsive.

[ ] Desktop responsive.

[ ] Light mode tersedia.

[ ] Dark mode tersedia.

[ ] Glassmorphism digunakan secara moderat.

[ ] Navigation mudah digunakan.



---

64. Definition of Done

Sebuah fitur dianggap selesai jika:

[ ] Requirement terpenuhi
[ ] UI selesai
[ ] Mobile responsive
[ ] Desktop responsive
[ ] Light mode
[ ] Dark mode
[ ] Validation
[ ] Error handling
[ ] Local persistence
[ ] Offline behavior
[ ] Sync behavior
[ ] Security
[ ] Accessibility
[ ] Testing
[ ] Tidak merusak fitur lain


---

65. Prioritas Pengembangan

Prioritas fitur:

P0 — Critical

Authentication
Local database
Offline support
Sync
Dashboard

P1 — Core

Absensi
Wallet
Pemasukan
Pengeluaran
Transfer
Adjustment
To-Do

P2 — Important

Budget
Tabungan
Weekly attendance
Reports
Export PDF
Export Excel

P3 — Enhancement

Reminder
Recurrence
Backup
Advanced charts

P4 — Future

Multi-user
Collaboration
Invitation
Realtime features


---

66. Product Philosophy

Worksphere bukan aplikasi enterprise yang kompleks.
Worksphere harus terasa seperti:
"Satu aplikasi pribadi untuk mengatur pekerjaan, keuangan, dan aktivitas harian."
Setiap fitur harus memiliki alasan yang jelas.
Jika sebuah fitur tidak memberikan manfaat nyata dan menambah kompleksitas, fitur tersebut tidak perlu dimasukkan ke versi awal.
Prioritas utama:
Simple
Fast
Reliable
Offline
Secure
Free