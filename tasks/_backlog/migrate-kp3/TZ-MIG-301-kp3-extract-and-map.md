# TZ-MIG-301: КП3 extract + field mapping audit

> Перед работой: `docs/TZ-AUTHORING.md` (Counterparty ≠ Organization; КП = Quotation).  
> Волна: `tasks/_backlog/migrate-kp3/WAVE-KP3-DATA-MIGRATE.md`  
> SSH-канон: `docs/ops/kp3-data-copy-access.md` · секреты: `deploy/kp3-data-copy/CREDENTIALS.md`

РОЛЬ АГЕНТА: Data migration analyst / ops extractor (read-only к КП3; docs + staging pack в КП8-репо)

ЗАВИСИМОСТИ: Нет (фундамент волны). SSH-ключ `kppdf8-kp3-data-copy` уже работает.

LAYER: 4 (docs + local data pack; **нет** product UI/backend schema patches в этой TZ)

CONFLICT KEYS: `data/from-kp3/**` ; `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` ; `docs/agent-checklists/TZ-MIG-301.md` ; `tasks/_backlog/migrate-kp3/**`

PAGES: (none — data ops)  
PAGE_DOCS: N/A

Проверено (preflight):
- KP3 Mongo `kp-app`: collections `products`(699), `kps`(28), `counterparties`(23)
- KP3 product keys: `name,code,category,subcategory,unit,price,description,notes,images,kind,isActive,…`
- KP3 kp keys: `title,status,items[],counterpartyId,companyId,companySnapshot,vatPercent,versions,…`
- KP8: `backend/src/modules/product/product.schema.ts` (`sku`, `listPrice`, `photoIds`)
- KP8: `backend/src/modules/counterparty/counterparty.schema.ts` (`inn` required, org-scoped unique)
- KP8: `backend/src/modules/quotation/quotation.schema.ts` (UI КП = Quotation)
- MCP: `kppdf_propose_product_create`, `kppdf_counterparty_create`, `kppdf_quotation_create_draft` — **photo upload tools отсутствуют**
- Access: `ssh -i %USERPROFILE%\.ssh\kppdf8-kp3-data-copy -o IdentitiesOnly=yes root@130.49.129.240`

Dictation → канон: «контрагенты» → Counterparty; «КП» → Quotation; «артикул/код» КП3 `code` → Product.`sku`.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. КП3 живёт на VPS `130.49.129.240`, код `/opt/kppdf`, Mongo `kp-app`, фото `/opt/kppdf/media`.
2. КП8 — отдельный SoT; массового импорта из КП3 ещё нет.
3. PO хочет: выгрузить → упаковать локально `data/from-kp3/` → **аудит колонок** → потом заливка MCP (TZ-MIG-302).
4. Риск: разные имена полей (`code`/`sku`, `price`/`listPrice`, `qty`/`quantity`, `bik`/`bankBik`, `role`/`roles`).

---

## ЧТО ДЕЛАТЬ

### ШАГ 1: Claim + preflight

- Checklist `docs/agent-checklists/TZ-MIG-301.md` по `_TEMPLATE.md`.
- `tasks/_active/TZ-MIG-301.md` marker.
- Проверить SSH: `BatchMode=yes` команда из канона возвращает `OK` + `ls /opt/kppdf`.
- **Не** трогать продукт-код FE/BE; **не** писать в Mongo КП8.

### ШАГ 2: Выгрузить Mongo (read-only)

С КП3 (через SSH) экспортировать JSON в локальный staging:

```
data/from-kp3/
  raw/
    products.json
    counterparties.json
    kps.json
  manifest.json          # counts, export UTC time, host, db name, git HEAD KP8
```

Требования:
- Полные документы коллекций `products`, `counterparties`, `kps` (не sample).
- Сохранить `_id` как строки в JSON (нужны для id-map).
- Способ: `mongodump`/`mongoexport` на сервере → `scp`/`sftp` на Windows **или** stream через ssh. Фиксируй команду в checklist Gates.

### ШАГ 3: Выгрузить media с сохранением связей

```
data/from-kp3/
  media/
    products/   # зеркало /opt/kppdf/media/products
    kp/         # если есть файлы
    specs/      # если есть
  photos-index.json   # productId|_id → relative paths + isMain/sortOrder из products.images[]
```

AC: число файлов locally ≈ remote (`~690`); битые ссылки `images[].url` без файла — список `missing-media.txt`.

### ШАГ 4: Аудит маппинга полей → отчёт

Создать **`docs/audits/2026-08-12-kp3-to-kp8-field-map.md`** со таблицами минимум для трёх сущностей:

Для каждого поля КП3:

| KP3 field | KP8 field | Вердикт | Комментарий |
|-----------|-----------|---------|-------------|
| … | … | map / rename-synonym / drop-ok / **gap-block** | … |

Обязательные строки вердикта:

- **map** — прямое или очевидное соответствие
- **rename-synonym** — другое имя, смысл тот же (пример: `code`→`sku`, `price`→`listPrice`, `bik`→`bankBik`, `qty`→`quantity`)
- **drop-ok** — в КП8 не нужно / UI-only legacy (с обоснованием)
- **gap-block** — смысл нужен, в КП8 поля нет и синонима нет → **блокирует MIG-302** для этой оси

Отдельно секции:

1. **Products** (вкл. `category` string vs `categoryId`, `images` vs `photoIds`)
2. **Counterparties** (`role[]`→`roles[]`, банк, адреса: legal/actual — куда класть или gap)
3. **KPs → Quotations** (`items[]`, статусы, `companySnapshot`/`companyId`, versions)
4. **Photos** — pack OK; MCP upload = **gap** (не выдумывать tool)
5. **Counts & samples** — 3 примера id на сущность
6. **Decision for PO** — список только `gap-block` (коротко) + рекомендация: «можно ли стартовать MIG-302 для map/rename части»

Правило PO: если gap реально нужен и незаменим — **не заливать** затронутые сущности в SoT; пакет остаётся в `data/from-kp3/`. Сообщить в checklist Ask.

### ШАГ 5: Id-map заготовка (без write)

`data/from-kp3/id-map.template.json`:

```json
{
  "products": { "<kp3ObjectId>": null },
  "counterparties": { "<kp3ObjectId>": null },
  "kps": { "<kp3ObjectId>": null }
}
```

Ключи = все source ids; values null до MIG-302.

### ШАГ 6: Отчёт + archive hygiene

- Checklist: Gates (SSH OK, counts, media count, audit path).
- `## Executor report (auto)` ≤15 lines.
- Archive: `tasks/_archive/2026-08/TZ-MIG-301.done.md` только если AC PASS.
- **Не** начинать MIG-302 в том же PR без явного OK PO по gap-списку.

---

## ИЗМЕНЯТЬ

- `data/from-kp3/**` (staging; JSON/media gitignored кроме README)
- `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` (**в git**)
- `docs/agent-checklists/TZ-MIG-301.md`
- `tasks/_active/TZ-MIG-301.md` → archive
- при необходимости уточнение `docs/ops/kp3-data-copy-access.md` (одна строка «export done»)

## НЕ ИЗМЕНЯТЬ

- `frontend/**`, `backend/**` schema/API (поля добавляет **другая** TZ после gap-отчёта)
- `desktop/mcp/**` (новые tools — только если PO отдельно попросит successor)
- Mongo/SoT КП8 (local или Synology) — **no writes**
- `deploy.ps1`, wipe, truncate
- чужой WIP / NAV-RETURN / SALES-*

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] SSH BatchMode OK на `root@130.49.129.240`
- [ ] `data/from-kp3/raw/{products,counterparties,kps}.json` существуют; counts ≈ 699 / 23 / 28 (±1 ок с пояснением)
- [ ] `data/from-kp3/media/**` + `photos-index.json`; missing list если есть
- [ ] Audit `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` с вердиктами map/rename/drop/gap-block
- [ ] `id-map.template.json` с полным набором source ids
- [ ] Checklist + Executor report (auto); archive done marker
- [ ] **Нет** коммита бинарных media/JSON-дампов в git (только audit + README + checklist)
- [ ] Verification:

```text
# SSH
ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -o IdentitiesOnly=yes -o BatchMode=yes root@130.49.129.240 "echo OK"

# Staging presence (PowerShell)
Test-Path data/from-kp3/raw/products.json
Test-Path data/from-kp3/photos-index.json
Test-Path docs/audits/2026-08-12-kp3-to-kp8-field-map.md

# git must NOT stage dumps
git check-ignore -v data/from-kp3/raw/products.json
```

known_limitation:
- Залив SoT / Synology = **TZ-MIG-302**, не эта задача.
- Photo MCP upload отсутствует → gap в audit, файлы только локально.
- Composition/materials из КП3 не в scope (в источнике нет полноценного v8 BOM).

---

## Финализация

Root-style: checklist → Executor report → `tasks/_archive/2026-08/TZ-MIG-301.done.md` + lock `.mimocode/locks/TZ-MIG-301-kp3-extract-map.lock` → обновить `_active-map`.  
Commit: audit + checklist + wave docs; **не** `data/from-kp3/raw|media`.
