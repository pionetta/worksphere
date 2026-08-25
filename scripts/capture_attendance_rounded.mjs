import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Login demo
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  const demoButtons = await page.$$('button');
  for (const btn of demoButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Mode Demo')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // Insert members with DEMO_USER id
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('worksphere');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const tx = db.transaction(['members'], 'readwrite');
    const store = tx.objectStore('members');
    const demoId = '00000000-0000-4000-8000-000000000001';
    store.put({
      id: 'member-demo-1',
      user_id: demoId,
      name: 'Ahmad Fauzi',
      note: 'Frontend Engineer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    store.put({
      id: 'member-demo-2',
      user_id: demoId,
      name: 'Siti Rahma',
      note: 'Product Designer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await new Promise(r => { tx.oncomplete = r; });
  });

  // Reload attendance page
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Click Hadir on member 1
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hadir = btns.find(b => b.textContent?.trim() === 'Hadir');
    if (hadir) hadir.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(outDir, '14_attendance_buttons_rounded.png') });

  await browser.close();
  console.log('Member attendance buttons rounded screenshot captured!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
