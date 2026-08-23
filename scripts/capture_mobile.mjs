import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots/mobile')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const PORT = 9224

async function fetchJson(url) {
  const res = await fetch(url)
  return res.json()
}

function createCdpClient(ws) {
  let curId = 1
  const pending = new Map()
  const eventListeners = new Map()

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method && eventListeners.has(msg.method)) {
        eventListeners.get(msg.method)(msg.params)
      }
    } catch (err) {
      console.error('CDP parse error:', err)
    }
  })

  return {
    send(method, params = {}, sessionId = undefined) {
      return new Promise((resolve, reject) => {
        const id = curId++
        pending.set(id, { resolve, reject })
        const payload = { id, method, params }
        if (sessionId) payload.sessionId = sessionId
        ws.send(JSON.stringify(payload))
      })
    },
    on(method, callback) {
      eventListeners.set(method, callback)
    },
  }
}

async function run() {
  console.log('🚀 Starting Headless Edge...')
  const userDataDir = path.resolve(process.cwd(), '.temp_edge_profile')
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--hide-scrollbars',
    '--mute-audio',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ])

  let version = null
  for (let i = 0; i < 30; i++) {
    try {
      version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`)
      if (version) break
    } catch {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  if (!version) {
    console.error('❌ CDP timeout')
    edge.kill()
    return
  }

  console.log('🔗 Browser WebSocket URL:', version.webSocketDebuggerUrl)
  const ws = new globalThis.WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve) => ws.addEventListener('open', resolve))
  console.log('✅ Browser Connected!')

  const browserCdp = createCdpClient(ws)

  // Create new target with mobile viewport
  const { targetId } = await browserCdp.send('Target.createTarget', {
    url: 'http://localhost:5173/login',
  })
  const { sessionId } = await browserCdp.send('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  console.log('🎯 Attached to Page Session:', sessionId)

  const send = (method, params = {}) => browserCdp.send(method, params, sessionId)

  await send('Page.enable')
  await send('Runtime.enable')

  // Set iPhone 14 mobile emulation
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })

  async function capture(filename, delay = 1000) {
    await new Promise((r) => setTimeout(r, delay))
    const res = await send('Page.captureScreenshot', { format: 'png' })
    const buf = Buffer.from(res.data, 'base64')
    const dest = path.join(SCREENSHOT_DIR, filename)
    fs.writeFileSync(dest, buf)
    console.log(`📸 Captured: screenshots/mobile/${filename} (${buf.length} bytes)`)
  }

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
    })
    return res.result?.value
  }

  console.log('--- Capturing Mobile Screenshots ---')

  // 1. Login Page
  console.log('Capturing 01_login_page.png...')
  await capture('01_login_page.png', 1800)

  // 2. Click Demo Mode -> Dashboard
  console.log('Entering Demo Mode...')
  await evalJs(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo'));
    if (btn) btn.click();
  `)
  await capture('02_dashboard_page.png', 2000)

  // 3. Attendance Page
  console.log('Navigating to /attendance...')
  await send('Page.navigate', { url: 'http://localhost:5173/attendance' })
  await capture('03_attendance_page.png', 1500)

  // 4. Finance Page - Ringkasan
  console.log('Navigating to /finance...')
  await send('Page.navigate', { url: 'http://localhost:5173/finance' })
  await capture('04_finance_ringkasan.png', 1500)

  // 5. Finance Page - Transaksi
  console.log('Clicking Tab Transaksi...')
  await evalJs(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Transaksi'));
    if (tab) tab.click();
  `)
  await capture('05_finance_transaksi.png', 800)

  // 6. Finance Page - Anggaran
  console.log('Clicking Tab Anggaran...')
  await evalJs(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Anggaran'));
    if (tab) tab.click();
  `)
  await capture('06_finance_anggaran.png', 800)

  // 7. Finance Page - Tabungan
  console.log('Clicking Tab Tabungan...')
  await evalJs(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Tabungan'));
    if (tab) tab.click();
  `)
  await capture('07_finance_tabungan.png', 800)

  // 8. Finance Page - Utang
  console.log('Clicking Tab Utang...')
  await evalJs(`
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('Utang'));
    if (tab) tab.click();
  `)
  await capture('08_finance_utang.png', 800)

  // 9. To-Do Page
  console.log('Navigating to /todo...')
  await send('Page.navigate', { url: 'http://localhost:5173/todo' })
  await capture('09_todo_page.png', 1500)

  // 10. Profile Modal
  console.log('Opening Profile Modal...')
  await evalJs(`
    const avatar = document.querySelector('header button[aria-label="Buka Profil"]');
    if (avatar) avatar.click();
  `)
  await capture('10_profile_modal.png', 1000)

  // Close Profile Modal
  await evalJs(`
    const closeBtn = document.querySelector('[role="dialog"] button[aria-label="Tutup"]');
    if (closeBtn) closeBtn.click();
  `)
  await new Promise((r) => setTimeout(r, 600))

  // 11. Quick Action Menu
  console.log('Opening Quick Actions FAB...')
  await evalJs(`
    const fab = document.querySelector('button[aria-label*="aksi cepat"]');
    if (fab) fab.click();
  `)
  await capture('11_quick_action_menu.png', 1000)

  console.log('✨ ALL 11 MOBILE SCREENSHOTS CAPTURED SUCCESSFULLY!')
  ws.close()
  edge.kill()
  process.exit(0)
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
