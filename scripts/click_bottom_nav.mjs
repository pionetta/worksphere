import puppeteer from 'puppeteer-core'
import path from 'path'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUTPUT_DIR = 'd:\\Udi/Aplikasi/worksphere/screenshots/vercel_ref'

async function clickBottomNav() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1500))

  const tabs = ['Absensi', 'Keuangan', 'Tugas', 'Integrasi']

  for (const t of tabs) {
    console.log(`Clicking bottom nav tab: ${t}...`)
    const btn = await page.$(`button[aria-label="${t}"]`)
    if (btn) {
      await btn.click()
      await new Promise(r => setTimeout(r, 1200))
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `view_${t.toLowerCase()}.png`),
        fullPage: true,
      })
      console.log(`📸 Saved view_${t.toLowerCase()}.png`)
    } else {
      console.log(`Button for ${t} not found!`)
    }
  }

  await browser.close()
  console.log('✅ Done!')
}

clickBottomNav().catch(console.error)
