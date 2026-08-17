# TZ-MIG-306: Fix product category filter after KP3 load

> **PO 2026-08-13:** в UI категории есть, фильтр по категории даёт пусто.  
> Факт audit: у **670/699** продуктов `categoryId` populate’ится; `GET /api/products?categoryId=<id>` → **total:0**. Фото — **не** эта TZ (см. TZD-47 → MIG-303).

РОЛЬ АГЕНТА: backend fix + data verify (prod LAN OK только если PO сказал «prod» / уже на Synology SoT)

ЗАВИСИМОСТИ: MIG-302 load done (`docs/audits/2026-08-12-kp3-mcp-load-report.md`, `data/from-kp3/id-map.json`)

LAYER: 3 (product list filter)

CONFLICT KEYS: `backend/src/modules/product/product.service.ts` ; `backend/src/modules/product/product.controller.ts` ; (если data-fix script) `data/from-kp3/_mig306_rebind_categories.py` ; `docs/audits/2026-08-13-product-category-filter-fix.md`

PAGES: `/products`  
PAGE_DOCS: N/A (или products.page.md если есть — обновить одну строку «фильтр categoryId»)

Проверено: `Product.categoryId` → ref `Category`; list FE шлёт `categoryId` (`products.page.ts` / `products.service.ts`); BE `findAll` ставит `filter.categoryId = new Types.ObjectId(q.categoryId)`.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. На SoT Synology LAN (`http://192.168.1.103:3000`): products **699**, categories **~15**, photoIds **0**.
2. List без фильтра: items с populated `categoryId: { _id, name, … }`.
3. `GET /api/products?categoryId=<тот же _id>` → `total: 0` (воспроизведено 2026-08-12).
4. PATCH того же `categoryId` на продукт **не** оживил фильтр (подозрение: тип в Mongo string vs ObjectId **и/или** баг в `findAll` / деплой ≠ локальный код).
5. 29 продуктов без категории — из KP3 с пустым `category` (ожидаемо).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Reproduce + root cause

- Login admin → взять любой product с populated category → `GET .../products?categoryId=<id>` → зафиксировать total.
- В Mongo (Synology) на 3 документах: `typeof categoryId` / `$type` (objectId vs string).
- Сверить **задеплоенный** `product.service` findAll с репо (нет ли старого фильтра по `category` name).

### ШАГ 2 — Fix (минимально)

Выбрать одно (предпочтительно оба, если data грязная):

**A. BE:** `findAll` должен матчить category надёжно, напр.:
- `filter.categoryId = { $in: [ObjectId(id), id] }` если в базе смесь типов; **или**
- нормализовать при create/update к ObjectId и один раз migrate data.

**B. Data:** скрипт (REST PATCH или mongo) — для всех products с category: перезаписать `categoryId` каноническим ObjectId из `Category` по имени из KP3 `products.json` / текущему populate name.  
Источник имён: `data/from-kp3/raw/products.json` + id-map.  
Не создавать дубли категорий с тем же name.

### ШАГ 3 — Verify

- Для ≥3 категорий с товарами: `GET /api/products?categoryId=…` → `total > 0` и все items с этим category.
- UI `/products`: выбрать категорию в фильтре → список не пустой (если в категории есть товары).
- 29 без категории: фильтр по ним не обязателен; «все» показывает их.

### ШАГ 4 — Report + archive

- `docs/audits/2026-08-13-product-category-filter-fix.md` (cause, counts before/after, sample ids).
- Checklist + archive `TZ-MIG-306.done.md`.
- Warm-deploy BE **только** если чинили код и PO сказал prod (иначе local + явный note).

---

## НЕ

- Не лить фото (TZD-47 / MIG-303).
- Не wipe DB.
- Не трогать FE ради «клиентского фильтра» вместо SoT.
- Не плодить вторые Category с теми же именами.

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Root cause записан в audit (string vs ObjectId / bug line / deploy skew).
- [ ] `GET /api/products?categoryId=<id>` для категории с ≥1 товаром → `total ≥ 1`.
- [ ] UI фильтр на `/products` показывает товары этой категории.
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS (если трогали BE).
- [ ] Audit + archive DONE.

Финализация: `tasks/_archive/2026-08/TZ-MIG-306.done.md` + progress по `GEMINI.md`.
