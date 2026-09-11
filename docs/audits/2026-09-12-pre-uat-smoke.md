# Pre-UAT smoke — 2026-09-12

**Триггер:** PO устал руками находить дыры перед ручной проверкой свежих волн
(`DROP-REFERENCE-NAV`, `REGISTRY-CATEGORIES`, `DOCSTUDIO-TABLE-PROPS`,
`AI-IMPORT-BASELINE`). Агент сам поднял стенд, прогнал gates, написал и
прогнал Chrome CDP smoke, оценил дыры в тестах.

**TZ:** `tasks/TZ-NX-PRE-UAT-SMOKE-2026-09-12.md` → `tasks/_archive/2026-09/`
**Script:** `scripts/pre-uat-smoke-2026-09-12.mjs`
**Evidence:** `docs/audits/evidence/pre-uat-2026-09-12/` (8 screenshots + `report.json`)

---

## Стенд

| Сервис | Порт | Статус до | Действие |
|--------|------|-----------|----------|
| API (Mongo+Backend) | :3000 | уже healthy | — |
| NX frontend (kppdf-web) | :4201 | не запущен | `node start.mjs --nx --no-browser` (additive, без `--reset`/wipe); готов за ~15с |

Login: `admin`/`admin123` (существующий seed, тот же, что использует
`scripts/tz-nx-hub-05-visual-parity-smoke.mjs` — не новый секрет, не
хардкодился в коммит отдельно от уже принятого паттерна).

## Gates (раздел B TZ)

| Gate | Результат |
|------|-----------|
| `backend: tsc -p tsconfig.build.json --noEmit` | ✅ PASS |
| `backend: pnpm test` | ✅ PASS — 133/133 suites, 1310 tests |
| `frontend-nx: nx run kppdf-web:test --skip-nx-cache` | ✅ PASS — 115/115 suites, 805 passed + 7 pre-existing skipped |
| `frontend-nx: nx build kppdf-web` | ✅ PASS (только 2 pre-existing warnings, известны с прошлых волн) |
| `pnpm architecture:check` (repo root) | ✅ PASS |
| `desktop: tsc --noEmit` + `npx tsx --test ...` (раздел E, optional) | ✅ PASS — 174/174, без Ollama (не требуется) |

**Ни одного FAIL на gates.** Все свежие волны уже сдали код в рабочем состоянии — это ожидаемо (каждая волна сама гоняла те же gates перед commit), но приятно подтвердить ещё раз холодным прогоном.

## Chrome CDP smoke (раздел C TZ) — 18/18 PASS, 0 FAIL, 0 SKIP

Полный JSON: `docs/audits/evidence/pre-uat-2026-09-12/report.json`.

| # | Проверка | Результат |
|---|----------|-----------|
| 1 | Shell top-nav: нет chip «Справ.»/reference (8 chips: Клиенты/Сделки/Снабж./Цех/Склад/Докум./Реестры/Админ) | ✅ PASS |
| 2a | `/registries` «Каталог» без «Единицы измерения» | ✅ PASS |
| 2b | `/registries` «Справочники» = units + Категории | ✅ PASS |
| 2c | `/registries` «Документы» = Тексты + Категории текстов + Виды таблиц | ✅ PASS |
| 2d | `/registries` без console errors | ✅ PASS |
| 3 | `/registries/categories` create-форма: type select с Детали/Изделия/Модули | ✅ PASS |
| 4 | `/registries/details` create: поле «Категория» — `<select>`, не raw ObjectId | ✅ PASS |
| 5 | `/registries/table-templates` открывается (master-table, не empty/crash) | ✅ PASS |
| 6a | `/studio/:id`: смоук-блок таблицы виден в панели «Слои» | ✅ PASS |
| 6b | Панель свойств таблицы ≥700px (факт: **820px**) | ✅ PASS |
| 6c | Есть чип «+ Количество» **или** колонка qty (факт: колонка qty уже есть — канонический шаблон «Продукты» с TZ-05 прошлой волны) | ✅ PASS |
| 6d | CTA «Реестры → Виды таблиц» → `/registries/table-templates`, новая вкладка | ✅ PASS |
| 7 | Ячейка фото: `<img>` **или** «Нет фото», никогда пустая `<td>` (факт: пустое фото → честное «Нет фото») | ✅ PASS |
| 8 | `/storage-items` «Поставить на склад»: материал — search/typeahead (`<input>`), не blind `<select>` | ✅ PASS |
| — | Console errors на всех переходах (1,2,4,5,6,7,8) | ✅ PASS (0 везде) |

Скриншоты (визуально сверены `04`/`06` дополнительно — см. ниже):
`01-shell-topnav.png` · `02-registries-groups.png` · `03-categories-create-dialog.png` ·
`04-details-create-dialog.png` · `05-table-templates.png` · `06-studio-table-props.png` ·
`07-studio-canvas-photo-cell.png` · `08-storage-put-on-stock.png`.

**Тестовые данные:** смоук создал ОДИН одноразовый studio-документ
(«PRE-UAT-SMOKE 2026-09-12») + один table-блок через API (канонический
шаблон «Продукты» с колонкой qty, одна строка с пустым фото — специально,
чтобы проверить «Нет фото» без зависимости от чужих реальных фото-файлов).
Документ удалён скриптом сразу после прогона (`DELETE /studio-documents/:id`,
подтверждено — в базе остались только 2 исходных документа PO). Не
использовал существующие документы PO («КП 11.09.2026») — у одного из их
table-блоков «Продукты» обнаружен рассинхрон `liveRows` (3 ячейки) против
6 колонок шаблона (см. «Побочная находка» ниже) — использование чужого
неконтролируемого состояния сделало бы smoke зависимым от чужих данных,
а не от кода этой волны.

## Побочная находка (не FAIL этой волны, зафиксировано для трассировки)

Документ PO «КП 11.09.2026 (2)» (`_id 6aa3ef71dd7c00449cb07749`), блок
«Продукты», ссылается на шаблон `6a9b24e6cf805a05f9126bde` — один из ДВУХ
дублей, деактивированных миграцией `TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER`
(прошлая волна). Это ожидаемо и не баг: снимок `tableTemplateColumns` живёт
на самом блоке, деактивация шаблона в реестре не трогает уже созданные
блоки. У этого конкретного блока `settings.liveRows` содержит 3-ячеечные
строки при 6 текущих колонках — стейл-данные с ДО текущих фиксов (S47/
LINE-QTY/PHOTO-SMOKE), созданные раньше, чем эти механизмы появились;
canvas умеет ресинхронизировать `liveRows` только по факту РЕДАКТИРОВАНИЯ
структуры колонок (`rehydrateLiveRowsAfterColumnChange`), не ретроактивно
для уже открытых документов. Не чиню — нет FAIL evidence на КОД этой
волны, только на конкретный старый документ. **PO смотри глазками**, если
будет открывать именно этот документ: если таблица «Продукты» там выглядит
криво — достаточно один раз тронуть «Строки таблицы» (или пересохранить
источник) в свойствах, это форсирует ресинхронизацию.

## Тесты (раздел D TZ)

**Не добавлено новых тестов** — ни один smoke-пункт не провалился, и
`nav-categories.spec.ts`'s `NAV_CATEGORY_ORDER` exact-order assertion уже
ловит регрессию «reference chip вернулся» (список из 10 id жёстко
зафиксирован; появление 11-го сломает тест). Приоритетные пункты TZ
(registries categories select, studio table props width/qty unlock, nav
no-reference) уже покрыты existing specs из своих волн:
`category-form-dialog.component.spec.ts`, `material-form-dialog.component.spec.ts`,
`studio-workspace-chrome.spec.ts` (`studioPanelIsTable`),
`studio-table-properties.component.spec.ts` (column structure unlock),
`nav-categories.spec.ts`. Писать дублирующие тесты «на всякий случай» без
дыры — не по канону этой волны (`НЕ: чинить долг без FAIL evidence`).

## Desktop (раздел E TZ, optional)

- `cd desktop && pnpm run typecheck` → PASS
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → PASS 174/174
- Ollama НЕ поднимался (не требуется по TZ; уже подтверждено offline в прошлой волне) — normalize eval fixtures синтетические, не live.
- Desktop GUI (Tauri pairing/click-through) — **SKIP**, GUI-приложение, недостижимо headless-CDP-скриптом; явно указано TZ как не-блокер.

## Итог для PO

### ✅ PO может не перепроверять (зелёное, с evidence)

- Верхний nav — нет «Справ.»/reference chip, все 4 свежие волны на месте.
- `/registries` — группировка (Каталог/Справочники/Документы) ровно как задумано.
- Создание категории — select типа (Детали/Изделия/Модули) работает.
- Создание детали — категория теперь `<select>`, не поле для ручного ObjectId.
- Реестр «Виды таблиц» открывается.
- Студия: панель свойств таблицы широкая (820px), колонка/чип «Количество» доступны, кнопка на реестр видов работает, фото-ячейка не пустая (img либо честное «Нет фото»).
- «Поставить на склад» — материал ищется typeahead'ом, не блайндом.
- Backend/NX/Desktop gates — все зелёные холодным прогоном.

### 👀 PO смотри глазками (единственный пункт)

- ~~Документ «КП 11.09.2026 (2)» → блок «Продукты» — старые данные могут визуально не совпадать с 6/7 колонками~~ — **CLOSEOUT (TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL, `a00a4f82`)**: побочная находка выше пофикшена авто-heal при открытии/загрузке документа — детект рассинхрона `liveRows`/колонок теперь срабатывает не только по факту редактирования структуры колонок, но и на каждом load, для live-source И manual/no-`dataSource` таблиц (сам этот документ — второй случай: у блока «Продукты» `dataSource` вообще отсутствует). **PO больше не обязан пересохранять** «КП 11.09.2026 (2)» руками — таблица выравнивается сама при следующем открытии.

## SHA

Нет продуктовых фиксов в этой волне — 0 FAIL на всех gates и всех 18 smoke-проверках. Единственный коммит — сам smoke-скрипт + этот аудит: `af78049d`.
