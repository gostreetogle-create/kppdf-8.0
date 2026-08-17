═══════════════════════════════════════════════════════════════
TZD-51: Desktop Excel Forms — справочники V2
═══════════════════════════════════════════════════════════════

> Wave: `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`
> После TZD-50. Планка та же: 98–100, без Google Sheets.

РОЛЬ АГЕНТА: Desktop core/UI + тонкие вызовы существующих Nest POST (без новых коллекций).

ЗАВИСИМОСТИ: **TZD-50 DONE** (Form Studio + fingerprint + round-trip). TZD-49 остаётся PARK.

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/import-targets.ts` ; `desktop/src/core/excel-form-template.ts` ; `desktop/src/core/excel-form-catalog.ts` ; `desktop/src/core/excel-form-catalog.test.ts` ; `docs/agent-checklists/TZD-51.md` ; `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`

PAGES: N/A
PAGE_DOCS: N/A

STATUS: READY (не стартовать до archive TZD-50)

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT
═══════════════════════════════════════════════════════════════

| Слово PO | Канон |
|----------|--------|
| Справочники | `warehouse`, `workType`, `colorReference`, `category` |
| Клиент | не здесь; counterparties уже в TZD-50 |
| Organization | наша фирма — не создавать из Excel |

Проверено:
- POST `/api/warehouses` — `CreateWarehouseDto` (name required; type enum)
- POST `/api/work-types` — name + **hourlyRate ≥ 0** required
- POST `/api/color-references` — name; slug/hex optional (server slugify)
- POST `/api/categories` — name + slug + type + **skuPrefix** required
- TZD-50 Form Studio + `_kppdf` fingerprint

Dedupe (до POST; при hit → `duplicate`, не писать):
- warehouse: trim lower `name`
- workType: trim lower `name`
- colorReference: trim lower `name` **или** exact `slug` если задан
- category: pair (`type`,`slug`) или `skuPrefix` unique

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. TZD-50 дал Form Studio только для catalog + counterparties.
2. Nest create API для справочников уже есть; Desktop `createEntities` их не знает.
3. Category требует slug+skuPrefix — в форме оба поля явные (не «магия без колонок»).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Расширить каталог Form Studio

  1.1. Категория UI **`references`** («Справочники») с таблицами:

| targetKey | labelRu | Обязательные колонки (RU label) |
|-----------|---------|----------------------------------|
| `warehouse` | Склады | Наименование *; Тип (main/branch/transit/production/other, default main); Адрес; Описание |
| `workType` | Виды работ | Наименование *; Ставка ₽/час *; Участок; Описание; Дни (Gantt); |
| `colorReference` | Цвета (RAL) | Наименование *; Hex (#RRGGBB); Описание |
| `category` | Категории | Наименование *; Тип * (material/product/general); Slug *; Префикс SKU *; Описание |

  1.2. `ImportTargetKey` union расширить этими ключами **или** отдельный `FormTargetKey` с adapter — главное: один allowlist, без «мёртвых» пунктов в UI.
  1.3. Скачивание формы переиспользует TZD-50 generator (`_kppdf` + `Данные`).

ШАГ 2: Валидация строк + dedupe

  2.1. Client-side validate до send (типы enum, hex, hourlyRate number, skuPrefix `/^[A-Z0-9-]+$/`, slug `/^[a-z0-9-]+$/`).
  2.2. Перед POST: GET list (существующие list endpoints) или точечный поиск — пометить duplicate. Не создавать второй склад с тем же именем.
  2.3. Битые → отчёт; хорошие → send.

ШАГ 3: Write path

  3.1. Расширить `createEntities` (или sibling) вызовами POST выше; org для color — с сервера (не из Excel).
  3.2. Policy A confirm: «Записать справочники сразу? …»
  3.3. Не использовать mutation journal, пока TZD-49 не снимет PARK (явно в UI hint: «справочники пишутся сразу после подтверждения»).

ШАГ 4: UX

  4.1. В Form Studio третья категория «Справочники»; описание у каждой таблицы — зачем пачкой.
  4.2. На форме Категории — hint: «Slug и префикс SKU лучше латиницей; префикс заглавными».
  4.3. На Виды работ — hint: «Ставка 0 = явно бесплатно».

ШАГ 5: Тесты + closeout

  5.1. Unit: catalog contains V2; template round-trip для `warehouse` и `category`.
  5.2. validate: bad hex / bad skuPrefix → invalid.
  5.3. Gates desktop tsc + svelte-check + focused tests.
  5.4. WAVE DoD: отметить TZD-51; Executor report; archive + lock.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `desktop/src/core/import-targets.ts` и/или `excel-form-catalog.ts`
- `desktop/src/core/excel-form-template.ts` (поддержка новых keys)
- `desktop/src/App.svelte` (createEntities + UI category)
- tests рядом
- `docs/agent-checklists/TZD-51.md`
- WAVE checkbox

НЕ ИЗМЕНЯТЬ:
- frontend Angular
- Google / MCP Google
- Orders / КП / stock movements / passports
- Новые Nest modules (только existing POST)
- TZD-49 journal unify (отдельный claim)
- Deploy без PO

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] В Form Studio категория «Справочники» → 4 таблицы; скачивание `_kppdf` работает
- [ ] Round-trip складов: 1 новая + 1 дубль имени → дубль в отчёте, новая в SoT после confirm
- [ ] workType без ставки → invalid, не POST
- [ ] category с плохим skuPrefix → invalid
- [ ] colorReference без slug → сервер принимает (name only)
- [ ] V1 таблицы TZD-50 не сломаны
- [ ] Gates:
```text
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && pnpm test
```
- [ ] Executor report (auto); archive `TZD-51.done.md`; lock `TZD-51-desktop-excel-form-dictionaries.lock`
- [ ] Cursor/PO PASS

known_limitation:
- Паспорта / заказы / КП — вне волны
- Journal unify non-material — TZD-49
- Parent category tree (parentId) — можно колонка опционально; глубокий UI дерева не строить

═══════════════════════════════════════════════════════════════
HANDOFF
═══════════════════════════════════════════════════════════════

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) Убедиться TZD-50 archived DONE
3) tasks/_active/TZD-51.md + checklist _TEMPLATE
4) Status CLAIMED; slot agent_id + claimed_at; _active-map conflict check
5) Team Room claim best-effort
Затем: docs/AI-AGENT-GUIDE.md + tasks/TZD-51-desktop-excel-form-dictionaries.md
Archive после Cursor/PO PASS.
