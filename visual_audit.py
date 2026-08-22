import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.async_api import async_playwright

os.makedirs('screenshots/visual_audit', exist_ok=True)

async def inspect_ui():
    print("==================================================")
    print("🔍 RUNNING COMPREHENSIVE UI/UX VISUAL AUDIT")
    print("==================================================\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # -------------------------------------------------------------
        # A. DESKTOP VIEWPORT AUDIT (Light & Dark Mode)
        # -------------------------------------------------------------
        context_desktop = await browser.new_context(viewport={'width': 1366, 'height': 868})
        page = await context_desktop.new_page()

        print("1. [Desktop Auth] Checking Login UI...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/01_desktop_login_light.png")

        # Enter Demo Mode
        await page.click('button:has-text("Coba Mode Demo")')
        await page.wait_for_timeout(1000)

        # 2. Desktop Dashboard
        print("2. [Desktop Dashboard] Checking Dashboard cards and layout...")
        await page.screenshot(path="screenshots/visual_audit/02_desktop_dashboard_light.png")

        # 3. Desktop To-Do Page
        print("3. [Desktop To-Do] Checking To-Do layout, form, and filters...")
        await page.goto("http://localhost:5173/app/todo")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/03_desktop_todo_light.png")

        # Open Create Task Form
        await page.click('button:has-text("Tambah")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/04_desktop_todo_form_light.png")

        # Fill and add a task
        await page.fill('input[placeholder*="tugas"]', 'Tugas Uji Visual UI')
        await page.click('button:has-text("Buat Tugas")')
        await page.wait_for_timeout(800)

        # Open Task Detail Modal
        await page.click('text=Tugas Uji Visual UI')
        await page.wait_for_timeout(600)
        await page.screenshot(path="screenshots/visual_audit/05_desktop_todo_detail_modal_light.png")
        await page.click('button[aria-label="Tutup"], button:has-text("Tutup")')
        await page.wait_for_timeout(400)

        # 4. Desktop Finance Page
        print("4. [Desktop Finance] Checking Finance tabs, wallet cards, transaction forms, charts...")
        await page.goto("http://localhost:5173/app/finance")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/06_desktop_finance_summary_light.png")

        # Wallets Tab
        await page.click('button:has-text("Dompet")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/07_desktop_finance_wallets_light.png")

        # Open Add Wallet Form
        await page.click('button:has-text("Tambah Dompet")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/08_desktop_finance_wallet_form_light.png")
        await page.fill('input[placeholder*="BCA"], input[name="name"]', 'Rekening Operasional BCA')
        await page.fill('input[type="number"], input[name="balance"]', '7500000')
        await page.click('button:has-text("Simpan")')
        await page.wait_for_timeout(800)

        # Transactions Tab
        await page.click('button:has-text("Transaksi")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/09_desktop_finance_transactions_light.png")

        # Open Income Form
        await page.click('button:has-text("Pemasukan")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/10_desktop_finance_income_form_light.png")
        await page.click('button:has-text("Batal")')
        await page.wait_for_timeout(400)

        # Categories Tab
        await page.click('button:has-text("Kategori")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/11_desktop_finance_categories_light.png")

        # Budgets Tab
        await page.click('button:has-text("Anggaran")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/12_desktop_finance_budgets_light.png")

        # Savings Tab
        await page.click('button:has-text("Tabungan")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/13_desktop_finance_savings_light.png")

        # 5. Desktop Attendance Page
        print("5. [Desktop Attendance] Checking Attendance layout, member list, and weekly table...")
        await page.goto("http://localhost:5173/app/attendance")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/14_desktop_attendance_daily_light.png")

        # Members Tab
        await page.click('button:has-text("Anggota")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/15_desktop_attendance_members_light.png")

        # Weekly Recap Tab
        await page.click('button:has-text("Rekap")')
        await page.wait_for_timeout(500)
        await page.screenshot(path="screenshots/visual_audit/16_desktop_attendance_recap_light.png")

        # 6. Desktop Dark Mode Audit
        print("6. [Desktop Dark Mode] Switching to Dark Mode across all pages...")
        await page.evaluate("() => { localStorage.setItem('worksphere-theme', 'dark'); document.documentElement.classList.add('dark'); }")
        await page.reload()
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/17_desktop_attendance_recap_dark.png")

        await page.goto("http://localhost:5173/app")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/18_desktop_dashboard_dark.png")

        await page.goto("http://localhost:5173/app/todo")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/19_desktop_todo_dark.png")

        await page.goto("http://localhost:5173/app/finance")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/visual_audit/20_desktop_finance_dark.png")

        # -------------------------------------------------------------
        # B. MOBILE VIEWPORT AUDIT (iPhone 14 - 390x844)
        # -------------------------------------------------------------
        print("\n7. [Mobile Viewport Audit] Inspecting 390x844 layout...")
        context_mobile = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=2
        )
        page_m = await context_mobile.new_page()

        # Set auth session
        await page_m.goto("http://localhost:5173/")
        await page_m.wait_for_load_state("networkidle")
        await page_m.click('button:has-text("Coba Mode Demo")')
        await page_m.wait_for_timeout(1000)

        # Mobile Dashboard
        await page_m.screenshot(path="screenshots/visual_audit/21_mobile_dashboard.png")

        # Mobile FAB Menu Open
        await page_m.click('button[aria-label*="aksi cepat"]')
        await page_m.wait_for_timeout(600)
        await page_m.screenshot(path="screenshots/visual_audit/22_mobile_quick_actions_menu.png")

        # Click Absensi from FAB
        await page_m.click('button[role="menuitem"]:has-text("Absensi")')
        await page_m.wait_for_timeout(600)
        await page_m.screenshot(path="screenshots/visual_audit/23_mobile_attendance_quick_sheet.png")

        # Close sheet
        close_sheet = page_m.locator('button[aria-label="Tutup"]').first
        if await close_sheet.count() > 0:
            await close_sheet.click()
            await page_m.wait_for_timeout(400)

        # Mobile To-Do
        await page_m.click('nav.fixed.bottom-0 a[href="/app/todo"]')
        await page_m.wait_for_load_state("networkidle")
        await page_m.screenshot(path="screenshots/visual_audit/24_mobile_todo.png")

        # Mobile Finance
        await page_m.click('nav.fixed.bottom-0 a[href="/app/finance"]')
        await page_m.wait_for_load_state("networkidle")
        await page_m.screenshot(path="screenshots/visual_audit/25_mobile_finance.png")

        # Mobile Attendance
        await page_m.click('nav.fixed.bottom-0 a[href="/app/attendance"]')
        await page_m.wait_for_load_state("networkidle")
        await page_m.screenshot(path="screenshots/visual_audit/26_mobile_attendance.png")

        # Mobile Dark Mode
        await page_m.evaluate("() => { localStorage.setItem('worksphere-theme', 'dark'); document.documentElement.classList.add('dark'); }")
        await page_m.reload()
        await page_m.wait_for_load_state("networkidle")
        await page_m.screenshot(path="screenshots/visual_audit/27_mobile_attendance_dark.png")

        await browser.close()
        print("\n==================================================")
        print("✅ VISUAL AUDIT COMPLETE: 27 SCREENSHOTS CAPTURED")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(inspect_ui())
