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

  // Click on the sr-only / accessible button directly or dropdown
  await page.evaluate(() => {
    const srBtns = Array.from(document.querySelectorAll('.sr-only button, button'));
    const tabungan = srBtns.find(b => b.textContent?.trim() === 'Tabungan');
    if (tabungan) tabungan.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click "+ Tambah Tujuan"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent?.includes('Tambah Tujuan'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Fill in form: target 1000000
  const inputs = await page.$$('input');
  for (const inp of inputs) {
    const ph = await page.evaluate(el => el.placeholder, inp);
    if (ph && ph.includes('Dana Darurat')) {
      await inp.type('Tabungan Liburan Akhir Tahun');
    } else if (ph === '0') {
      await inp.type('1000000');
    }
  }

  // Click "Kustom" in DurationPicker
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const customBtn = btns.find(b => b.textContent?.trim() === 'Kustom');
    if (customBtn) customBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Type custom duration "45" and select "Hari"
  const customInp = await page.$('input[placeholder="Misal: 45"]');
  if (customInp) {
    await customInp.type('45');
  }

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hariBtn = btns.find(b => b.textContent?.trim() === 'Hari');
    if (hariBtn) hariBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(outDir, '05_custom_duration_savings_45hari.png') });

  // Now change to "10" and select "Minggu"
  await page.evaluate(() => {
    const inp = document.querySelector('input[placeholder="Misal: 45"]');
    if (inp) {
      inp.value = '10';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const mingguBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Minggu');
    if (mingguBtn) mingguBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(outDir, '06_custom_duration_savings_10minggu.png') });

  await browser.close();
  console.log('Custom duration screenshots captured!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
