#!/usr/bin/env node
/**
 * Загрузка реалистичных данных каталога + заказов в локальную Mongo.
 * Прямое подключение (mongoose) — без API, идемпотентно по стабильным ключам.
 *
 * Режимы:
 *   node scripts/seed-catalog-data.mjs --inspect   # только посмотреть (read-only)
 *   node scripts/seed-catalog-data.mjs             # чистка демо/битых записей + загрузка
 *
 * НЕ трогает системные данные: users, statuses, categories, units, permissions,
 * settings, workflows, doc-types и пр.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

const env = { ...loadEnvFile(join(ROOT, 'backend', '.env')), ...loadEnvFile(join(ROOT, '.env')) };
const URI =
  env.MONGODB_URI || env.MONGO_URI || 'mongodb://localhost:27017/kppdf?replicaSet=rs0&directConnection=true';

const { default: mongoose } = await import(pathToFileURL(join(ROOT, 'backend', 'node_modules', 'mongoose', 'index.js')).href);
const { Types } = mongoose;

// ── helpers ────────────────────────────────────────────────────────────────
function inn10(seed) {
  const base = String(770000000 + (seed % 100000)).padStart(9, '0').slice(0, 9);
  const coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += coeffs[i] * Number(base[i]);
  return base + String((sum % 11) % 10);
}

function daysFromToday(offset) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

const DEMO_RE = /демо|тест|демо|demo|test|локал|local|demo5/i;
const MOJI_RE = /\?{2,}/;

// ── work types ─────────────────────────────────────────────────────────────
const WORK_TYPES = [
  { key: 'cut', name: 'Резка металла', section: 'Производство', department: 'Заготовительный участок', days: 1, hourlyRate: 750 },
  { key: 'weld', name: 'Сварка', section: 'Производство', department: 'Сварочный участок', days: 2, hourlyRate: 950 },
  { key: 'bend', name: 'Гибочные работы', section: 'Производство', department: 'Заготовительный участок', days: 1, hourlyRate: 700 },
  { key: 'locksmith', name: 'Слесарная обработка', section: 'Производство', department: 'Слесарный участок', days: 2, hourlyRate: 800 },
  { key: 'paint', name: 'Покраска', section: 'Производство', department: 'Покрасочная камера', days: 3, hourlyRate: 850 },
  { key: 'assembly', name: 'Сборка', section: 'Производство', department: 'Сборочный участок', days: 2, hourlyRate: 800 },
  { key: 'pack', name: 'Упаковка', section: 'Логистика', department: 'Участок упаковки', days: 1, hourlyRate: 600 },
  { key: 'install', name: 'Монтаж', section: 'Логистика', department: 'Выездная бригада', days: 2, hourlyRate: 1100 },
];

// ── materials ──────────────────────────────────────────────────────────────
const MATERIALS = [
  { key: 'МТ-101', name: 'Труба профильная 40×20×2 мм', article: 'МТ-101', kind: 'raw', unit: 'м', price: 320, stock: 480, grade: 'Ст3сп', weightKg: 1.7 },
  { key: 'МТ-102', name: 'Труба профильная 60×30×2 мм', article: 'МТ-102', kind: 'raw', unit: 'м', price: 420, stock: 360, grade: 'Ст3сп', weightKg: 2.6 },
  { key: 'МТ-103', name: 'Труба профильная 20×20×1,5 мм', article: 'МТ-103', kind: 'raw', unit: 'м', price: 140, stock: 600, grade: 'Ст3сп', weightKg: 0.9 },
  { key: 'МТ-104', name: 'Лист стальной 2 мм', article: 'МТ-104', kind: 'raw', unit: 'м²', price: 1450, stock: 120, grade: 'Ст3сп', weightKg: 15.7 },
  { key: 'МТ-105', name: 'Лист оцинкованный 1,5 мм', article: 'МТ-105', kind: 'raw', unit: 'м²', price: 1280, stock: 90, grade: '08пс', weightKg: 11.8 },
  { key: 'МТ-106', name: 'Уголок стальной 40×40×3 мм', article: 'МТ-106', kind: 'raw', unit: 'м', price: 260, stock: 220, grade: 'Ст3сп', weightKg: 1.9 },
  { key: 'МТ-107', name: 'Полоса стальная 25×4 мм', article: 'МТ-107', kind: 'raw', unit: 'м', price: 90, stock: 300, grade: 'Ст3сп', weightKg: 0.8 },
  { key: 'МТ-108', name: 'Пруток стальной Ø10 мм', article: 'МТ-108', kind: 'raw', unit: 'м', price: 60, stock: 500, grade: 'Ст3сп', weightKg: 0.6 },
  { key: 'МТ-109', name: 'Грунт-эмаль по металлу', article: 'МТ-109', kind: 'purchased', unit: 'л', price: 540, stock: 60 },
  { key: 'МТ-110', name: 'Краска порошковая RAL 7016', article: 'МТ-110', kind: 'purchased', unit: 'кг', price: 690, stock: 80 },
  { key: 'МТ-111', name: 'Крепёж нержавеющий (комплект)', article: 'МТ-111', kind: 'fastener', unit: 'компл', price: 180, stock: 240 },
  { key: 'МТ-112', name: 'Петля сварная усиленная', article: 'МТ-112', kind: 'part', unit: 'шт', price: 95, stock: 150 },
  { key: 'МТ-113', name: 'Замок врезной', article: 'МТ-113', kind: 'part', unit: 'шт', price: 1250, stock: 40 },
  { key: 'МТ-114', name: 'Ручка-скоба', article: 'МТ-114', kind: 'part', unit: 'шт', price: 210, stock: 90 },
  { key: 'МТ-115', name: 'Уплотнитель резиновый', article: 'МТ-115', kind: 'purchased', unit: 'м', price: 75, stock: 400 },
  { key: 'МТ-116', name: 'Электрод сварочный Ø3 мм', article: 'МТ-116', kind: 'purchased', unit: 'кг', price: 210, stock: 180 },
];

// ── modules: materials (by material key) + work types (by work-type key) ────
const MODULES = [
  { key: 'МД-201', name: 'Каркас перголы', article: 'МД-201', materials: ['МТ-102', 'МТ-101', 'МТ-116'], wts: ['cut', 'weld', 'paint'], weight: 46 },
  { key: 'МД-202', name: 'Решётка декоративная', article: 'МД-202', materials: ['МТ-107', 'МТ-103', 'МТ-116'], wts: ['cut', 'weld', 'paint'], weight: 18 },
  { key: 'МД-203', name: 'Рама калитки', article: 'МД-203', materials: ['МТ-101', 'МТ-116'], wts: ['cut', 'weld', 'paint'], weight: 14 },
  { key: 'МД-204', name: 'Заполнение калитки', article: 'МД-204', materials: ['МТ-104', 'МТ-103'], wts: ['cut', 'bend', 'paint'], weight: 12 },
  { key: 'МД-205', name: 'Петли и фурнитура', article: 'МД-205', materials: ['МТ-112', 'МТ-114', 'МТ-113'], wts: ['assembly'], weight: 3 },
  { key: 'МД-206', name: 'Створка ворот', article: 'МД-206', materials: ['МТ-102', 'МТ-104'], wts: ['cut', 'weld', 'paint'], weight: 62 },
  { key: 'МД-207', name: 'Секция забора', article: 'МД-207', materials: ['МТ-101', 'МТ-103', 'МТ-105'], wts: ['cut', 'weld', 'paint'], weight: 28 },
  { key: 'МД-208', name: 'Столб забора', article: 'МД-208', materials: ['МТ-102', 'МТ-109'], wts: ['cut', 'weld', 'paint'], weight: 9 },
  { key: 'МД-209', name: 'Каркас двери', article: 'МД-209', materials: ['МТ-102', 'МТ-106'], wts: ['cut', 'weld', 'paint'], weight: 34 },
  { key: 'МД-210', name: 'Полотно двери', article: 'МД-210', materials: ['МТ-104', 'МТ-115'], wts: ['cut', 'bend', 'paint'], weight: 40 },
  { key: 'МД-211', name: 'Каркас навеса', article: 'МД-211', materials: ['МТ-102', 'МТ-101'], wts: ['cut', 'weld', 'paint'], weight: 52 },
  { key: 'МД-212', name: 'Кровельное покрытие', article: 'МД-212', materials: ['МТ-105', 'МТ-111'], wts: ['bend', 'assembly'], weight: 22 },
  { key: 'МД-213', name: 'Секция ограждения', article: 'МД-213', materials: ['МТ-103', 'МТ-108'], wts: ['cut', 'weld', 'paint'], weight: 16 },
  { key: 'МД-214', name: 'Поручень', article: 'МД-214', materials: ['МТ-101'], wts: ['cut', 'bend', 'paint'], weight: 8 },
  { key: 'МД-215', name: 'Рама стеллажа', article: 'МД-215', materials: ['МТ-101', 'МТ-106'], wts: ['cut', 'weld', 'paint'], weight: 30 },
  { key: 'МД-216', name: 'Полка стеллажа', article: 'МД-216', materials: ['МТ-105'], wts: ['cut', 'bend'], weight: 15 },
  { key: 'МД-217', name: 'Корпус мангала', article: 'МД-217', materials: ['МТ-104', 'МТ-106'], wts: ['cut', 'weld', 'paint'], weight: 26 },
  { key: 'МД-218', name: 'Крыша мангала', article: 'МД-218', materials: ['МТ-103', 'МТ-105'], wts: ['cut', 'weld', 'paint'], weight: 11 },
  { key: 'МД-219', name: 'Решётка мангала', article: 'МД-219', materials: ['МТ-108', 'МТ-107'], wts: ['cut', 'weld'], weight: 6 },
  { key: 'МД-220', name: 'Крепёжный комплект', article: 'МД-220', materials: ['МТ-111', 'МТ-109'], wts: ['pack'], weight: 2 },
  { key: 'МД-221', name: 'Финишная сборка', article: 'МД-221', materials: ['МТ-111'], wts: ['assembly', 'pack'], weight: 1 },
];

// ── products (goods): modules by module key ─────────────────────────────────
const PRODUCTS = [
  { sku: '4001', name: 'Пергола «Комфорт» 3000×3000', mods: ['МД-201', 'МД-202', 'МД-221'], price: 168000, desc: 'Алюминизированная сталь, порошковая покраска RAL 7016', dims: { length: 3000, width: 3000, height: 2400 } },
  { sku: '4002', name: 'Калитка «Классик» 1000×2000', mods: ['МД-203', 'МД-204', 'МД-205', 'МД-221'], price: 46500, desc: 'Сварная рама, заполнение лист 2 мм, замок и ручка', dims: { width: 1000, height: 2000 } },
  { sku: '4003', name: 'Ворота распашные 3000×2000', mods: ['МД-206', 'МД-205', 'МД-221'], price: 128000, desc: 'Две створки, усиленные петли, покраска RAL 6005', dims: { width: 3000, height: 2000 } },
  { sku: '4004', name: 'Забор секционный «Гранит»', mods: ['МД-207', 'МД-208', 'МД-220', 'МД-221'], price: 5400, desc: 'Секция 2,5 м с столбом, оцинкованная сталь', dims: { width: 2500, height: 1500 } },
  { sku: '4005', name: 'Дверь входная «Гарда» 950×2050', mods: ['МД-209', 'МД-210', 'МД-205', 'МД-221'], price: 94000, desc: 'Металлическая дверь с уплотнением, замок 3-го класса', dims: { width: 950, height: 2050 } },
  { sku: '4006', name: 'Навес «Волна» 4000×6000', mods: ['МД-211', 'МД-212', 'МД-220', 'МД-221'], price: 212000, desc: 'Каркас 60×30, кровля оцинкованный лист', dims: { length: 4000, width: 6000, height: 2800 } },
  { sku: '4007', name: 'Ограждение лестницы «Ритм»', mods: ['МД-213', 'МД-214', 'МД-221'], price: 9800, desc: 'Секция 1 м с поручнем, пруток Ø10', dims: { width: 1000, height: 900 } },
  { sku: '4008', name: 'Стеллаж складской 2000×600×2500', mods: ['МД-215', 'МД-216', 'МД-220', 'МД-221'], price: 18600, desc: 'Четыре полки, нагрузка до 300 кг', dims: { length: 2000, width: 600, height: 2500 } },
  { sku: '4009', name: 'Козырёк над входом «Капля»', mods: ['МД-211', 'МД-212', 'МД-221'], price: 74000, desc: 'Кованый каркас, поликарбонат', dims: { length: 1600, width: 1000 } },
  { sku: '4010', name: 'Мангал с крышей «Очаг»', mods: ['МД-217', 'МД-218', 'МД-219', 'МД-221'], price: 49000, desc: 'Корпус 2 мм, крыша, решётка, колёса', dims: { length: 1100, width: 550, height: 1900 } },
];

// ── suppliers (organizations) ──────────────────────────────────────────────
const SUPPLIERS = [
  { name: 'ООО «СтальПро»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «МеталлТрейд»', type: ['supplier'], legalType: 'ooo' },
  { name: 'АО «Лакокраска-Сервис»', type: ['supplier'], legalType: 'ao' },
  { name: 'ООО «КрепёжКомплект»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «Профнастил-М»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «Сварочные технологии»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «Алюм-Профиль»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «ТехМет»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ООО «КомплектСнаб»', type: ['supplier'], legalType: 'ooo' },
  { name: 'ИП Сергеев А.В.', type: ['supplier'], legalType: 'ip' },
];

// ── clients (counterparties) ───────────────────────────────────────────────
const CLIENTS = [
  { name: 'ООО «СтройГрад»', site: 'Объект «Северный парк»', address: 'г. Москва, ул. Полярная, 12' },
  { name: 'ООО «Загородный Дом»', site: 'Коттеджный посёлок «Сосны»', address: 'Московская обл., д. Пирогово' },
  { name: 'АО «Торговая сеть „Формат“»', site: 'ТЦ «Формат» (основной)', address: 'г. Москва, Каширское ш., 61' },
  { name: 'ООО «Ландшафт-Парк»', site: 'Парк-отель «Зелёный берег»', address: 'г. Тверь, наб. Афанасия Никитина, 3' },
  { name: 'ООО «Кафе-Прованс»', site: 'Кафе «Прованс» (терраса)', address: 'г. Москва, ул. Пятницкая, 8' },
  { name: 'ООО «ГК „Берёзка“»', site: 'Гостиница «Берёзка»', address: 'г. Калуга, ул. Кирова, 15' },
  { name: 'ООО «Складские решения»', site: 'Логистический центр «Юг»', address: 'г. Домодедово, мкр. Востряково' },
  { name: 'ООО «Частный сектор 24»', site: 'Магазин «У дома» №24', address: 'г. Москва, ул. Ленинская Слобода, 19' },
  { name: 'ООО «Магазин „У дома“»', site: 'Магазин «У дома» №7', address: 'г. Подольск, ул. Маштакова, 9' },
  { name: 'ИП Кузнецова Е.С.', site: 'Выставочный зал', address: 'г. Москва, Волоколамское ш., 73' },
];

const WORKERS = [
  { lastName: 'Иванов', firstName: 'Сергей', patronymic: 'Петрович', department: 'Заготовительный участок', grade: '5-й разряд', wts: ['cut', 'bend'], phone: '+7 (916) 204-10-01' },
  { lastName: 'Петров', firstName: 'Андрей', patronymic: 'Викторович', department: 'Сварочный участок', grade: '6-й разряд', wts: ['weld'], phone: '+7 (916) 204-10-02' },
  { lastName: 'Сидоров', firstName: 'Дмитрий', patronymic: 'Алексеевич', department: 'Сварочный участок', grade: '5-й разряд', wts: ['weld'], phone: '+7 (916) 204-10-03' },
  { lastName: 'Козлов', firstName: 'Николай', patronymic: 'Иванович', department: 'Слесарный участок', grade: '5-й разряд', wts: ['locksmith', 'assembly'], phone: '+7 (916) 204-10-04' },
  { lastName: 'Орлов', firstName: 'Алексей', patronymic: 'Сергеевич', department: 'Покрасочная камера', grade: '4-й разряд', wts: ['paint'], phone: '+7 (916) 204-10-05' },
  { lastName: 'Кузнецов', firstName: 'Павел', patronymic: 'Андреевич', department: 'Сборочный участок', grade: '4-й разряд', wts: ['assembly', 'pack'], phone: '+7 (916) 204-10-06' },
  { lastName: 'Смирнова', firstName: 'Елена', patronymic: 'Владимировна', department: 'Участок упаковки', grade: '3-й разряд', wts: ['pack'], phone: '+7 (916) 204-10-07' },
  { lastName: 'Васильев', firstName: 'Игорь', patronymic: 'Николаевич', department: 'Выездная бригада', grade: '5-й разряд', wts: ['install'], phone: '+7 (916) 204-10-08' },
  { lastName: 'Морозов', firstName: 'Владимир', patronymic: 'Павлович', department: 'Выездная бригада', grade: '5-й разряд', wts: ['install'], phone: '+7 (916) 204-10-09' },
  { lastName: 'Фёдоров', firstName: 'Михаил', patronymic: 'Олегович', department: 'Сборочный участок', grade: '4-й разряд', wts: ['assembly'], phone: '+7 (916) 204-10-10' },
];

const WAREHOUSES = [
  { name: 'Склад материалов', type: 'main', address: 'Цех 1, зона А', zoneNames: ['А1', 'А2', 'А3'] },
  { name: 'Склад готовой продукции', type: 'main', address: 'Цех 2, зона Б', zoneNames: ['Б1', 'Б2'] },
  { name: 'Производственный склад', type: 'production', address: 'Цех 3, зона В', zoneNames: ['В1'] },
  { name: 'Склад отгрузки', type: 'transit', address: 'Рампа 1', zoneNames: ['Р1'] },
];

// ── orders ─────────────────────────────────────────────────────────────────
const ORDERS = [
  { number: 'З-2026-001', client: 0, status: 'confirmed', lane: 'design', lineStatus: 'pending', offset: 2, items: [{ sku: '4001', qty: 1 }] },
  { number: 'З-2026-002', client: 1, status: 'in_production', lane: 'shop', lineStatus: 'in_production', offset: 5, items: [{ sku: '4002', qty: 2 }, { sku: '4005', qty: 1 }] },
  { number: 'З-2026-003', client: 2, status: 'draft', lane: 'prep', lineStatus: 'pending', offset: -1, items: [{ sku: '4004', qty: 20 }] },
  { number: 'З-2026-004', client: 0, status: 'ready', lane: 'to_ship', lineStatus: 'ready', offset: -3, items: [{ sku: '4003', qty: 1 }] },
  { number: 'З-2026-005', client: 3, status: 'shipped', lane: 'shipped', lineStatus: 'shipped', offset: -7, items: [{ sku: '4006', qty: 1 }] },
  { number: 'З-2026-006', client: 4, status: 'in_production', lane: 'shop', lineStatus: 'in_production', offset: 6, items: [{ sku: '4010', qty: 3 }, { sku: '4008', qty: 2 }] },
  { number: 'З-2026-007', client: 5, status: 'confirmed', lane: 'design', lineStatus: 'pending', offset: 3, items: [{ sku: '4007', qty: 14 }] },
  { number: 'З-2026-008', client: 6, status: 'in_production', lane: 'shop', lineStatus: 'in_production', offset: 8, items: [{ sku: '4009', qty: 1 }, { sku: '4005', qty: 2 }] },
  { number: 'З-2026-009', client: 7, status: 'ready', lane: 'to_ship', lineStatus: 'ready', offset: -2, items: [{ sku: '4002', qty: 4 }] },
  { number: 'З-2026-010', client: 8, status: 'draft', lane: 'prep', lineStatus: 'pending', offset: 0, items: [{ sku: '4006', qty: 2 }, { sku: '4004', qty: 30 }] },
];

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  const inspect = process.argv.includes('--inspect');
  await mongoose.connect(URI, { directConnection: true });
  console.log(`Connected: ${URI.split('@').pop()}\n`);

  if (inspect) {
    await inspectDb();
  } else {
    await clean();
    await seed();
  }
  await mongoose.disconnect();
}

async function inspectDb() {
  const cols = ['products', 'productmodules', 'materials', 'counterparties', 'organizations', 'worktypes', 'workers', 'warehouses', 'sites', 'orders'];
  for (const c of cols) {
    const coll = mongoose.connection.db.collection(c);
    const total = await coll.countDocuments({});
    const demo = await coll.countDocuments({
      $or: [
        { name: { $regex: DEMO_RE } },
        { sku: { $regex: DEMO_RE } },
        { article: { $regex: DEMO_RE } },
        { shortName: { $regex: DEMO_RE } },
        { number: { $regex: DEMO_RE } },
        { department: { $regex: DEMO_RE } },
        { notes: { $regex: DEMO_RE } },
        { description: { $regex: DEMO_RE } },
        { name: { $regex: MOJI_RE } },
      ],
    });
    console.log(`${c.padEnd(18)} total=${String(total).padStart(4)}  demo/test=${String(demo).padStart(3)}`);
  }
}

async function clean() {
  const rules = [
    { c: 'orders', label: 'заказы', filter: { $or: [{ number: { $regex: DEMO_RE } }, { notes: { $regex: DEMO_RE } }] } },
    { c: 'sites', label: 'объекты', filter: { name: { $regex: DEMO_RE } } },
    { c: 'warehouses', label: 'склады', filter: { name: { $regex: DEMO_RE } } },
    { c: 'workers', label: 'сотрудники', filter: { $or: [{ department: { $regex: DEMO_RE } }, { patronymic: { $regex: DEMO_RE } }, { lastName: { $regex: DEMO_RE } }] } },
    { c: 'worktypes', label: 'виды работ', filter: { name: { $regex: DEMO_RE } } },
    { c: 'organizations', label: 'фирмы', filter: { $or: [{ name: { $regex: DEMO_RE } }, { shortName: { $regex: DEMO_RE } }] } },
    { c: 'counterparties', label: 'контрагенты', filter: { $or: [{ name: { $regex: DEMO_RE } }, { shortName: { $regex: DEMO_RE } }] } },
    { c: 'products', label: 'изделия', filter: { $or: [{ name: { $regex: DEMO_RE } }, { sku: { $regex: DEMO_RE } }, { name: { $regex: MOJI_RE } }, { description: { $regex: MOJI_RE } }] } },
    { c: 'productmodules', label: 'модули', filter: { $or: [{ name: { $regex: DEMO_RE } }, { article: { $regex: DEMO_RE } }, { name: { $regex: MOJI_RE } }] } },
    { c: 'materials', label: 'материалы', filter: { $or: [{ name: { $regex: DEMO_RE } }, { article: { $regex: DEMO_RE } }, { sku: { $regex: DEMO_RE } }, { name: { $regex: MOJI_RE } }] } },
  ];

  for (const r of rules) {
    const coll = mongoose.connection.db.collection(r.c);
    const res = await coll.deleteMany(r.filter);
    if (res.deletedCount) console.log(`  ✓ удалено ${r.label}: ${res.deletedCount}`);
  }
  console.log('');
}

async function seed() {
  const db = mongoose.connection.db;

  // suppliers (organizations)
  const supplierIds = [];
  for (let i = 0; i < SUPPLIERS.length; i++) {
    const s = SUPPLIERS[i];
    const inn = inn10(3100 + i);
    let doc = await db.collection('organizations').findOne({ inn });
    if (!doc) {
      doc = await db.collection('organizations').insertOne({
        name: s.name,
        shortName: s.name.replace(/^(ООО|АО|ИП)\s*/i, ''),
        legalForm: s.legalType === 'ip' ? 'ИП' : s.name.split(' ')[0],
        legalType: s.legalType,
        inn,
        kpp: s.legalType === 'ip' ? undefined : `77${String(700000 + i).slice(0, 4)}01`,
        type: s.type,
        partyTypes: ['supplier'],
        isActive: true,
        paymentTermDays: 15,
        vatRate: 20,
        bankName: 'ПАО Сбербанк',
        bankBik: '044525225',
        bankAccount: `40702810${String(3800000000 + i * 100000)}`.slice(0, 20),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      doc = { _id: doc.insertedId, ...doc.ops?.[0] };
    }
    supplierIds.push(doc._id);
    console.log(`  ✔ поставщик: ${s.name}`);
  }

  // materials (supplierId spread across suppliers)
  const materials = {};
  for (let i = 0; i < MATERIALS.length; i++) {
    const m = MATERIALS[i];
    let doc = await db.collection('materials').findOne({ article: m.article });
    if (!doc) {
      doc = await db.collection('materials').insertOne({
        name: m.name,
        article: m.article,
        sku: m.article,
        materialKind: m.kind,
        unit: m.unit,
        pricePerUnit: m.price,
        stockQty: m.stock,
        weightKg: m.weightKg,
        materialGrade: m.grade,
        supplierId: supplierIds[i % supplierIds.length],
        description: `${m.name}, в наличии`,
        isActive: true,
        deletedAt: null,
        dimensions: [],
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      doc = { _id: doc.insertedId };
    }
    materials[m.key] = doc._id;
    console.log(`  ✔ материал: ${m.name}`);
  }

  // work types
  const workTypes = {};
  for (const w of WORK_TYPES) {
    let doc = await db.collection('worktypes').findOne({ name: w.name });
    if (!doc) {
      doc = await db.collection('worktypes').insertOne({
        name: w.name,
        section: w.section,
        department: w.department,
        isActive: true,
        defaultDurationHours: w.days * 8,
        hourlyRate: w.hourlyRate,
        days: w.days,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      doc = { _id: doc.insertedId };
    }
    workTypes[w.key] = doc._id;
  }
  console.log(`  ✔ виды работ: ${WORK_TYPES.length}`);

  // modules
  const modules = {};
  for (const mod of MODULES) {
    let doc = await db.collection('productmodules').findOne({ article: mod.article });
    const workTypeRows = mod.wts.map((k, i) => ({
      workTypeId: workTypes[k],
      estimatedHours: (WORK_TYPES.find((w) => w.key === k)?.days ?? 1) * 8,
      sortOrder: i,
    }));
    const materialRows = mod.materials.map((k, i) => ({
      materialId: materials[k],
      quantity: 1,
      unit: 'шт',
      isPurchased: true,
      sortOrder: i,
    }));
    const compositionLines = mod.materials.map((k, i) => ({
      _id: new Types.ObjectId(),
      lineType: 'material',
      refId: materials[k],
      quantity: 1,
      sortOrder: i,
      unit: 'шт',
      isPurchased: true,
    }));
    if (!doc) {
      const r = await db.collection('productmodules').insertOne({
        name: mod.name,
        article: mod.article,
        dimensions: { width: 1000, height: 600, depth: 40, unit: 'мм' },
        weight: mod.weight,
        sortOrder: MODULES.findIndex((x) => x.key === mod.key),
        workTypes: workTypeRows,
        materials: materialRows,
        composition: compositionLines,
        photoIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      doc = { _id: r.insertedId };
    }
    modules[mod.key] = doc._id;
  }
  console.log(`  ✔ модули: ${MODULES.length}`);

  // products
  const products = {};
  for (const p of PRODUCTS) {
    let doc = await db.collection('products').findOne({ sku: p.sku });
    const modIds = p.mods.map((k) => modules[k]);
    const composition = p.mods.map((k, i) => ({
      _id: new Types.ObjectId(),
      lineType: 'module',
      refId: modules[k],
      quantity: 1,
      sortOrder: i,
      unit: 'шт',
    }));
    if (!doc) {
      const r = await db.collection('products').insertOne({
        name: p.name,
        sku: p.sku,
        kind: 'good',
        unit: 'шт',
        status: 'active',
        listPrice: p.price,
        basePrice: Math.round(p.price * 0.82),
        costPrice: Math.round(p.price * 0.58),
        defaultMarkupPercent: 30,
        stockQty: 0,
        description: p.desc,
        dimensions: p.dims,
        weightKg: Math.round(p.price / 900),
        hasDrawing: true,
        hasPassport: false,
        isActive: true,
        deletedAt: null,
        composition,
        productModuleIds: modIds,
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      doc = { _id: r.insertedId };
    }
    products[p.sku] = doc._id;
    console.log(`  ✔ изделие: ${p.name}`);
  }

  // clients (counterparties) + sites
  const clientIds = [];
  const siteIds = [];
  for (let i = 0; i < CLIENTS.length; i++) {
    const c = CLIENTS[i];
    const inn = inn10(4100 + i);
    let cp = await db.collection('counterparties').findOne({ inn });
    if (!cp) {
      const r = await db.collection('counterparties').insertOne({
        name: c.name,
        shortName: c.name.replace(/^(ООО|АО|ИП)\s*/i, '').replace(/«|»|"|"/g, ''),
        legalForm: c.name.startsWith('ИП') ? 'ИП' : c.name.split(' ')[0],
        legalType: c.name.startsWith('ИП') ? 'ip' : 'ooo',
        inn,
        kpp: c.name.startsWith('ИП') ? undefined : `77${String(710000 + i).slice(0, 4)}01`,
        roles: ['customer'],
        type: ['customer'],
        partyTypes: ['customer'],
        isActive: true,
        paymentTermDays: 10,
        vatRate: 20,
        phone: `+7 (495) 30${String(10 + i).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`,
        deletedAt: null,
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cp = { _id: r.insertedId };
    }
    clientIds.push(cp._id);
    let site = await db.collection('sites').findOne({ counterpartyId: cp._id, name: c.site });
    if (!site) {
      const r = await db.collection('sites').insertOne({
        counterpartyId: cp._id,
        name: c.site,
        address: c.address,
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      site = { _id: r.insertedId };
    }
    siteIds.push(site._id);
    console.log(`  ✔ клиент: ${c.name}`);
  }

  // workers
  const wtIds = Object.values(workTypes);
  for (let i = 0; i < WORKERS.length; i++) {
    const w = WORKERS[i];
    let doc = await db.collection('workers').findOne({ lastName: w.lastName, firstName: w.firstName, department: w.department });
    if (!doc) {
      await db.collection('workers').insertOne({
        lastName: w.lastName,
        firstName: w.firstName,
        patronymic: w.patronymic,
        department: w.department,
        grade: w.grade,
        phone: w.phone,
        ratePerHour: 700,
        workTypeIds: w.wts.map((k) => workTypes[k]),
        isActive: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  console.log(`  ✔ сотрудники: ${WORKERS.length}`);

  // warehouses
  for (const wh of WAREHOUSES) {
    let doc = await db.collection('warehouses').findOne({ name: wh.name });
    if (!doc) {
      await db.collection('warehouses').insertOne({
        name: wh.name,
        type: wh.type,
        address: wh.address,
        description: wh.name,
        isActive: true,
        zoneNames: wh.zoneNames,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  console.log(`  ✔ склады: ${WAREHOUSES.length}`);

  // orders
  for (const o of ORDERS) {
    let doc = await db.collection('orders').findOne({ number: o.number });
    if (doc) continue;
    const items = o.items.map((it, idx) => {
      const pid = products[it.sku];
      const prod = PRODUCTS.find((p) => p.sku === it.sku);
      const unitPrice = prod?.price ?? 0;
      return {
        lineId: `${o.number}-${idx + 1}`,
        boardLane: o.lane,
        productId: pid,
        productName: prod?.name,
        productSku: it.sku,
        quantity: it.qty,
        unit: 'шт',
        unitPrice,
        total: unitPrice * it.qty,
        status: o.lineStatus,
        readyForWork: o.lane === 'shop' || o.lane === 'to_ship' || o.lane === 'shipped',
      };
    });
    const total = items.reduce((a, it) => a + it.total, 0);
    await db.collection('orders').insertOne({
      number: o.number,
      counterpartyId: clientIds[o.client],
      siteId: siteIds[o.client],
      date: daysFromToday(o.offset - 2),
      plannedDate: daysFromToday(o.offset),
      status: o.status,
      priority: o.status === 'in_production' ? 'high' : 'normal',
      total,
      materialsSource: 'own',
      isActive: true,
      items,
      notes: `Заказ ${o.number}`,
      shipmentIds: [],
      reservationIds: [],
      estimateDayOverrides: [],
      estimateStartOffsets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✔ заказ: ${o.number} (${o.status})`);
  }

  console.log('\nГотово.');
  const counts = {};
  for (const c of ['products', 'productmodules', 'materials', 'counterparties', 'organizations', 'orders', 'workers', 'worktypes', 'warehouses', 'sites']) {
    counts[c] = await mongoose.connection.db.collection(c).countDocuments({});
  }
  console.log(JSON.stringify(counts, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
