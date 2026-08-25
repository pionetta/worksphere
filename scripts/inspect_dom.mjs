import puppeteer from 'puppeteer-core'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function inspectDom() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.goto('https://worksphere-mobile.vercel.app/', { waitUntil: 'networkidle2' })

  // List all click targets in bottom nav
  const bottomBarButtons = await page.$$eval('div.fixed.bottom-0 button, nav button, footer button', els => els.map(e => ({
    text: e.textContent.trim(),
    html: e.outerHTML
  })))
  console.log('Bottom bar buttons:', bottomBarButtons)

  // Try clicking each button in the bottom navigation
  const btns = await page.$$('button')
  for (let i = 0; i < btns.length; i++) {
    const text = await page.evaluate(el => el.textContent.trim(), btns[i])
    console.log(`Button ${i}: "${text}"`)
  }

  await browser.close()
}

inspectDom().catch(console.error)
