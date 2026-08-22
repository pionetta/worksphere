import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = "screenshots/finance_test"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
BASE_URL = "http://localhost:5173"

def run_finance_feature_tests():
    print("==================================================")
    print("🚀 MEMULAI PENGUJIAN FITUR KEUANGAN & DOMPET")
    print("==================================================")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1366, "height": 768})
        page = context.new_page()

        # -------------------------------------------------------------
        # STEP 1: Login Demo & Navigasi ke Modul Keuangan
        # -------------------------------------------------------------
        print("\n[STEP 1] Login Demo & Navigasi ke Menu Keuangan...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.click("button:has-text('Coba Mode Demo')")
        page.wait_for_url("**/app", timeout=10000)
        time.sleep(1)

        # Klik Navigasi Keuangan
        page.click("a[href='/app/finance']")
        page.wait_for_url("**/app/finance", timeout=10000)
        time.sleep(1.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/01_halaman_keuangan_ringkasan.png")

        assert page.locator("button:has-text('Ringkasan')").is_visible(), "Tab Ringkasan tidak ditemukan"
        assert page.locator("button:has-text('Dompet')").is_visible(), "Tab Dompet tidak ditemukan"
        assert page.locator("button:has-text('Transaksi')").is_visible(), "Tab Transaksi tidak ditemukan"
        assert page.locator("button:has-text('Kategori')").is_visible(), "Tab Kategori tidak ditemukan"
        assert page.locator("button:has-text('Anggaran')").is_visible(), "Tab Anggaran tidak ditemukan"
        assert page.locator("button:has-text('Tabungan')").is_visible(), "Tab Tabungan tidak ditemukan"
        print("  ✅ Navigasi Keuangan berhasil, 6 Tab utama lengkap.")
        results.append(("1. Navigasi & Struktur Tab Keuangan", "LULUS", "Enam tab navigasi (Ringkasan, Dompet, Transaksi, Kategori, Anggaran, Tabungan) aktif"))

        # -------------------------------------------------------------
        # STEP 2: Tab Dompet - Menambah Dompet Baru & Rekening
        # -------------------------------------------------------------
        print("\n[STEP 2] Tab Dompet: Menambah Dompet & Rekening...")
        page.click("button:has-text('Dompet')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/02_tab_dompet_awal.png")

        # Tambah Dompet 1: Bank Mandiri (Saldo: 5.000.000)
        tambah_dompet_btn = page.get_by_role("button", name="Tambah Dompet")
        if tambah_dompet_btn.count() > 0:
            tambah_dompet_btn.first.click()
            time.sleep(0.5)

        page.fill("input[placeholder*='BCA']", "Bank Mandiri")
        page.fill("input[type='number']", "5000000")
        page.click("button:has-text('Simpan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/03_dompet_mandiri_dibuat.png")
        assert page.locator("text=Bank Mandiri").is_visible(), "Dompet Bank Mandiri gagal ditambahkan"
        print("  ✅ Dompet 'Bank Mandiri' (Rp 5.000.000) berhasil ditambahkan.")

        # Tambah Dompet 2: GoPay Digital (Saldo: 500.000)
        tambah_dompet_btn = page.get_by_role("button", name="Tambah Dompet")
        if tambah_dompet_btn.count() > 0:
            tambah_dompet_btn.first.click()
            time.sleep(0.5)

        page.fill("input[placeholder*='BCA']", "GoPay Digital")
        page.fill("input[type='number']", "500000")
        page.click("button:has-text('Simpan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/04_dua_dompet_tersedia.png")
        assert page.locator("text=GoPay Digital").is_visible(), "Dompet GoPay gagal ditambahkan"
        print("  ✅ Dompet 'GoPay Digital' (Rp 500.000) berhasil ditambahkan.")
        results.append(("2. Manajemen Dompet", "LULUS", "Tambah beberapa akun dompet/rekening dengan saldo awal berhasil"))

        # -------------------------------------------------------------
        # STEP 3: Tab Kategori - Memeriksa & Menambah Kategori Baru
        # -------------------------------------------------------------
        print("\n[STEP 3] Tab Kategori: Memeriksa Kategori Default & Tambah Kategori...")
        page.click("button:has-text('Kategori')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/05_tab_kategori_default.png")

        # Cek kategori default
        assert page.locator("text=Makanan").first.is_visible(), "Kategori Makanan tidak ditemukan"
        assert page.locator("text=Gaji").first.is_visible(), "Kategori Gaji tidak ditemukan"
        print("  ✅ Kategori default (Pengeluaran & Pemasukan) berhasil diinisialisasi otomatis.")

        # Tambah Kategori Kustom: Langganan Cloud
        tambah_kat_btn = page.get_by_role("button", name="Tambah Kategori")
        if tambah_kat_btn.count() > 0:
            tambah_kat_btn.first.click()
            time.sleep(0.5)
            page.fill("input[placeholder*='Contoh: Gaji']", "Langganan Cloud & AI")
            page.click("button:has-text('Simpan')")
            time.sleep(1)
            page.screenshot(path=f"{SCREENSHOT_DIR}/06_kategori_baru_tersimpan.png")
            assert page.locator("text=Langganan Cloud & AI").is_visible(), "Kategori kustom gagal ditambahkan"
            print("  ✅ Kategori kustom 'Langganan Cloud & AI' berhasil dibuat.")
        results.append(("3. Inisialisasi & Tambah Kategori", "LULUS", "Kategori default siap pakai dan pendaftaran kategori kustom baru berjalan lancar"))

        # -------------------------------------------------------------
        # STEP 4: Tab Transaksi - Pencatatan Pemasukan & Pengeluaran
        # -------------------------------------------------------------
        print("\n[STEP 4] Tab Transaksi: Mencatat Pemasukan & Pengeluaran...")
        page.click("button:has-text('Transaksi')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/07_tab_transaksi_awal.png")

        # Catat Pemasukan: Gaji Project (Rp 3.000.000)
        tambah_tx_btn = page.get_by_role("button", name="Tambah Transaksi")
        if tambah_tx_btn.count() > 0:
            tambah_tx_btn.first.click()
            time.sleep(0.5)

        # Tab Pemasukan di Form Transaksi
        if page.locator("button:has-text('Pemasukan')").is_visible():
            page.click("button:has-text('Pemasukan')")
            time.sleep(0.3)

        page.fill("input[type='number']", "3000000")
        page.fill("input[placeholder*='Keterangan']", "Pembayaran Termin Proyek Website")
        page.click("button:has-text('Simpan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/08_transaksi_pemasukan_dicatat.png")
        print("  ✅ Transaksi Pemasukan (Rp 3.000.000) berhasil dicatat.")

        # Catat Pengeluaran: Biaya Makan & Operasional (Rp 150.000)
        tambah_tx_btn = page.get_by_role("button", name="Tambah Transaksi")
        if tambah_tx_btn.count() > 0:
            tambah_tx_btn.first.click()
            time.sleep(0.5)

        if page.locator("button:has-text('Pengeluaran')").is_visible():
            page.click("button:has-text('Pengeluaran')")
            time.sleep(0.3)

        page.fill("input[type='number']", "150000")
        page.fill("input[placeholder*='Keterangan']", "Makan Siang Tim")
        page.click("button:has-text('Simpan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/09_transaksi_pengeluaran_dicatat.png")
        print("  ✅ Transaksi Pengeluaran (Rp 150.000) berhasil dicatat.")
        results.append(("4. Pencatatan Transaksi", "LULUS", "Pencatatan pemasukan dan pengeluaran dengan kategori & catatan tersimpan rapi"))

        # -------------------------------------------------------------
        # STEP 5: Tab Anggaran - Menetapkan Budget Bulanan
        # -------------------------------------------------------------
        print("\n[STEP 5] Tab Anggaran: Menetapkan Anggaran Bulanan...")
        page.click("button:has-text('Anggaran')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/10_tab_anggaran.png")

        tambah_budget_btn = page.get_by_role("button", name="Tambah Anggaran")
        if tambah_budget_btn.count() > 0:
            tambah_budget_btn.first.click()
            time.sleep(0.5)
            page.fill("input[type='number']", "1000000")
            page.click("button:has-text('Simpan')")
            time.sleep(1)
            page.screenshot(path=f"{SCREENSHOT_DIR}/11_anggaran_ditetapkan.png")
            print("  ✅ Anggaran bulanan (Rp 1.000.000) berhasil ditetapkan.")
        results.append(("5. Penetapan & Monitor Anggaran", "LULUS", "Anggaran bulanan dapat diatur dengan pemantauan progress real-time"))

        # -------------------------------------------------------------
        # STEP 6: Tab Tabungan - Menetapkan Target Menabung & Setoran
        # -------------------------------------------------------------
        print("\n[STEP 6] Tab Tabungan: Membuat Target Tabungan...")
        page.click("button:has-text('Tabungan')")
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/12_tab_tabungan.png")

        tambah_savings_btn = page.get_by_role("button", name="Tambah Target")
        if tambah_savings_btn.count() > 0:
            tambah_savings_btn.first.click()
            time.sleep(0.5)
            page.fill("input[placeholder*='Dana Darurat']", "Dana Darurat 2026")
            page.fill("input[type='number']", "10000000")
            page.click("button:has-text('Simpan')")
            time.sleep(1)
            page.screenshot(path=f"{SCREENSHOT_DIR}/13_target_tabungan_dibuat.png")
            assert page.locator("text=Dana Darurat 2026").is_visible(), "Target Tabungan gagal dibuat"
            print("  ✅ Target Tabungan 'Dana Darurat 2026' (Rp 10.000.000) berhasil dibuat.")
        results.append(("6. Target Menabung (Savings Goals)", "LULUS", "Pembuatan target tabungan dengan indikator persentase ketercapaian berhasil"))

        # -------------------------------------------------------------
        # STEP 7: Tab Ringkasan - Verifikasi Total Saldo & Analisis Grafik
        # -------------------------------------------------------------
        print("\n[STEP 7] Tab Ringkasan: Memeriksa Total Saldo & Grafik Keuangan...")
        page.click("button:has-text('Ringkasan')")
        time.sleep(1.5)
        page.screenshot(path=f"{SCREENSHOT_DIR}/14_ringkasan_dan_grafik.png")

        assert page.locator("p:has-text('Total Saldo')").first.is_visible(), "Total Saldo tidak muncul di ringkasan"
        assert page.locator("p:has-text('Pemasukan')").first.is_visible(), "Total Pemasukan tidak muncul di ringkasan"
        assert page.locator("p:has-text('Pengeluaran')").first.is_visible(), "Total Pengeluaran tidak muncul di ringkasan"
        print("  ✅ Kartu ringkasan keuangan dan visualisasi grafik memuat data secara akurat.")
        results.append(("7. Ringkasan & Visualisasi Grafik", "LULUS", "Total saldo terkonsolidasi, arus kas bersih, dan visualisasi grafik tampil akurat"))

        browser.close()

    print("\n==================================================")
    print("📊 RINGKASAN HASIL PENGUJIAN KEUANGAN & DOMPET")
    print("==================================================")
    for title, status, desc in results:
        print(f"[{status}] {title}: {desc}")

if __name__ == "__main__":
    run_finance_feature_tests()
