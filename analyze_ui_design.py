import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOT_DIR = "screenshots/ui_analysis"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
BASE_URL = "http://localhost:5173"

VIEWPORTS = {
    "mobile": {"width": 390, "height": 844, "name": "Mobile (iPhone 14/15)"},
    "tablet": {"width": 768, "height": 1024, "name": "Tablet (iPad)"},
    "desktop": {"width": 1366, "height": 768, "name": "Desktop (Laptop/Monitor)"},
}

def analyze_ui_design():
    print("==================================================")
    print("🎨 MEMULAI ANALISIS TAMPILAN & UI/UX WORKSPHERE")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp_key, vp_info in VIEWPORTS.items():
            print(f"\n[VIEWPORT] Menguji Tampilan {vp_info['name']} ({vp_info['width']}x{vp_info['height']})...")
            
            # --- TEMA LIGHT ---
            context_light = browser.new_context(
                viewport={"width": vp_info["width"], "height": vp_info["height"]},
                color_scheme="light"
            )
            page_light = context_light.new_page()

            # 1. Halaman Login (Light)
            page_light.goto(f"{BASE_URL}/login")
            page_light.wait_for_load_state("networkidle")
            time.sleep(0.5)
            page_light.screenshot(path=f"{SCREENSHOT_DIR}/01_{vp_key}_login_light.png")

            # 2. Masuk Demo -> Dashboard (Light)
            page_light.click("button:has-text('Coba Mode Demo')")
            page_light.wait_for_url("**/app", timeout=10000)
            time.sleep(0.8)
            page_light.screenshot(path=f"{SCREENSHOT_DIR}/02_{vp_key}_dashboard_light.png")

            # 3. Absensi (Light)
            page_light.goto(f"{BASE_URL}/app/attendance")
            page_light.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_light.screenshot(path=f"{SCREENSHOT_DIR}/03_{vp_key}_absensi_light.png")

            # 4. Keuangan (Light)
            page_light.goto(f"{BASE_URL}/app/finance")
            page_light.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_light.screenshot(path=f"{SCREENSHOT_DIR}/04_{vp_key}_keuangan_light.png")

            # 5. To-Do (Light)
            page_light.goto(f"{BASE_URL}/app/todo")
            page_light.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_light.screenshot(path=f"{SCREENSHOT_DIR}/05_{vp_key}_todo_light.png")

            # 6. Modal Profil (Light)
            if page_light.locator("button[title='Profil Pengguna']").is_visible():
                page_light.click("button[title='Profil Pengguna']")
                time.sleep(0.6)
                page_light.screenshot(path=f"{SCREENSHOT_DIR}/06_{vp_key}_profil_modal_light.png")

            context_light.close()

            # --- TEMA DARK ---
            context_dark = browser.new_context(
                viewport={"width": vp_info["width"], "height": vp_info["height"]},
                color_scheme="dark"
            )
            page_dark = context_dark.new_page()

            # 1. Halaman Login (Dark)
            page_dark.goto(f"{BASE_URL}/login")
            page_dark.wait_for_load_state("networkidle")
            time.sleep(0.5)
            page_dark.screenshot(path=f"{SCREENSHOT_DIR}/07_{vp_key}_login_dark.png")

            # 2. Masuk Demo -> Dashboard (Dark)
            page_dark.click("button:has-text('Coba Mode Demo')")
            page_dark.wait_for_url("**/app", timeout=10000)
            time.sleep(0.8)
            page_dark.screenshot(path=f"{SCREENSHOT_DIR}/08_{vp_key}_dashboard_dark.png")

            # 3. Absensi (Dark)
            page_dark.goto(f"{BASE_URL}/app/attendance")
            page_dark.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_dark.screenshot(path=f"{SCREENSHOT_DIR}/09_{vp_key}_absensi_dark.png")

            # 4. Keuangan (Dark)
            page_dark.goto(f"{BASE_URL}/app/finance")
            page_dark.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_dark.screenshot(path=f"{SCREENSHOT_DIR}/10_{vp_key}_keuangan_dark.png")

            # 5. To-Do (Dark)
            page_dark.goto(f"{BASE_URL}/app/todo")
            page_dark.wait_for_load_state("networkidle")
            time.sleep(0.8)
            page_dark.screenshot(path=f"{SCREENSHOT_DIR}/11_{vp_key}_todo_dark.png")

            # 6. Modal Profil (Dark)
            if page_dark.locator("button[title='Profil Pengguna']").is_visible():
                page_dark.click("button[title='Profil Pengguna']")
                time.sleep(0.6)
                page_dark.screenshot(path=f"{SCREENSHOT_DIR}/12_{vp_key}_profil_modal_dark.png")

            context_dark.close()
            print(f"  ✅ Selesai menangkap 12 variasi tampilan untuk {vp_info['name']}.")

        browser.close()

    print("\n==================================================")
    print("✨ ANALISIS VISUAL DAN TAMPILAN BERHASIL SELESAI")
    print("==================================================")

if __name__ == "__main__":
    analyze_ui_design()
