# TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as a "Freebuff" wave prompt but actually run in a Claude Code
> session — flagged the budget-labeling conflict to PO earlier in this wave, who chose "run it
> here, honestly labeled". `agent_id: claude` below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T07:18:25Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (text-block-form-dialog.component.ts/.spec.ts)
- [x] TZ + audit `docs/audits/2026-09-13-text-block-category-inline-create.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.md` на месте

## Acceptance

- [x] Live: «Создать текст» → + у категории → создать корень → выбран; + у подкатегории → создать лист → выбран → Save текста ок (live-verified, real backend + real Chrome, screenshots)
- [x] Без ухода в `/registries/text-block-categories` для happy path (nested dialog, same pattern as `module-form-dialog.openCreateCategory`)
- [x] Визуально ряд = kit (`pi-select-add-row` / `pi-select-add-btn`), не произвольный flex (used `app-pi-select-add-row` verbatim, confirmed live + unit `closest('app-pi-select-add-row')`)
- [x] Gates: dialog specs + `nx build kppdf-web` PASS last

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend dialog feature, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/text-block-categories.page.md` + `docs/pages/document-studio.page.md` — updated
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; `docs/agent-checklists/STREAM-QUEUE.md`/`_NOW.md` left untouched (dirty from another agent)
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 126 suites / 952 tests passed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 299 warnings; **git-stash A/B verified** baseline (without this TZ's diff) = 38 errors / 296 warnings — 0 new errors
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-text-block-category-inline-create-smoke.mjs` — 11/11 checks PASS after two real bugs found and fixed live (below). Evidence: `reports/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE-smoke.json`, `-1-dialog.png`, `-2-selected.png`.
  - **Regression-sanity-checked** the `setRootId` timing fix specifically: reverted it to a synchronous `rootId.set()`, re-ran — `root_category_created_and_selected` correctly flipped to FAIL; restored the fix, re-ran (after a backend restart to clear the in-memory login throttle exhausted by iteration) — 11/11 PASS again.

## Executor report

- **Feature implemented** (`text-block-form-dialog.component.ts`): wrapped Категория and Подкатегория selects in `app-pi-select-add-row` («+» button, kit component, not a bespoke flex+button). `openCreateRootCategory()` / `openCreateSubCategory()` open `TextBlockCategoryFormDialogComponent` (the same standalone dialog the `/registries/text-block-categories` reuses) via the exact `onDialogCloseOnce` wiring pattern as `module-form-dialog.openCreateCategory` — append to the local list, select the new item, `form.markAsDirty()`. Sub-add is disabled until a root is picked (`[addDisabled]="!rootId()"`).
- **Two real, pre-existing bugs found live and fixed** (neither reproduces in jsdom — both required a real backend + real browser to surface):
  1. **Crash**: `studio-editor.page.ts`'s `openSaveTextBlockDialog()` prefilled `textBlock` without a `tags` field; `TextBlockFormDialogComponent`'s constructor unconditionally does `row.tags.join(', ')`, throwing `TypeError: Cannot read properties of undefined (reading 'join')` and crashing the whole page on **every** click of "Сохранить в библиотеку текстов" — a pre-existing, shipping bug, not something this TZ introduced, but it blocked verifying this TZ's own AC and is a severe, easily-triggered crash. One-line fix: added `tags: []` to the prefill object.
  2. **Silent selection bug** (in code this TZ touches, so squarely in scope): the ROOT category `<select>` uses a raw `[value]="rootId()"` binding (not reactive forms, unlike the subcategory select which uses `formControlName` and worked correctly first try). Setting `roots` and `rootId` back-to-back in the same synchronous tick — exactly what `openCreateRootCategory`'s callback does, and what the pre-existing `initCategories` edit-mode pre-selection also already did — loses the native `<select>`'s option-matching race: the `[value]` binding applies before the `@for`-rendered `<option>` for the brand-new root exists in the DOM, so the browser silently leaves the select on its placeholder even though the `rootId` signal (and everything gated on it, like enabling the subcategory add button) is already correct internally. Fixed by extracting a shared `setRootId()` helper that defers the signal write one macrotask (`setTimeout`) so it lands after Angular has rendered the new option — applied to both `initCategories` (fixing the same latent risk in the pre-existing edit-mode flow) and `onRootChange`.
- **Tests**: extended `text-block-form-dialog.component.spec.ts` with a `PiDialogService` mock (added to all three existing `TestBed` configs) and a new describe block: both add buttons present + kit component wiring, sub-add disabled/enabled transitions, full nested-create wiring for both root and subcategory (dialog.open call args, post-close state), and a cancel-does-nothing case. The root-create test awaits one macrotask tick to observe the deferred `setRootId`.
- **Docs**: `docs/pages/text-block-categories.page.md` (new paragraph after the registry SoT section) and `docs/pages/document-studio.page.md` (extended the existing `TextBlockFormDialogComponent` paragraph) — one line each per the TZ's own instruction, describing the kit select-add-row + nested-create, no detour to the registry.
- **Debugging note for future live-smoke authors**: `app-pi-input`'s `data-test`/`id` attributes live on the custom-element host tag, not the native `<input>` nested inside — a script must resolve to `host.querySelector('input')` before setting `.value`, or the write silently lands on a stray host property nothing reads. Also, this app's Angular/CDK-driven click handlers did not reliably react to a synthetic `element.dispatchEvent(new MouseEvent('click'))` in a few places (the "Сохранить в библиотеку текстов" button, the nested dialog's own buttons) — real CDP-native `Input.dispatchMouseEvent` at the element's actual coordinates worked where the synthetic dispatch silently no-op'd. Both are now baked into `scripts/tz-nx-text-block-category-inline-create-smoke.mjs`'s `click()`/`setInputValue()` helpers for reuse by later TZs' smoke scripts in this same queue.
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.
- Dev-stack note: had to restart the local backend mid-TZ (`node start.mjs --stop` then `--nx --no-browser`) purely to reset its in-memory login-rate-limit counter, exhausted by repeated smoke-script iterations while debugging (`/auth/login` is throttled to 20/hour). Mongo container was recreated as part of that restart (docker compose down/up, no `-v`) — ephemeral NX-stage demo data per `PO-CANON`, not a wipe.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
