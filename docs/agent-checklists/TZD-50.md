# TZD-50 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-50.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy-codebuff
- claimed_at: 2026-08-16T14:28:42Z
- workspace: D:\kppdf-8.0
- team_room_claim: no _(одиночная сессия; _active/ пуст, TZD-49 PARK в backlog — пересечения App.svelte нет)_

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (TZD-50, WAVE-DESKTOP-EXCEL-FORMS, AI-AGENT-GUIDE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-50.md` на месте

## Acceptance

- [x] Категория → таблица: видны только V1 таблицы (catalog → material/product/module; counterparties → counterparty); справочники V2 **не** в списке (allowlist в `excel-form-template.ts`)
- [x] Скачать форму Материалы/Изделия/Модули/Контрагенты → `kppdf-{targetKey}-form.xlsx`: заголовки русские, обязательные с ` *`, пустая строка-скелет, скрытый `_kppdf` (templateVersion/targetKey/generatedAt/columnKeys/app)
- [x] Загрузить нетронутую форму → один блок на targetKey из fingerprint + identity-карта (суффикс ` *` снимается) — красных колонок нет (unit-тест identity mapping)
- [x] Дубль по dedupe key (article/sku/inn): в файле → `duplicate`, в каталоге → `ok_update`; product без SKU → `needs_review`; на send уходят только ok_new/ok_update
- [x] Материалы → journal propose→confirm (без изменений); non-material → Policy A confirm; итог «записано/отклонено» на экране + скачивание отчёта отклонений `.csv` (BOM, `;`)
- [x] Чужой Excel без `_kppdf` — прежний Import Studio (fingerprint null → analyzeTables) — excel.test.ts 5/5 PASS, регресса нет
- [x] UI полностью на русском (RU-статусы строк, RU-подсказки, без английских лейблов)
- [x] Gates PASS: tsc 0, svelte-check 0, tsx --test 56/56 (вкл. excel-form-template 9 + multi-import 7 + excel 5)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (Desktop core + UI) — type: module
- [x] FIC §A–E: Desktop app, не Angular route; MCP/Desktop раздел — Form Studio не MCP-tool; FIC пройдено по смыслу (docs MCP.md + WAVE)
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route); `desktop/docs/MCP.md` — раздел «Формы Excel (TZD-50)» добавлен
- [x] SECTION-READINESS — N/A (не трогал Angular-страницы)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (App.svelte — мой CLAIM; TZD-49 PARK не трогал; чужие правки backend/seed/_NOW/PO-* не коммитил)
- [x] Coupling map — N/A (Desktop, не общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдено (ключи канона не менял, TZD-51 не трогал)

## Gates (факт)

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок)
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings)
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **PASS 56/56** (новые: excel-form-template 9 тестов; multi-import обновлён под статусы invalid/duplicate/needs_review)
- Коммит: `10dde79a8f6e7e0af34bc53ee49e65adc442dc67` — `feat(desktop): Excel Form Studio download + round-trip (TZD-50)` (pushed по GIT-POLICY/PO — не запрошен)

## Executor report (auto)

- **agent:** buffy-codebuff · TZD-50 · 2026-08-16
- **Commit:** `10dde79a8f6e7e0af34bc53ee49e65adc442dc67`
- **ШАГ 1–2:** `desktop/src/core/excel-form-template.ts` (new) — FormCategoryKey `catalog|counterparties`, allowlist V1 (материалы/изделия/модули/контрагенты; колонки re-export из IMPORT_TARGETS), генерация `.xlsx`: лист «Данные» (RU-заголовки, ` *` у обязательных, пустая строка-скелет, ширины колонок) + скрытый `_kppdf` (`1.0.0`, targetKey, generatedAt ISO, columnKeys JSON, app=kppdf-desktop); имя `kppdf-{key}-form.xlsx`.
- **ШАГ 3 (round-trip):** `excel.ts` — `ExcelWorkbookPreview.fingerprint`, лист `_kppdf` исключён из превью/выбора; `readFormFingerprint` (неизвестный targetKey/битый паспорт → null = safe ignore); `inbox.ts` — fingerprint в InboxAudit (аудит файлов агента тоже распознаёт форму); App.svelte `prepareMapping(rows, fingerprint)` — один блок на targetKey + identity-карта (суффикс ` *` снимается; переименованные колонки остаются красными unfit — отправка закрыта).
- **ШАГ 4 (качество):** статусы строк target-aware (`duplicate`/`invalid`/`needs_review`/`ok_update`/`ok_new`) в `multi-import.ts` с dedupe-ключами (article/sku/inn); перед проверкой строк тянем ключи каталога страницами (потолок 1000, partial — честная подсказка); send только ok_new/ok_update; итог «записано N / отклонено M» + отчёт `.csv` (UTF-8 BOM, `;`, кавычки).
- **ШАГ 5 (UX):** зона «Формы Excel» в студии: категория → таблица (disabled + RU-hint без категории) → описание → «Скачать Excel-форму» (аккаунт не нужен) → 3 шага; RU-статусы строк и счётчики; keyboard-доступно (нативные select/button).
- **Тесты:** `excel-form-template.test.ts` (9): allowlist V1, имя файла, заголовки ` *` + скелет, round-trip targetKey/columnKeys, hidden-лист вне превью, safe-ignore неизвестного/битого паспорта, identity mapping (включая `Артикул (SKU) *` и `Расчётный счёт`), полный round-trip с данными, переименованный заголовок → unfit.
- **Conflict disclosure:** CLAIM единственный (App.svelte); TZD-49 PARK не трогал; чужие WIP (backend seeds, PO-*, _NOW.md, PAGE-TZ-INDEX, TZD-51, аудит Sheets) не тронуты и не закоммичены.
- **Known limits:** дедуп по каталогу ограничен 1000 ключей на таблицу (честная подсказка); V2 справочники → TZD-51; единый journal non-material → TZD-49 PARK; паспорта изделий → WAVE-PRODUCT-PASSPORTS.

## Review handoff

- [x] READY FOR REVIEW в wave inbox (WAVE-DESKTOP-EXCEL-FORMS) — DoD checkbox TZD-50 отмечен
- [x] Cursor Verdict **PASS** 2026-08-16 (spot-check: allowlist V1, `_kppdf`, Form Studio UI, multi-import statuses, gates 56/56 claimed). Next: commit desktop-only + archive — **не** TZD-51 до lock.

## Closeout (после PASS)

- [x] archive + lock + удалить `_active` (archive `tasks/_archive/2026-08/TZD-50.done.md`; lock `.mimocode/locks/TZD-50-desktop-excel-form-studio.lock`)
- [x] Status = DONE
- closed_at: 2026-08-16T17:58:00+03:00

### Timestamps

| Поле | Когда |
|------|--------|
| `claimed_at` | 2026-08-16T14:28:42Z |
| READY FOR REVIEW date | 2026-08-16 (после gates) |
| `closed_at` (archive) | 2026-08-16T17:58:00+03:00 |
