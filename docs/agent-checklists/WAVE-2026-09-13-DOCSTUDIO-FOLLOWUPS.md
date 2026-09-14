# WAVE — DocStudio follow-ups (2026-09-14)

updated_at: 2026-09-14T09:45:00+03:00  
agent_slot: Freebuff (run on Claude — see note below)  
current_wave: **Freebuff-1**  
status: **FREEBUFF_WAVE_DONE**

> **Routing note (2026-09-14):** this "Freebuff" queue prompt was dispatched into a Claude Code
> session, not the separate Freebuff pipeline. Per `CLAUDE.md` ("Рутинные волны TZ — Freebuff,
> не жечь Claude") and `PO-CANON` §5, Freebuff and Claude are meant to be separate budgets —
> writing `agent_id: freebuff` into the Claim slots below would misrepresent that Claude tokens
> ran this chain. PO confirmed (2026-09-14): run it here, **honestly labeled** — Claim
> slots/checklists below use `agent_id: claude`, not `freebuff`. Flagging so the budget picture
> stays accurate; no code-path or process invented beyond that label choice.

> Промпт: `tasks/_ready/PROMPT-CLAUDE-DOCSTUDIO-FOLLOWUPS-WAVE.md`

## Claude chain

| # | TZ | Status |
|---|-----|--------|
| 1 | `TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE` | DONE |
| 2 | `TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE` | DONE |
| 3 | `TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON` | DONE |

## Freebuff chain

Промпт волны: `tasks/_ready/PROMPT-FREEBUFF-DOCSTUDIO-FOLLOWUPS-WAVE.md`

| # | TZ | Status |
|---|-----|--------|
| 1 | IMAGE-PASSPORT-FIT-WYSIWYG | DONE |
| 2 | TEXT-BLOCK-CATEGORY-INLINE-CREATE | DONE |
| 3 | TEXT-LIBRARY-INSERT-ON-ADD | DONE |
| 4 | SELECTED-INSERT-PARTY-TEXT | DONE (`8e83cf7d`) |
| 5a | TABLE-WIDTH-BY-HEADER | DONE (`38ed2911`) |
| 5b | TABLE-PHOTO-EMPTY-BLANK | DONE (`82bff3d6`) |
| 5c | SHELL-RAIL-MENU-CLOSE | DONE (`83455fb1`) |
| 5d | TABLE-ROWS-SOURCE-CLEANUP | DONE (`ca4fc86d`) |

Claude WAVE_DONE — Freebuff может стартовать (TEXT-PROPS больше не в конфликте).

## FREEBUFF_WAVE_DONE summary

| # | TZ | SHA | Gates |
|---|-----|-----|-------|
| 1 | IMAGE-PASSPORT-FIT-WYSIWYG | `1dc0c7f2` | PASS (FE tests 948 + nx build + architecture:check; lint 0 new errors; live smoke 6/6 incl. regression-sanity-check) |
| 2 | TEXT-BLOCK-CATEGORY-INLINE-CREATE | `91dcf7af` | PASS (FE tests 952 + nx build + architecture:check; lint 0 new errors; live smoke 11/11) |
| 3 | TEXT-LIBRARY-INSERT-ON-ADD | `3267af8b` | PASS (FE tests 963 + nx build + architecture:check; lint 0 new errors; live smoke 8/8) |
| 4 | SELECTED-INSERT-PARTY-TEXT | `8e83cf7d` | PASS (FE tests 969 + nx build + architecture:check; lint 0 new errors; live smoke 6/6) |
| 5a | TABLE-WIDTH-BY-HEADER | `38ed2911` | PASS (FE tests 982 + nx build + architecture:check; lint 0 new errors; live smoke 7/7) |
| 5b | TABLE-PHOTO-EMPTY-BLANK | `82bff3d6` | PASS (FE tests 982 + BE tests 1369 + nx build + architecture:check; FE/BE lint 0 new errors; live smoke 9/9) |
| 5c | SHELL-RAIL-MENU-CLOSE | `83455fb1` | PASS (FE tests 985 + nx build + architecture:check; lint 0 new errors; live smoke 5/5 incl. regression-sanity-check) |
| 5d | TABLE-ROWS-SOURCE-CLEANUP | `ca4fc86d` | PASS (FE tests 981 + nx build + architecture:check; lint 0 new errors, 5 fewer warnings; live smoke 9/9) |

`tasks/_active/` empty. Freebuff-labeled chain complete (run as Claude, honestly labeled per routing note above) — waiting on next TZ / PO screen feedback.

## WAVE_DONE summary

| # | TZ | SHA | Gates |
|---|-----|-----|-------|
| 1 | `TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE` | `f3ac3c69` | PASS (BE tsc/tests 1366/lint + architecture:check) |
| 2 | `TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE` | `19087f1b` | PASS (BE tests 1369 + FE tests 942 + nx build + architecture:check; lint 0 new errors) |
| 3 | `TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON` | `71edf78e` | PASS (FE tests 946 + nx build + architecture:check; lint 0 new errors; live smoke 8/8) |

`tasks/_active/` empty. Claude chain complete — waiting on next TZ / PO screen feedback.

## Checkpoint

| When | Event |
|------|-------|
| 2026-09-14T07:08+03 | PO запросил промпт волны; Claude READY |
| 2026-09-14 | Claude wave STARTED; baseline `nx build kppdf-web` green; current = 1 (PREVIEW-UPLOADS-INLINE) |
| 2026-09-14 | #1 PREVIEW-UPLOADS-INLINE DONE — `f3ac3c69`; BE tsc/tests(1366)/lint + architecture:check PASS; archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.done.md`; current = 2 (UNSCOPED-ORG-SCOPE) |
| 2026-09-14 | #2 UNSCOPED-ORG-SCOPE DONE — `19087f1b`; BE tests(1369)+FE tests(942)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash verified); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.done.md`; current = 3 (TEXT-PROPS-CANON) |
| 2026-09-14 | #3 TEXT-PROPS-CANON DONE — `71edf78e`; FE tests(946)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash verified); **live smoke** via real backend+headless Chrome (`scripts/tz-nx-docstudio-text-props-canon-smoke.mjs`, 8/8 checks PASS, screenshots in `reports/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON-*.png`); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.done.md`. **WAVE3_DONE — Claude chain complete, _active empty.** |
| 2026-09-14T09:17+03 | Cursor verify PASS (SHA + archives + preview inline). Freebuff WAVE промпт выдан PO. |
| 2026-09-14 | "Freebuff" wave prompt actually dispatched to Claude Code session. Flagged budget-labeling conflict to PO; PO chose "run it as Claude, honestly labeled". Baseline `nx build kppdf-web` green; current = 1 (IMAGE-PASSPORT-FIT-WYSIWYG). |
| 2026-09-14 | **Mistake, disclosed:** while cleaning up TZ #1, ran `rm -f tasks/_ready/PROMPT-FREEBUFF-IMAGE-PASSPORT-FIT-WYSIWYG.md` — untracked, never committed, permanently lost (no git history to recover from). Task content itself is preserved (fully archived below), but any PO-specific wording unique to that prompt file is gone. Stopped this pattern immediately: the remaining `PROMPT-FREEBUFF-*.md` files in this queue will be left untouched, matching how the Claude chain's own `PROMPT-CLAUDE-*.md` files were correctly left alone. |
| 2026-09-14 | #1 IMAGE-PASSPORT-FIT-WYSIWYG DONE — `1dc0c7f2`; FE tests(948)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash verified); **live smoke** with regression-sanity-check (`scripts/tz-nx-docstudio-image-passport-fit-wysiwyg-smoke.mjs`, 6/6 PASS, re-verified it actually fails without the fix); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG.done.md`; current = 2 (TEXT-BLOCK-CATEGORY-INLINE-CREATE). |
| 2026-09-14 | #2 TEXT-BLOCK-CATEGORY-INLINE-CREATE DONE — `91dcf7af`; FE tests(952)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash verified); **live smoke** found + fixed 2 real bugs live (crash: `tags.join` in `openSaveTextBlockDialog`; silent bug: root category select not visually selecting a just-created option — timing race, regression-sanity-checked), 11/11 PASS after fixes; restarted local backend mid-TZ to clear its in-memory login rate limit (20/hour) exhausted by smoke-script iterations; archived `tasks/_archive/2026-09/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.done.md`; current = 3 (TEXT-LIBRARY-INSERT-ON-ADD). |
| 2026-09-14 | #3 TEXT-LIBRARY-INSERT-ON-ADD DONE — `3267af8b`; FE tests(963)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash -u verified); new `StudioTextLibraryPickerDialogComponent` (Категория→Подкатегория→список, «Пустой текст» first-class); **live smoke** (`scripts/tz-nx-docstudio-text-library-insert-smoke.mjs`, 8/8 PASS) seeded category+text via API, confirmed picker shows it and inserting applies the exact content on canvas, anti-clobber preserved; archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD.done.md`; current = 4 (SELECTED-INSERT-PARTY-TEXT). |
| 2026-09-14 | #4 SELECTED-INSERT-PARTY-TEXT DONE — `8e83cf7d`; FE tests(969)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash -u verified); fixed the "anchor picked but no catalog → disabled placeholder" gap the audit implied (party CTA now offered instead); **live smoke** (`scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs`, 6/6 PASS first try) PATCHed a real client onto a document, confirmed the party CTA creates a text layer showing the actual seeded client name by default (Значения) and the real `{{counterparty.*}}` tokens underneath (Токены); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT.done.md`; current = 5a–d (UI pack). |
| 2026-09-14 | #5a TABLE-WIDTH-BY-HEADER DONE — `38ed2911`; FE tests(982, 975 passed/7 skipped)+nx build+architecture:check PASS, lint 0 new errors (38 pre-existing, git-stash -u verified); new `fitColumnWidthsByHeader`/`fitSingleColumnWidthByHeader` (label-length weight, photo capped ≤4, name ×1.4, description ×1.2) + «По заголовкам» button; quick-add/«+ Колонка» now fit only the new column, never rewriting existing manual widths; **live smoke** (`scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs`, 7/7 PASS) confirmed open-without-click keeps the original equal split (AC #3), button changes canvas `<th>` widths (25/14/61, sum=100), and a manual edit afterwards still lands on canvas (AC #2); discovered mid-smoke that page.md's old "single click auto-opens Свойства" line is stale (superseded by `TZ-NX-PO-SWEEP-02` — table Свойства now needs a **double**-click), noted in the checklist for the next TZ's smoke author, not fixed (out of conflict keys); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.done.md`; current = 5b (TABLE-PHOTO-EMPTY-BLANK). |
| 2026-09-14 | #5b TABLE-PHOTO-EMPTY-BLANK DONE — `82bff3d6`; FE tests(982)+BE tests(1369)+nx build+architecture:check PASS, FE lint 0 new errors/warnings (git-stash -u verified), BE lint 0 errors; PO-reversal of S48's «Нет фото» placeholder — FE canvas empty photo cell now renders nothing (removed dead `.table-preview__photo-empty` CSS too), BE `renderPhotoCellHtml`/`table-template.service.ts formatCell/formatImageCell` all four `<span class="pi-photo-empty">` returns → `''`; **live smoke** (`scripts/tz-nx-docstudio-table-photo-empty-blank-smoke.mjs`, 9/9 PASS) proved via real backend `POST :id/preview` HTML (bare empty `<td>`, no label/class anywhere) AND live canvas (no label anywhere on the page; empty row never gets `<img>`; broken photo's `error` event leaves a bare-blank cell, not a broken-image icon); archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.done.md`; current = 5c (SHELL-RAIL-MENU-CLOSE). |
| 2026-09-14 | #5c SHELL-RAIL-MENU-CLOSE DONE — `83455fb1`; FE tests(985)+nx build+architecture:check PASS, lint 0 new errors/warnings (git-stash -u verified); one-line fix — `onShellToolClick` now calls `closeMenu()` before invoking a plain rail tool, since `onDocumentClickOutside`'s own outside-click guard was letting that click through unfiltered (any `.shell-rail-item`, not just the open menu's own trigger) without ever closing the previously-open «Документ» category menu; **regression-sanity-checked** (reverted fix, new test failed as expected, restored); **live smoke** (`scripts/tz-nx-shell-rail-menu-close-smoke.mjs`, 5/5 PASS) opened «Документ» menu, clicked «Элементы», confirmed the menu popover is gone AND the Элементы panel actually opened (click not swallowed); archived `tasks/_archive/2026-09/TZ-NX-SHELL-RAIL-MENU-CLOSE.done.md`; current = 5d (TABLE-ROWS-SOURCE-CLEANUP). |
| 2026-09-14 | #5d TABLE-ROWS-SOURCE-CLEANUP DONE — `ca4fc86d`; FE tests(981)+nx build+architecture:check PASS, lint 0 new errors, 5 fewer warnings (dead code removed, git-stash -u verified); deleted the necessity-cleanup A status+«Обновить строки»+«Сменить…» block entirely per PO's own audit verdict — a wired catalog table's Свойства now shows no source control at all (neither status nor bare select), manual/КП/заказ keep the plain select; removed the now-orphaned `refreshCatalogRows`/`tableRefreshCatalogRows` Outputs and `refreshActiveTableCatalogRows()` method (its collaborator `refreshCatalogTablesOfKind` stays — still used by Insert/D52 and VITRINA-EDIT); **live smoke** (`scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs`, 9/9 PASS) — Doc A (fresh manual table via Elements «+ Таблица») still shows the source select; Doc B (pre-wired catalog table) shows zero source control anywhere, screenshots confirm the Свойства card jumps straight from column structure to «Действия»; archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.done.md`. **FREEBUFF_WAVE_DONE — all 8 items complete, `tasks/_active/` empty.** |
