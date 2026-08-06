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
  // Unit must be short (API max 16). Long lines are mis-parsed titles → description.
  if (clean[i] && /^(шт|кг|м|м2|м²|компл|комплект)\b/i.test(clean[i]) && clean[i].length <= 16) {
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
  };
}

/**
 * YouGile REST не отдаёт флаг «обложка».
 * Обложку ставят через чат («Сделать обложкой») — это почти всегда
 * отдельное сообщение только с файлом, а НЕ картинка из строки паспорта
 * (скрин таблицы ~1369×94 / preview *x24).
 */
function extractChatImages(messages) {
  const out = [];
  for (const m of messages || []) {
    const text = String(m.text || '').trim();
    if (!text) continue;
    const isImageOnly = /^\/root\/#file:\/user-data\//i.test(text);
    const re =
      /user-data\/([0-9a-f-]{36})\/image\.png(?:%3Fpreviews%5B%5D%3D-256-preview%40(\d+)x(\d+))?/gi;
    let match;
    while ((match = re.exec(text)) !== null) {
      const previewW = match[2] ? Number(match[2]) : null;
      const previewH = match[3] ? Number(match[3]) : null;
      out.push({
        fileId: match[1],
        isImageOnly,
        isStripPreview: previewH != null && previewH < 80,
        previewW,
        previewH,
        messageId: m.id,
      });
    }
  }
  return out;
}

function pngDimensions(buf) {
  if (!buf || buf.length < 24 || buf[0] !== 0x89) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function isLikelyCoverPng(buf) {
  const d = pngDimensions(buf);
  if (!d) return false;
  // Reject passport table scrapes and other ultra-wide strips
  if (d.height < 150) return false;
  if (d.width / d.height > 6) return false;
  return true;
}

function rankCoverCandidates(images) {
  // 1) dedicated chat images (cover workflow)
  // 2) any non-strip embeds
  // 3) leftovers
  const pure = images.filter((i) => i.isImageOnly && !i.isStripPreview);
  if (pure.length) return pure;
  const nonStrip = images.filter((i) => !i.isStripPreview);
  if (nonStrip.length) return nonStrip;
  return images;
}

async function downloadCoverPhoto(token, images, dest) {
  const ranked = rankCoverCandidates(images);
  const tried = [];
  for (const cand of ranked) {
    const url = `https://ru.yougile.com/user-data/${cand.fileId}/image.png`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      tried.push({ fileId: cand.fileId, error: res.status });
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dims = pngDimensions(buf);
    if (!isLikelyCoverPng(buf)) {
      tried.push({ fileId: cand.fileId, rejected: 'strip-or-tiny', dims });
      continue;
    }
    fs.writeFileSync(dest, buf);
    return {
      bytes: buf.length,
      yougileFileId: cand.fileId,
      dims,
      isImageOnly: cand.isImageOnly,
      tried,
    };
  }
  return { error: 'no suitable cover image', tried, candidates: ranked.length };
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
      const messages = chat.content || [];
      // Passport lives in the first non-image-only text message
      const passportMsg = messages.find((m) => {
        const text = String(m.text || '').trim();
        return text && !/^\/root\/#file:\/user-data\//i.test(text);
      });
      const passport = parseChatPassport(passportMsg?.text || '');
      const images = extractChatImages(messages);

      let photoLocal = null;
      const fname = `${t.idTaskProject || t.id}-${passport.sku || 'nosku'}.png`;
      const dest = path.join(photosDir, fname);
      if (images.length) {
        try {
          const cover = await downloadCoverPhoto(token, images, dest);
          if (cover.yougileFileId) {
            photoLocal = {
              file: `photos/${fname}`,
              bytes: cover.bytes,
              yougileFileId: cover.yougileFileId,
              dims: cover.dims,
              pick: 'chat-image-only-cover-heuristic',
              isImageOnly: cover.isImageOnly,
              rejected: cover.tried,
            };
          } else {
            photoLocal = cover;
          }
        } catch (e) {
          photoLocal = { error: String(e.message || e) };
        }
      }

      const safeUnit =
        passport.unit && String(passport.unit).length <= 16 ? passport.unit : 'шт';

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
        chatMessageCount: messages.length,
        chatImages: images,
        passport,
        photo: photoLocal,
        productDraft: passport.sku
          ? {
              sku: String(passport.sku),
              name: passport.name || t.title,
              kind: 'good',
              unit: safeUnit,
              status: 'active',
              description: passport.description,
              dimensions: passport.dimensions,
              installation: passport.finish?.match(/бетон|монтаж|установ/i)
                ? passport.finish.split('\n')[0].slice(0, 256)
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
                photoFileId: photoLocal?.yougileFileId || null,
                photoPick: photoLocal?.pick || null,
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

      // YouGile: ≤50 req/min — chat + 1–N photo downloads
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
    photoPolicy:
      'Prefer first image-only chat message (YouGile «Сделать обложкой»); reject passport table scrapes (ultra-wide / tiny height).',
    counts: {
      tasks: rawTasks.length,
      byColumn: Object.fromEntries(
        BOARD.columns.map((c) => [c.name, rawTasks.filter((t) => t.columnId === c.id).length]),
      ),
      withPhoto: rawTasks.filter((t) => t.photo?.file).length,
      coverHeuristic: rawTasks.filter((t) => t.photo?.pick === 'chat-image-only-cover-heuristic').length,
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
