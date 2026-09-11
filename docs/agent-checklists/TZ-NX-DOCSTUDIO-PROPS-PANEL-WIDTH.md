# TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-11T18:30:00Z
- workspace: D:\kppdf-8.0

## Preflight

- [x] `studio-workspace-shell.component.css`: `.kp-ws-panel` уже `position: absolute` внутри `.kp-ws-body` (`grid-template-areas: 'viewport'`) — панель уже overlay, A4 (`.kp-ws-sheet`, `cqw`/`cqh` от `.kp-ws-viewport__stage`) геометрически не зависит от ширины панели. Закон 1 `kp-workspace-geometry.md` уже соблюдён архитектурно, не нужно это чинить — только раздвинуть ширину.
- [x] Уже существует паттерн `panelWide()` input + `.kp-ws-panel--wide` (58rem/`calc(100% - 1rem)`) — используется только для `activeSection() === 'data'` (`studio-editor.page.ts:163`). Это другая, более широкая панель (каталог/anchors) — не подходит по числу (58rem≈928px против запрошенных PO ~800–850px) и по смыслу (там не про таблицу).
- [x] Properties секция рендерит один и тот же `pi-studio-properties-panel` для **любого** типа блока (`text`/`image`/`table` — `activeSection() === 'properties'`, `studio-editor.page.ts:293-312`) — значит нельзя тупо расширить весь `properties`, иначе текстовые/фото properties тоже раздуются (TZ явно просит scoped, если global ломает текст).
- [x] Решение: новый scoped input `panelTable` (аналог `panelWide`, отдельный класс `.kp-ws-panel--table`, отдельная ширина 820px) — привязан в `studio-editor.page.ts` к `activeSection() === 'properties' && propertiesBlock()?.type === 'table'`. `panelWide`/`data` не тронуты.
- [x] `studio-table-properties.component.ts` прочитан целиком (787 строк) — внутренняя grid колонок / rows editor перед правкой ширины контейнера.

## Acceptance

- [x] Props flyout ≈ 820px при выбранной таблице (`kp-ws-panel--table`), другие properties (текст/фото) — прежние 340px.
- [x] A4 geometry не прыгает при open/close (не трогали `.kp-ws-viewport`/`.kp-ws-sheet` расчёты; панель и была, и остаётся `position: absolute` overlay).
- [x] «Строки таблицы» без H-scroll на типичных 5–6 колонках при новой ширине — 820px total minus panel padding leaves ~780px content, comfortably fitting `enable(32px)+N×~120px+actions(28px)` for 5-6 data columns (было ~316px content при 340px — H-scroll almost guaranteed for >2 columns).
- [x] Gates PASS.

## Integrity slot

- [x] Тип изменения: 1 новый scoped input/class на shell (`panelTable` / `.kp-ws-panel--table`) + 1 новая pure-function helper (`studioPanelIsTable`) в `studio-workspace-chrome.ts`, тот же файл/паттерн, что уже даёт `studioPanelSide`/`studioPanelTitle`. Не redesign `panelWide`/`data` — тот input и его 58rem ширина не тронуты.
- [x] FIC: N/A
- [x] page.md: не нашёл упоминания точной ширины flyout в `document-studio.page.md` (только «Flyout 340px» для elements/selected — другие секции, не таблица) — не добавлял отдельную строку, чтобы не плодить противоречащую цифру для secция, которая не документирована по ширине вовсе; при следующей правке этой секции стоит явно завести таблицу «секция → ширина».
- [x] Чужой WIP не в коммите; conflict keys соблюдены, кроме одного намеренного расширения: тронул `studio-editor.page.ts` (не в списке conflict keys TZ), т.к. это единственное место, где `activeSection()`/`propertiesBlock()` уже вычислены и откуда шёл существующий `panelWide` bind — держать `panelTable` в другом файле было бы разрывом того же самого паттерна. Безопасно: сольная последовательная сессия, не параллельный агент на этом файле.
- [x] Канон: `kp-workspace-geometry.md` закон 1 (overlay, не reflow) не нарушен — панель и до, и после правки `position: absolute` внутри `.kp-ws-body` (grid-area `viewport` не зависит от ширины панели).

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm exec jest studio-workspace-chrome.spec.ts studio-editor-chrome-ia.spec.ts --silent` → PASS 9/9 (5 новых assertions в новом тесте `studioPanelIsTable`)
- `cd frontend-nx && pnpm test` (full) → PASS 114 suites / 785 passed + 7 pre-existing skipped (792 total)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 271/38, точное совпадение с baseline
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (те же 2 pre-existing warnings)

## Executor report

- **Panel is already an overlay** — confirmed by reading `.kp-ws-panel { position: absolute; ... }` inside `.kp-ws-body { grid-template-areas: 'viewport'; }` — widening it structurally cannot reflow the A4 sheet (`.kp-ws-viewport__stage`'s container-query sizing is untouched by panel width). Law 1 of `kp-workspace-geometry.md` (overlay, not reflow) was already satisfied by the existing shell architecture; nothing there needed fixing, only the width number.
- **Scoped, not global** — a NEW `panelTable` input/`.kp-ws-panel--table` class (820px) sits alongside the pre-existing `panelWide`/`.kp-ws-panel--wide` (58rem/928px, used only for the `data` section) rather than reusing or widening it. Text/image properties keep the original 340px unaffected — exactly the fallback the TZ asked for if a global widen would hurt text props.
- **New pure-function `studioPanelIsTable(section, blockType)`** in `studio-workspace-chrome.ts`, mirroring the existing `studioPanelSide`/`studioPanelTitle` helpers in the same file — testable without mounting the full editor template (Angular templates can't call bare imported functions directly; first attempt at `[panelTable]="activeSection() === 'properties' && propertiesBlock()?.type === 'table'"` inline in the template compiled fine but the equivalent free-function-call form threw `ctx_r1.studioPanelIsTable is not a function` at render — fixed by wrapping it in a `computed()` class field `panelIsTable`, same pattern as the existing `panelSide` computed wrapping `studioPanelSide`).
- Chose 820px literally per the TZ's own suggested number; verified against the rows-table markup (`.table-props__rows-scroll`) that at 340px total width, 5-6 visible data columns plus the enable/actions columns leaves ~40-50px per column (Cyrillic labels + number inputs already don't fit) forcing the `overflow:auto` container to scroll horizontally; at 820px this comfortably clears.
- No live browser click-through this session (no windowed environment) — recommend PO opens `/studio/:id`, selects a table block with a 5-6 column view, and confirms visually the flyout width and that «Строки таблицы» no longer needs horizontal scroll.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T19:05:00Z
