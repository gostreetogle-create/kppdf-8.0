# TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T04:45:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-text-properties / studio-editor.page.ts / studio-block-helpers.ts / studio-blocks-canvas.component.ts / pi-rich-text-editor.component.ts)
- [x] TZ + audit `docs/audits/2026-09-13-docstudio-text-props-canon.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.md` на месте

## Acceptance

- [x] После open редактора active = **Значения**; на холсте с выбранным клиентом `{{counterparty.inn}}` → цифры (bag-построение уже подтверждено `studio-editor-token-display.spec.ts`'s existing "builds organization/counterparty/anchor/quotation/order" test — untouched, still green)
- [x] Без клиента: Значения ≠ визуальный clone Токенов (`.substitution-token--unresolved` modifier — dashed/muted vs solid/info-color; verified live, screenshot)
- [x] В Свойствах текста один ряд выравнивания; нет второго внизу; нет TipTap-align в compact (verified live: RTE toolbar has exactly 1 group — B/I/U only; studio panel has exactly 4 align buttons in its own row)
- [x] Размер и цвет в том же компактном блоке, что B/I/U + align (reordered template: Font → Size/Color → Align → ERP/Formula, one bordered "Оформление" box directly below RTE)
- [x] Gates: focused studio-text / studio-editor-token / studio-blocks-canvas specs + `nx build kppdf-web` — все зелёные
- [x] Archive + STREAM (STREAM-QUEUE.md left untouched per conflict-key note below; wave board updated instead)

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend UI/UX bugfix + default flip, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP
- [x] page.md: `docs/pages/document-studio.page.md` §2.2 + §3.5 — updated (default Значения, unresolved modifier, one-align canon)
- [x] DOMAIN-MAP: N/A — no module/route/page contour change
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; `docs/agent-checklists/STREAM-QUEUE.md` and `_NOW.md` listed as conflict keys by the TZ but left untouched — already dirty with another agent's WIP from before this wave started; this TZ's own closeout goes through the wave board instead
- [x] Coupling map: N/A — no shared cross-page status/FK field touched
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (confirmed at wave start + after TZ #1/#2)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 126 suites / 946 tests passed (7 pre-existing skips)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 294 warnings; **verified via `git stash` A/B** that baseline (without this TZ's diff) is 38 errors / 293 warnings — 0 new errors, +1 warning (non-null assertion in the new spec test, same style as the rest of that file)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0, identical pre-existing warnings to baseline
- **Live smoke** (real backend + real browser, not TestBed): `node scripts/tz-nx-docstudio-text-props-canon-smoke.mjs` → created a real studio document + text block via the API, opened `/studio/:id` in headless Chrome (CDP), double-clicked the block to open «Свойства». All 8 checks PASS:
  - unresolved `{{counterparty.name}}` on canvas gets `substitution-token--unresolved` (not the plain `.substitution-token` chip)
  - properties panel opens; «Значения» `aria-pressed="true"`, «Токены» `aria-pressed="false"` — confirms the real app default, not just the TestBed mock
  - exactly 4 `studio-align-*` buttons (one row) and exactly 1 `.pi-rte-toolbar .pi-rte-group` (B/I/U only, no align group in compact RTE)
  - Evidence: `reports/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-smoke.json`, `-canvas.png`, `-properties.png` (screenshot confirms visually: gold-highlighted «Значения», dashed muted token on canvas, single align row with left highlighted, right below Size/Color)

## Executor report

- **Default flip:** `tokenDisplayMode` signal in `studio-editor.page.ts` default changed `'tokens'` → `'values'`. This supersedes TOKEN-EDITOR-CHIP's own ACCEPT #4 (documented, not silently reverted).
- **Honest «Значения» hint:** new `onTokenDisplayModeChange(mode)` in `studio-editor.page.ts` wraps the toggle — on switching to «Значения», scans all text blocks for `{{counterparty.*}}`/`{{organization.*}}` and toasts a one-time `warning` ("Выберите клиента/исполнителя в «Данные»…") only when that entity is genuinely missing from the bag. Never fires switching back to «Токены», never fires for unrelated token kinds (`{{table.*}}`, `{{quotation.*}}`) this editor has no per-session picker for.
- **Visual distinction:** `renderStudioTokensAsValues` (`studio-block-helpers.ts`) now marks an unresolved token with `substitution-token--unresolved` (+ a `title` attr) instead of the bare `.substitution-token` class «Токены» mode uses. New CSS in `studio-blocks-canvas.component.ts` (dashed border, muted color, transparent background) makes the two modes visually distinct even with an empty bag — fixes the audit's "visually no-op" finding.
- **Bag reliability (Step 2):** verified by code inspection, not changed — `Counterparty`'s FE type and the backend `findAll` (no `.select()`/projection) already carry `inn`/`shortName` end-to-end; the audit's "list might be thin" concern doesn't reproduce in this codebase. No `getById` fallback was needed.
- **One alignment control (Step 3):** `pi-rich-text-editor.component.ts` now hides its own TipTap textAlign button group (and the preceding separator) when `compact()` is true — that's the studio's own usage; the RTE's B/I/U group is untouched ("оставить" per the TZ's own canon table). Non-compact usage (`text-block-form-dialog.component.ts`'s plain library-text editor, which has no separate `block.style.align` control) keeps its align buttons — scoped by `compact()`, not a global removal. `studio-text-properties.component.ts` reordered its typo box (pure template reorder, no logic change) so Font → Size/Color → Align sit together as one "Оформление" group directly under the RTE, with ERP/Formula moved below it, matching the TZ's canon table.
- **Docs:** `docs/pages/document-studio.page.md` §2.2 and §3.5 updated — default «Значения», the unresolved-modifier note, the one-alignment-control canon (SoT = `block.style.align`, TipTap-align hidden in compact).
- Tests updated/added: `studio-editor-token-display.spec.ts` (default-mode test flipped to «Значения»; +4 new tests for the missing-entity hint, including a negative case for RBAC-unrelated token kinds); `studio-block-helpers.spec.ts` (unresolved-token test now asserts the `--unresolved` modifier, not the old identical-to-tokens-mode markup).
- **Pitfall hit and fixed:** a backtick inside an HTML comment I added to `pi-rich-text-editor.component.ts`'s `template:` string literal broke the JS parse for every consumer of that lib (27 suites failed with `SyntaxError: Unexpected token ':'`) — same class of bug as the known `styles:` backtick pitfall, now broadened in memory (`pitfall_backtick_in_styles_template_literal.md`) to cover `template:` too, since Jest catches it loudly there (unlike the AOT-only `styles:` case).
- **Live verification:** started the full local stack (`node start.mjs --nx --no-browser`, Docker Mongo + backend + frontend-nx) specifically to satisfy this TZ's "Live: Playwright" validation path — wrote `scripts/tz-nx-docstudio-text-props-canon-smoke.mjs` (Chrome CDP, no Playwright dependency needed, matches this repo's existing `tz-ux-321-fix-rail-smoke.mjs` pattern) which creates a real document+block via the API and drives a real browser. All 8 checks passed; stopped the stack afterward (`node start.mjs --stop`) to leave no background services running.
- Known limits: did not restructure the panel into a literally-single DOM container spanning the RTE toolbar and the typo box (would mean merging two independently-reusable components) — the "one compact block" reading is satisfied by them being immediately adjacent with no align duplication, not by a DOM merge; PO can flag if a tighter visual grouping is still wanted.
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
