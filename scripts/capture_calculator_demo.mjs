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

  // Fill in form: target 1000000, preset 12 Bln
  const inputs = await page.$$('input');
  for (const inp of inputs) {
    const ph = await page.evaluate(el => el.placeholder, inp);
    if (ph && ph.includes('Dana Darurat')) {
      await inp.type('Dana Darurat 12 Bulan');
    } else if (ph === '0') {
      await inp.type('1000000');
    }
  }

  // Click 12 Bln
  const presetBtns = await page.$$('button');
  for (const btn of presetBtns) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.trim() === '12 Bln') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(outDir, '01_savings_calculator_form.png') });

  // Click Simpan
  const submitBtns = await page.$$('button');
  for (const btn of submitBtns) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.trim() === 'Simpan') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, '02_savings_calculator_card.png') });

  // Click Utang in sub-tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const utang = btns.find(b => b.textContent?.trim() === 'Utang');
    if (utang) utang.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Catat Utang
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent?.includes('Catat Utang'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Fill debt form
  const debtInputs = await page.$$('input');
  for (const inp of debtInputs) {
    const ph = await page.evaluate(el => el.placeholder, inp);
    if (ph && ph.includes('Nama pemberi')) {
      await inp.type('Pinjaman Modal Usaha');
    } else if (ph === '0') {
      await inp.type('1200000');
    }
  }

  // Click 12 Bln
  const debtPresets = await page.$$('button');
  for (const btn of debtPresets) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.trim() === '12 Bln') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(outDir, '03_debt_calculator_form.png') });

  // Click Simpan in debt form
  const debtFormBtns = await page.$$('button');
  for (const btn of debtFormBtns) {
    const txt = await page.evaluate(el => el.textContent, btn);
    if (txt && txt.trim() === 'Simpan') {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, '04_debt_calculator_card.png') });

  await browser.close();
  console.log('Capture complete!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
