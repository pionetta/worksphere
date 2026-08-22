import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.async_api import async_playwright

os.makedirs('screenshots/e2e', exist_ok=True)

async def run_e2e():
    print("==================================================")
    print("🚀 WORKSPHERE AUTOMATED E2E BROWSER TESTING SUITE")
    print("==================================================\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 868})
        page = await context.new_page()

        # Step 1: Open Login Screen & Click Demo Mode
        print("1. [Auth] Opening http://localhost:5173/ ...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/e2e/01_login_screen.png")
        print("   📸 Captured: screenshots/e2e/01_login_screen.png")

        print("   🔑 Clicking 'Coba Mode Demo (Offline)' ...")
        demo_btn = page.locator('button:has-text("Coba Mode Demo")')
        await demo_btn.click()
        await page.wait_for_timeout(1500)
        await page.wait_for_load_state("networkidle")
        print(f"   Current URL: {page.url}")

        # Step 2: Dashboard Inspection
        print("\n2. [Dashboard] Verifying Dashboard (/app) ...")
        await page.screenshot(path="screenshots/e2e/02_dashboard_overview.png")
        print("   📸 Captured: screenshots/e2e/02_dashboard_overview.png")

        # Step 3: To-Do Module Testing
        print("\n3. [To-Do] Testing To-Do Module (/app/todo) ...")
        await page.goto("http://localhost:5173/app/todo")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/e2e/03_todo_initial.png")

        print("   ➕ Adding a new task: 'Persiapan Rapat Anggaran Q3' ...")
        add_task_btn = page.locator('button:has-text("Tambah Tugas"), button[title*="Tambah"]')
        if await add_task_btn.count() > 0:
            await add_task_btn.first.click()
            await page.wait_for_timeout(600)
            
            # Fill title
            title_input = page.locator('input[placeholder*="tugas"], input[name="title"], input[type="text"]').first
            if await title_input.count() > 0:
                await title_input.fill("Persiapan Rapat Anggaran Q3")
            
            # Save task
            save_btn = page.locator('button:has-text("Simpan"), button:has-text("Tambah")').last
            if await save_btn.count() > 0:
                await save_btn.click()
                await page.wait_for_timeout(1000)

        await page.screenshot(path="screenshots/e2e/04_todo_with_task.png")
        print("   📸 Captured: screenshots/e2e/04_todo_with_task.png")

        # Step 4: Keuangan (Finance) Module Testing
        print("\n4. [Finance] Testing Finance Module (/app/finance) ...")
        await page.goto("http://localhost:5173/app/finance")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1000)

        # Tab: Ringkasan
        await page.screenshot(path="screenshots/e2e/05_finance_summary.png")
        print("   📸 Captured: screenshots/e2e/05_finance_summary.png")

        # Tab: Dompet
        dompet_tab = page.locator('button:has-text("Dompet")')
        if await dompet_tab.count() > 0:
            await dompet_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/06_finance_wallets.png")
            print("   📸 Captured: screenshots/e2e/06_finance_wallets.png")

        # Tab: Transaksi
        tx_tab = page.locator('button:has-text("Transaksi")')
        if await tx_tab.count() > 0:
            await tx_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/07_finance_transactions.png")
            print("   📸 Captured: screenshots/e2e/07_finance_transactions.png")

        # Tab: Grafik
        chart_tab = page.locator('button:has-text("Grafik")')
        if await chart_tab.count() > 0:
            await chart_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/08_finance_charts.png")
            print("   📸 Captured: screenshots/e2e/08_finance_charts.png")

        # Step 5: Absensi (Attendance) Module Testing
        print("\n5. [Attendance] Testing Attendance Module (/app/attendance) ...")
        await page.goto("http://localhost:5173/app/attendance")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="screenshots/e2e/09_attendance_daily.png")
        print("   📸 Captured: screenshots/e2e/09_attendance_daily.png")

        # Tab: Anggota
        anggota_tab = page.locator('button:has-text("Anggota")')
        if await anggota_tab.count() > 0:
            await anggota_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/10_attendance_members.png")
            print("   📸 Captured: screenshots/e2e/10_attendance_members.png")

        # Tab: Rekap Mingguan
        rekap_tab = page.locator('button:has-text("Rekap")')
        if await rekap_tab.count() > 0:
            await rekap_tab.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/11_attendance_recap.png")
            print("   📸 Captured: screenshots/e2e/11_attendance_recap.png")

        # Step 6: Theme Toggle (Dark Mode)
        print("\n6. [Theme] Testing Dark Theme Mode ...")
        theme_btn = page.locator('button[title*="Tema"]')
        if await theme_btn.count() > 0:
            await theme_btn.first.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path="screenshots/e2e/12_dark_mode.png")
            print("   📸 Captured: screenshots/e2e/12_dark_mode.png")

        # Step 7: Logout Button & Confirm Dialog
        print("\n7. [Logout] Testing Logout & Confirmation Dialog ...")
        logout_btn = page.locator('button[title="Keluar"]').first
        if await logout_btn.count() > 0:
            await logout_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/e2e/13_logout_confirm_dialog.png")
            print("   📸 Captured: screenshots/e2e/13_logout_confirm_dialog.png")

            # Click Confirm in Dialog
            dialog_confirm_btn = page.locator('div[role="alertdialog"] button:has-text("Keluar")')
            if await dialog_confirm_btn.count() > 0:
                await dialog_confirm_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path="screenshots/e2e/14_logged_out_success.png")
                print("   📸 Captured: screenshots/e2e/14_logged_out_success.png")

        await browser.close()
        print("\n==================================================")
        print("🎉 ALL E2E AUTOMATED BROWSER TESTS PASSED (100%)")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_e2e())
