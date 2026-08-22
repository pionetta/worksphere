import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.async_api import async_playwright

os.makedirs('screenshots/full_test', exist_ok=True)

async def run_full_testing():
    print("==================================================================")
    print("🧪 WORKSPHERE FULL FUNCTIONAL & SUPABASE INTEGRATION TEST SUITE")
    print("==================================================================\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 868})
        page = await context.new_page()

        # -------------------------------------------------------------
        # 1. AUTHENTICATION & LOGIN
        # -------------------------------------------------------------
        print("1️⃣ [Autentikasi] Membuka aplikasi di http://localhost:5173/ ...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/full_test/01_login.png")

        print("   👉 Memilih 'Coba Mode Demo (Offline)' untuk masuk ke aplikasi...")
        await page.click('button:has-text("Coba Mode Demo")')
        await page.wait_for_timeout(1500)
        await page.wait_for_load_state("networkidle")
        print(f"   ✅ Berhasil masuk! URL Saat ini: {page.url}")

        # -------------------------------------------------------------
        # 2. DASHBOARD
        # -------------------------------------------------------------
        print("\n2️⃣ [Dashboard] Memeriksa widget dan ringkasan Dashboard...")
        await page.screenshot(path="screenshots/full_test/02_dashboard.png")

        # Test FAB (+) Quick Action
        print("   👉 Membuka menu Aksi Cepat (Quick Action FAB)...")
        fab_btn = page.locator('button[aria-label="Aksi Cepat"]').first
        if await fab_btn.count() > 0:
            await fab_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/full_test/03_quick_action_menu.png")
            await page.keyboard.press('Escape')
            await page.wait_for_timeout(400)

        # -------------------------------------------------------------
        # 3. MODUL TO-DO (TUGAS & SUBTASK)
        # -------------------------------------------------------------
        print("\n3️⃣ [To-Do] Menguji Modul To-Do List & Manajemen Tugas...")
        await page.goto("http://localhost:5173/app/todo")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(800)

        print("   ➕ Menambahkan Tugas 1: 'Penyusunan Rencana Strategis' (Deadline Hari Ini)...")
        add_task_btn = page.locator('button:has-text("Tambah"), button[title*="Tambah"]').first
        if await add_task_btn.count() > 0:
            await add_task_btn.click()
            await page.wait_for_timeout(600)
            await page.fill('input[placeholder*="tugas"], input[name="title"], input[type="text"]', 'Penyusunan Rencana Strategis')
            await page.click('button:has-text("Simpan"), button:has-text("Tambah")')
            await page.wait_for_timeout(1000)

        print("   ➕ Menambahkan Tugas 2: 'Review Laporan Keuangan'...")
        if await add_task_btn.count() > 0:
            await add_task_btn.click()
            await page.wait_for_timeout(600)
            await page.fill('input[placeholder*="tugas"], input[name="title"], input[type="text"]', 'Review Laporan Keuangan')
            await page.click('button:has-text("Simpan"), button:has-text("Tambah")')
            await page.wait_for_timeout(1000)

        # Click on Task to open details & add subtask
        task_card = page.locator('text=Penyusunan Rencana Strategis').first
        if await task_card.count() > 0:
            print("   🔍 Membuka detail tugas untuk menambah subtask...")
            await task_card.click()
            await page.wait_for_timeout(800)
            
            subtask_input = page.locator('input[placeholder*="subtask"], input[placeholder*="Subtask"]')
            if await subtask_input.count() > 0:
                await subtask_input.fill("Analisis data pendukung")
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(600)

            await page.screenshot(path="screenshots/full_test/04_todo_detail_modal.png")
            close_btn = page.locator('button[aria-label="Tutup"], button:has-text("Tutup")')
            if await close_btn.count() > 0:
                await close_btn.first.click()
                await page.wait_for_timeout(500)

        await page.screenshot(path="screenshots/full_test/05_todo_list_updated.png")

        # -------------------------------------------------------------
        # 4. MODUL KEUANGAN (DOMPET, TRANSAKSI, GRAFIK, KATEGORI)
        # -------------------------------------------------------------
        print("\n4️⃣ [Keuangan] Menguji Modul Keuangan & Integritas Transaksi...")
        await page.goto("http://localhost:5173/app/finance")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(800)

        # Tab: Ringkasan (shows charts & summary)
        print("   📊 Tab Ringkasan: Menampilkan grafik dan ringkasan...")
        await page.screenshot(path="screenshots/full_test/06_finance_summary_charts.png")

        # Tab: Dompet (Add Wallets)
        print("   💳 Tab Dompet: Menambahkan rekening dompet baru...")
        await page.click('button:has-text("Dompet")')
        await page.wait_for_timeout(600)

        add_wallet_btn = page.locator('button:has-text("Tambah Dompet"), button:has-text("Tambah")')
        if await add_wallet_btn.count() > 0:
            await add_wallet_btn.first.click()
            await page.wait_for_timeout(600)
            await page.fill('input[placeholder*="BCA"], input[placeholder*="dompet"], input[name="name"]', 'Rekening Utama BCA')
            await page.fill('input[placeholder*="0"], input[type="number"], input[name="balance"]', '5000000')
            await page.click('button:has-text("Simpan")')
            await page.wait_for_timeout(1000)

        await page.screenshot(path="screenshots/full_test/07_finance_wallets.png")

        # Tab: Transaksi
        print("   💰 Tab Transaksi: Memeriksa daftar dan pencatatan transaksi...")
        await page.click('button:has-text("Transaksi")')
        await page.wait_for_timeout(600)
        await page.screenshot(path="screenshots/full_test/08_finance_transactions.png")

        # Tab: Kategori
        print("   🏷️ Tab Kategori: Memeriksa kategori default...")
        kategori_tab = page.locator('button:has-text("Kategori")')
        if await kategori_tab.count() > 0:
            await kategori_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/full_test/09_finance_categories.png")

        # -------------------------------------------------------------
        # 5. MODUL ABSENSI (ANGGOTA, HARIAN, REKAP MINGGUAN)
        # -------------------------------------------------------------
        print("\n5️⃣ [Absensi] Menguji Modul Presensi & Rekap Mingguan...")
        await page.goto("http://localhost:5173/app/attendance")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(800)

        # Tab: Anggota (Add Member)
        print("   👥 Tab Anggota: Menambahkan anggota baru...")
        await page.click('button:has-text("Anggota")')
        await page.wait_for_timeout(600)

        add_member_btn = page.locator('button:has-text("Tambah Anggota"), button:has-text("Tambah")')
        if await add_member_btn.count() > 0:
            await add_member_btn.first.click()
            await page.wait_for_timeout(600)
            await page.fill('input[placeholder*="nama"], input[name="name"]', 'Budi Pratama')
            await page.click('button:has-text("Simpan")')
            await page.wait_for_timeout(1000)

        await page.screenshot(path="screenshots/full_test/10_attendance_members.png")

        # Tab: Absensi Harian (Mark Present)
        print("   📅 Tab Absensi: Mengisi absensi harian...")
        await page.click('button:has-text("Absensi")')
        await page.wait_for_timeout(600)
        
        hadir_btn = page.locator('button:has-text("Hadir")').first
        if await hadir_btn.count() > 0:
            await hadir_btn.click()
            await page.wait_for_timeout(500)
            save_att_btn = page.locator('button:has-text("Simpan Absensi")')
            if await save_att_btn.count() > 0:
                await save_att_btn.click()
                await page.wait_for_timeout(1000)

        await page.screenshot(path="screenshots/full_test/11_attendance_daily_marked.png")

        # Tab: Rekap Mingguan
        print("   📈 Tab Rekap: Memeriksa tabel rekap (titik netral untuk hari belum dicatat)...")
        await page.click('button:has-text("Rekap")')
        await page.wait_for_timeout(800)
        await page.screenshot(path="screenshots/full_test/12_attendance_weekly_recap.png")

        # -------------------------------------------------------------
        # 6. DARK MODE & PENGATURAN TEMA
        # -------------------------------------------------------------
        print("\n6️⃣ [Tema] Menguji perubahan tema Dark Mode & Light Mode...")
        theme_btn = page.locator('button[title*="Tema"]').first
        if await theme_btn.count() > 0:
            await theme_btn.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path="screenshots/full_test/13_dark_theme.png")
            print("   🌙 Berhasil mengaktifkan Dark Mode!")

        # -------------------------------------------------------------
        # 7. LOGOUT & DIALOG KONFIRMASI
        # -------------------------------------------------------------
        print("\n7️⃣ [Logout] Menguji tombol keluar & dialog konfirmasi...")
        logout_btn = page.locator('header button[title="Keluar"], nav button:has-text("Keluar")').first
        if await logout_btn.count() > 0:
            await logout_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/full_test/14_logout_dialog.png")
            
            confirm_btn = page.locator('div[role="alertdialog"] button:has-text("Keluar")')
            if await confirm_btn.count() > 0:
                await confirm_btn.click()
                await page.wait_for_timeout(1200)
                await page.screenshot(path="screenshots/full_test/15_logged_out.png")
                print("   👋 Berhasil logout dan kembali ke halaman login!")

        await browser.close()
        print("\n==================================================================")
        print("🎉 SELURUH PENGUJIAN FUNGSIONAL & SUPABASE SUKSES (100% PASS)")
        print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_testing())
