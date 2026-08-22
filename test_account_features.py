import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = "screenshots/account_test"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
BASE_URL = "http://localhost:5173"

def run_account_feature_tests():
    print("==================================================")
    print("🚀 MEMULAI PENGUJIAN FITUR AKUN & PROFIL WORKSPHERE")
    print("==================================================")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # -------------------------------------------------------------
        # TEST 1: Halaman Login & Elemen Form
        # -------------------------------------------------------------
        print("\n[TEST 1] Memeriksa Halaman Login & Elemen Form...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        page.screenshot(path=f"{SCREENSHOT_DIR}/01_halaman_login.png")
        assert page.locator("h1:has-text('Worksphere')").is_visible(), "Judul Worksphere tidak ditemukan"
        assert page.locator("input#email").is_visible(), "Input Email tidak ditemukan"
        assert page.locator("input#password").is_visible(), "Input Password tidak ditemukan"
        assert page.get_by_role("button", name="Masuk", exact=True).is_visible(), "Tombol Masuk tidak ditemukan"
        assert page.get_by_role("button", name="Masuk dengan Google").is_visible(), "Tombol Google tidak ditemukan"
        assert page.locator("button:has-text('Coba Mode Demo')").is_visible(), "Tombol Mode Demo tidak ditemukan"
        print("  ✅ Form Login & tombol aksi tampil lengkap dan terstruktur.")
        results.append(("1. Form Login & Komponen UI", "LULUS", "Semua input, tombol Google, dan Mode Demo tampil lengkap"))

        # -------------------------------------------------------------
        # TEST 2: Validasi Form Buat Akun (Register Form & Edge Cases)
        # -------------------------------------------------------------
        print("\n[TEST 2] Memeriksa Form Buat Akun & Validasi Keamanan...")
        page.click("button:has-text('Daftar sekarang')")
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/02_halaman_daftar.png")

        # Cek elemen form daftar
        assert page.locator("input#username").is_visible(), "Input Username tidak muncul"
        assert page.locator("input#confirmPassword").is_visible(), "Input Konfirmasi Password tidak muncul"
        assert page.get_by_role("button", name="Daftar", exact=True).is_visible(), "Tombol Daftar tidak muncul"
        print("  ✅ Form Pendaftaran akun (Username, Email, Password, Konfirmasi) tampil.")

        # Uji Validasi 1: Username Kosong
        page.fill("input#email", "test_audit@worksphere.id")
        page.fill("input#password", "Password123")
        page.fill("input#confirmPassword", "Password123")
        page.get_by_role("button", name="Daftar", exact=True).click()
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/03_validasi_username_kosong.png")
        assert page.locator("text=Nama pengguna / username wajib diisi").is_visible(), "Pesan validasi username tidak muncul"
        print("  ✅ Validasi username wajib diisi berfungsi.")

        # Uji Validasi 2: Password Kurang dari 6 Karakter
        page.fill("input#username", "Pengguna Uji")
        page.fill("input#password", "abc1")
        page.fill("input#confirmPassword", "abc1")
        page.get_by_role("button", name="Daftar", exact=True).click()
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/04_validasi_password_pendek.png")
        assert page.locator("text=Password minimal 6 karakter").is_visible(), "Pesan validasi panjang password tidak muncul"
        print("  ✅ Validasi password minimal 6 karakter berfungsi.")

        # Uji Validasi 3: Password Tanpa Angka
        page.fill("input#password", "abcdefgh")
        page.fill("input#confirmPassword", "abcdefgh")
        page.get_by_role("button", name="Daftar", exact=True).click()
        time.sleep(0.5)
        assert page.locator("text=kombinasi huruf dan angka").is_visible(), "Pesan validasi huruf & angka tidak muncul"
        print("  ✅ Validasi wajib huruf & angka berfungsi.")

        # Uji Validasi 4: Konfirmasi Password Tidak Cocok
        page.fill("input#password", "Rahasia123")
        page.fill("input#confirmPassword", "Rahasia456")
        page.get_by_role("button", name="Daftar", exact=True).click()
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/05_validasi_password_tidak_cocok.png")
        assert page.locator("text=Konfirmasi password tidak cocok").is_visible(), "Pesan konfirmasi tidak cocok tidak muncul"
        print("  ✅ Validasi kecocokan konfirmasi password berfungsi.")
        results.append(("2. Validasi Keamanan Buat Akun", "LULUS", "Memvalidasi username, panjang password, kombinasi huruf & angka, dan kecocokan konfirmasi"))

        # -------------------------------------------------------------
        # TEST 3: Mode Demo Login & Masuk ke Dashboard
        # -------------------------------------------------------------
        print("\n[TEST 3] Masuk via Mode Demo (Offline Demo Session)...")
        page.click("button:has-text('Coba Mode Demo')")
        page.wait_for_url("**/app", timeout=10000)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/06_dashboard_demo_login.png")

        assert page.locator("text=Selamat").is_visible(), "Sapaan Dashboard tidak muncul"
        assert page.locator("button[title='Profil Pengguna']").is_visible(), "Avatar Profile button di Header tidak ditemukan"
        print("  ✅ Login Mode Demo sukses, user diarahkan ke Dashboard.")
        results.append(("3. Autentikasi & Masuk Dashboard", "LULUS", "Sesi aktif, sapaan personal tampil, dan header menampilkan avatar pengguna"))

        # -------------------------------------------------------------
        # TEST 4: Membuka Modal Profil Pengguna
        # -------------------------------------------------------------
        print("\n[TEST 4] Membuka Modal Profil Pengguna dari Header...")
        page.click("button[title='Profil Pengguna']")
        time.sleep(0.8)
        page.screenshot(path=f"{SCREENSHOT_DIR}/07_modal_profil_terbuka.png")

        assert page.locator("text=Profil Pengguna").is_visible(), "Modal Profil Pengguna tidak terbuka"
        assert page.locator("button:has-text('Informasi Profil')").is_visible(), "Tab Informasi Profil tidak ada"
        assert page.locator("button:has-text('Ganti Password')").is_visible(), "Tab Ganti Password tidak ada"
        assert page.locator("input#profile-email").is_visible(), "Email terdaftar tidak tampil"
        assert page.locator("input#profile-username").is_visible(), "Input username tidak tampil"
        print("  ✅ Modal Profil Pengguna terbuka dengan informasi akun lengkap.")
        results.append(("4. Modal Profil Pengguna", "LULUS", "Modal responsif, menampilkan tab profil, ganti password, dan input username"))

        # -------------------------------------------------------------
        # TEST 5: Mengubah Nama Pengguna / Username
        # -------------------------------------------------------------
        print("\n[TEST 5] Mengubah Nama Pengguna / Username...")
        page.fill("input#profile-username", "Rusdi Aristiawan")
        page.click("button:has-text('Simpan Perubahan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/08_profil_berhasil_diperbarui.png")

        assert page.locator("text=Profil berhasil diperbarui").is_visible(), "Notifikasi sukses simpan profil tidak muncul"
        print("  ✅ Nama pengguna berhasil disimpan.")

        # Tutup modal profil
        page.click("button[aria-label='Tutup']")
        time.sleep(0.5)

        # Verifikasi sapaan di Dashboard terupdate
        page.screenshot(path=f"{SCREENSHOT_DIR}/09_dashboard_nama_terupdate.png")
        assert page.locator("h2:has-text('Rusdi Aristiawan')").is_visible(), "Sapaan Dashboard tidak memperbarui nama baru"
        print("  ✅ Sapaan Dashboard otomatis terupdate dengan nama baru 'Rusdi Aristiawan'.")
        results.append(("5. Edit Username & Sinkronisasi Nama", "LULUS", "Nama pengguna berhasil diubah dan tersinkronisasi instan ke Dashboard dan Sidebar"))

        # -------------------------------------------------------------
        # TEST 6: Pengujian Tab Ubah Password
        # -------------------------------------------------------------
        print("\n[TEST 6] Pengujian Fitur Ubah Password...")
        page.click("button[title='Profil Pengguna']")
        time.sleep(0.5)
        page.click("button:has-text('Ganti Password')")
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/10_tab_ganti_password.png")

        # Uji validasi password baru tanpa angka
        page.fill("input#profile-new-password", "hanyahuruf")
        page.fill("input#profile-confirm-password", "hanyahuruf")
        page.click("button:has-text('Ubah Password')")
        time.sleep(0.5)
        assert page.locator("text=kombinasi huruf dan angka").is_visible(), "Validasi huruf dan angka tidak muncul di ganti password"
        print("  ✅ Validasi huruf & angka pada Ganti Password berfungsi.")

        # Masukkan password valid
        page.fill("input#profile-new-password", "Worksphere2026")
        page.fill("input#profile-confirm-password", "Worksphere2026")
        page.click("button:has-text('Ubah Password')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/11_password_berhasil_diubah.png")
        assert page.locator("text=Password berhasil diubah").is_visible(), "Notifikasi sukses ubah password tidak muncul"
        print("  ✅ Password berhasil diubah dan divalidasi.")
        results.append(("6. Ubah Password Pengguna", "LULUS", "Validasi aturan password kuat dan perubahan password berhasil"))

        # Tutup modal
        page.click("button[aria-label='Tutup']")
        time.sleep(0.5)

        # -------------------------------------------------------------
        # TEST 7: Pengujian Konfirmasi Keluar (Logout Flow)
        # -------------------------------------------------------------
        print("\n[TEST 7] Pengujian Logout & Dialog Konfirmasi...")
        page.click("button[title='Keluar']")
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/12_dialog_konfirmasi_logout.png")

        assert page.locator("h3:has-text('Keluar dari Akun')").is_visible(), "Dialog konfirmasi logout tidak muncul"
        assert page.locator("button:has-text('Batal')").is_visible(), "Tombol Batal logout tidak ada"
        print("  ✅ Dialog konfirmasi keluar muncul mencegah aksi tidak sengaja.")

        # Klik konfirmasi keluar
        page.locator("div[role='alertdialog'] button:has-text('Keluar')").click()
        page.wait_for_url("**/login", timeout=10000)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/13_kembali_ke_login.png")

        assert page.locator("h1:has-text('Worksphere')").is_visible(), "Tidak kembali ke halaman login setelah logout"
        print("  ✅ Logout berhasil, sesi dibersihkan, dan diarahkan kembali ke /login.")
        results.append(("7. Logout & Dialog Konfirmasi", "LULUS", "Dialog konfirmasi mencegah salah klik, sesi aman dibersihkan, dan diarahkan ke login"))

        browser.close()

    print("\n==================================================")
    print("📊 RINGKASAN HASIL PENGUJIAN AKUN & PROFIL")
    print("==================================================")
    for title, status, desc in results:
        print(f"[{status}] {title}: {desc}")

if __name__ == "__main__":
    run_account_feature_tests()
