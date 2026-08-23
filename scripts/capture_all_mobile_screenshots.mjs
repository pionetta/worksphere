import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/mobile')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const PORT = 9222

async function fetchJson(url) {
  const res = await fetch(url)
  return res.json()
}

async function sendCdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000)
    const msg = JSON.stringify({ id, method, params })

    const handler = (event) => {
      const parsed = JSON.parse(event.data)
      if (parsed.id === id) {
        ws.removeEventListener('message', handler)
        if (parsed.error) reject(new Error(parsed.error.message))
        else resolve(parsed.result)
      }
    }

    ws.addEventListener('message', handler)
    ws.send(msg)
  })
}

async function run() {
  console.log('🚀 Launching Headless Edge with CDP on port', PORT)
  const userDataDir = path.resolve(process.cwd(), '.temp_browser_profile')
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--hide-scrollbars',
    '--mute-audio',
    `--user-data-dir=${userDataDir}`,
    'http://localhost:5173/',
  ])

  // Wait for CDP endpoint
  let version = null
  for (let i = 0; i < 20; i++) {
    try {
      version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`)
      if (version) break
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  if (!version) {
    console.error('❌ Failed to connect to Edge CDP')
    edge.kill()
    return
  }

  const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`)
  const target = list.find((t) => t.type === 'page') || list[0]
  console.log('🔗 Connecting to page target:', target.webSocketDebuggerUrl)

  const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl)

  await new Promise((resolve) => ws.addEventListener('open', resolve))
  console.log('✅ Connected to WebSocket CDP!')

  // Enable Page and DOM
  await sendCdp(ws, 'Page.enable')
  await sendCdp(ws, 'DOM.enable')
  await sendCdp(ws, 'Runtime.enable')

  // Set Device Metrics Override (iPhone 14 / Mobile standard: 390x844, scale 2)
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })

  async function capture(filename, delayMs = 600) {
    await new Promise((r) => setTimeout(r, delayMs))
    const { data } = await sendCdp(ws, 'Page.captureScreenshot', { format: 'png' })
    const buffer = Buffer.from(data, 'base64')
    const dest = path.join(SCREENSHOT_DIR, filename)
    fs.writeFileSync(dest, buffer)
    console.log(`📸 Saved: screenshots/mobile/${filename} (${buffer.length} bytes)`)
  }

  async function evaluate(expression) {
    const res = await sendCdp(ws, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    return res.result?.value
  }

  console.log('--- Capturing Mobile Screenshots ---')

  // 1. Login Page
  await evaluate(`window.location.href = '/login'`)
  await new Promise((r) => setTimeout(r, 1200))
  await capture('01_login_page.png')

  // Click Demo Mode
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo'));
    if (btn) btn.click();
  `)
  await new Promise((r) => setTimeout(r, 1500))

  // 2. Dashboard Page
  await evaluate(`window.location.href = '/'`)
  await new Promise((r) => setTimeout(r, 1000))
  await capture('02_dashboard_page.png')

  // 3. Attendance Page
  await evaluate(`window.location.href = '/attendance'`)
  await new Promise((r) => setTimeout(r, 1000))
  await capture('03_attendance_page.png')

  // 4. Finance Page - Tab Ringkasan
  await evaluate(`window.location.href = '/finance'`)
  await new Promise((r) => setTimeout(r, 1000))
  await capture('04_finance_ringkasan.png')

  // 5. Finance Page - Tab Transaksi
  await evaluate(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Transaksi'));
    if (tab) tab.click();
  `)
  await capture('05_finance_transaksi.png')

  // 6. Finance Page - Tab Anggaran
  await evaluate(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Anggaran'));
    if (tab) tab.click();
  `)
  await capture('06_finance_anggaran.png')

  // 7. Finance Page - Tab Tabungan
  await evaluate(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Tabungan'));
    if (tab) tab.click();
  `)
  await capture('07_finance_tabungan.png')

  // 8. Finance Page - Tab Utang
  await evaluate(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Utang'));
    if (tab) tab.click();
  `)
  await capture('08_finance_utang.png')

  // 9. To-Do Page
  await evaluate(`window.location.href = '/todo'`)
  await new Promise((r) => setTimeout(r, 1000))
  await capture('09_todo_page.png')

  // 10. Profile Modal
  await evaluate(`
    const avatarBtn = document.querySelector('header button[aria-label="Buka Profil"]');
    if (avatarBtn) avatarBtn.click();
  `)
  await capture('10_profile_modal.png', 800)

  // Close Profile Modal
  await evaluate(`
    const closeBtn = document.querySelector('[role="dialog"] button[aria-label="Tutup"]');
    if (closeBtn) closeBtn.click();
  `)
  await new Promise((r) => setTimeout(r, 500))

  // 11. Quick Action Menu (FAB +)
  await evaluate(`
    const fab = document.querySelector('button[aria-label*="aksi cepat"]');
    if (fab) fab.click();
  `)
  await capture('11_quick_action_menu.png', 800)

  console.log('✨ All mobile screenshots captured successfully!')
  ws.close()
  edge.kill()
  process.exit(0)
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
