import puppeteer from 'puppeteer-core'
import path from 'path'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUTPUT_DIR = 'd:\\Udi\\Aplikasi\\worksphere\\screenshots\\vercel_ref'

async function inspectCards() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1500))

  // Find clickable cards
  const cards = await page.$$('div, button, a')
  for (const c of cards) {
    const text = await page.evaluate(el => el.textContent, c)
    if (text && text.includes('Presensi Hari Ini')) {
      console.log('Clicking Presensi Hari Ini...')
      await c.click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'screen_presensi_detail.png'), fullPage: true })
      break
    }
  }

  // Go back
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1000))

  for (const c of await page.$$('div, button, a')) {
    const text = await page.evaluate(el => el.textContent, c)
    if (text && text.includes('To Do List')) {
      console.log('Clicking To Do List...')
      await c.click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'screen_todo_detail.png'), fullPage: true })
      break
    }
  }

  // Go back
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1000))

  for (const c of await page.$$('div, button, a')) {
    const text = await page.evaluate(el => el.textContent, c)
    if (text && text.includes('Rincian')) {
      console.log('Clicking Rincian Keuangan...')
      await c.click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'screen_finance_detail.png'), fullPage: true })
      break
    }
  }

  await browser.close()
  console.log('✅ Captured detail screens!')
}

inspectCards().catch(console.error)
