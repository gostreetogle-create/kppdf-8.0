# TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as part of a "Freebuff" UI-pack wave prompt but actually
> run in a Claude Code session — same budget-labeling routing note as the rest of this
> wave (`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`). `agent_id: claude`
> below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T08:35:59Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` empty before claim — no conflicting agent on `studio-table-properties.component.ts` / `studio-editor.page.ts`
- [x] TZ read (`tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md`) + `docs/audits/2026-09-13-docstudio-table-rows-source-cleanup.md` (PO verdict: DELETE the whole status+Обновить+Сменить block)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md` на месте

## Acceptance

- [x] Catalog table props: нет «Обновить строки» / «Сменить…» / «Из Выбрано: …» (live-verified, zero source control renders at all)
- [x] Изменить Выбрано → лист обновляется без этой кнопки (unaffected — `onCatalogSelectionChange` already re-`putDataSet`s on every buffer change; covered by existing unchanged `studio-editor-catalog-insert.spec.ts` tests, not re-verified live — see Executor report)
- [x] Elements «+ Таблица» → «Источник строк» select доступен (live-verified)
- [x] Gates: table-properties specs + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend feature removal, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` — necessity-cleanup этап A paragraph rewritten to record the PO reversal + canon line
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите — `docs/PO-CANON.md`/`docs/PO-SHARED-UNDERSTANDING.md`/`docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent left untouched, not staged
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start, confirmed at TZ 5c close)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 129 suites / 981 tests (974 passed, 7 skipped) — net -4 vs prior wave state (5 old tests removed/rewritten to 3 new in properties spec, 2 editor tests removed for the deleted method)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 309 warnings; **git-stash -u A/B verified** baseline (without this TZ's diff) = 38 errors / 314 warnings — 0 new errors, 5 fewer warnings (dead code removed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed (1488 files; baseline 17; resolved since baseline: 2)
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs` — two documents. Doc A: created a fresh manual table via Elements → «+ Таблица (слой)» — Свойства still shows the plain «Источник строк» select (screenshot: `Вручную`). Doc B: a table block pre-wired to `dataSource: {type: 'catalog-products'}` with populated `liveRows` (simulating a just-Insert'ed catalog table) — Свойства shows ZERO source control: no status line, no «Обновить строки», no «Сменить…», no bare select, and no «Из Выбрано»/«Обновить строки»/«Сменить» text anywhere on the page (screenshot: the card jumps straight from «Структура колонок» to «Действия»/«Удалить слой»). 9/9 checks PASS. Evidence: `reports/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP-smoke.json`, `-1-manual-select.png`, `-2-catalog-no-control.png`.

## Executor report

- **Component** (`studio-table-properties.component.ts`): replaced the `@if (isCatalogRowSource() && !sourceChangeOpen()) { status+Обновить+Сменить } @else { select (+ Отмена for catalog) }` branch with a single `@if (!isCatalogRowSource()) { select }` — a wired catalog table now renders nothing in this slot at all, matching the audit's explicit verdict ("не показывать по умолчанию — ни status, ни enum"). Removed the now-dead `sourceChangeOpen` signal (and its two `.set(false)` call sites — `onSourceSelectChange`, `ngOnChanges`), the `refreshCatalogRows` `@Output`, `catalogSourceLabel()`/`CATALOG_SOURCE_LABELS` (only consumer was the deleted status paragraph), and the now-unused `.table-props__source-status`/`.table-props__source-actions`/`.table-props__cancel-link` CSS rules.
- **Wiring** (`studio-properties-panel.component.ts`, `studio-editor.page.ts`): removed the `(refreshCatalogRows)="tableRefreshCatalogRows.emit()"` passthrough and the `tableRefreshCatalogRows` `@Output` on the panel wrapper, the `(tableRefreshCatalogRows)="refreshActiveTableCatalogRows()"` binding on the editor page, and the now-orphaned `refreshActiveTableCatalogRows()` method itself (its only other collaborator, `refreshCatalogTablesOfKind`, is still used by Insert/D52 and VITRINA-EDIT «Изменить» — not touched).
- **Tests**: `studio-table-properties.component.spec.ts` — the necessity-A describe block's 5 tests (status shown, manual-select-shown, «Обновить» emits, «Сменить…» reveals+emits+resets, cancel, block-switch-resets) replaced with 4 tests asserting the new contract (catalog table shows nothing; manual table's select still works and emits; switching a block from manual to catalog removes the select from the DOM). `studio-editor-catalog-insert.spec.ts` — deleted the whole `refreshActiveTableCatalogRows` describe block (2 tests) that called the now-deleted method directly.
- **Docs**: `docs/pages/document-studio.page.md` — the necessity-cleanup этап A bullet about «Источник строк» rewritten in place to record both the original status+Обновить+Сменить feature AND its reversal, plus the explicit canon line the TZ asked for: "строки каталога = Выбрано + Insert; без блока Обновить/Сменить."
- Known limits: none beyond the TZ's own stated non-goals (did not touch `commitCatalogSelectionChange`'s auto-refresh, did not touch the «Строки таблицы» preview/LINE-QTY, did not reintroduce an always-visible enum for catalog — all respected as written). AC #2 (buffer-change auto-updates the sheet) is pre-existing, unaffected behavior — verified via the existing (unchanged) `onCatalogSelectionChange` unit-test coverage rather than re-driven live, since this TZ's diff never touches that code path.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
