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

  // 1. Go to Login & enter Demo mode
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('worksphere-theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  const demoButtons = await page.$$('button');
  for (const btn of demoButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Mode Demo')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1800));

  // 2. Capture Finance Summary with Analytics & Exports
  console.log('Capturing Finance Summary & Analytics...');
  await page.goto('http://localhost:5173/app/finance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'analytics_finance_summary.png') });

  // 3. Capture Attendance Weekly Recap with AttendanceTrendChart
  console.log('Capturing Attendance Weekly Recap Chart...');
  await page.goto('http://localhost:5173/app/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const tabs = await page.$$('button[role="button"]');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Rekap')) {
      await tab.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'analytics_attendance_trend.png') });

  // 4. Capture Todo Page with TaskAnalyticsCard
  console.log('Capturing Todo Analytics...');
  await page.goto('http://localhost:5173/app/todo', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'analytics_todo_breakdown.png') });

  await browser.close();
  console.log('All analytics screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing analytics screenshots:', err);
  process.exit(1);
});
