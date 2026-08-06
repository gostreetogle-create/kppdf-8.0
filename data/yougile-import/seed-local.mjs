#!/usr/bin/env node
/**
 * Seed local Mongo from data/yougile-import (YouGile «Рабочая» snapshot).
 * Read-only w.r.t. YouGile. Idempotent by Product.sku.
 *
 *   node data/yougile-import/seed-local.mjs
 *   node data/yougile-import/seed-local.mjs --base http://127.0.0.1:3000
 */
import { readFileSync, existsSync, createReadStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function argVal(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function extractRal(text = '') {
  const m = text.match(/RAL\s*([0-9]{4})/i);
  return m ? `RAL ${m[1]}` : undefined;
}

async function login(base, username, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`login ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const token = data.access || data.accessToken;
  if (!token) throw new Error('login: no access token');
  return token;
}

async function api(base, token, method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function uploadPhoto(base, token, filePath, originalName) {
  const fd = new FormData();
  const buf = readFileSync(filePath);
  fd.append('file', new Blob([buf], { type: 'image/png' }), originalName);
  const res = await fetch(`${base}/api/photos/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`upload ${originalName} → ${res.status} ${text}`);
  // SilentResult or raw Photo
  const photo = data?.data ?? data;
  const id = photo?._id || photo?.id;
  if (!id) throw new Error(`upload: no photo id in ${text.slice(0, 200)}`);
  return String(id);
}

async function findBySku(base, token, sku) {
  const q = new URLSearchParams({ page: '1', limit: '50', search: sku });
  const list = await api(base, token, 'GET', `/api/products?${q}`);
  const items = list.items || list.data || [];
  return items.find((p) => String(p.sku) === String(sku)) || null;
}

async function withRetry(fn, label, attempts = 8) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const status = e.status || e.message?.match(/→\s*(\d+)/)?.[1];
      if (String(status) === '429' || /Too Many Requests/i.test(e.message || '')) {
        const wait = 2000 + i * 1500;
        process.stdout.write(`(429 wait ${wait}ms) `);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
  throw last;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refuse: NODE_ENV=production');
    process.exit(2);
  }

  const env = { ...loadEnvFile(join(ROOT, 'backend', '.env')), ...loadEnvFile(join(ROOT, '.env')) };
  const base = argVal('--base', 'http://127.0.0.1:3000').replace(/\/$/, '');
  const username = argVal('--user', env.ADMIN_USERNAME || 'admin');
  const password = argVal('--password', env.ADMIN_PASSWORD || 'admin123');
  const delayMs = Number(argVal('--delay', '1200'));

  const productsPath = join(__dirname, 'products.normalized.json');
  const products = JSON.parse(readFileSync(productsPath, 'utf8'));

  console.log(`Login ${username} @ ${base} … delay=${delayMs}ms`);
  const token = await login(base, username, password);
  console.log(`Products to upsert: ${products.length}`);

  const stats = { created: 0, updated: 0, photos: 0, skipped: 0, errors: [] };

  for (const p of products) {
    try {
      let photoIds = [];
      if (p.source?.photoFile) {
        const abs = join(__dirname, p.source.photoFile);
        if (existsSync(abs)) {
          const id = await withRetry(
            () => uploadPhoto(base, token, abs, `${p.sku}.png`),
            `photo ${p.sku}`,
          );
          photoIds = [id];
          stats.photos += 1;
        }
      }

      const ral =
        extractRal(p.description || '') ||
        extractRal(p.notes || '') ||
        (p.ralCode ? String(p.ralCode) : undefined);

      const payload = {
        name: p.name,
        sku: String(p.sku),
        kind: p.kind || 'good',
        unit: (p.unit && String(p.unit).length <= 16 ? p.unit : 'шт'),
        status: p.status || 'active',
        isActive: true,
        description: p.description || undefined,
        notes: p.notes || undefined,
        dimensions: p.dimensions || undefined,
        installation: p.installation ? String(p.installation).slice(0, 256) : undefined,
        hasDrawing: true,
        photoIds: photoIds.length ? photoIds : undefined,
        ralCode: ral ? ral.replace(/^RAL\s*/i, '').slice(0, 16) : undefined,
      };

      for (const k of Object.keys(payload)) {
        if (payload[k] === undefined) delete payload[k];
      }

      const existing = await withRetry(
        () => findBySku(base, token, p.sku),
        `find ${p.sku}`,
      );
      if (existing?._id) {
        await withRetry(
          () => api(base, token, 'PATCH', `/api/products/${existing._id}`, payload),
          `patch ${p.sku}`,
        );
        stats.updated += 1;
        process.stdout.write(`U ${p.sku} `);
      } else {
        await withRetry(
          () => api(base, token, 'POST', `/api/products`, payload),
          `post ${p.sku}`,
        );
        stats.created += 1;
        process.stdout.write(`C ${p.sku} `);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    } catch (e) {
      stats.errors.push({ sku: p.sku, message: e.message, data: e.data });
      process.stdout.write(`E ${p.sku} `);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log('\n---');
  console.log(JSON.stringify({ ...stats, errorCount: stats.errors.length }, null, 2));
  if (stats.errors.length) {
    console.log('errors sample:', JSON.stringify(stats.errors.slice(0, 5), null, 2));
  }

  await new Promise((r) => setTimeout(r, 3000));
  const verify = await withRetry(
    () => api(base, token, 'GET', '/api/products?page=1&limit=5&search=3101'),
    'verify',
  );
  console.log('verify search 3101:', {
    total: verify.total,
    sample: (verify.items || []).slice(0, 2).map((x) => ({
      sku: x.sku,
      name: x.name,
      photos: (x.photoIds || []).length,
    })),
  });

  const all = await withRetry(
    () => api(base, token, 'GET', '/api/products?page=1&limit=1'),
    'total',
  );
  console.log('products total now:', all.total);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
