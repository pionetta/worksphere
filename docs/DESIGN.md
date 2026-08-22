# Worksphere — Design System & UI/UX Specification

## 1. Tujuan

Dokumen ini mendefinisikan standar desain, UI, UX, layout, navigasi, warna, typography, komponen, dan interaction pattern untuk aplikasi Worksphere.

Semua halaman dan component harus mengikuti design system ini.

Tujuan utama desain:

- Minimalis.
- Modern.
- Bersih.
- Nyaman digunakan dalam waktu lama.
- Mobile-first.
- Responsive.
- Glassmorphism yang moderat.
- Mendukung Light Mode dan Dark Mode.
- Mudah dipahami.
- Tidak terlihat seperti dashboard enterprise yang terlalu kompleks.

---

# 2. Design Philosophy

Worksphere harus terasa seperti aplikasi produktivitas pribadi yang modern.

Prinsip desain:

```text
Simple
Clean
Calm
Fast
Useful
Consistent

Hindari:

Terlalu banyak warna.
Terlalu banyak card.
Terlalu banyak shadow.
Glassmorphism berlebihan.
Animasi berlebihan.
Gradient yang terlalu mencolok.
UI yang terlalu padat.


---

3. Mobile First

Target utama adalah smartphone.

Prioritas:

Mobile
↓
Tablet
↓
Desktop

Semua halaman harus dirancang terlebih dahulu untuk layar mobile.


---

4. Responsive Breakpoints

Gunakan breakpoint standar Tailwind:

sm = 640px
md = 768px
lg = 1024px
xl = 1280px
2xl = 1536px

Prioritas desain:

< 640px
Mobile

640–1023px
Tablet

>= 1024px
Desktop


---

5. App Shell

Struktur utama:

┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│                               │
│                               │
│       Main Content            │
│                               │
│                               │
├───────────────────────────────┤
│ Bottom Navigation             │
└───────────────────────────────┘

Pada desktop:

┌────────────┬──────────────────┐
│            │                  │
│ Sidebar    │   Main Content   │
│            │                  │
│            │                  │
└────────────┴──────────────────┘


---

6. Navigation

Mobile

Gunakan bottom navigation.

Menu utama:

Home
Absensi
Keuangan
To-Do

Contoh:

┌───────────────────────────────┐
│                               │
│           Content             │
│                               │
├───────────────────────────────┤
│  Home  Absensi  Keuangan  ToDo│
└───────────────────────────────┘

Gunakan icon + label.


---

7. Desktop Navigation

Pada layar desktop gunakan sidebar.

Contoh:

┌─────────────────────────────────────────┐
│ Worksphere                              │
├──────────────┬──────────────────────────┤
│              │                          │
│ Home         │                          │
│ Absensi      │       Content            │
│ Keuangan     │                          │
│ To-Do        │                          │
│              │                          │
│ Pengaturan   │                          │
│              │                          │
└──────────────┴──────────────────────────┘

Sidebar dapat dibuat collapsible jika diperlukan.


---

8. Brand

Nama:

Worksphere

Logo harus sederhana.

Gunakan:

Wordmark.

Icon sederhana.

Bentuk geometris.


Hindari logo kompleks.


---

9. Color Philosophy

Worksphere tidak menggunakan banyak warna.

Gunakan:

Neutral
Primary
Success
Warning
Danger
Info

Warna status digunakan hanya jika diperlukan.


---

10. Light Mode

Light mode menggunakan:

Background:
soft neutral / off-white

Surface:
white / translucent white

Text:
dark neutral

Secondary Text:
gray neutral

Border:
subtle neutral

Background tidak harus putih murni.

Tujuannya mengurangi kesan terlalu terang.


---

11. Dark Mode

Dark mode menggunakan:

Background:
deep neutral

Surface:
dark translucent

Text:
near-white

Secondary Text:
muted gray

Border:
subtle light opacity

Hindari penggunaan hitam #000000 di seluruh layar.

Gunakan dark neutral agar lebih nyaman.


---

12. Primary Color

Gunakan satu warna utama.

Primary color harus:

Terlihat jelas.

Tidak terlalu mencolok.

Cocok pada light mode.

Cocok pada dark mode.


Warna primary digunakan untuk:

Primary Button
Active Navigation
Links
Selected State
Progress
Important Action

Jangan menggunakan primary color pada semua element.


---

13. Semantic Colors

Gunakan semantic colors:

Success

Untuk:

Hadir
Completed
Income
Success
Synced

Warning

Untuk:

Budget hampir habis
Deadline mendekat
Sync warning

Danger

Untuk:

Absen
Expense indicator jika diperlukan
Delete
Overdue
Error

Info

Untuk:

Information
Sync status

Status tetap harus memiliki text/icon, bukan hanya warna.


---

14. Glassmorphism

Glassmorphism adalah elemen visual pendukung, bukan struktur utama seluruh UI.

Gunakan:

backdrop blur
translucent background
subtle border
soft shadow

Contoh:

background:
rgba(..., 0.6)

border:
1px solid rgba(...)

backdrop-filter:
blur(...)


---

15. Glassmorphism Rules

Gunakan glassmorphism terutama pada:

Header
Floating Action Button
Navigation
Important Card
Modal
Bottom Sheet

Jangan membuat seluruh halaman menjadi kaca.

Hindari:

blur terlalu kuat
opacity terlalu rendah
text sulit dibaca
terlalu banyak transparansi

Accessibility dan readability lebih penting daripada efek visual.


---

16. Background

Background dapat menggunakan:

Soft gradient.

Subtle radial gradient.

Neutral solid color.


Gradient harus sangat halus.

Contoh konsep:

Top:
subtle primary tint

Middle:
neutral

Bottom:
neutral

Jangan menggunakan gradient warna-warni yang agresif.


---

17. Typography

Gunakan font modern dan mudah dibaca.

Prioritas:

Inter

Fallback:

system-ui
sans-serif


---

18. Typography Scale

Gunakan skala konsisten.

Display:
32–36px

H1:
28–32px

H2:
24px

H3:
20px

Body:
16px

Small:
14px

Caption:
12px

Jangan menggunakan terlalu banyak ukuran font.


---

19. Font Weight

Gunakan:

Regular:
400

Medium:
500

Semibold:
600

Bold:
700

Prioritas:

400
500
600

Bold hanya untuk informasi penting.


---

20. Spacing

Gunakan spacing berbasis kelipatan 4.

Contoh:

4px
8px
12px
16px
20px
24px
32px
40px
48px

Jangan menggunakan spacing random.


---

21. Border Radius

Gunakan rounded corners modern.

Rekomendasi:

Small:
8px

Medium:
12px

Large:
16px

Card:
16–20px

Modal:
20–24px

Jangan membuat semua element terlalu bulat.


---

22. Cards

Card digunakan untuk mengelompokkan informasi.

Card harus:

padding
subtle border
soft shadow
moderate radius

Contoh:

┌─────────────────────────┐
│ Total Saldo             │
│                         │
│ Rp5.250.000             │
│                         │
│ +5.2% bulan ini         │
└─────────────────────────┘


---

23. Dashboard Design

Dashboard harus memberikan informasi penting dalam satu layar.

Urutan:

Greeting
↓
Sync Status
↓
Financial Summary
↓
Attendance Summary
↓
To-Do Summary
↓
Quick Actions


---

24. Dashboard Header

Contoh:

Selamat pagi, Rusdi

18 Agustus 2026

● Tersinkron

Jika user offline:

○ Offline
Perubahan akan disinkronkan saat online.


---

25. Financial Summary

Gunakan card:

Total Saldo

Rp5.250.000

Kemudian:

Pemasukan
Rp6.000.000

Pengeluaran
Rp750.000

Jangan membuat terlalu banyak card terpisah di mobile.

Gunakan satu summary card jika memungkinkan.


---

26. Attendance Summary

Contoh:

Absensi Minggu Ini

Hadir       42
Absen        3
Libur        9

Gunakan visual sederhana.


---

27. To-Do Summary

Contoh:

Tugas Hari Ini

3 tugas tersisa

• Revisi Bab 3
• Input absensi
• Cek laporan

Tampilkan maksimal beberapa task penting.


---

28. Quick Actions

Dashboard menyediakan quick action.

Contoh:

+ Absensi
+ Transaksi
+ Tugas

Gunakan Floating Action Button atau compact action group.


---

29. Page Header

Setiap halaman utama memiliki:

Title
Subtitle optional
Action

Contoh:

Keuangan
Kelola pemasukan dan pengeluaran

                    +


---

30. Bottom Navigation

Navigation aktif harus jelas.

Contoh:

Home
●

Inactive:

○

Gunakan icon dan label.


---

31. Floating Action Button

FAB digunakan untuk tindakan utama.

Contoh:

+

Pada halaman:

Absensi
Keuangan
To-Do

FAB dapat memiliki context berbeda.


---

32. Button

Jenis button:

Primary
Secondary
Ghost
Danger
Icon

Primary digunakan untuk action utama.

Contoh:

Simpan
Tambah Transaksi
Buat Tugas


---

33. Form

Form harus:

Label jelas.

Input cukup besar.

Error mudah terlihat.

Keyboard type sesuai.

Validation message jelas.


Contoh:

Nominal

[ Rp 100.000            ]

Kategori

[ Makanan            ▼ ]

Tanggal

[ 18 Agustus 2026      ]


---

34. Input Nominal

Input nominal harus menggunakan:

inputMode="numeric"

Format tampilan:

Rp100.000

Jangan menggunakan decimal.


---

35. Modal

Modal digunakan untuk:

Confirmation.

Short form.

Detail ringan.


Jangan menggunakan modal besar untuk seluruh workflow jika halaman penuh lebih sesuai.


---

36. Bottom Sheet

Pada mobile, gunakan bottom sheet untuk:

Filter
Quick actions
Transaction type
Sort

Bottom sheet harus dapat ditutup dengan:

X.

Backdrop.

Swipe jika diterapkan.



---

37. Toast

Toast digunakan untuk feedback singkat.

Contoh:

✓ Transaksi berhasil disimpan

atau:

✓ Absensi diperbarui

Error:

⚠ Gagal menyimpan perubahan

Toast tidak boleh menjadi satu-satunya cara menyampaikan error penting.


---

38. Loading

Gunakan skeleton untuk content.

Contoh:

████████████
██████
██████████

Spinner digunakan untuk action singkat.


---

39. Empty State

Contoh:

Belum ada transaksi

Catat pemasukan atau pengeluaran pertama Anda.

[ Tambah Transaksi ]

Empty state harus membantu user mengambil tindakan.


---

40. Error State

Contoh:

Terjadi kesalahan

Data belum dapat ditampilkan.

[ Coba Lagi ]

Jangan menampilkan error teknis.


---

41. Offline State

Saat offline tampilkan indicator:

○ Offline

Tidak boleh menghalangi aplikasi.

User tetap dapat menggunakan fitur utama.


---

42. Sync State

Gunakan status:

Tersinkron
Menyinkronkan
Offline
Gagal sinkron

Contoh:

↻ Menyinkronkan...


---

43. Attendance UI

Halaman:

Absensi

Struktur:

Header
↓
Week Selector
↓
Attendance Summary
↓
Member List
↓
Save


---

44. Attendance Date Selector

Gunakan date/week selector.

Contoh:

‹
11–17 Agustus
›

User dapat berpindah minggu.


---

45. Attendance Member Card

Contoh:

┌─────────────────────────────┐
│ Rusdi                       │
│ Anggota utama               │
│                             │
│ [ Hadir ] [ Absen ] [ Libur]│
└─────────────────────────────┘

Status yang aktif harus terlihat jelas.


---

46. Attendance Color

Gunakan semantic color:

Hadir → Success
Absen → Danger
Libur → Neutral / Warning

Tetap tampilkan text.


---

47. Attendance History

Gunakan list atau table.

Mobile:

18 Agustus

Rusdi       Hadir
Syafiq      Hadir
Bulqis      Libur

Desktop dapat menggunakan table.


---

48. Weekly Attendance Summary

Contoh:

Minggu Ini

Rusdi
Hadir  : 5
Absen  : 1
Libur  : 1


---

49. Finance UI

Halaman utama:

Keuangan

Struktur:

Total Saldo
↓
Income / Expense
↓
Wallets
↓
Recent Transactions
↓
Charts


---

50. Wallet Card

Contoh:

┌─────────────────────────────┐
│ BCA                         │
│ Bank                        │
│                             │
│ Rp2.500.000                 │
│                             │
│ 24 transaksi                │
└─────────────────────────────┘


---

51. Transaction List

Contoh:

Hari ini

+ Gaji
Gaji
Rp5.000.000

- Makan
Makanan
Rp25.000

↔ Transfer
BCA → DANA
Rp200.000

Gunakan icon untuk membedakan jenis transaksi.


---

52. Income UI

Gunakan indikator positif.

Informasi:

+Rp5.000.000
Gaji
BCA
18 Agustus


---

53. Expense UI

Informasi:

-Rp25.000
Makanan
Cash
18 Agustus


---

54. Transfer UI

Informasi:

↔ Rp200.000

BCA → DANA

18 Agustus


---

55. Adjustment UI

Informasi:

Koreksi Saldo

+Rp50.000

BCA

Adjustment harus mudah dibedakan dari pemasukan normal.


---

56. Finance Filters

Filter:

Semua
Pemasukan
Pengeluaran
Transfer
Penyesuaian

Additional:

Wallet
Kategori
Tanggal


---

57. Budget UI

Contoh:

Makanan

Rp750.000 / Rp1.000.000

████████░░ 75%

Sisa Rp250.000

Jika melebihi:

Rp1.100.000 / Rp1.000.000

Melebihi budget Rp100.000


---

58. Savings UI

Contoh:

Dana Darurat

Rp4.000.000
dari Rp10.000.000

████████░░░░ 40%

Target:
Rp10.000.000


---

59. To-Do UI

Halaman utama:

To-Do

Struktur:

Quick Add
↓
Today
↓
Overdue
↓
Upcoming


---

60. Task Card

Contoh:

┌─────────────────────────────┐
│ ○ Revisi Bab 3              │
│                             │
│ High                        │
│ Skripsi                     │
│                             │
│ Deadline: Hari ini          │
└─────────────────────────────┘


---

61. Completed Task

Completed task:

☑ Revisi Bab 2

Judul dapat menggunakan:

text-decoration: line-through

Namun opacity jangan terlalu rendah agar masih terbaca.


---

62. Priority Indicator

Gunakan badge:

Urgent
High
Medium
Low

Jangan hanya menggunakan warna.


---

63. Overdue

Task overdue harus mudah dikenali.

Contoh:

⚠ Terlambat 2 hari

Gunakan danger semantic color.


---

64. Deadline

Contoh:

Hari ini, 20:00
Besok, 09:00
20 Agustus

Format harus natural dalam Bahasa Indonesia.


---

65. Reminder UI

Contoh:

🔔 Pengingat

18 Agustus 2026
18:00

Jika notification permission belum diberikan, tampilkan penjelasan yang jelas.


---

66. Subtask UI

Contoh:

Revisi Bab 3

☑ Periksa referensi
☑ Perbaiki format
☐ Tambahkan pembahasan
☐ Finalisasi

Progress:

2 / 4 selesai


---

67. Search

Search field:

🔍 Cari...

Search tidak boleh terlalu tinggi.

Gunakan debounce jika pencarian membutuhkan query kompleks.


---

68. Filter UI

Filter dapat dibuka melalui:

Filter

Mobile menggunakan bottom sheet.

Desktop menggunakan popover/sidebar.


---

69. Settings UI

Struktur:

Pengaturan

Tampilan
├── Tema

Notifikasi
├── Reminder

Sinkronisasi
├── Status
├── Sinkronkan Sekarang

Akun
├── Email
├── Logout


---

70. Theme Selector

Pilihan:

○ System
○ Light
○ Dark

Default:

System

jika memungkinkan.


---

71. Accessibility

Semua interactive element harus:

Bisa digunakan dengan keyboard.

Memiliki focus state.

Memiliki accessible label.

Memiliki ukuran touch target yang nyaman.

Memiliki contrast yang cukup.


Target touch:

minimal sekitar 44px


---

72. Animation

Gunakan animasi sederhana.

Contoh:

fade
slide
scale

Durasi:

150–300ms

Hindari animasi panjang.


---

73. Page Transition

Transisi antar halaman harus ringan.

Jangan menggunakan animasi kompleks yang memperlambat aplikasi.


---

74. Reduced Motion

Jika user mengaktifkan:

prefers-reduced-motion

kurangi atau matikan animasi yang tidak penting.


---

75. Responsive Tables

Table digunakan pada desktop.

Pada mobile, ubah menjadi:

Card
List
Accordion

Jangan memaksa table lebar ke layar smartphone.


---

76. Desktop Layout

Desktop dapat menggunakan:

Sidebar
Main Content

Main content memiliki max-width yang sesuai.

Jangan membuat konten terlalu lebar.


---

77. Mobile Safe Area

Perhatikan:

env(safe-area-inset-top)
env(safe-area-inset-bottom)

terutama untuk:

Bottom navigation.

FAB.

Header.



---

78. PWA Visual

PWA harus terasa seperti aplikasi native.

Gunakan:

standalone

untuk display mode.

Jangan membuat UI seperti website desktop yang dipaksa menjadi mobile.


---

79. Install Prompt

Jika browser mendukung install prompt, tampilkan secara halus.

Contoh:

Install Worksphere

Gunakan Worksphere seperti aplikasi di perangkat Anda.

[ Install ]
[ Nanti ]

Jangan menampilkan prompt setiap kali user membuka aplikasi.


---

80. Offline UX

Offline bukan error.

Contoh:

○ Offline

Perubahan Anda disimpan di perangkat
dan akan disinkronkan saat online.

User tetap dapat melanjutkan pekerjaan.


---

81. Sync Error UX

Jika sinkronisasi gagal:

⚠ Beberapa perubahan belum tersinkronkan.

[ Coba Sinkronkan ]

Jangan menghapus data lokal.


---

82. Destructive Actions

Gunakan warna danger untuk:

Hapus
Logout
Reset
Restore

Konfirmasi harus jelas.


---

83. Confirmation Dialog

Contoh:

Hapus transaksi?

Transaksi ini akan dihapus dari daftar
dan saldo akan dihitung ulang.

[Batal] [Hapus]


---

84. UX Financial Safety

Sebelum menyimpan transaksi:

Validasi nominal.

Validasi wallet.

Validasi kategori.

Validasi tanggal.


Untuk transfer:

Pastikan wallet sumber dan tujuan berbeda.

Pastikan saldo mencukupi.

Tampilkan ringkasan sebelum submit jika diperlukan.



---

85. UX Attendance Safety

Sebelum menyimpan:

Tanggal
Jumlah anggota
Status masing-masing

Pastikan user dapat melihat seluruh status sebelum menyimpan.


---

86. UX To-Do Safety

Task dapat diedit dengan cepat.

Completed task dapat di-uncomplete.

Jangan menghapus task ketika user hanya menekan checkbox.


---

87. Consistency Rules

Semua halaman harus menggunakan:

Font yang sama
Spacing yang sama
Button style yang sama
Card style yang sama
Border radius yang sama
Icon library yang sama
Toast yang sama
Modal yang sama

Jangan membuat design system baru di setiap feature.


---

88. Component Naming

Gunakan PascalCase.

Contoh:

DashboardCard
WalletCard
TransactionItem
AttendanceMemberCard
TaskCard
SyncIndicator
EmptyState
ConfirmDialog


---

89. UX Priority

Jika terjadi konflik antara visual dan usability:

Usability
>
Accessibility
>
Performance
>
Visual Effect

Glassmorphism tidak boleh mengorbankan ketiga hal di atas.


---

90. Final Design Direction

Worksphere harus memiliki kesan:

Minimal
Elegant
Modern
Personal
Calm
Productive

Bukan:

Corporate
Complex
Over-designed
Colorful
Heavy


---

91. Final Visual Reference

Konsep visual keseluruhan:

┌─────────────────────────────────┐
│ Worksphere              ☀ / ☾   │
│                                 │
│ Selamat pagi                    │
│ Kelola harimu dengan lebih baik │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Total Saldo                 │ │
│ │                             │ │
│ │ Rp5.250.000                 │ │
│ │                             │ │
│ │ +Rp6.000.000  -Rp750.000   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Absensi Minggu Ini              │
│ ┌────────┬────────┬──────────┐  │
│ │ Hadir  │ Absen  │ Libur    │  │
│ │   42   │   3    │    9     │  │
│ └────────┴────────┴──────────┘  │
│                                 │
│ Tugas Hari Ini                  │
│ ○ Revisi Bab 3                  │
│ ○ Input absensi                 │
│                                 │
│                         [+]     │
├─────────────────────────────────┤
│ Home  Absensi  Keuangan  To-Do  │
└─────────────────────────────────┘

End of DESIGN.md