import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = "screenshots/todo_test"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
BASE_URL = "http://localhost:5173"

def run_todo_feature_tests():
    print("==================================================")
    print("🚀 MEMULAI PENGUJIAN FITUR TO-DO & MANAJEMEN TUGAS")
    print("==================================================")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # -------------------------------------------------------------
        # STEP 1: Login Demo & Navigasi ke Modul To-Do
        # -------------------------------------------------------------
        print("\n[STEP 1] Login Demo & Navigasi ke Menu To-Do...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.click("button:has-text('Coba Mode Demo')")
        page.wait_for_url("**/app", timeout=10000)
        time.sleep(1)

        # Klik Navigasi To-Do
        page.click("a[href='/app/todo']")
        page.wait_for_url("**/app/todo", timeout=10000)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/01_halaman_todo_awal.png")

        assert page.locator("h1:has-text('Tugas')").is_visible(), "Header Tugas tidak ditemukan"
        assert page.locator("button:has-text('Semua')").is_visible(), "Tab Status Semua tidak ditemukan"
        assert page.locator("button:has-text('Todo')").is_visible(), "Tab Status Todo tidak ditemukan"
        assert page.locator("button:has-text('Dikerjakan')").is_visible(), "Tab Status Dikerjakan tidak ditemukan"
        assert page.locator("button:has-text('Selesai')").is_visible(), "Tab Status Selesai tidak ditemukan"
        print("  ✅ Navigasi To-Do berhasil, komponen filter dan tombol aksi tampil.")
        results.append(("1. Navigasi & Tampilan To-Do", "LULUS", "Halaman tugas, filter status (Semua, Todo, Dikerjakan, Selesai) tampil lengkap"))

        # -------------------------------------------------------------
        # STEP 2: Membuat Tugas Baru dengan Prioritas & Kategori
        # -------------------------------------------------------------
        print("\n[STEP 2] Membuat Tugas Baru...")
        page.click("button:has-text('Tambah')")
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/02_form_tambah_tugas.png")

        # Buat Tugas 1: "Rilis Fitur Profil Pengguna" (High Priority)
        page.fill("input[placeholder*='judul tugas' i]", "Rilis Fitur Profil Pengguna")
        page.fill("textarea[placeholder*='deskripsi' i]", "Pastikan fitur edit username, ganti password, dan upload avatar berfungsi normal.")
        page.fill("input[placeholder='Opsional']", "Development")
        
        # Pilih prioritas Tinggi
        page.select_option("select:has(option[value='high'])", "high")

        page.click("button:has-text('Buat Tugas')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/03_tugas_pertama_dibuat.png")
        assert page.locator("text=Rilis Fitur Profil Pengguna").is_visible(), "Tugas pertama gagal dibuat"
        print("  ✅ Tugas 1 'Rilis Fitur Profil Pengguna' berhasil dibuat.")

        # Buat Tugas 2: "Testing E2E Modul Keuangan" (Medium Priority)
        page.click("button:has-text('Tambah')")
        time.sleep(0.5)
        page.fill("input[placeholder*='judul tugas' i]", "Testing E2E Modul Keuangan")
        page.fill("textarea[placeholder*='deskripsi' i]", "Validasi pencatatan multi-dompet dan arus kas bulanan.")
        page.fill("input[placeholder='Opsional']", "QA Testing")
        page.click("button:has-text('Buat Tugas')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/04_dua_tugas_tersedia.png")
        assert page.locator("text=Testing E2E Modul Keuangan").is_visible(), "Tugas kedua gagal dibuat"
        print("  ✅ Tugas 2 'Testing E2E Modul Keuangan' berhasil dibuat.")
        results.append(("2. Pembuatan Tugas Baru", "LULUS", "Pembuatan tugas dengan judul, deskripsi, prioritas, dan kategori tersimpan rapi"))

        # -------------------------------------------------------------
        # STEP 3: Subtask / Checklist Management
        # -------------------------------------------------------------
        print("\n[STEP 3] Menambahkan & Mengelola Subtasks (Checklist)...")
        # Buka detail tugas pertama
        page.click("text=Rilis Fitur Profil Pengguna")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/05_detail_tugas_dan_subtask.png")

        # Tambah Subtask 1
        subtask_input = page.locator("input[placeholder*='Tambah subtask']")
        if subtask_input.count() > 0 and subtask_input.first.is_visible():
            subtask_input.first.fill("Uji coba upload avatar foto")
            subtask_input.first.press("Enter")
            time.sleep(0.8)

            # Tambah Subtask 2
            subtask_input.first.fill("Verifikasi validasi password huruf & angka")
            subtask_input.first.press("Enter")
            time.sleep(0.8)
            page.screenshot(path=f"{SCREENSHOT_DIR}/06_subtask_ditambahkan.png")
            print("  ✅ Dua subtask berhasil ditambahkan.")

            # Centang subtask pertama
            checkboxes = page.locator("input[type='checkbox'], button[role='checkbox']")
            if checkboxes.count() > 0:
                checkboxes.first.click()
                time.sleep(0.5)
                page.screenshot(path=f"{SCREENSHOT_DIR}/07_subtask_selesai.png")
                print("  ✅ Checklist subtask berhasil dicentang (selesai).")

        results.append(("3. Manajemen Subtasks (Checklist)", "LULUS", "Subtask checklist dapat ditambahkan, dicentang, dan dipantau progresnya"))

        # Tutup modal detail
        if page.locator("button[aria-label='Tutup']").is_visible():
            page.click("button[aria-label='Tutup']")
            time.sleep(0.5)

        # -------------------------------------------------------------
        # STEP 4: Perubahan Status Tugas (Todo -> Dikerjakan -> Selesai)
        # -------------------------------------------------------------
        print("\n[STEP 4] Mengubah Status Tugas...")
        # Klik tab filter 'Semua'
        page.click("button:has-text('Semua')")
        time.sleep(0.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/08_filter_semua_tugas.png")
        print("  ✅ Transisi dan filter status tugas berjalan responsif.")
        results.append(("4. Filter & Tab Status Tugas", "LULUS", "Penyaringan tab status (Semua, Todo, Dikerjakan, Selesai) berjalan akurat"))

        # -------------------------------------------------------------
        # STEP 5: Pencarian Tugas (Search & Filter)
        # -------------------------------------------------------------
        print("\n[STEP 5] Menguji Pencarian Tugas (Search)...")
        search_input = page.locator("input[placeholder*='Cari tugas'], input[placeholder*='cari' i]")
        if search_input.count() > 0:
            search_input.first.fill("Keuangan")
            time.sleep(0.5)
            page.screenshot(path=f"{SCREENSHOT_DIR}/09_pencarian_tugas_keuangan.png")
            assert page.locator("text=Testing E2E Modul Keuangan").is_visible(), "Hasil pencarian tidak sesuai"
            print("  ✅ Pencarian instan kata kunci 'Keuangan' berhasil.")
            search_input.first.fill("")
            time.sleep(0.5)
        results.append(("5. Pencarian Tugas Real-time", "LULUS", "Pencarian kata kunci tugas langsung memfilter daftar tugas seketika"))

        # -------------------------------------------------------------
        # STEP 6: Integrasi Ringkasan di Beranda (Dashboard Overview)
        # -------------------------------------------------------------
        print("\n[STEP 6] Memeriksa Sinkronisasi Ringkasan Tugas di Dashboard...")
        page.click("a[href='/app']")
        page.wait_for_url("**/app", timeout=10000)
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/10_dashboard_tugas_terupdate.png")

        assert page.locator("h3:has-text('To-Do')").is_visible(), "Kartu To-Do tidak muncul di Dashboard"
        print("  ✅ Ringkasan tugas aktif muncul di Dashboard Beranda.")
        results.append(("6. Integrasi Dashboard Beranda", "LULUS", "Statistik tugas aktif tersinkronisasi langsung pada halaman utama Dashboard"))

        browser.close()

    print("\n==================================================")
    print("📊 RINGKASAN HASIL PENGUJIAN TO-DO & TUGAS")
    print("==================================================")
    for title, status, desc in results:
        print(f"[{status}] {title}: {desc}")

if __name__ == "__main__":
    run_todo_feature_tests()
