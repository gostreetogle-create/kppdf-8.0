# TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as a "Freebuff" wave prompt but actually run in a Claude Code
> session — flagged the budget-labeling conflict to PO earlier in this wave, who chose "run it
> here, honestly labeled". `agent_id: claude` below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T07:38:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-elements-panel / studio-editor.page.ts / studio-text-properties.component.ts)
- [x] TZ + audit `docs/audits/2026-09-13-docstudio-text-library-insert-entry.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD.md` на месте

## Acceptance

- [x] Live: Элементы → + Текст → видно категории/подкатегории/список → выбор вставляет на лист (live-verified, real backend + real Chrome, screenshots)
- [x] «Пустой текст» по-прежнему создаёт пустой слой (unit + live verified; anti-clobber preserved)
- [x] Save в библиотеку из Свойств не регресс (existing `text-block-form-dialog` specs untouched and still green; picker only reads, doesn't touch the save path)
- [x] Gates: focused studio specs + `nx build kppdf-web` PASS last

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend feature — new picker dialog, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` §3.1 — updated
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

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 128 suites / 963 tests passed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 302 warnings; **git-stash A/B verified** baseline (without this TZ's diff, `-u` to include the new untracked files) = 38 errors / 299 warnings — 0 new errors
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-docstudio-text-library-insert-smoke.mjs` — seeded a root category, subcategory, and library text via the API, opened a fresh studio document, switched to Элементы, clicked «+ Текст». 8/8 checks PASS: picker shows the seeded text, picking it inserts that exact content onto the canvas (screenshot confirms: Слои panel + canvas both show the library content), and a live-only insight — clicking «Пустой текст» again while the just-inserted (non-empty) layer is still active correctly does NOT clobber it (anti-clobber preserved), rather than always producing a fresh layer. Evidence: `reports/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD-smoke.json`, `-1-picker.png`, `-2-inserted.png`.

## Executor report

- **New component** — `studio-text-library-picker-dialog.component.ts` (`StudioTextLibraryPickerDialogComponent`): a standalone Pi-dialog with «Пустой текст» as a first-class button plus the same Категория → Подкатегория → list filter contract `studio-text-properties.component.ts`'s own «Из библиотеки» section already uses (same `PiTextBlockCategoriesService`/`PiTextBlocksService` calls, same params) — reuses the established HTTP contract rather than inventing a new one, per the TZ's own instruction, though the filter UI markup itself is a small, deliberate duplication (extracting a shared sub-component felt like scope creep for a SIZE:S TZ; noted as a known limit below). Closes with a discriminated result: `{ kind: 'empty' }` or `{ kind: 'library'; textBlock }`; closing via cancel (undefined) does nothing.
- **Wiring** (`studio-editor.page.ts`): `addTextToActiveLayer()` now opens this picker instead of calling `createTextLayer()` directly; a new private `insertTextContent(content, title?)` holds the exact anti-clobber logic the old method always had (an EMPTY active text layer gets filled in place; anything else — no active layer, a non-text layer, or an already-non-empty text layer — gets/keeps a fresh `createTextLayer` call, now parameterized by `content`/`title` instead of the hardcoded `'Новый текст'`/`` `Слой ${n}` ``). `addLayer()` (a separate, unrelated toolbar entry point) still calls `createTextLayer()` with no args, unchanged default behavior.
- **Tests**: new `studio-text-library-picker-dialog.component.spec.ts` (list/filter/empty-pick/library-pick/cancel — 6 tests) and new `studio-editor-text-library-insert.spec.ts` (dialog opens on «+ Текст»; empty pick creates with old defaults; library pick creates with the picked content/title; library pick against an EMPTY active layer fills in place instead of creating a duplicate; cancel does nothing — 5 tests). Fixed one existing test in `studio-editor-write-serial.spec.ts` that called `addTextToActiveLayer()` directly expecting a synchronous create — since that test is really about the revision-confirmation-via-follow-up-GET behavior (unrelated to this TZ), redirected it to call the shared `insertTextContent` the picker now also funnels into.
- **Docs**: `docs/pages/document-studio.page.md` §3.1 — one paragraph on the new picker + anti-clobber note + "save is still from Свойства/реестр, picker only reads."
- **Live debugging note** (kept for the next TZ's smoke script author, per this queue's growing shared toolkit): a computed click-target rect for an element still scrolled out of view inside a scrollable list produces a stale position — the click lands on whatever's actually under those coordinates (here: the dialog backdrop, silently dismissing the picker with nothing picked, no exception thrown). Always `scrollIntoView` an option immediately before recomputing its rect for a CDP-native click, not just before the initial existence check.
- **Known limits**: the category/subcategory filter markup is duplicated between this new picker and `studio-text-properties.component.ts`'s «Из библиотеки» section (same shape, not extracted into one shared component) — a future unification TZ could merge them if PO wants it; left as-is here to keep this SIZE:S TZ's diff focused, per its own explicit non-goal ("не переписывать каталожные ... формы ... в этом TZ").
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
