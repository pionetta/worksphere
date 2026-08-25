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

  // 2. Add member
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const tabs = await page.$$('button[role="button"]');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Anggota')) {
      await tab.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Tambah Anggota')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 400));
      const input = await page.$('input[placeholder*="nama" i], input[type="text"]');
      if (input) {
        await input.type('Rian Hidayat');
        const saveBtn = await page.$('button[type="submit"]');
        if (saveBtn) await saveBtn.click();
        await new Promise(r => setTimeout(r, 600));
      }
      break;
    }
  }

  // Switch back to Absensi tab
  const tabs2 = await page.$$('button[role="button"]');
  for (const tab of tabs2) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Absensi')) {
      await tab.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 1: Unselected initial state
  await page.screenshot({ path: path.join(outDir, 'attendance_step1_unselected.png') });

  // Click on "Hadir" button
  const hadirButtons = await page.$$('button[aria-label*="Hadir"]');
  if (hadirButtons.length > 0) {
    await hadirButtons[0].click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'attendance_step2_hadir.png') });
  }

  // Click on "Absen" button
  const absenButtons = await page.$$('button[aria-label*="Absen"]');
  if (absenButtons.length > 0) {
    await absenButtons[0].click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, 'attendance_step3_absen.png') });
  }

  await browser.close();
  console.log('Captured step1, step2, step3 screenshots!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
