# TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as part of a "Freebuff" UI-pack wave prompt but actually
> run in a Claude Code session — same budget-labeling routing note as the rest of this
> wave (`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`). `agent_id: claude`
> below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T08:01:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` empty before claim — no conflicting agent on `studio-table-defaults.ts` / `studio-table-properties.component.ts`
- [x] TZ read (`tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.md`)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.md` on место

## Acceptance

- [x] Кнопка «По заголовкам» на таблице с длинным «Наименование» и коротким «Ед.»/«Фото» — name-колонка заметно шире на холсте; сумма % = 100 (live-verified: 25/14/61)
- [x] После кнопки ручная правка одного % сохраняется и влияет на лист (live-verified: manual edit 25→79%, canvas `<th>` width followed)
- [x] Open старого документа **без** клика — ширины как были, равный сплит без сюрприза (live-verified: 33/33/34, no silent rewrite)
- [x] Gates: `studio-table-defaults` + `studio-table-properties` specs + `nx build kppdf-web` PASS
- [x] Archive + wave board

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend feature, pure fn + one button, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` — new paragraph after "Этап C — ширина колонок реально влияет"
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите — `docs/PO-CANON.md`/`docs/PO-SHARED-UNDERSTANDING.md`/`docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent left untouched, not staged
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start, confirmed at TZ #4 close)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 129 suites / 982 tests (975 passed, 7 skipped)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 314 warnings; **git-stash -u A/B verified** baseline (without this TZ's diff) = 38 errors / 304 warnings — 0 new errors
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed (1488 files; baseline 17; resolved since baseline: 2)
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs` — created a table block via the API with 3 equal-weight columns (short «Артикул», photo-alias «Фото», long «Наименование»), opened it in the studio. 7/7 checks PASS: opening fresh (no click) keeps the original equal split (33/33/34, no silent auto-fit — AC #3); double-click selects the table and opens Свойства (`TZ-NX-PO-SWEEP-02`: a single click only selects, this TZ's smoke initially assumed the older page.md wording and had to switch to double-click, matching `openTableBlock`/`tableEditRequest`); clicking «По заголовкам» changes the canvas `<th>` widths to 25%/14%/61% (name >> photo, sum = 100); editing one % input by hand afterwards (77) immediately changes that column's canvas width (79%) — manual override survives and applies (AC #2). Evidence: `reports/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER-smoke.json`, `-1-before.png`, `-2-after-fit.png`, `-3-manual-edit.png`.

## Executor report

- **Pure helper** (`studio-table-defaults.ts`): `fitColumnWidthsByHeader(columns)` — weighs each column by `label.trim()` code-point length (FLOOR = 2), with the TZ's exact key-alias multipliers: `photo` capped at `min(weight, 4)`, `name` × 1.4, `description` × 1.2, everything else plain length. Rounds to the nearest integer weight; `columnWidthPercents` (existing, TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY) normalizes to 100% same as any manual width, so no new percent-math was needed. A sibling `fitSingleColumnWidthByHeader(column)` applies the same weight to one column only — used at add-time so adding a column never silently rewrites the widths an operator already tuned on the others.
- **Button** (`studio-table-properties.component.ts`): «По заголовкам» (`data-test="studio-table-widths-by-header"`) next to «+ Колонка», calling `fitColumnWidths()` → `emitColumnStructure(fitColumnWidthsByHeader(...))` — same save/rehydrate path as every other column-structure edit (heals labels/types, remaps rows, filters hidden keys). Hint text updated to mention the button, per the TZ's suggested copy.
- **Defaults without surprise** (ШАГ 3 of the TZ): `createStandardStudioTableColumn` (quick-add chips) and `createStudioTableColumn` (generic «+ Колонка») both now build their new column through `fitSingleColumnWidthByHeader` instead of a flat `width: 20` — only the just-added column's width changes, existing columns are untouched, and opening an old document without clicking anything never re-fits (verified live, AC #3).
- **Tests**: `studio-table-defaults.spec.ts` — 5 new tests (name wider than photo + percents sum to 100; only width changes, not key/label/type/align; photo capped at 4 behind a long label; short label floored to ≥2; `createStandardStudioTableColumn` uses the same header-based width). Two pre-existing tests that asserted the OLD flat `width: 20` quick-add behavior (`studio-table-defaults.spec.ts`'s `createStandardStudioTableColumn` test, `studio-table-properties.component.spec.ts`'s qty/sum quick-add tests) updated to the new header-fit widths (10 and 5 respectively — this TZ's own intended behavior change, not a regression). One new test in `studio-table-properties.component.spec.ts` for the button itself (name ends up wider than photo after click).
- **Docs**: `docs/pages/document-studio.page.md` — new paragraph after the "Этап C" width-apply paragraph, explaining the button, the multiplier canon, and the single-column-only default-fit behavior.
- Known limits: none beyond the TZ's own stated non-goals (no fit-by-cell-content/canvas measureText, no auto-fit on every label keystroke or on document open — all respected as written).
- Live-smoke discovery (not a code bug, a stale doc line): `document-studio.page.md`'s older "клик по таблице = выделение + авто-открытие панели «Свойства»" line (S45) is superseded by `TZ-NX-PO-SWEEP-02` (single click now only selects; Свойства opens on **double**-click via `openTableBlock`/`tableEditRequest`) — out of this TZ's conflict keys, not touched; noted here so the next TZ's smoke-script author doesn't hit the same 20 minutes of "properties panel not opening" I did.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
