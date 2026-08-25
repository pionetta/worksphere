import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/mobile')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function run() {
  console.log('🚀 Launching Edge with Puppeteer Core...')
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  async function clickByText(text, timeout = 3000) {
    await page.waitForFunction(
      (t) => {
        const btns = Array.from(document.querySelectorAll('button, a, [role="button"], [role="tab"]'))
        return btns.some((b) => b.textContent && b.textContent.includes(t))
      },
      { timeout },
      text
    )
    await page.evaluate((t) => {
      const btns = Array.from(document.querySelectorAll('button, a, [role="button"], [role="tab"]'))
      const match = btns.find((b) => b.textContent && b.textContent.includes(t))
      if (match) match.click()
    }, text)
  }

  // 1. Login Light
  console.log('📱 1. Login Page (Light Mode)...')
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_mode_terang.png') })

  // 2. Login Dark
  console.log('🌙 2. Login Page (Dark Mode)...')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_mode_gelap.png') })

  // 3. Enter Demo Mode
  console.log('🔑 3. Entering Demo Mode...')
  await clickByText('Mode Demo')
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
  await new Promise((r) => setTimeout(r, 1200))

  // 4. Dashboard
  console.log('📊 4. Dashboard Mobile...')
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dashboard_mobile.png') })

  // 5. Absensi - Tab Harian
  console.log('📅 5. Absensi Harian...')
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_absensi_harian.png') })

  // 6. Absensi - Tab Anggota
  console.log('👥 6. Absensi - Tab Anggota...')
  await clickByText('Anggota')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_absensi_daftar_anggota.png') })

  // 7. Absensi - Tab Rekap
  console.log('📈 7. Absensi - Tab Rekap...')
  await clickByText('Rekap')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_absensi_rekap.png') })

  // 8. Keuangan - Tab Ringkasan
  console.log('💰 8. Keuangan - Tab Ringkasan...')
  await page.goto('http://localhost:5173/app/finance', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_keuangan_ringkasan.png') })

  // 9. Keuangan - Tab Dompet
  console.log('👛 9. Keuangan - Tab Dompet...')
  await clickByText('Dompet')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_keuangan_dompet.png') })

  // 10. Keuangan - Tab Transaksi
  console.log('💳 10. Keuangan - Tab Transaksi...')
  await clickByText('Transaksi')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_keuangan_transaksi.png') })

  // 11. Keuangan - Tab Anggaran
  console.log('🎯 11. Keuangan - Tab Anggaran...')
  await clickByText('Anggaran')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_keuangan_anggaran.png') })

  // 12. Keuangan - Tab Tabungan
  console.log('🐷 12. Keuangan - Tab Tabungan...')
  await clickByText('Tabungan')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_keuangan_tabungan.png') })

  // 13. Keuangan - Tab Utang
  console.log('🤝 13. Keuangan - Tab Utang & Piutang...')
  await clickByText('Utang')
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_keuangan_utang_piutang.png') })

  // 14. To-Do (Daftar Tugas)
  console.log('✅ 14. To-Do (Daftar Tugas)...')
  await page.goto('http://localhost:5173/app/todo', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_todo_daftar_tugas.png') })

  // 14b. To-Do (Papan Kanban)
  console.log('📋 14b. To-Do (Papan Kanban)...')
  await clickByText('Papan Kanban')
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_kanban_board_view.png') })
  await page.screenshot({ path: path.resolve('C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/16_kanban_board_view.png') })

  // 15. Profile Modal with Notifications
  console.log('⚙️ 15. Modal Profil & Pengaturan (dengan Notifikasi Web)...')
  const avatar = await page.waitForSelector('header button[aria-label="Buka Profil"]')
  if (avatar) await avatar.click()
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_modal_profil_pengaturan.png') })
  await page.screenshot({ path: path.resolve('C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/17_profile_notification_settings.png') })

  // Close modal
  const closeBtn = await page.waitForSelector('[role="dialog"] button[aria-label="Tutup"]')
  if (closeBtn) await closeBtn.click()
  await new Promise((r) => setTimeout(r, 600))

  // 16. Quick Actions FAB on Dashboard
  console.log('⚡ 16. Menu Aksi Cepat (FAB +)...')
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  const fab = await page.waitForSelector('button[aria-label*="aksi cepat"]')
  if (fab) await fab.click()
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_menu_aksi_cepat_fab.png') })

  console.log('\n🎉 SEMUA SCREENSHOT LENGKAP BERHASIL DIAMBIL!')
  await browser.close()
}

run().catch((e) => {
  console.error('❌ Error during capture:', e)
  process.exit(1)
})
