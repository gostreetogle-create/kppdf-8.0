# TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as a "Freebuff" wave prompt but actually run in a Claude Code
> session — flagged the budget-labeling conflict to PO, who chose "run it here, honestly
> labeled". `agent_id: claude` below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T06:42:40Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-blocks-canvas.component.ts/.spec.ts)
- [x] TZ + audit `docs/audits/2026-09-13-docstudio-image-passport-fit-wysiwyg.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG.md` на месте

## Acceptance

- [x] Computed/style: overlay image на canvas = `contain`; non-overlay = `cover` (live-verified, jsdom can't resolve this component's CSS cascade — confirmed via smoke script + unit-level class-presence contract)
- [x] Live: паспорт на холсте визуально совпадает с PDF (letterbox, не fill-crop) — verified via real Chrome CDP smoke, computed `object-fit: contain`
- [x] Gates: focused studio canvas tests; `nx build kppdf-web` PASS последним

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (FE CSS bugfix, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` §3.7 — updated (fit WYSIWYG note)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; `docs/agent-checklists/STREAM-QUEUE.md`/`_NOW.md` listed as conflict keys by other TZs in this wave, left untouched (dirty from another agent) — this TZ's own closeout goes through the wave board
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start baseline build)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 126 suites / 948 tests passed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 296 warnings; **git-stash A/B verified** baseline (without this TZ's diff) = 38 errors / 294 warnings — 0 new errors, +2 warnings (non-null assertions in the new spec, same style as the rest of the file)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0, identical pre-existing warnings
- **Live smoke** (real backend + real browser — jsdom cannot resolve this component's CSS cascade, confirmed while writing the unit spec): `node scripts/tz-nx-docstudio-image-passport-fit-wysiwyg-smoke.mjs` — created a real studio doc with a passport-overlay image block + a regular photo block via the API, opened `/studio/:id` in headless Chrome. 6/6 checks PASS: passport `object-fit: contain`, regular photo `object-fit: cover`, both blocks `padding: 0`.
  - **Regression-sanity-checked**: re-ran the same smoke script with the CSS fix `git stash`-reverted — padding checks correctly flipped to FAIL (`4px` instead of `0px`), proving the script actually catches the bug rather than trivially passing. Fix restored before finalizing; final run is 6/6 PASS again.
  - Evidence: `reports/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG-smoke.json`, `-canvas.png`.

## Executor report

- **Root cause** (confirmed exactly as audited): `.studio-block--passport-bg img` (contain) and `.studio-block--image img` (cover) are both single-class selectors at equal specificity (0,1,1). The passport-background article carries BOTH classes, so both rules match; at equal specificity, source order decides — `.studio-block--image img` is declared later in the same `styles: []` array, so `cover` always won regardless of intent, stretching/cropping the passport on canvas while the server-rendered PDF (a separate, untouched `.doc-bg--block img { object-fit: contain }` rule in `document-render.service.ts`) correctly letterboxed it.
- **Fix** — `studio-blocks-canvas.component.ts`:
  - Changed the passport rule's selector to the compound `.studio-block--passport-bg.studio-block--image img` (specificity 0,2,1), which now unconditionally outranks the plain `.studio-block--image img` (0,1,1) regardless of future reordering — a more robust fix than just moving the rule later in the array (which the TZ also offered as an option), since it removes the equal-specificity trap entirely rather than just flipping which side of it currently wins.
  - Added `padding: 0` to `.studio-block--image` (covers both the passport and regular-photo case, since both carry this class) — the generic `.studio-block { padding: 4px }` was shrinking a regular image block's `<img>` on the canvas relative to the PDF's image box, which has no padding.
  - **Did not touch** `document-render.service.ts` / BE `.doc-bg--block img { object-fit: contain }` — already correct per the TZ's own explicit instruction ("не менять passport PDF на cover") and the existing regression spec `document-render.studio-canvas.spec.ts` already covers it; no BE files are in this diff.
- **Tests**: added a focused describe block to `studio-blocks-canvas.component.spec.ts` — two class-presence tests (passport gets both classes; a regular photo does not get `studio-block--passport-bg`), which is the reliable jsdom-level contract for the template wiring the CSS keys off. Discovered mid-TZ that jsdom cannot resolve either `getComputedStyle` on these class-based rules OR expose this Angular version's injected `<style>` text (both returned empty) — dropped those brittle assertions and relied on the live Chrome smoke script for the actual `object-fit`/`padding` proof instead (documented in a spec comment so a future reader doesn't re-attempt the same dead end).
- **Docs**: `docs/pages/document-studio.page.md` §3.7 — one paragraph: canon (passport contain / regular cover / no padding) + root cause + fix summary.
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
