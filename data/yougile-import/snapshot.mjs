/**
 * One-shot read-only snapshot: YouGile «Рабочая» → data/yougile-import/
 * Requires D:\\kppdf-8.0\\.env.local with YOUGILE_TOKEN.
 * Does NOT mutate YouGile. Does NOT write Mongo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT = __dirname;

function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) throw new Error('Missing .env.local');
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const BOARD = {
  name: 'Рабочая',
  id: '3f29cdfe-6f8f-450c-b465-0e00b6913173',
  columns: [
    { name: 'На распределении', id: 'e140e808-4ddd-44e6-bca1-d7f06c73700b' },
    { name: 'В работе', id: '592a445c-1775-4200-8186-cea8bf0b03ef' },
    { name: 'Завершены', id: '9060a110-e740-4436-8b15-00a97bb2ea76' },
    { name: 'Приостановлены', id: 'b15692a0-905b-4e1a-8408-aaee9c506c1a' },
  ],
};

function parseChatPassport(text) {
  if (!text) return { parseWeak: true };
  const fileMatch = text.match(/user-data\/([0-9a-f-]{36})\//i);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, ' ').trim())
    .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''));

  // Drop trailing file path line(s)
  const clean = lines.filter((l) => !l.includes('/user-data/') && !l.startsWith('/root/#'));

  // Heuristic: first numeric short line often position; next 4-digit-ish = sku
  let position = null;
  let sku = null;
  let name = null;
  let qty = null;
  let unit = null;
  let dimsRaw = null;
  const rest = [];

  let i = 0;
  if (clean[i] && /^\d{1,3}$/.test(clean[i])) {
    position = clean[i++];
  }
  if (clean[i] && /^\d{3,6}$/.test(clean[i])) {
    sku = clean[i++];
  }
  while (clean[i] === '') i++;
  if (clean[i] && !/^\d+(\s*[xх×]\s*\d+)/i.test(clean[i]) && !/^(шт|кг|м|м2|компл)/i.test(clean[i])) {
    name = clean[i++];
  }
  if (clean[i] && /^\d+([.,]\d+)?$/.test(clean[i])) {
    qty = Number(clean[i++].replace(',', '.'));
  }
  if (clean[i] && /^(шт|кг|м|м2|компл|комплект)/i.test(clean[i])) {
    unit = clean[i++];
  }
  if (clean[i] && /\d/.test(clean[i]) && /[xх×]/.test(clean[i])) {
    dimsRaw = clean[i++];
  }
  while (i < clean.length) {
    if (clean[i]) rest.push(clean[i]);
    i++;
  }

  const dimensions = parseDims(dimsRaw);
  const finish = rest.join('\n');
  const descriptionParts = [];
  if (finish) descriptionParts.push(finish);
  if (position) descriptionParts.push(`Позиция в ЗНП: ${position}`);

  return {
    parseWeak: !sku || !name,
    position,
    sku,
    name,
    qty,
    unit: unit || 'шт',
    dimsRaw,
    dimensions,
    finish,
    description: descriptionParts.join('\n\n') || undefined,
    photoFileId: fileMatch?.[1] || null,
  };
}

function parseDims(raw) {
  if (!raw) return undefined;
  const norm = raw.replace(/[×х]/gi, 'x').replace(/\s+/g, '');
  const m = norm.match(/^(\d+(?:[.,]\d+)?)x(\d+(?:[.,]\d+)?)x(\d+(?:[.,]\d+|\?)?)/i);
  if (!m) return undefined;
  const num = (s) => (s === '?' ? undefined : Number(String(s).replace(',', '.')));
  return {
    length: num(m[1]),
    width: num(m[2]),
    height: m[3] === '?' ? undefined : num(m[3]),
    unit: 'мм',
  };
}

async function api(base, token, urlPath) {
  const res = await fetch(`${base}${urlPath}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${urlPath} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function downloadPhoto(token, fileId, dest) {
  const url = `https://ru.yougile.com/user-data/${fileId}/image.png`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`photo ${fileId} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  loadEnvLocal();
  const token = process.env.YOUGILE_TOKEN;
  const base = process.env.YOUGILE_BASE_URL || 'https://ru.yougile.com/api-v2';
  if (!token) throw new Error('YOUGILE_TOKEN missing');

  const photosDir = path.join(OUT, 'photos');
  fs.mkdirSync(photosDir, { recursive: true });

  const rawTasks = [];
  const products = [];
  const bySku = new Map();

  for (const col of BOARD.columns) {
    const page = await api(base, token, `/tasks?columnId=${col.id}&limit=100&offset=0`);
    for (const t of page.content || []) {
      const chat = await api(base, token, `/chats/${t.id}/messages`);
      const msgWithText = (chat.content || []).find((m) => m.text && String(m.text).trim());
      const passport = parseChatPassport(msgWithText?.text || '');
      let photoLocal = null;
      if (passport.photoFileId) {
        const fname = `${t.idTaskProject || t.id}-${passport.sku || 'nosku'}.png`;
        const dest = path.join(photosDir, fname);
        try {
          const size = await downloadPhoto(token, passport.photoFileId, dest);
          photoLocal = { file: `photos/${fname}`, bytes: size, yougileFileId: passport.photoFileId };
        } catch (e) {
          photoLocal = { error: String(e.message || e), yougileFileId: passport.photoFileId };
        }
      }

      const row = {
        yougileTaskId: t.id,
        taskCode: t.idTaskProject || null,
        taskCommon: t.idTaskCommon || null,
        columnId: col.id,
        columnName: col.name,
        boardId: BOARD.id,
        titleRaw: t.title,
        deadlineMs: t.deadline?.deadline ?? null,
        completed: !!t.completed,
        archived: !!t.archived,
        stickers: t.stickers || {},
        chatMessageCount: (chat.content || []).length,
        passport,
        photo: photoLocal,
        productDraft: passport.sku
          ? {
              sku: String(passport.sku),
              name: passport.name || t.title,
              kind: 'good',
              unit: passport.unit || 'шт',
              status: 'active',
              description: passport.description,
              dimensions: passport.dimensions,
              installation: passport.finish?.match(/бетон|монтаж|установ/i)
                ? passport.finish.split('\n')[0]
                : undefined,
              hasDrawing: true,
              notes: [
                `YouGile ${t.idTaskProject || t.id}`,
                `Колонка: ${col.name}`,
                passport.position ? `Поз: ${passport.position}` : null,
                t.title,
              ]
                .filter(Boolean)
                .join('\n'),
              source: {
                yougileTaskId: t.id,
                taskCode: t.idTaskProject,
                columnName: col.name,
                photoFile: photoLocal?.file || null,
              },
            }
          : null,
      };
      rawTasks.push(row);
      if (row.productDraft) {
        const prev = bySku.get(row.productDraft.sku) || [];
        prev.push(row.taskCode);
        bySku.set(row.productDraft.sku, prev);
        products.push(row.productDraft);
      }

      // YouGile: ≤50 req/min — ~3 calls/task (list already done; chat+photo)
      await new Promise((r) => setTimeout(r, 1300));
    }
  }

  // Unique products by sku (keep richest description / with photo)
  const unique = new Map();
  for (const p of products) {
    const cur = unique.get(p.sku);
    if (!cur) {
      unique.set(p.sku, p);
      continue;
    }
    const score = (x) =>
      (x.source?.photoFile ? 2 : 0) + (x.description?.length || 0) + (x.name?.length || 0);
    if (score(p) > score(cur)) unique.set(p.sku, p);
  }

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    companyId: process.env.YOUGILE_COMPANY_ID || null,
    board: BOARD,
    counts: {
      tasks: rawTasks.length,
      byColumn: Object.fromEntries(
        BOARD.columns.map((c) => [c.name, rawTasks.filter((t) => t.columnId === c.id).length]),
      ),
      withPhoto: rawTasks.filter((t) => t.photo?.file).length,
      parseWeak: rawTasks.filter((t) => t.passport?.parseWeak).length,
      uniqueSkus: unique.size,
    },
  };

  fs.writeFileSync(path.join(OUT, 'snapshot-meta.json'), JSON.stringify(snapshot, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT, 'tasks.raw.json'), JSON.stringify(rawTasks, null, 2), 'utf8');
  fs.writeFileSync(
    path.join(OUT, 'products.normalized.json'),
    JSON.stringify([...unique.values()].sort((a, b) => a.sku.localeCompare(b.sku)), null, 2),
    'utf8',
  );
  fs.writeFileSync(
    path.join(OUT, 'sku-to-tasks.json'),
    JSON.stringify(Object.fromEntries([...bySku.entries()].sort()), null, 2),
    'utf8',
  );

  console.log(JSON.stringify(snapshot.counts, null, 2));
  console.log('Wrote snapshot into', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
