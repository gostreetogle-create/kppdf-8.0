#!/usr/bin/env node
/**
 * Carefully remove only known local demo orphans.
 *
 * Usage:
 *   node scripts/clean-local-demo-orphans.mjs          # dry-run (default)
 *   node scripts/clean-local-demo-orphans.mjs --apply  # apply exactly the listed changes
 *
 * The script deliberately uses the native MongoDB collections through the
 * repository's existing Mongoose dependency. It never drops a database,
 * deletes a whole template/document, or touches catalog/order rows.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BACKEND_ROOT = join(ROOT, 'backend');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function loadConfig() {
  return {
    ...loadEnvFile(join(BACKEND_ROOT, '.env')),
    ...loadEnvFile(join(ROOT, '.env')),
  };
}

function resolveMongoUri(config) {
  const uri = config.MONGODB_URI || config.MONGO_URI;
  if (!uri) {
    return 'mongodb://localhost:27017/kppdf?replicaSet=rs0&directConnection=true';
  }
  return uri;
}

function assertLocalMongo(uri) {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error('Refusing cleanup: MONGO_URI is not a valid MongoDB URI');
  }

  if (parsed.protocol !== 'mongodb:' && parsed.protocol !== 'mongodb+srv:') {
    throw new Error(`Refusing cleanup: unsupported MongoDB protocol ${parsed.protocol}`);
  }
  if (parsed.protocol === 'mongodb+srv:') {
    throw new Error('Refusing cleanup: mongodb+srv is remote/ambiguous; use localhost/docker Mongo only');
  }

  const hosts = parsed.host
    .split(',')
    .map((host) => host.trim().replace(/:\d+$/, '').toLowerCase())
    .filter(Boolean);
  const allowedHosts = new Set(['localhost', '127.0.0.1', '::1', 'mongo', 'kppdf-mongo']);
  if (hosts.length === 0 || hosts.some((host) => !allowedHosts.has(host))) {
    throw new Error(
      `Refusing cleanup: Mongo target is not local/docker-only (${hosts.join(', ') || 'unknown host'})`,
    );
  }
  if (/prod|production|synology/i.test(uri)) {
    throw new Error('Refusing cleanup: URI looks like production/Synology');
  }
}

function displayId(value) {
  return value?.toString?.() ?? String(value);
}

function idKey(value) {
  return displayId(value);
}

function isImageUrl(value) {
  return typeof value === 'string' && value.startsWith('/uploads/') && !value.includes('..');
}

function imageFilePath(url, uploadRoot) {
  if (!isImageUrl(url)) return null;
  const suffix = url.slice('/uploads/'.length);
  const root = resolve(uploadRoot);
  const candidate = resolve(root, normalize(suffix));
  const rel = relative(root, candidate);
  if (rel.startsWith('..') || isAbsolute(rel)) return null;
  return candidate;
}

function hasImageFile(url, uploadRoot) {
  const path = imageFilePath(url, uploadRoot);
  return path !== null && existsSync(path);
}

function addBrokenRef(map, url, location) {
  if (!isImageUrl(url)) return;
  const key = `${location.collection}:${location.documentId}:${location.fieldPath}:${url}`;
  if (!map.has(key)) map.set(key, { url, ...location });
}

function inspectImageValue(value, location, uploadRoot, broken) {
  if (typeof value === 'string') {
    if (isImageUrl(value) && !hasImageFile(value, uploadRoot)) {
      addBrokenRef(broken, value, location);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      inspectImageValue(
        entry,
        { ...location, fieldPath: `${location.fieldPath}[${index}]` },
        uploadRoot,
        broken,
      ),
    );
    return;
  }
  if (!value || typeof value !== 'object') return;

  // The known Doc Studio shapes are intentionally explicit. We do not scan
  // arbitrary string fields, which prevents removing unrelated URLs or text.
  if (location.fieldPath === 'backgroundImage' || location.fieldPath.endsWith('.imageUrl')) {
    return;
  }
  if ('imageUrl' in value) {
    inspectImageValue(
      value.imageUrl,
      { ...location, fieldPath: `${location.fieldPath}.imageUrl` },
      uploadRoot,
      broken,
    );
  }
  if ('url' in value && (value.kind === 'image' || value.type === 'image')) {
    inspectImageValue(
      value.url,
      { ...location, fieldPath: `${location.fieldPath}.url` },
      uploadRoot,
      broken,
    );
  }
}

function collectBrokenDocStudioImages(db, uploadRoot) {
  const broken = new Map();
  const templateDocs = db.collection('document_templates').find(
    { backgroundImage: { $exists: true, $type: 'array' } },
    { projection: { backgroundImage: 1 } },
  );
  return (async () => {
    for await (const doc of templateDocs) {
      (doc.backgroundImage ?? []).forEach((url, index) => {
        if (!hasImageFile(url, uploadRoot)) {
          addBrokenRef(broken, url, {
            collection: 'document_templates',
            documentId: doc._id,
            fieldPath: `backgroundImage[${index}]`,
          });
        }
      });
    }

    const studioDocs = db.collection('studio_documents').find(
      { backgroundImage: { $exists: true, $type: 'array' } },
      { projection: { backgroundImage: 1 } },
    );
    for await (const doc of studioDocs) {
      (doc.backgroundImage ?? []).forEach((url, index) => {
        if (!hasImageFile(url, uploadRoot)) {
          addBrokenRef(broken, url, {
            collection: 'studio_documents',
            documentId: doc._id,
            fieldPath: `backgroundImage[${index}]`,
          });
        }
      });
    }

    const blocks = db.collection('template_blocks').find(
      {
        $or: [
          { 'settings.imageUrl': { $exists: true } },
          { 'settings.image': { $exists: true } },
          { 'settings.url': { $exists: true } },
          { 'settings.image.url': { $exists: true } },
          { content: { $regex: /^\/uploads\// } },
        ],
      },
      { projection: { settings: 1, type: 1, content: 1, parentType: 1, parentId: 1, templateId: 1 } },
    );
    for await (const block of blocks) {
      const settings = block.settings;
      const blockLocation = {
        collection: 'template_blocks',
        documentId: block._id,
        fieldPath: 'settings',
      };
      if (block.type === 'image') {
        inspectImageValue(
          block.content,
          { ...blockLocation, fieldPath: 'content' },
          uploadRoot,
          broken,
        );
      }
      if (settings && typeof settings === 'object') {
        if ('imageUrl' in settings) {
          inspectImageValue(settings.imageUrl, { ...blockLocation, fieldPath: 'settings.imageUrl' }, uploadRoot, broken);
        }
        if (settings.image && typeof settings.image === 'object') {
          inspectImageValue(settings.image, { ...blockLocation, fieldPath: 'settings.image' }, uploadRoot, broken);
        }
        if (settings.url && block.type === 'image') {
          inspectImageValue(settings.url, { ...blockLocation, fieldPath: 'settings.url' }, uploadRoot, broken);
        }
      }
    }
    return broken;
  })();
}

async function findOrphans(db) {
  const orders = new Set();
  const orderCursor = db.collection('orders').find({}, { projection: { _id: 1 } });
  for await (const order of orderCursor) orders.add(idKey(order._id));

  const supplyOrphans = [];
  for (const collection of ['supplyrequests', 'supplytasks']) {
    const cursor = db.collection(collection).find(
      { orderId: { $exists: true, $ne: null } },
      { projection: { orderId: 1 } },
    );
    for await (const doc of cursor) {
      if (!orders.has(idKey(doc.orderId))) {
        supplyOrphans.push({ collection, _id: doc._id, orderId: doc.orderId });
      }
    }
  }

  const products = new Set();
  const productCursor = db.collection('products').find({}, { projection: { _id: 1 } });
  for await (const product of productCursor) products.add(idKey(product._id));

  const materials = new Set();
  const materialCursor = db.collection('materials').find({}, { projection: { _id: 1 } });
  for await (const material of materialCursor) materials.add(idKey(material._id));

  const movementOrphans = [];
  const movementCursor = db.collection('stockmovements').find(
    {
      $or: [
        { productId: { $exists: true, $ne: null } },
        { materialId: { $exists: true, $ne: null } },
      ],
    },
    { projection: { productId: 1, materialId: 1 } },
  );
  for await (const movement of movementCursor) {
    const productMissing = movement.productId != null && !products.has(idKey(movement.productId));
    const materialMissing = movement.materialId != null && !materials.has(idKey(movement.materialId));
    if (productMissing || materialMissing) {
      movementOrphans.push({
        collection: 'stockmovements',
        _id: movement._id,
        productId: movement.productId,
        materialId: movement.materialId,
        reason: productMissing ? 'product missing' : 'material missing',
      });
    }
  }

  return { supplyOrphans, movementOrphans };
}

async function applySupplyOrphans(db, candidates) {
  const applied = [];
  for (const candidate of candidates) {
    const result = await db.collection(candidate.collection).deleteOne({ _id: candidate._id });
    if (result.deletedCount === 1) applied.push(candidate);
  }
  return applied;
}

async function applyMovementOrphans(db, candidates) {
  const applied = [];
  for (const candidate of candidates) {
    const result = await db.collection('stockmovements').deleteOne({ _id: candidate._id });
    if (result.deletedCount === 1) applied.push(candidate);
  }
  return applied;
}

async function applyBrokenImages(db, broken) {
  const applied = [];
  const grouped = new Map();
  for (const ref of broken.values()) {
    const key = `${ref.collection}:${ref.documentId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(ref);
  }

  for (const refs of grouped.values()) {
    const first = refs[0];
    const collection = db.collection(first.collection);
    const doc = await collection.findOne({ _id: first.documentId });
    if (!doc) continue;

    const set = {};
    const unset = {};
    const backgroundIndexes = new Set();
    for (const ref of refs) {
      const path = ref.fieldPath;
      if (path === 'content') {
        if (doc.type === 'image' && doc.content === ref.url) {
          unset.content = '';
          applied.push(ref);
        }
      } else if (/^backgroundImage\[\d+\]$/.test(path)) {
        const index = Number(path.match(/\[(\d+)\]$/)[1]);
        const current = doc.backgroundImage;
        if (Array.isArray(current) && current[index] === ref.url) {
          backgroundIndexes.add(index);
          applied.push(ref);
        }
      } else if (/^settings\.(imageUrl|url|image\.url)$/.test(path)) {
        const settingsPath = path.slice('settings.'.length).split('.');
        let current = doc.settings;
        for (const segment of settingsPath) current = current?.[segment];
        if (current === ref.url) {
          unset[path] = '';
          applied.push(ref);
        }
      }
    }
    if (backgroundIndexes.size > 0) {
      const current = doc.backgroundImage;
      const next = current.filter((_, index) => !backgroundIndexes.has(index));
      set.backgroundImage = next;
      if (doc.defaultBackgroundIndex >= next.length) {
        set.defaultBackgroundIndex = next.length ? 0 : -1;
      }
    }

    if (Object.keys(set).length > 0 || Object.keys(unset).length > 0) {
      const update = {};
      if (Object.keys(set).length > 0) update.$set = set;
      if (Object.keys(unset).length > 0) update.$unset = unset;
      await collection.updateOne({ _id: first.documentId }, update);
    }
  }
  return applied;
}

function printCandidates(label, rows) {
  console.log(`\n${label}: ${rows.length}`);
  for (const row of rows) {
    const details = Object.entries(row)
      .filter(([key]) => key !== 'collection')
      .map(([key, value]) => `${key}=${displayId(value)}`)
      .join(' ');
    console.log(`  - ${row.collection ?? ''} ${details}`.trim());
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing cleanup when NODE_ENV=production');
  }

  const apply = process.argv.slice(2).includes('--apply');
  const config = loadConfig();
  const uri = resolveMongoUri(config);
  assertLocalMongo(uri);
  const dbName = config.MONGO_DB || new URL(uri).pathname.replace(/^\//, '').split('?')[0] || 'kppdf';
  const uploadRoot = resolve(config.UPLOAD_DIR || join(BACKEND_ROOT, 'uploads'));

  const { default: mongoose } = await import(
    pathToFileURL(join(BACKEND_ROOT, 'node_modules', 'mongoose', 'index.js')).href,
  );
  await mongoose.connect(uri, { dbName, directConnection: true });
  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection did not expose a database');

  try {
    console.log(`${apply ? 'APPLY' : 'DRY-RUN'} local demo orphan cleanup`);
    console.log(`Mongo target: ${uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@/]+)@/, '$1<redacted>@')}`);
    console.log(`Database: ${dbName}`);
    console.log(`Upload root: ${uploadRoot}`);

    const { supplyOrphans, movementOrphans } = await findOrphans(db);
    const broken = await collectBrokenDocStudioImages(db, uploadRoot);
    const brokenRows = Array.from(broken.values());

    printCandidates('SupplyRequest/SupplyTask orphan rows', supplyOrphans);
    printCandidates('StockMovement hard-missing reference rows', movementOrphans);
    printCandidates('Doc Studio broken image refs', brokenRows);

    const counts = {
      supplyOrphans: supplyOrphans.length,
      movementOrphans: movementOrphans.length,
      brokenStudioImages: brokenRows.length,
    };

    if (apply) {
      const appliedSupply = await applySupplyOrphans(db, supplyOrphans);
      const appliedMovements = await applyMovementOrphans(db, movementOrphans);
      const appliedImages = await applyBrokenImages(db, broken);
      console.log('\nApplied counts:');
      console.log(JSON.stringify({
        supplyDeleted: appliedSupply.length,
        movementsDeleted: appliedMovements.length,
        studioRefsFixed: appliedImages.length,
      }, null, 2));
      console.log('\nApplied IDs:');
      printCandidates('Supply deleted', appliedSupply);
      printCandidates('Movements deleted', appliedMovements);
      printCandidates('Studio refs fixed', appliedImages);
    }

    console.log('\nCounts JSON:');
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...counts }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
