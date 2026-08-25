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

  // Click Utang tab in topbar
  await page.evaluate(() => {
    const triggers = Array.from(document.querySelectorAll('[role="button"], button'));
    const utang = triggers.find(b => b.textContent?.trim() === 'Utang');
    if (utang) utang.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(outDir, '15_debt_filter_fullwidth.png') });

  await browser.close();
  console.log('Debt filter fullwidth screenshot captured!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
