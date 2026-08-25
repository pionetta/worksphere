import path from 'path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const DEMO_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Pengguna Demo' },
  aud: 'authenticated',
  created_at: '2026-08-22T00:00:00.000Z',
  email: 'demo@worksphere.local',
  role: 'authenticated',
  updated_at: '2026-08-22T00:00:00.000Z',
}

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

  // 1. Pre-seed demo user into localStorage
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const demo = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Coba Mode Demo'))
    if (demo) demo.click()
  })
  await new Promise(r => setTimeout(r, 1200))

  // 2. Go to To-Do page
  await page.goto('http://localhost:5173/app/todo', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))

  // 3. Add 2 demo tasks if list is empty
  await page.evaluate(async () => {
    // Open create task form if visible
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Tambah'))
    if (addBtn) addBtn.click()
  })
  await new Promise(r => setTimeout(r, 800))

  // Type title
  const titleInput = await page.$('input[placeholder*="tugas"]') || await page.$('input#title')
  if (titleInput) {
    await titleInput.type('Desain UI/UX Papan Kanban')
    const submitBtn = await page.waitForSelector('button[type="submit"]')
    if (submitBtn) await submitBtn.click()
    await new Promise(r => setTimeout(r, 800))
  }

  // 4. Switch to Kanban Board
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const kanban = btns.find((b) => b.textContent && b.textContent.includes('Papan Kanban'))
    if (kanban) kanban.click()
  })
  await new Promise((r) => setTimeout(r, 1000))

  const kanbanPath = path.resolve(
    'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/16_kanban_board_view.png'
  )
  await page.screenshot({ path: kanbanPath, fullPage: false })
  console.log('Saved Kanban screenshot to:', kanbanPath)

  await browser.close()
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
