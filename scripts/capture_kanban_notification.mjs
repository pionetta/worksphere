import path from 'path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function capture() {
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

  // 1. Go to login page
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const demo = btns.find(b => b.textContent.includes('Coba Mode Demo'))
    if (demo) demo.click()
  })

  // Wait for redirect to /app
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
  await new Promise(r => setTimeout(r, 1500))

  // 2. Click To-Do in bottom navigation
  await page.evaluate(() => {
    const navLinks = Array.from(document.querySelectorAll('nav a'))
    const todoLink = navLinks.find(a => a.getAttribute('href')?.includes('/todo') || a.textContent.includes('To-Do'))
    if (todoLink) todoLink.click()
  })
  await new Promise(r => setTimeout(r, 1500))

  // 3. Switch to Kanban Board
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const kanban = btns.find(b => b.textContent.includes('Papan Kanban'))
    if (kanban) kanban.click()
  })
  await new Promise(r => setTimeout(r, 1200))

  const kanbanPath = path.resolve('C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/16_kanban_board_view.png')
  await page.screenshot({ path: kanbanPath, fullPage: false })
  console.log('Saved Kanban screenshot to:', kanbanPath)

  // 4. Open Profile modal from header avatar
  await page.evaluate(() => {
    const avatar = document.querySelector('header button[aria-label="Buka Profil"]') || document.querySelector('header button')
    if (avatar) avatar.click()
  })
  await new Promise(r => setTimeout(r, 1200))

  const profilePath = path.resolve('C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/17_profile_notification_settings.png')
  await page.screenshot({ path: profilePath, fullPage: false })
  console.log('Saved Profile notification screenshot to:', profilePath)

  await browser.close()
}

capture().catch(err => {
  console.error('Error capturing screenshot:', err)
  process.exit(1)
})
