#!/usr/bin/env node
/**
 * Re-attach cover photos from data/yougile-import/photos to local products.
 * Uploads via API, then sets photoIds via mongosh (API PATCH breaks on populated photoIds).
 *
 *   node data/yougile-import/seed-photos-fix.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

function argVal(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function login(base, username, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`login ${res.status}`);
  const data = await res.json();
  return data.access || data.accessToken;
}

async function uploadPhoto(base, token, filePath, name) {
  const buf = readFileSync(filePath);
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'image/png' }), name);
  const res = await fetch(`${base}/api/photos/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`upload ${name} → ${res.status} ${text}`);
  const data = JSON.parse(text);
  const photo = data?.data ?? data;
  return String(photo._id || photo.id);
}

function mongoSetPhoto(sku, photoId) {
  const script = `
db = db.getSiblingDB('kppdf');
const r = db.products.updateOne(
  { sku: ${JSON.stringify(sku)}, deletedAt: null },
  { $set: { photoIds: [ObjectId(${JSON.stringify(photoId)})] } }
);
print(JSON.stringify({ sku: ${JSON.stringify(sku)}, matched: r.matchedCount, modified: r.modifiedCount }));
`;
  const r = spawnSync(
    'docker',
    ['exec', '-i', 'kppdf-mongo', 'mongosh', '--quiet', '--eval', script],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) {
    throw new Error(`mongosh ${sku}: ${r.stderr || r.stdout}`);
  }
  return r.stdout.trim();
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, attempts = 10) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (/429|Too Many/i.test(String(e.message))) {
        await sleep(2500 + i * 1500);
        continue;
      }
      throw e;
    }
  }
  throw last;
}

async function main() {
  const base = argVal('--base', 'http://127.0.0.1:3000').replace(/\/$/, '');
  const password = argVal('--password', 'admin123');
  const delayMs = Number(argVal('--delay', '1600'));
  const products = JSON.parse(readFileSync(join(__dirname, 'products.normalized.json'), 'utf8'));

  console.log('Login…');
  const token = await login(base, 'admin', password);

  const stats = { ok: 0, skip: 0, errors: [] };
  for (const p of products) {
    const rel = p.source?.photoFile;
    if (!rel) {
      stats.skip += 1;
      continue;
    }
    const abs = join(__dirname, rel);
    if (!existsSync(abs)) {
      stats.errors.push({ sku: p.sku, message: 'file missing' });
      continue;
    }
    try {
      const photoId = await withRetry(() => uploadPhoto(base, token, abs, `${p.sku}.png`));
      const out = mongoSetPhoto(p.sku, photoId);
      process.stdout.write(`OK ${p.sku} `);
      stats.ok += 1;
      console.log(out);
      await sleep(delayMs);
    } catch (e) {
      stats.errors.push({ sku: p.sku, message: e.message });
      process.stdout.write(`E ${p.sku} `);
      await sleep(delayMs);
    }
  }
  console.log('\n', JSON.stringify(stats, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
