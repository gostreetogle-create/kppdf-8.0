#!/usr/bin/env node
/**
 * TZ-NX-REGISTRY-READINESS-MARATHON browser smoke.
 * Run with backend+frontend-nx already up (node start.mjs --nx --no-browser).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '../../../../backend/package.json'));
const puppeteer = require('puppeteer-core');

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:4201';
const REGISTRIES = ['units', 'materials', 'details', 'modules', 'products', 'departments'];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const consoleErrors = {};
const networkErrors = {};
const routeResults = {};

for (const key of REGISTRIES) {
  consoleErrors[key] = [];
  networkErrors[key] = [];
}

function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error('Chrome not found');
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 60000 });
  const demoBtn = await page.$('[data-test="fill-demo-button"]');
  if (demoBtn) await demoBtn.click();
  await page.click('app-pi-button[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 30000 });
  await delay(1000);
}

async function collectRegistry(page, key) {
  const url = `${BASE}/registries/${key}`;
  const pageErrors = [];
  const netFails = [];

  const onConsole = (msg) => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  };
  const onPageError = (err) => pageErrors.push(String(err));
  const onResponse = (res) => {
    const u = res.url();
    if (u.includes('/api/') && res.status() >= 400) {
      netFails.push({ url: u, status: res.status() });
    }
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('response', onResponse);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('[data-test="registry-panel-title"]', { timeout: 20000 });

  const title = await page.$eval('[data-test="registry-panel-title"]', (el) => el.textContent?.trim() ?? '');
  const toolbar = await page.$('[data-test="registry-toolbar"]');
  const filters = await page.$('[data-test="registry-toolbar-filters"], [data-test="registry-toolbar-filters-empty"]');
  const pagination = await page.$('[data-test="registry-toolbar-pagination"]');
  const createBtn = await page.$('[data-test="registry-create"]');

  const rowActions = await page.$$eval('[data-test^="registry-row-action-"]', (els) =>
    els.map((el) => ({
      dataTest: el.getAttribute('data-test'),
      ariaLabel: el.getAttribute('aria-label'),
      title: el.getAttribute('title'),
      text: (el.textContent ?? '').trim(),
      tag: el.tagName,
    })),
  );

  await page.screenshot({ path: join(__dirname, `03-registry-${key}.png`), fullPage: true });

  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  page.off('response', onResponse);

  consoleErrors[key] = pageErrors;
  networkErrors[key] = netFails;

  return {
    url,
    title,
    toolbar: !!toolbar,
    filters: !!filters,
    pagination: !!pagination,
    create: !!createBtn,
    rowActionCount: rowActions.length,
    rowActions,
    consoleErrors: pageErrors,
    networkErrors: netFails,
  };
}

async function main() {
  mkdirSync(__dirname, { recursive: true });
  const chromePath = findChrome();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const globalConsole = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') globalConsole.push(msg.text());
  });
  page.on('pageerror', (err) => globalConsole.push(String(err)));

  await login(page);
  await page.screenshot({ path: join(__dirname, '01-post-login.png'), fullPage: true });

  await page.goto(`${BASE}/registries`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-test="registries-master-table"]', { timeout: 20000 }).catch(() => {
    /* master table may use different test id */
  });
  await page.screenshot({ path: join(__dirname, '02-registries-master.png'), fullPage: true });

  for (const key of REGISTRIES) {
    routeResults[key] = await collectRegistry(page, key);
  }

  // Materials create dialog
  await page.goto(`${BASE}/registries/materials`, { waitUntil: 'networkidle2' });
  const createMat = await page.$('[data-test="registry-create"]');
  if (createMat) {
    await createMat.click();
    await page.waitForSelector('pi-dialog, [role="dialog"]', { timeout: 10000 }).catch(() => {});
    await delay(500);
    await page.screenshot({ path: join(__dirname, '04-materials-create-dialog.png'), fullPage: true });
    await page.keyboard.press('Escape');
  }

  // Materials edit
  const editBtn = await page.$('[data-test="registry-row-action-edit-material"]');
  if (editBtn) {
    await editBtn.click();
    await delay(800);
    await page.screenshot({ path: join(__dirname, '05-materials-edit-dialog.png'), fullPage: true });
    await page.keyboard.press('Escape');
  }

  // Materials archive confirm
  const archiveBtn = await page.$('[data-test="registry-row-action-archive-material"]');
  if (archiveBtn) {
    await archiveBtn.click();
    await delay(500);
    await page.screenshot({ path: join(__dirname, '06-materials-archive-confirm.png'), fullPage: true });
    await page.keyboard.press('Escape');
  }

  // Module composition dialog
  await page.goto(`${BASE}/registries/modules`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-test="registry-panel-title"]', { timeout: 15000 });
  const compBtn = await page.$('[data-test="registry-row-action-open-composition"]');
  if (compBtn) {
    await compBtn.click();
    await delay(1200);
    await page.screenshot({ path: join(__dirname, '07-modules-composition-dialog.png'), fullPage: true });
    await page.keyboard.press('Escape');
  }

  // Product composition
  await page.goto(`${BASE}/registries/products`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-test="registry-panel-title"]', { timeout: 15000 });
  const prodComp = await page.$('[data-test="registry-row-action-open-composition"]');
  if (prodComp) {
    await prodComp.click();
    await delay(1200);
    await page.screenshot({ path: join(__dirname, '08-products-composition-dialog.png'), fullPage: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    base: BASE,
    routeResults,
    consoleErrors,
    networkErrors,
    globalConsole,
    pass:
      Object.values(consoleErrors).every((a) => a.length === 0) &&
      Object.values(networkErrors).every((a) => a.length === 0),
  };

  writeFileSync(join(__dirname, 'smoke-report.json'), JSON.stringify(report, null, 2));
  await browser.close();

  console.log(JSON.stringify({ pass: report.pass, routes: Object.keys(routeResults) }, null, 2));
  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
