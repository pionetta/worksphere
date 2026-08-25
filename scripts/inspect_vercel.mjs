import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUTPUT_DIR = 'd:\\Udi\\Aplikasi\\worksphere\\screenshots\\vercel_ref'

async function inspectVercel() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

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

  console.log('🌐 Opening https://worksphere-mobile.vercel.app/ ...')
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1500))

  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_landing.png'), fullPage: true })
  console.log('📸 Saved 01_landing.png')

  // Find buttons / links on landing
  const links = await page.$$eval('a, button', els => els.map(e => ({
    tag: e.tagName,
    text: e.textContent.trim(),
    href: e.getAttribute('href')
  })))
  console.log('Found elements:', JSON.stringify(links, null, 2))

  // Try to click Demo or Login or navigate
  const demoBtn = await page.$('button, a')
  const buttons = await page.$$('button, a')
  for (const b of buttons) {
    const txt = await page.evaluate(el => el.textContent, b)
    if (txt && (txt.includes('Demo') || txt.includes('Mulai') || txt.includes('Masuk') || txt.includes('Coba'))) {
      console.log('Clicking:', txt.trim())
      await b.click()
      await new Promise(r => setTimeout(r, 1500))
      break
    }
  }

  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_after_click.png'), fullPage: true })

  // Check URL
  console.log('Current URL:', page.url())

  // Inspect navigation items
  const navLinks = await page.$$eval('nav a, footer a, [role="navigation"] a', els => els.map(e => ({
    text: e.textContent.trim(),
    href: e.getAttribute('href')
  })))
  console.log('Navigation links:', JSON.stringify(navLinks, null, 2))

  // If there are tabs or subpages, take screenshots
  const routes = ['/attendance', '/finance', '/todo', '/notes', '/team', '/settings']
  for (const r of routes) {
    try {
      await page.goto(`https://worksphere-mobile.vercel.app${r}`, { waitUntil: 'networkidle2' }).catch(() => {})
      await new Promise(res => setTimeout(res, 1000))
      const safeName = r.replace('/', '')
      await page.screenshot({ path: path.join(OUTPUT_DIR, `route_${safeName}.png`), fullPage: false })
      console.log(`📸 Saved route_${safeName}.png`)
    } catch (err) {
      console.log(`Failed route ${r}:`, err.message)
    }
  }

  await browser.close()
  console.log('✅ Vercel inspection finished!')
}

inspectVercel().catch(err => {
  console.error(err)
  process.exit(1)
})
