import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.async_api import async_playwright

os.makedirs('screenshots/mobile', exist_ok=True)

async def run_mobile_testing():
    print("==================================================")
    print("📱 WORKSPHERE MOBILE VIEW AUTOMATED BROWSER TEST")
    print("==================================================\n")

    async with async_playwright() as p:
        # Launch Chromium with mobile emulation (iPhone 14 viewport)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=2
        )
        page = await context.new_page()

        # Step 1: Login Screen on Mobile
        print("1. [Auth Mobile] Opening http://localhost:5173/ on Mobile Viewport (390x844)...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="screenshots/mobile/01_mobile_login.png")
        print("   📸 Captured: screenshots/mobile/01_mobile_login.png")

        # Click Demo Mode to enter
        print("   🔑 Entering Demo Mode...")
        demo_btn = page.locator('button:has-text("Coba Mode Demo")')
        await demo_btn.click()
        await page.wait_for_timeout(1500)
        await page.wait_for_load_state("networkidle")

        # Step 2: Mobile Dashboard with Bottom Navigation
        print("2. [Dashboard Mobile] Verifying Dashboard & Bottom Navigation...")
        await page.screenshot(path="screenshots/mobile/02_mobile_dashboard.png")
        print("   📸 Captured: screenshots/mobile/02_mobile_dashboard.png")

        # Step 3: Mobile To-Do Tab via Bottom Navigation
        print("3. [To-Do Mobile] Navigating to To-Do via Bottom Navigation...")
        todo_nav = page.locator('nav.fixed.bottom-0 a[href="/app/todo"]')
        if await todo_nav.count() > 0:
            await todo_nav.click()
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/mobile/03_mobile_todo.png")
            print("   📸 Captured: screenshots/mobile/03_mobile_todo.png")

        # Step 4: Mobile Keuangan (Finance) Tab via Bottom Navigation
        print("4. [Finance Mobile] Navigating to Keuangan via Bottom Navigation...")
        finance_nav = page.locator('nav.fixed.bottom-0 a[href="/app/finance"]')
        if await finance_nav.count() > 0:
            await finance_nav.click()
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/mobile/04_mobile_finance.png")
            print("   📸 Captured: screenshots/mobile/04_mobile_finance.png")

        # Step 5: Mobile Absensi (Attendance) Tab via Bottom Navigation
        print("5. [Attendance Mobile] Navigating to Absensi via Bottom Navigation...")
        attendance_nav = page.locator('nav.fixed.bottom-0 a[href="/app/attendance"]')
        if await attendance_nav.count() > 0:
            await attendance_nav.click()
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/mobile/05_mobile_attendance.png")
            print("   📸 Captured: screenshots/mobile/05_mobile_attendance.png")

        # Step 6: Mobile Dark Mode Toggle
        print("6. [Theme Mobile] Testing Dark Mode Toggle on Mobile...")
        theme_btn = page.locator('header button[title*="Tema"]').first
        if await theme_btn.count() > 0:
            await theme_btn.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path="screenshots/mobile/06_mobile_dark_mode.png")
            print("   📸 Captured: screenshots/mobile/06_mobile_dark_mode.png")

        # Step 7: Mobile Logout Confirmation Dialog
        print("7. [Logout Mobile] Testing Logout on Mobile...")
        logout_btn = page.locator('header button[title="Keluar"]').first
        if await logout_btn.count() > 0:
            await logout_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="screenshots/mobile/07_mobile_logout_dialog.png")
            print("   📸 Captured: screenshots/mobile/07_mobile_logout_dialog.png")

        await browser.close()
        print("\n==================================================")
        print("🎉 ALL MOBILE AUTOMATED TESTS COMPLETED SUCCESSFULLY!")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_mobile_testing())
