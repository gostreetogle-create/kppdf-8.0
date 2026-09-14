# WAVE — DocStudio follow-ups (2026-09-14)

updated_at: 2026-09-14T09:17:00+03:00  
agent_slot: Freebuff (run on Claude — see note below)  
current_wave: **Freebuff-1**  
status: **STARTED**

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
| 4 | SELECTED-INSERT-PARTY-TEXT | PENDING |
| 5a–d | UI pack (WIDTH · PHOTO-EMPTY · RAIL-MENU · ROWS-SOURCE) | PENDING |

Claude WAVE_DONE — Freebuff может стартовать (TEXT-PROPS больше не в конфликте).

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
