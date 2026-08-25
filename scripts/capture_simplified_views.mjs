import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/hp/.gemini/antigravity-ide/brain/cfcf70c0-f737-42f4-80f7-40b8cb708eb8/screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  // 1. Simplified Landing Page
  console.log('Capturing Simplified Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'landing_simplified.png') });

  // 2. Login to Demo Mode
  console.log('Entering Demo mode...');
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

  // 3. Dashboard without FAB
  console.log('Capturing Dashboard without FAB...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'dashboard_no_fab.png') });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
