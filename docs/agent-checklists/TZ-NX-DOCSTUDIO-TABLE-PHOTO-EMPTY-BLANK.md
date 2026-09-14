# TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as part of a "Freebuff" UI-pack wave prompt but actually
> run in a Claude Code session — same budget-labeling routing note as the rest of this
> wave (`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`). `agent_id: claude`
> below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T08:15:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` empty before claim — no conflicting agent on the canvas/resolver/table-template conflict keys
- [x] TZ read (`tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.md`)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.md` на месте

## Acceptance

- [x] Live table row without photo: photo cell visually blank; DOM/PDF HTML не содержит «Нет фото» (live-verified both canvas and backend preview HTML)
- [x] Row with valid photo: img as now (unchanged code path, unit + live smoke confirm the populated-photo branch untouched)
- [x] Gates: focused FE+BE specs + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend template/CSS tweak + backend string-literal fix, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` — new sentence appended to the existing S48 paragraph
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите — `docs/PO-CANON.md`/`docs/PO-SHARED-UNDERSTANDING.md`/`docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent left untouched, not staged
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start, confirmed at TZ 5a close)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- FE: `cd frontend-nx && pnpm exec nx test kppdf-web` → 129 suites / 982 tests (975 passed, 7 skipped)
- FE: `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 314 warnings; **git-stash -u A/B verified** baseline (without this TZ's diff) = 38 errors / 314 warnings — 0 new errors, 0 new warnings (this TZ's diff removed lines, added none lint-relevant)
- FE: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- BE: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → clean
- BE: `cd backend && pnpm test` → 136 suites / 1369 tests passed
- BE: `cd backend && pnpm lint` → 0 errors (202 pre-existing `any` warnings, untouched files)
- `pnpm architecture:check` (root) → passed (1488 files; baseline 17; resolved since baseline: 2)
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-docstudio-table-photo-empty-blank-smoke.mjs` — created a table with a genuinely-empty photo row («Без фото») and a broken-URL photo row («Битое фото», non-existent `/uploads/...` path). 9/9 checks PASS: backend `POST :id/preview` HTML has no «Нет фото» text, no `pi-photo-empty` class anywhere, and the empty row's photo `<td>` is a bare `<td style="...">​</td>` (evidence captured verbatim in the smoke JSON); on canvas, no «Нет фото» text anywhere in the page, the empty row never gets an `<img>`, and after forcing the broken photo's `error` event (a real dev-server 404 for the non-existent path can already resolve inside the page-load wait, so whether it self-heals before or after our explicit dispatch is a timing race not asserted either way) the cell is a bare blank string, not text or a stray broken-image icon. Evidence: `reports/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK-smoke.json`, `-1-before-error.png`, `-2-after-error.png` (both rows visibly blank photo cells in the Свойства «Строки таблицы» preview and on the A4 canvas).

## Executor report

- **FE canvas** (`studio-blocks-canvas.component.ts`): removed the `<span class="table-preview__photo-empty">Нет фото</span>` `@else` branch in the photo-cell template — an empty/failed photo cell now renders nothing inside the `<td>`. Removed the now-dead `.table-preview__photo-empty` CSS rule. Row height is unaffected — it already came from the shared `.table-preview th, .table-preview td { padding: 2px 4px; }` rule, not from this span's own line-height.
- **BE resolver** (`studio-data-resolver.ts` `renderPhotoCellHtml`): `if (!url) return '<span class="pi-photo-empty">Нет фото</span>'` → `return ''`.
- **BE legacy table-template** (`table-template.service.ts` `formatCell`/`formatImageCell`): all four `'<span class="pi-photo-empty">Нет фото</span>'` returns (empty string, `[img]`/`[image]`/`[фото]`/`[photo]` sample placeholder, null/undefined/empty value, and unresolved/unsafe URL) → `''`.
- **Tests**: FE `studio-blocks-canvas.component.spec.ts` — the two S48/PHOTO-BROKEN-IMG tests that asserted the OLD "Нет фото" text now assert `textContent?.trim() === ''` instead (this TZ's own intended reversal, not a regression). BE: `studio-data-resolver.spec.ts` (photo-empty-cell test rewritten to assert absence of the label + presence of a bare empty `<td>`; the orphaned-photo-reference test's title corrected — it was never actually asserting HTML text, only the raw resolved row value, which is unaffected by this TZ), `table-template.service.spec.ts` (3 tests: `[img]` placeholder, null/empty value, unsafe URL — all flipped from `toContain('Нет фото')` to `not.toContain(...)` + `not.toContain('pi-photo-empty')`), `document-template.assets.spec.ts` (one test's mock `tableTemplate.preview` double updated to return `''` instead of the old span, matching the real service it stands in for).
- **Docs**: `docs/pages/document-studio.page.md` — appended one bolded sentence to the existing S48 paragraph documenting the PO reversal (empty/broken → blank, not "Нет фото"), with the reasoning (row height stays from `td` padding, browser broken-image icon still suppressed via the pre-existing `isPhotoLoadFailed`/`onerror` mechanism from `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG`).
- Known limits: none beyond the TZ's own stated non-goals (showcase/catalog card "Нет фото" outside a table cell is a separate, already-tracked successor — `TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG`, already closed per `document-studio.page.md` — not touched here; this TZ is table-cell only).
- Live-smoke design note for the next TZ author: a manual table's `tableTemplateSampleRows` photo cell is rendered as-is by the backend HTML path (no on-disk file-existence check — that only happens for catalog *live* rows via `studio-data-resolver.ts`'s `localUploadFileExists`), so a broken-but-non-empty URL string legitimately still gets an `<img>` tag in the backend preview HTML; don't assert otherwise for a manually-authored row.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
