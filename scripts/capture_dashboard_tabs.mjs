import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SCREENSHOT_DIR = 'd:\\Udi\\Aplikasi\\worksphere\\screenshots\\mobile'

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })

  console.log('🔑 Navigating to login...')
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })

  // Force Light mode
  await page.evaluate(() => {
    localStorage.setItem('worksphere_theme', 'light')
    document.documentElement.classList.remove('dark')
  })

  // Click Demo Mode button
  const buttons = await page.$$('button')
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn)
    if (text && text.includes('Mode Demo')) {
      await btn.click()
      break
    }
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle2' })

  await page.evaluate(() => {
    localStorage.setItem('worksphere_theme', 'light')
    document.documentElement.classList.remove('dark')
  })

  await page.waitForSelector('.rounded-\\[24px\\]', { timeout: 8000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 1200))

  // 1. Tab Keuangan (Default)
  console.log('📸 Capturing Dashboard - Tab Keuangan (Light)...')
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dashboard_tab_keuangan.png'),
    fullPage: false,
  })
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'new_dashboard_exact.png'),
    fullPage: false,
  })

  // 2. Tab Absensi
  console.log('📸 Switching to Tab Absensi...')
  const tabButtons = await page.$$('button')
  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.textContent, btn)
    if (text && text.trim() === 'Absensi') {
      await btn.click()
      break
    }
  }
  await new Promise((r) => setTimeout(r, 600))
  console.log('📸 Capturing Dashboard - Tab Absensi (Light)...')
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dashboard_tab_absensi.png'),
    fullPage: false,
  })

  // 3. Tab Tugas
  console.log('📸 Switching to Tab Tugas...')
  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.textContent, btn)
    if (text && text.trim() === 'Tugas') {
      await btn.click()
      break
    }
  }
  await new Promise((r) => setTimeout(r, 600))
  console.log('📸 Capturing Dashboard - Tab Tugas (Light)...')
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dashboard_tab_tugas.png'),
    fullPage: false,
  })

  await browser.close()
  console.log('🎉 All tabs captured in light mode successfully!')
}

run().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
