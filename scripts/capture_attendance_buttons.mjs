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

  // 1. Enter Demo Mode
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  const demoButtons = await page.$$('button');
  for (const btn of demoButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Mode Demo')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1800));

  // 2. Go to Attendance page
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Add a sample member if none exist so we can see the buttons live
  const memberTab = await page.$('button[value="members"]');
  if (memberTab) {
    await memberTab.click();
    await new Promise(r => setTimeout(r, 400));

    // Find and click Tambah Anggota if there
    const addBtns = await page.$$('button');
    for (const btn of addBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Tambah Anggota')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 300));
        // Type member name
        const input = await page.$('input[placeholder*="nama" i], input[type="text"]');
        if (input) {
          await input.type('Budi Santoso');
          const submitBtn = await page.$('button[type="submit"]');
          if (submitBtn) await submitBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
        break;
      }
    }

    // Go back to Absensi tab
    const absensiTab = await page.$('button[value="attendance"]');
    if (absensiTab) {
      await absensiTab.click();
      await new Promise(r => setTimeout(r, 500));
    }
  }

  await page.screenshot({ path: path.join(outDir, 'attendance_buttons_enhanced.png') });

  await browser.close();
  console.log('Captured attendance_buttons_enhanced.png');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
