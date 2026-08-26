import path from 'path'
import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

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

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    const demoBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent && b.textContent.includes('Mode Demo')
    )
    if (demoBtn) demoBtn.click()
  })
  await new Promise(r => setTimeout(r, 1200))

  await page.goto('http://localhost:5173/app/finance', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1000))

  // Click Catat Transaksi button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const catatBtn = btns.find(b => b.textContent && b.textContent.includes('Catat Transaksi'))
    if (catatBtn) catatBtn.click()
  })
  await new Promise(r => setTimeout(r, 800))

  const shot1 = path.resolve(
    'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/19_transaction_modal_expense.png'
  )
  await page.screenshot({ path: shot1, fullPage: false })
  console.log('Saved expense modal to:', shot1)

  // Switch to Pemasukan
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const pemasukanBtn = btns.find(b => b.textContent && b.textContent.includes('Pemasukan'))
    if (pemasukanBtn) pemasukanBtn.click()
  })
  await new Promise(r => setTimeout(r, 800))

  const shot2 = path.resolve(
    'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/20_transaction_modal_income.png'
  )
  await page.screenshot({ path: shot2, fullPage: false })
  console.log('Saved income modal to:', shot2)

  await browser.close()
}

run().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
