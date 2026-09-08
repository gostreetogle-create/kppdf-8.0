# TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-08T19:49:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (empty)
- [x] TZ / канон / deps прочитаны (S47 DONE; TZ text)
- [x] Claim slot заполнен **до** чтения/правки кода этой задачи; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS.md` на месте

### Preflight Check Output
- **Context read:** TZ text; S47 archive/checklist (dependency DONE)
- **Key Constraints:** A4 geometry law; print-like canvas; honest empty state, never raw qty/text as fake photo; reuse legacy `table-template.service.ts` photo cell behaviour, no Create-КП rewrite
- **Planned Deliverable:** photo-column detection + `<img>`/empty-state render on canvas and studio PDF/preview HTML
- **Validation Path:** canvas specs, resolver/output specs if touched, `nx build kppdf-web`, WAVE DONE

## Acceptance (из TZ)

- [x] After S47 map, Фото column shows image or empty state — not `1` from quantity — verified by canvas specs (`renders an <img> for a populated photo cell`, `renders «Нет фото» for an empty photo cell`) and resolver specs (`renders a photo column as an <img> thumbnail`, `renders «Нет фото» for an empty photo cell`)
- [x] Preview/PDF does not regress text columns — `renderStudioTableHtml` only branches for `isPhotoColumnKey(column.key)`; all existing non-photo-column resolver specs (subtotal/VAT footer, escaped cell values, disabled rows) still pass unchanged
- [x] Specs + `nx build kppdf-web` PASS; WAVE checklist complete — see Gates

## Gates (факт)

- `cd backend && pnpm exec jest studio-data-resolver studio-document.service studio-output` → 3 suites / 57 tests passed (incl. 3 new S48 photo-cell tests)
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → 0 errors
- `cd backend && pnpm exec eslint studio-data-resolver.ts studio-data-resolver.spec.ts` → 0 errors/warnings
- `cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/studio` (full studio dir) → 19 suites / 109 tests passed
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0; only the same pre-existing unrelated warnings (gantt-bars budget, ngModel `??` hint in a file not touched by this TZ)
- `pnpm architecture:check` → passed (1473 files; baseline 17)
- `nx lint kppdf-web` not re-run beyond S47's finding — no new files/lines in the previously-flagged a11y-error components; my touched files (`studio-blocks-canvas.component.ts`, `studio-table-defaults.ts`, resolver) carry no lint errors per the targeted eslint run above (backend) and the absence of new template interaction elements (frontend: only `<img>`/`<span>`/`<td>`, no new click handlers)

## Executor report

**Detection:** `isPhotoColumnKey`/`isStudioPhotoColumnKey` — same 9-alias key list (`photo`, `image`, `рисунок`, `photourl`, `photoid`, `photo_id`, `photoids`, `photo_ids`, `фото`) duplicated in `studio-data-resolver.ts` (backend, derived from S47's `COLUMN_ALIASES.photo`) and a new export in `studio-table-defaults.ts` (frontend) — matching this codebase's existing convention of a small per-layer alias-list copy (same pattern as `proposal-table-layout.util.ts` and `document-template.service.ts`'s `syntheticKpColumn`). No `type: 'photo'` column-type variant was added to `StudioTableColumn` — not needed for any acceptance scenario (PO canon and all specs use key-based columns only), and would have expanded scope into the type system unasked.

**Canvas (`studio-blocks-canvas.component.ts`):** new `isPhotoColumnAt(block, columnIndex)`; template's inner cell loop now branches per-cell — photo column renders `<img [src]="cell">` when non-empty (Angular's own URL sanitizer covers this binding, no manual escaping needed) or a `.table-preview__photo-empty` "Нет фото" span when empty; new CSS for `.table-preview__photo-cell/__photo/__photo-empty` using existing OKLCH tokens (`var(--color-muted-foreground)`), consistent with the file's existing style block.

**Backend (`studio-data-resolver.ts`):** `renderStudioTableHtml`'s per-cell map now checks `isPhotoColumnKey(column.key)` and calls new `renderPhotoCellHtml(value)` — `<img src="…" style="max-width:72px;max-height:48px;object-fit:contain">` or `<span class="pi-photo-empty">Нет фото</span>`, mirroring legacy `table-template.service.ts`'s `formatCell` photo branch (same CSS class name, same empty-state text) without touching Create-КП code, per the TZ's "НЕ ИЗМЕНЯТЬ".

**Security note (fixed inline, not a new TZ):** this is the first place in `studio-data-resolver.ts` that interpolates a value into an HTML **attribute** (`src="…"`) rather than text-node content. The existing `escapeHtmlValue` helper's quote-escaping regex (`/\\\"/g`) only matches a literal backslash+quote, never a bare `"` — safe for text nodes but would let a `"` in a manually-typed photo-column cell value break out of the `src="…"` attribute and inject a new attribute (e.g. `onerror=`). Added a small local `escapeAttrValue()` wrapper (reuses `escapeHtmlValue` for `&`/`<`/`>`/`'`, adds a correct bare-`"` → `&quot;` replace) instead of touching the shared `escapeHtmlValue` (used broadly elsewhere; fixing its regex was out of scope and a wider blast radius than this TZ). Locked with a spec: a `"><script>` cell value cannot inject a literal `<script>` tag. `<img src>` itself is not a script sink (`javascript:` URLs are inert there), so no scheme allowlist was needed.

**Known limitation (unchanged from S47, re-confirmed in scope check):** the backend PDF bake path filters nothing by `tableHiddenColumnKeys` (a wider pre-existing gap than S47's BUG-5, which was canvas-only) — still not touched; not named in either audit's bug list or in this TZ's steps.

No archive/deploy/wipe actions taken beyond this TZ's own archive step below.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: BE + NX code (resolver + canvas + table-defaults) + docs
- [x] FIC §A–E: N/A — no new page/permission/module/MCP
- [x] page.md обновлён: `docs/pages/document-studio.page.md` (S48 paragraph) + `docs/pages/PAGE-TZ-INDEX.md` row
- [x] DOMAIN-MAP: N/A — no route/module/page contour change
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T20:05:00Z
