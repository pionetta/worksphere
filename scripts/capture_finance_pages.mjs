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
  await new Promise(r => setTimeout(r, 1000));

  // 1. Click "Lihat Semua Transaksi"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const viewAllTx = btns.find(b => b.textContent?.includes('Lihat Semua Transaksi'));
    if (viewAllTx) viewAllTx.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(outDir, '11_page_semua_transaksi.png') });

  // 2. Click "Kembali ke Halaman Utama Keuangan"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.textContent?.includes('Kembali ke Halaman Utama Keuangan'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  // 3. Click sr-only / accessible button for Dompet to see Halaman Semua Dompet
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const viewAllWallets = btns.find(b => b.textContent?.includes('Lihat Semua Dompet') || b.textContent?.trim() === 'Dompet');
    if (viewAllWallets) viewAllWallets.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(outDir, '12_page_semua_dompet.png') });

  await browser.close();
  console.log('Page navigation screenshots captured!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
