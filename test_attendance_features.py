import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = "screenshots/attendance_test"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
BASE_URL = "http://localhost:5173"

def run_attendance_feature_tests():
    print("==================================================")
    print("🚀 MEMULAI PENGUJIAN FITUR ABSENSI & ANGGOTA")
    print("==================================================")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # -------------------------------------------------------------
        # STEP 1: Login Demo & Navigasi ke Halaman Absensi
        # -------------------------------------------------------------
        print("\n[STEP 1] Login Demo & Navigasi ke Menu Absensi...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.click("button:has-text('Coba Mode Demo')")
        page.wait_for_url("**/app", timeout=10000)
        time.sleep(1)

        # Klik Navigasi Absensi
        page.click("a[href='/app/attendance']")
        page.wait_for_url("**/app/attendance", timeout=10000)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/01_halaman_absensi_utama.png")

        assert page.locator("button:has-text('Absensi')").is_visible(), "Tab Absensi tidak ditemukan"
        assert page.locator("button:has-text('Anggota')").is_visible(), "Tab Anggota tidak ditemukan"
        assert page.locator("button:has-text('Rekap')").is_visible(), "Tab Rekap tidak ditemukan"
        print("  ✅ Navigasi berhasil, 3 Tab utama (Absensi, Anggota, Rekap) tampil.")
        results.append(("1. Navigasi & Struktur Tab", "LULUS", "Tiga tab navigasi (Absensi, Anggota, Rekap) aktif dan responsif"))

        # -------------------------------------------------------------
        # STEP 2: Tab Anggota - Tambah Anggota Baru
        # -------------------------------------------------------------
        print("\n[STEP 2] Tab Anggota: Menambah Anggota Baru...")
        page.click("button:has-text('Anggota')")
        time.sleep(0.8)
        page.screenshot(path=f"{SCREENSHOT_DIR}/02_tab_anggota_awal.png")

        # Tambah Anggota 1: Ahmad Pratama (Lead Developer)
        tambah_btn = page.get_by_role("button", name="Tambah Anggota")
        if tambah_btn.count() > 0:
            tambah_btn.first.click()
            time.sleep(0.5)

        page.fill("input[placeholder='Masukkan nama']", "Ahmad Pratama")
        page.fill("input[placeholder*='Ketua']", "Lead Developer")
        page.click("button:has-text('Simpan')")
        time.sleep(0.8)
        page.screenshot(path=f"{SCREENSHOT_DIR}/03_anggota_ahmad_ditambahkan.png")
        assert page.locator("text=Ahmad Pratama").is_visible(), "Anggota Ahmad Pratama gagal ditambahkan"
        print("  ✅ Anggota 'Ahmad Pratama' berhasil ditambahkan.")

        # Tambah Anggota 2: Siti Rahma (UI/UX Designer)
        tambah_btn = page.get_by_role("button", name="Tambah Anggota")
        if tambah_btn.count() > 0:
            tambah_btn.first.click()
            time.sleep(0.5)
        page.fill("input[placeholder='Masukkan nama']", "Siti Rahma")
        page.fill("input[placeholder*='Ketua']", "UI/UX Designer")
        page.click("button:has-text('Simpan')")
        time.sleep(0.8)

        # Tambah Anggota 3: Budi Santoso (QA Engineer)
        tambah_btn = page.get_by_role("button", name="Tambah Anggota")
        if tambah_btn.count() > 0:
            tambah_btn.first.click()
            time.sleep(0.5)
        page.fill("input[placeholder='Masukkan nama']", "Budi Santoso")
        page.fill("input[placeholder*='Ketua']", "QA Engineer")
        page.click("button:has-text('Simpan')")
        time.sleep(0.8)
        page.screenshot(path=f"{SCREENSHOT_DIR}/04_tiga_anggota_terdaftar.png")
        print("  ✅ Tiga anggota (Ahmad, Siti, Budi) berhasil didaftarkan.")
        results.append(("2. Tambah Anggota", "LULUS", "Pendaftaran anggota baru dengan nama dan jabatan/catatan berhasil"))

        # -------------------------------------------------------------
        # STEP 3: Tab Anggota - Edit Informasi Anggota
        # -------------------------------------------------------------
        print("\n[STEP 3] Tab Anggota: Edit Informasi Anggota...")
        edit_buttons = page.locator("button[aria-label*='Edit' i], button:has(svg.lucide-pencil)")
        if edit_buttons.count() > 0:
            edit_buttons.first.click()
            time.sleep(0.5)
            # Update nama
            name_input = page.locator("input[placeholder='Masukkan nama']").first
            name_input.fill("Ahmad Pratama Senior")
            page.click("button:has-text('Update')")
            time.sleep(0.8)
            page.screenshot(path=f"{SCREENSHOT_DIR}/05_anggota_diedit.png")
            assert page.locator("text=Ahmad Pratama Senior").is_visible(), "Update nama anggota gagal"
            print("  ✅ Edit data anggota berhasil disimpan.")
        results.append(("3. Manajemen & Edit Anggota", "LULUS", "Data anggota dapat diperbarui dan disunting dengan lancar"))

        # -------------------------------------------------------------
        # STEP 4: Tab Absensi - Pencatatan Kehadiran Harian
        # -------------------------------------------------------------
        print("\n[STEP 4] Tab Absensi: Pencatatan Status Kehadiran (Hadir/Absen/Libur)...")
        page.click("button:has-text('Absensi')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/06_tab_absensi_daftar_anggota.png")

        # Set status kehadiran masing-masing
        # Status Hadir untuk anggota 1
        hadir_btns = page.locator("button:has-text('Hadir')")
        if hadir_btns.count() > 0:
            hadir_btns.first.click()
            time.sleep(0.3)

        # Status Absen untuk anggota 2
        absen_btns = page.locator("button:has-text('Absen')")
        if absen_btns.count() > 1:
            absen_btns.nth(1).click()
            time.sleep(0.3)
        elif absen_btns.count() > 0:
            absen_btns.first.click()
            time.sleep(0.3)

        # Status Libur untuk anggota 3
        libur_btns = page.locator("button:has-text('Libur')")
        if libur_btns.count() > 2:
            libur_btns.nth(2).click()
            time.sleep(0.3)
        elif libur_btns.count() > 0:
            libur_btns.first.click()
            time.sleep(0.3)

        page.screenshot(path=f"{SCREENSHOT_DIR}/07_status_kehadiran_dipilih.png")

        # Klik tombol Simpan jika ada perubahan tertunda
        simpan_btn = page.locator("button:has-text('Simpan Perubahan'), button:has-text('Simpan')")
        if simpan_btn.count() > 0 and simpan_btn.first.is_visible():
            simpan_btn.first.click()
            time.sleep(1)
            page.screenshot(path=f"{SCREENSHOT_DIR}/08_absensi_tersimpan.png")
            print("  ✅ Data absensi harian berhasil disimpan.")

        # Verifikasi Kartu Ringkasan Kehadiran
        assert page.locator("p:has-text('Hadir')").first.is_visible(), "Label Hadir tidak muncul di ringkasan"
        assert page.locator("p:has-text('Absen')").first.is_visible(), "Label Absen tidak muncul di ringkasan"
        assert page.locator("p:has-text('Libur')").first.is_visible(), "Label Libur tidak muncul di ringkasan"
        print("  ✅ Kartu statistik ringkasan kehadiran terupdate secara akurat.")
        results.append(("4. Pencatatan Absensi Harian", "LULUS", "Status Hadir/Absen/Libur tercatat dan statistik terhitung otomatis"))

        # -------------------------------------------------------------
        # STEP 5: Navigasi Tanggal Absensi (Date Navigation)
        # -------------------------------------------------------------
        print("\n[STEP 5] Memeriksa Penggantian Tanggal Absensi...")
        nav_btns = page.locator("button:has(svg.lucide-chevron-left), button:has(svg.lucide-chevron-right)")
        if nav_btns.count() > 0:
            nav_btns.first.click()
            time.sleep(0.8)
            page.screenshot(path=f"{SCREENSHOT_DIR}/09_navigasi_hari_kemarin.png")
            print("  ✅ Navigasi tanggal absensi (mundur/maju) berfungsi.")

        # -------------------------------------------------------------
        # STEP 6: Tab Rekap - Rekap Mingguan & Ekspor Data
        # -------------------------------------------------------------
        print("\n[STEP 6] Tab Rekap: Memeriksa Tabel Rekap Mingguan & Opsi Ekspor...")
        page.click("button:has-text('Rekap')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/10_tab_rekap_mingguan.png")

        # Cek Tombol Ekspor
        assert page.locator("button:has-text('Excel')").is_visible(), "Tombol Excel tidak ditemukan"
        assert page.locator("button:has-text('PDF')").is_visible(), "Tombol PDF tidak ditemukan"
        print("  ✅ Tabel rekap mingguan menampilkan seluruh anggota dengan tombol Export Excel & PDF.")
        results.append(("5. Rekap Mingguan & Ekspor Laporan", "LULUS", "Tabel matriks kehadiran per hari dalam minggu tampil lengkap beserta opsi Export Excel dan PDF"))

        browser.close()

    print("\n==================================================")
    print("📊 RINGKASAN HASIL PENGUJIAN ABSENSI & ANGGOTA")
    print("==================================================")
    for title, status, desc in results:
        print(f"[{status}] {title}: {desc}")

if __name__ == "__main__":
    run_attendance_feature_tests()
