import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/mobile')

async function run() {
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

  // 1. Landing Page (Mobile Light)
  console.log('✨ 1. Capturing Landing Page (Light Mode)...')
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1000))
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '00_landing_page_mobile.png'),
    fullPage: false,
  })
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '00_landing_page_full.png'),
    fullPage: true,
  })

  // 2. Landing Page (Mobile Dark)
  console.log('🌙 2. Capturing Landing Page (Dark Mode)...')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '00_landing_page_dark.png'),
    fullPage: false,
  })
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '00_landing_page_dark_full.png'),
    fullPage: true,
  })

  console.log('🎉 Landing Page screenshots captured!')
  await browser.close()
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
