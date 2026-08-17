═══════════════════════════════════════════════════════════════
TZD-50: Desktop Excel Form Studio (скачать форму V1)
═══════════════════════════════════════════════════════════════

> Перед работой: `docs/TZ-AUTHORING.md`, `GEMINI.md`, wave
> `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`.
> Планка: 98–100. Не «минимальный MVP», а удобный полный контур
> скачал → заполнил → загрузил → проверка → подтвердил.

РОЛЬ АГЕНТА: Desktop UI + Desktop core (Svelte/Tauri); без frontend SPA; BE только если без него нельзя сохранить fingerprint (по умолчанию **не** трогать Nest).

ЗАВИСИМОСТИ: Нет (фундамент волны). TZD-48 DONE уже на main. **TZD-49 PARK** — не claim параллельно (общий `App.svelte`).

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/import-targets.ts` ; `desktop/src/core/excel-form-template.ts` ; `desktop/src/core/excel-form-template.test.ts` ; `desktop/src/importers/excel.ts` ; `desktop/docs/MCP.md` (короткая ссылка на Form Studio) ; `docs/agent-checklists/TZD-50.md` ; `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`

PAGES: N/A (Desktop app, не Angular route)
PAGE_DOCS: N/A ; `desktop/docs/INSTALL.md` — одна строка в разделе Import, если уместно

STATUS: READY

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT
═══════════════════════════════════════════════════════════════

| Слово PO | Канон кода |
|----------|------------|
| Таблица / форма | `ImportTargetKey` + запись в allowlist Form Studio |
| Клиент | `Counterparty` (`counterparty`), не Organization |
| Заливка | SoT = Nest/Mongo; Excel = вход; HITL обязателен |

Unique / dedupe V1:
- material: `organizationId + article` (как Material schema)
- product: `sku` если непустой; пустой sku → строка `needs_review`, не молчаливый create-дубль по name
- module: `article`
- counterparty: `inn` (обязателен вместе с name)

Проверено:
- `desktop/src/core/import-targets.ts` — material/product/module/counterparty + RU labels
- `desktop/src/App.svelte` — dropdown таблиц, mapping, validate, sendBlocks, Policy A confirm
- `desktop/src/importers/excel.ts` — SheetJS read; **write/template отсутствует**
- `docs/PO-CANON.md` — Desktop/MCP управляемый импорт, не автопубликация
- `tasks/_backlog/desktop/TZD-49-…` — PARK, пересечение App.svelte

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Import Studio умеет **загрузить** чужой Excel и сопоставить колонки; список целей — 4 таблицы.
2. **Нет** «Скачать Excel-форму» с каноническими заголовками.
3. Нет стабильного fingerprint файла → при обратной загрузке снова ручной/эвристический mapping.
4. UX выбора таблицы плоский (не категория → таблица).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Каталог Form Studio (категория → таблица)

  1.1. Ввести структуру allowlist **только V1** (расширение справочников = TZD-51):

```ts
// канон имён ключей — не менять без successor
type FormCategoryKey = 'catalog' | 'counterparties';
// catalog → material | product | module
// counterparties → counterparty
```

  1.2. Каждая запись: `targetKey`, `categoryKey`, `labelRu`, `descriptionRu` (1 короткое предложение «зачем пачкой»), `requiredFields`, `columns` = из `IMPORT_TARGETS` (не дублировать руками — re-export / derive).
  1.3. UI: сначала select/segment **Категория**, затем список/select **Таблица** только из выбранной категории. Пустой category → таблицы скрыты / disabled с RU-hint «Сначала выберите категорию».

ШАГ 2: Генерация и скачивание `.xlsx`

  2.1. Новый модуль `desktop/src/core/excel-form-template.ts`:
       - лист **`Данные`**: строка 1 = русские `label` колонок; обязательные пометить суффиксом ` *` в заголовке (пример: `Артикул *`); строка 2 = пустая (скелет ввода); опционально тонкая строка-пример **закомментирована / на листе «Пример»** — не смешивать с данными.
       - скрытый лист **`_kppdf`**: `templateVersion` (semver string `1.0.0`), `targetKey`, `generatedAt` ISO, `columnKeys` (JSON-массив канонических key в порядке колонок), `app` = `kppdf-desktop`.
  2.2. Имя файла: `kppdf-{targetKey}-form.xlsx` (латиница ключа).
  2.3. Кнопка **«Скачать Excel-форму»** активна только при выбранной таблице + paired аккаунт не обязателен для скачивания (форму можно готовить офлайн). Сохранение через существующий Tauri save/dialog / download path проекта (не изобретать второй FS API).
  2.4. После скачивания — короткий RU toast/hint: «Заполните лист «Данные» и загрузите файл во вкладке Импорт Excel».

ШАГ 3: Round-trip при загрузке

  3.1. В `excel.ts` (или рядом): если есть лист `_kppdf` с валидным `targetKey` ∈ V1 — пометить parse result как `formTemplate: true`.
  3.2. Import Studio при таком файле:
       - автоматически ставит один import block на `targetKey` из fingerprint;
       - строит identity mapping header(label)→key (учитывая суффикс ` *`);
       - **не** заставляет пользователя заново угадывать таблицу;
       - если пользователь переименовал заголовки — красные unfit как сейчас, отправка закрыта до fix/ignore.
  3.3. Файлы без `_kppdf` — прежнее поведение (CAD/чужой Excel) без регресса.

ШАГ 4: Контур качества «проверка → отправить → подтвердить»

  4.1. Перед send: сводка RU — сколько `ok_new` / `ok_update` / `duplicate` / `invalid` / `needs_review`.
  4.2. На send уходят **только** `ok_new` и `ok_update`; остальные остаются в отчёте на экране (список строк + причина), не пишутся.
  4.3. Материалы → journal propose; затем существующий confirm UI. Non-material → существующий Policy A `confirm()` с честным текстом «сразу в каталог».
  4.4. После операции: итог «записано N / отклонено M» + возможность скачать отчёт отклонений как `.csv` или `.txt` (простой; не PDF).

ШАГ 5: UX / визуал Form Studio

  5.1. Отдельная зона/вкладка **«Формы Excel»** рядом с «Импорт Excel» (не прятать в MCP).
  5.2. Один экран: категория → таблица → описание → [Скачать] → короткая шпаргалка 3 шага (скачал / заполнил / загрузил во Импорт).
  5.3. Без карточного дашборда, без английских лейблов, без emoji. Плотный Paper-like стиль Desktop (существующие CSS-токены App.svelte).
  5.4. Keyboard: Tab-порядок логичный; кнопка Скачать доступна с клавиатуры.

ШАГ 6: Тесты + docs + checklist

  6.1. Unit: generate → parse round-trip сохраняет `targetKey` и порядок `columnKeys`; required `*` strip; неизвестный targetKey → safe ignore fingerprint.
  6.2. Не ломать существующие excel/multi-import/specification tests.
  6.3. Checklist `docs/agent-checklists/TZD-50.md` + Executor report (auto) перед archive.
  6.4. Одна строка в WAVE DoD checkbox TZD-50.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `desktop/src/core/excel-form-template.ts` (new)
- `desktop/src/core/excel-form-template.test.ts` (new)
- `desktop/src/core/import-targets.ts` (category metadata / helpers только если нужно; не ломать ключи)
- `desktop/src/importers/excel.ts` (read `_kppdf`)
- `desktop/src/App.svelte` (Form Studio UI + round-trip wiring + summary/report)
- `desktop/docs/MCP.md` или INSTALL — 5–10 строк «Формы Excel»
- `docs/agent-checklists/TZD-50.md`
- `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md` (checkbox)

НЕ ИЗМЕНЯТЬ:
- `frontend/**`, Angular SPA
- Google Sheets / OAuth / MCP Google
- TZD-49 scope (journal unify product/module/counterparty)
- Заказы / КП / паспорта / складские движения
- `desktop/mcp-runtime/**` без нужды
- Deploy / wipe / version bump MSI без PO

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Категория → таблица: видны только V1 таблицы; справочники V2 **не** в списке
- [ ] Скачать форму Материалы/Изделия/Модули/Контрагенты → файл открывается в Excel, заголовки русские, обязательные с ` *`, есть пустая строка данных, есть скрытый `_kppdf`
- [ ] Загрузить скачанную (нетронутые заголовки) форму → авто-таблица + identity map; без красных колонок
- [ ] Строка-дубль по dedupe key → статус duplicate, **не** уходит в SoT; ok-строки уходят
- [ ] Материалы: propose→confirm; non-material: Policy A confirm; итог N/M на экране + файл отчёта отклонений
- [ ] Чужой Excel без `_kppdf` — прежний Import Studio без регресса
- [ ] UI полностью на русском; light читаем
- [ ] Gates:
```text
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && pnpm test   # или существующий test script; минимум excel-form-template + excel + multi-import
```
- [ ] `## Executor report (auto)` в checklist; archive `tasks/_archive/2026-08/TZD-50.done.md`; lock `.mimocode/locks/TZD-50-desktop-excel-form-studio.lock`
- [ ] Cursor/PO PASS перед «закрыта» (качество 98+)

known_limitation:
- Справочники warehouse/workType/color/category → **TZD-51**
- Единый journal для non-material → TZD-49 PARK
- Паспорта изделий → WAVE-PRODUCT-PASSPORTS (нужна ссылка PO)

═══════════════════════════════════════════════════════════════
HANDOFF
═══════════════════════════════════════════════════════════════

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-50.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт App.svelte/TZD-49 = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/TZD-50-desktop-excel-form-download.md и выполни TZD-50.
Archive только после Cursor/PO PASS.
