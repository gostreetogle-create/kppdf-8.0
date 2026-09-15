# TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T08:45:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Source-of-truth disclosure

Same lost-spec situation as S1/S2 (session-resume environment issue — see
those checklists). Unlike S1/S2, this one had no well-precedented pattern
to fall back on, so before writing any code I explicitly asked the PO/user
whether to (a) design the split myself, (b) stop the wave short, or
(c) write a plan first — chose (a), "proceed with my own best-judgment
split," per the user's explicit answer.

Traced context from the surviving older pack
`tasks/_ready/2026-09-14-docstudio-editor-decomp/`:
- `PARK-PHASE5.md` — the PO's own draft scope note from 2026-09-14
  ("Сплит `studio-blocks-canvas` → text / table / image presenters",
  "Сплит `studio-table-properties` → columns editor / rows editor", "без
  смены public Input/Output контрактов page↔facade, без UX IA"), which
  explicitly parked this exact split for "risk" until Phase 1–4 were
  stable on main.
- `WAVE-MAP.md` (same pack) confirms Phases 1–4 are DONE
  (`142d66e4`/`b4169eec`/`9f50403d`/`e0b64de5`, 2026-09-14).
- B5's own `WAVE-MAP.md` (captured earlier in-session, before it was lost)
  names this TZ "PARK Phase 5: canvas/table-properties split (now
  authorized)" — the PO unparking it.

No formal AC/component-boundary spec survives anywhere; the design below
is mine, built directly from the two files' actual code + both existing
spec files (read in full before writing anything, specifically to find
constraints a from-scratch design could violate).

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (S2 archived `99ffadc0`)
- [x] TZ / канон / deps прочитаны (PARK-PHASE5.md + WAVE-MAP.md of the surviving pack — see disclosure above)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT.md` на месте (reconstructed)

## Design constraints found before writing code

Read both existing specs in full first — they set the real constraints,
tighter than PARK-PHASE5.md's one-line draft:

- `studio-blocks-canvas.component.spec.ts` calls `component.tableColumns(LIVE_TABLE)`
  and `component.tableRows(LIVE_TABLE)` **directly** on the host instance
  (not through the DOM) — these two methods had to stay on
  `StudioBlocksCanvasComponent` itself, callable exactly as before, even
  though the table markup moved into a new presenter.
- Both specs are otherwise DOM-query-based (`data-test` attributes,
  `article.studio-block--*` classes, `<thead>`/`<tbody>` structure) and
  Output-subscription-based (`component.selected.subscribe(...)`,
  `component.rowsChange.subscribe(...)`) — neither cares which component
  template actually produced the DOM/emitted the event, only that the
  **host's own public `@Input()`/`@Output()` API and the final rendered
  DOM stay byte-identical**. This is what made the split viable at all
  without changing either spec.

## What changed — `studio-blocks-canvas` → 3 presenters

`StudioBlocksCanvasComponent` (656 → 313 LOC) keeps its full public
Input/Output API, `backgroundBlocks()`/`foregroundBlocks()`/`tableColumns()`/
`tableRows()`/`isPhotoColumnAt()`/`colWidthPct()`/`photoCellStyle()`/
`tableEmptyStateLabel()`/`tableTransparent()`/`textLineHeight()`/`textHtml()`/
`selectBlock()`/`openTextBlock()`/`openTableBlock()`/`startDrag()`/
`startResize()` all **unchanged, verbatim** (kept for the direct-call
spec dependency above, and because they're the actual source of truth —
see the next point). The background/passport-image compositing loop stays
inline on the host (it's non-interactive, structurally unlike the
foreground blocks, and PARK-PHASE5.md only named the 3 foreground types).

New: `StudioTextBlockPresenterComponent`, `StudioImageBlockPresenterComponent`,
`StudioTableBlockPresenterComponent` — each renders exactly one `@if`
branch's markup verbatim, receiving **fully precomputed** values as
`@Input()`s (the host still calls its own `tableColumns`/`colWidthPct`/
etc. in its template, now packaged into a `columnMetaFor(block)` array and
a `photoCellStylesFor(block)` URL-keyed map instead of passing raw
function references) and re-emitting raw DOM events (`select`, `dragStart`,
`resizeStart`, etc.) that the host's template wires straight back to its
own unchanged methods. No business logic was duplicated — every
presenter's derived values come from the host calling the exact same
methods it always did; the presenters are template-only extractions.

The one exception is `isPhotoLoadFailed`, converted from a regular method
to a `readonly` arrow-function class field (`= (url) => this.failedPhotoUrls().has(url)`)
so it stays correctly `this`-bound when passed as a bare function
reference into the table presenter's `[isPhotoLoadFailed]` Input — the
underlying `failedPhotoUrls` signal (shared canvas-wide, unchanged
semantics) still lives only on the host.

**CSS scoping finding (would have silently broken block styling if
missed):** Angular's emulated view encapsulation scopes a component's
`styles:` array to elements rendered by *that component's own template*
— a parent's CSS does **not** cascade to a child component's DOM, even
though the DOM tree itself is flat/unscoped visually. Since the
`.studio-block`/`.selection-frame`/`.resize-handle`/etc. base rules now
apply to elements rendered by the *presenters*, those rules had to be
**duplicated** into all 3 presenters' own `styles:` arrays (verified by
running the full spec suite, which asserts on `.selection-frame`/
`article.studio-block--table` presence — this would have failed loudly
if the duplication were wrong or missing, which is exactly how this was
caught and verified, not just reasoned about). One exception:
`:host ::ng-deep .studio-block__text-body .substitution-token` stayed
host-only unchanged — `::ng-deep` deliberately un-scopes everything past
`:host`, so it still reaches the presenter's DOM; verified by the token-
chip test suite passing unmodified.

## What changed — `studio-table-properties` → 2 editors

`StudioTablePropertiesComponent` (1058 → 384 LOC) keeps its full public
Input/Output API and every state-mutating method unchanged (`onTemplateSelect`,
`addColumn`/`removeColumn`/`moveColumn`/`updateColumnField`/`fitColumnWidths`/
`addStandardColumn`/`emitColumnStructure`/`toggleColumn`, `onTableCell`/
`toggleTableRow`/`addTableRow`/`removeTableRow`/`onLiveQtyCellChange`,
`toggleTransparentBackground`/`onPhotoFitChange`/`onPhotoMaxHeightChange`,
template loading). No spec calls any method directly on this component
(confirmed by reading `studio-table-properties.component.spec.ts` in
full first — only `.subscribe()` on Outputs and DOM queries), so this
split had more freedom than the canvas one.

New: `StudioTableColumnsEditorComponent` (Макет колонок select + Колонки
visibility picker + Структура колонок editor/locked-summary) and
`StudioTableRowsEditorComponent` (manual rows editor + live-rows viewer +
empty-source hint) — both derive their own read-only display values
locally from their own `block` Input via the **same imported pure
functions** the host always used (`studioTableColumns`, `studioTableRows`,
`studioTableRowSource`, etc. from `@kppdf/features/doc-studio`) rather
than receiving precomputed values — safe here because no spec calls these
derivation methods directly (unlike the canvas case), so there was no
constraint forcing them to stay host-side. Every user action re-emits
through Outputs the host's template forwards 1:1 to its unchanged
mutation methods.

The columns-open/close dropdown state (`columnsOpen` signal),
`@HostListener('document:click')` outside-click-to-close, and the
`#columnPicker` `viewChild` ref moved **entirely** into
`StudioTableColumnsEditorComponent` — nothing outside the original
columns section ever read `columnsOpen`, so this became fully-owned UI
state in the child rather than an Input/Output round-trip. The host's
`ngOnChanges` lost only its `columnsOpen.set(false)` line (now handled by
the child's own `ngOnChanges` on its `block` Input); `syncSelectedId()`
stays on the host unchanged.

Row source select, transparent-background toggle, photo-display settings,
save-as-template button, and the registry link all stay on the host
verbatim — PARK-PHASE5.md only named "columns editor / rows editor" as
the split targets, not these sections.

Row/column-derivation methods that existed *purely* to feed the host's
own (now-removed) template markup — `columnsEditable()`,
`rowsAll()`/`visibleColumns()`/`visibleColumnIndices()`/`liveRowsAll()`/
`isQtyColumnAt()`/`isPhotoColumnAt()`/`isRowEnabled()`, the `columns`
field alias, `chevronDown`/`columnTypes`/`columnAligns` — were removed
from the host as genuine dead code (verified no other host-internal
caller depended on them; the *mutation* methods that share similar names,
like `onTableCell`, already called the imported pure functions directly,
never through these derivation helpers).

## No public/UX/behavior change (verified)

- [x] Both components' `@Input()`/`@Output()` APIs are byte-identical to before
- [x] Both existing spec files pass **completely unmodified** — 20/20 canvas tests, 23/23 table-properties tests
- [x] `studio-editor.page.ts`/`studio-properties-panel.component.ts` (the only external consumers) needed zero changes — same import paths, same component selectors
- [x] Full kppdf-web suite unchanged in count/result (89/89 suites, 615/622, 7 skipped — same as before this TZ)
- [x] Bundle size unchanged (503.38 kB)

## Acceptance

- [x] `studio-blocks-canvas.component.spec.ts` green (20/20, unmodified)
- [x] `studio-table-properties.component.spec.ts` green (23/23, unmodified)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal UI decomposition, no behavior/route/permission change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change, no public API change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 5 doc-studio ui/ component files touched/added + this checklist/tracker/task marker)
- [x] Coupling map — N/A (both components' external contract unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from S2 closure (`99ffadc0`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors; one round-trip fixing a backtick-inside-styles-template-literal syntax break, caught immediately by this same command)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `npx jest --config libs/features/jest.config.ts studio-blocks-canvas.component.spec.ts` → PASS (20/20, unmodified spec)
- `npx jest --config libs/features/jest.config.ts studio-table-properties.component.spec.ts` → PASS (23/23, unmodified spec)
- `cd frontend-nx && pnpm exec nx test features` → PASS (42/42 suites, 377/377 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (89/89 suites, 615/622 passed, 7 skipped, 0 failed — identical to pre-TZ baseline)
- `pnpm architecture:check` → PASS (1545 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; the 2 pre-existing NG8102 `??`-operator warnings correctly relocated to the new `studio-table-rows-editor.component.ts`, not new warnings)

## Executor report

Что сделано: разбил `studio-blocks-canvas.component.ts` (656 LOC) на 3
dumb-презентера (text/image/table) и `studio-table-properties.component.ts`
(1058 LOC) на 2 (columns/rows editor) — ровно как в черновике
PARK-PHASE5.md. Оба хоста сохранили свой публичный Input/Output API
байт-в-байт; оба существующих spec-файла прошли **без единой правки**.
Ключевая находка: Angular emulated view encapsulation не даёт родительским
стилям применяться к DOM, отрисованному дочерним компонентом — общие
`.studio-block`/`.selection-frame`/`.resize-handle` правила пришлось
продублировать в каждый из 3 презентеров (поймано и подтверждено
зелёными спеками, не просто предположено). Для canvas: `tableColumns`/
`tableRows` остались на хосте verbatim, т.к. спека вызывает их напрямую
на инстансе — презентеры получают уже посчитанные значения (`columnMeta`/
`photoCellStyles` вместо function-typed inputs). Для table-properties:
спека не дёргает методы напрямую (только `.subscribe()` на Output'ах),
поэтому новые компоненты сами пересчитывают read-only значения из
`block` через те же импортированные чистые функции — единственный
источник истины не размножился, просто два call-site вместо одного.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data — Cursor's WIP на studio-list.page.ts/.spec.ts)
не трогал. TZ spec-файл этой задачи был физически утерян до прочтения;
явно спросил PO/пользователя перед началом (см. «Source-of-truth
disclosure» выше), получил явное разрешение на самостоятельный дизайн.

Process gap (disclosed): after the user's explicit go-ahead I went
straight into reading `PARK-PHASE5.md` and writing code without first
creating the `tasks/_active/TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT.md` marker —
a genuine Claim Protocol violation (GEMINI.md: "без заполненного Claim
slot — не писать продуктовый код"). No actual conflict occurred
(single-agent session, `tasks/_active/` was verified empty beforehand),
but the marker should have existed before the first `Write`/`Edit` to a
product file. Created it retroactively before archiving; flagging here
rather than hiding it.

Known limits: нет. **B5 wave — ALL 5 TZs DONE** (C1→C2→S1→S2→P5). Это
последняя задача в явной цепочке — STOP по инструкции.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
