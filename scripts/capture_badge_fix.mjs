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

  // Finance page
  await page.goto('http://localhost:5173/app/finance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Click Tabungan in topbar (role="button" or role="tab")
  await page.evaluate(() => {
    const triggers = Array.from(document.querySelectorAll('[role="button"], button'));
    const tabungan = triggers.find(b => b.textContent?.trim() === 'Tabungan');
    if (tabungan) tabungan.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Tambah Tujuan
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent?.includes('Tambah Tujuan'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Type in form
  const inputs = await page.$$('input');
  for (const inp of inputs) {
    const ph = await page.evaluate(el => el.placeholder, inp);
    if (ph && ph.includes('Dana Darurat')) {
      await inp.type('Dana Darurat');
    } else if (ph === '0') {
      await inp.type('1000000');
    }
  }

  // Click Kustom and type 61 Hari
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const customBtn = btns.find(b => b.textContent?.trim() === 'Kustom');
    if (customBtn) customBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const customInp = await page.$('input[placeholder="Misal: 45"]');
  if (customInp) {
    await customInp.type('61');
  }

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hariBtn = btns.find(b => b.textContent?.trim() === 'Hari');
    if (hariBtn) hariBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Submit
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Simpan');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, '13_savings_card_badge_fixed.png') });

  await browser.close();
  console.log('Fixed screenshot captured!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
