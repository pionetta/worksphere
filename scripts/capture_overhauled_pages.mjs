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

  // Emulate light color scheme
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  // Go to root and set theme in localStorage
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('worksphere-theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Landing Page Light
  console.log('Capturing Landing Page (Light)...');
  await page.screenshot({ path: path.join(outDir, 'overhaul_01_landing_light.png') });

  // 2. Login Page Light
  console.log('Capturing Login Page (Light)...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('worksphere-theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'overhaul_02_login_light.png') });

  // 3. Demo login to populate data and enter app
  console.log('Entering Demo mode...');
  const demoButtons = await page.$$('button');
  for (const btn of demoButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Mode Demo')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1800));
  await page.evaluate(() => {
    localStorage.setItem('worksphere-theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  // 4. Dashboard Light
  console.log('Capturing Dashboard Page (Light)...');
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'overhaul_03_dashboard_light.png') });

  // 5. Attendance Page Light
  console.log('Capturing Attendance Page (Light)...');
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'overhaul_04_absensi_light.png') });

  // 6. Finance Page Light
  console.log('Capturing Finance Page (Light)...');
  await page.goto('http://localhost:5173/app/finance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'overhaul_05_keuangan_light.png') });

  // 7. Todo Page Light
  console.log('Capturing Todo Page (Light)...');
  await page.goto('http://localhost:5173/app/todo', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'overhaul_06_todo_light.png') });

  await browser.close();
  console.log('All light mode overhaul screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing overhaul screenshots:', err);
  process.exit(1);
});
