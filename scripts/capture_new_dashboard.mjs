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

  console.log('🔑 Entering Demo Mode directly...')
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))

  const demoBtn = await page.$('button ::-p-text(Coba Mode Demo)')
  if (demoBtn) {
    await demoBtn.click()
    await new Promise((r) => setTimeout(r, 1500))
  } else {
    await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1500))
  }

  // Ensure Light Mode for comparison with mockup
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await new Promise((r) => setTimeout(r, 500))

  // Dismiss any toast
  await page.evaluate(() => {
    const toasts = document.querySelectorAll('[data-sonner-toast], [role="status"]')
    toasts.forEach((t) => (t.style.display = 'none'))
  })
  await new Promise((r) => setTimeout(r, 600))

  await page.waitForSelector('.rounded-\\[24px\\]', { timeout: 8000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 1000))

  console.log('📸 Capturing New Dashboard View...')
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'new_dashboard_exact.png'),
    fullPage: false,
  })

  console.log('🎉 Screenshot saved to new_dashboard_exact.png!')
  await browser.close()
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
