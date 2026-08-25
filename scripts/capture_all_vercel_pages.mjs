import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUTPUT_DIR = 'd:\\Udi\\Aplikasi\\worksphere\\screenshots\\vercel_ref'

async function captureAllVercelPages() {
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
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 1500))

  const navLabels = ['Beranda', 'Absensi', 'Keuangan', 'Tugas', 'Integrasi']

  for (const label of navLabels) {
    console.log(`Navigating to tab: ${label}...`)
    const buttons = await page.$$('button')
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), b)
      if (text === label) {
        await b.click()
        await new Promise(r => setTimeout(r, 1200))
        break
      }
    }
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `page_${label.toLowerCase()}.png`),
      fullPage: true,
    })
    console.log(`📸 Saved page_${label.toLowerCase()}.png`)
  }

  await browser.close()
  console.log('✅ Captured all Vercel pages!')
}

captureAllVercelPages().catch(err => {
  console.error(err)
  process.exit(1)
})
