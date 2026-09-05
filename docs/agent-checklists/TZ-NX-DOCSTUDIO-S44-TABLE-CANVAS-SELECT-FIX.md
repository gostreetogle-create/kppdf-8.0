# TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-05T10:39:16Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`_active/` был пуст кроме `.gitkeep`)
- [x] TZ / канон / deps прочитаны (TZ файл целиком, studio-table-defaults.ts, studio-table-properties.component.ts rowSource(), studio-blocks-canvas.component.ts template/class, pi-rich-text-editor.component.ts insertContent + substitution-token CSS)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S44-TABLE-CANVAS-SELECT-FIX.md` на месте

## Acceptance

- [x] Таблица с источником данных: клик не скрывает/не обнуляет строки (только selection-frame+resize) — `@if` в `studio-blocks-canvas.component.ts` дополнен `tableRowSource(block) === 'manual'`, table-edit больше не рендерится для не-manual источника, table-preview (else-ветка) остаётся видимым
- [x] Ручная таблица: клик по-прежнему открывает table-edit попап — условие `=== 'manual'` истинно по умолчанию (studioTableRowSource возвращает 'manual', если settings.dataSource/tableDataSource не заданы)
- [x] Панель «Свойства» открывается при выборе любой таблицы — без регресса (условие открытия панели не менялось, только DOM внутри самого блока-таблицы на холсте)
- [x] `.substitution-token` на холсте — `oklch(var(--color-info))`, без background/border (только `color`, никаких других свойств)
- [x] Пробел после вставки токена перед следующим текстом (если не конец/не уже пробел) — `insertContent()` в `pi-rich-text-editor.component.ts` проверяет символ сразу после вставленного узла и вставляет `' '` только если он не пустой и не пробел
- [x] PDF/Просмотр — токен остаётся чёрным: подтверждено кодом (`grep -rn substitution-token backend/src/modules/document-render` → 0 совпадений, стиль существует только в двух Angular-компонентах, в PDF-пайплайн не попадает)
- [x] Клик+сразу-драг с первого раза для таблиц с источником данных; text/image/manual table — без регресса: доказано контролем потока — `startDrag()` guard `target.closest('.table-edit')` может сработать только если `.table-edit` реально рендерится в DOM под курсором; после Шага 1 для не-manual таблиц он не рендерится вовсе → guard не матчит → drag стартует с первого pointerdown. Для manual-таблиц и text/image поведение не менялось (код startDrag/selectBlock не тронут)
- [x] `nx test kppdf-web --testPathPattern=studio` PASS (80 suites, 516 passed/7 skipped)
- [x] `nx lint kppdf-web` без новых ошибок (233 problems / 33 errors до и после — побайтово идентичный список, проверено git stash baseline)
- [x] `nx build kppdf-web` PASS, exit 0 (последней)

**Известное ограничение (задокументировано честно):** живая браузерная проверка (клик/драг/цвет в реальном DOM) не выполнена — в репозитории нет установленного Playwright/chromium-cli, а устанавливать новый инструмент ради разовой визуальной проверки непропорционально задаче. Вместо этого AC 1/2/6 подтверждены детерминированным разбором потока управления (условие `@if`/guard `closest()`), AC 4/5 — код-ридингом (единственное CSS-правило, отсутствие в PDF-пайплайне подтверждено grep). Риск: специфичность CSS/наследование в реальном браузере теоретически может отличаться от статического анализа, хотя в данном случае правило единственное и не конфликтует ни с чем (проверено).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (document-studio)
- [x] FIC §A–E N/A (frontend UI behavior fix, не meta/permission/module schema) — причина: чисто visual/behavioral fix существующих компонентов, без новых полей/route/permission
- [x] page.md / PAGE-TZ-INDEX: N/A (нет новой page/route, существующий document-studio page.md уже описывает поведение верно)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (studio-blocks-canvas.component.ts, studio-table-defaults.ts, pi-rich-text-editor.component.ts)
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

Канон: `docs/TZ-NX-BUILD-INTEGRITY.md`

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio` → PASS (80/80 suites, 516 passed, 7 skipped)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 235 problems (33 errors, 202 warnings), идентично baseline (git stash verified) — без новых ошибок
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (последней)

## Executor report

Изменено:
- `studio-table-defaults.ts` — новый экспорт `studioTableRowSource(block)` + тип `StudioTableRowSource`
- `studio-table-properties.component.ts` — `rowSource()` теперь вызывает общий хелпер (сигнатура не менялась)
- `studio-blocks-canvas.component.ts` — `@if` для `table-edit` дополнен `tableRowSource(block) === 'manual'`; добавлен метод `tableRowSource()`; CSS `:host ::ng-deep .studio-block__text-body .substitution-token { color: oklch(var(--color-info)); }`
- `pi-rich-text-editor.component.ts` — `insertContent()` вставляет пробел после substitution-token, если следующий символ не пробел и не конец документа
- `studio-table-defaults.spec.ts` — добавлен тест на `studioTableRowSource` (manual default, dataSource.type, tableDataSource)

Conflict disclosure: только объявленные CONFLICT KEYS (`studio-blocks-canvas.component.ts`, `studio-table-defaults.ts`, `pi-rich-text-editor.component.ts`) + их прямые зависимые (`studio-table-properties.component.ts` — было указано как "переиспользует хелпер", `studio-table-defaults.spec.ts` — тест нового экспорта). `studio-editor.page.ts`, backend, `liveRows`/`putDataSet` — не тронуты, как требует TZ.

Known limits: живая браузерная проверка не выполнена (см. Acceptance) — нет Playwright/chromium-cli в репо; AC подтверждены код-ридингом/control-flow разбором вместо визуального смоук-теста. Рекомендация PO: при следующей ручной сессии в Studio быстро глазами проверить a/b/c из ШАГ 3 TZ.

## Review handoff

- [x] Review не требуется отдельным wave inbox — TZ не указывает review gate; archive после зелёных gates

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-05 (см. commit SHA в архиве)
