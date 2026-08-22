import asyncio
import os
import random
from playwright.async_api import async_playwright

os.makedirs('screenshots', exist_ok=True)

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print("1. Opening Register page...")
        await page.goto("http://localhost:5173/register")
        await page.wait_for_load_state("networkidle")

        rand_id = random.randint(10000, 99999)
        test_email = f"user{rand_id}@gmail.com"
        print(f"2. Submitting registration with: {test_email} ...")
        await page.fill('input[type="email"]', test_email)
        pwd_inputs = page.locator('input[type="password"]')
        count = await pwd_inputs.count()
        for i in range(count):
            await pwd_inputs.nth(i).fill("Password123!")

        await page.click('button[type="submit"]')
        await page.wait_for_timeout(3000)
        await page.screenshot(path="screenshots/10_after_valid_register.png")
        print(f"   Current URL: {page.url}")

        # If redirected to /app, explore all screens
        if "/app" in page.url:
            print("3. Navigating inside App Dashboard...")
            await page.screenshot(path="screenshots/11_app_dashboard.png")

            print("4. Navigating to Attendance...")
            await page.goto("http://localhost:5173/app/attendance")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/12_app_attendance.png")

            print("5. Navigating to Finance...")
            await page.goto("http://localhost:5173/app/finance")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/13_app_finance.png")

            print("6. Navigating to Todo...")
            await page.goto("http://localhost:5173/app/todo")
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/14_app_todo.png")

        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(run())
