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

  // Seed members into Dexie 'worksphere'
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const openReq = indexedDB.open('worksphere')
      openReq.onsuccess = () => {
        const db = openReq.result
        if (db.objectStoreNames.contains('members')) {
          const tx = db.transaction('members', 'readwrite')
          const store = tx.objectStore('members')
          const members = [
            {
              id: 'm-1',
              user_id: '00000000-0000-4000-8000-000000000001',
              name: 'Salsabila Ramadhani Putri (Admin)',
              note: 'Staff Administrasi & Keuangan',
              is_active: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'm-2',
              user_id: '00000000-0000-4000-8000-000000000001',
              name: 'Muhammad Fadhil Pratama',
              note: 'Lead Software Engineer',
              is_active: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'm-3',
              user_id: '00000000-0000-4000-8000-000000000001',
              name: 'Anisa Dian Maharani',
              note: 'Product Designer',
              is_active: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]
          members.forEach(m => store.put(m))
          tx.oncomplete = () => resolve(true)
          tx.onerror = () => resolve(false)
        } else {
          resolve(false)
        }
      }
      openReq.onerror = () => resolve(false)
    })
  })
  await new Promise(r => setTimeout(r, 600))

  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 1500))

  const shotPath = path.resolve(
    'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots/18_attendance_dropdown_selector.png'
  )
  await page.screenshot({ path: shotPath, fullPage: false })
  console.log('Saved attendance dropdown screenshot to:', shotPath)

  await browser.close()
}

run().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
