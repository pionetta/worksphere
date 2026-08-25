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

  // 1. Screenshot Main Ringkasan View with 4 Topbar items, Quick Buttons & Wallets list
  await page.screenshot({ path: path.join(outDir, '07_finance_main_ringkasan.png') });

  // 2. Open "Tambah Dompet" form popup
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addWallet = btns.find(b => b.textContent?.includes('Tambah Dompet'));
    if (addWallet) addWallet.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '08_finance_add_wallet_modal.png') });

  // Close or cancel
  await page.evaluate(() => {
    const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Batal');
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Open "Catat Transaksi" form popup
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addTx = btns.find(b => b.textContent?.includes('Catat Transaksi'));
    if (addTx) addTx.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '09_finance_add_transaction_modal.png') });

  // Close or cancel
  await page.evaluate(() => {
    const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Batal');
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Open "Riwayat Transaksi" popup
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const viewAllTx = btns.find(b => b.textContent?.includes('Lihat Semua'));
    if (viewAllTx) viewAllTx.click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(outDir, '10_finance_transactions_popup.png') });

  await browser.close();
  console.log('Restructured finance screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
