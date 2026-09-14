# WAVE — DocStudio follow-ups (2026-09-14)

updated_at: 2026-09-14T07:08:00+03:00  
agent_slot: Claude  
current_wave: **Claude-1**  
status: **STARTED**

> Промпт: `tasks/_ready/PROMPT-CLAUDE-DOCSTUDIO-FOLLOWUPS-WAVE.md`

## Claude chain

| # | TZ | Status |
|---|-----|--------|
| 1 | `TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE` | DONE |
| 2 | `TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE` | PENDING |
| 3 | `TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON` | PENDING |

## Freebuff chain (не в этом промпте)

| # | TZ | PROMPT |
|---|-----|--------|
| 1 | IMAGE-PASSPORT-FIT-WYSIWYG | PROMPT-FREEBUFF-IMAGE-PASSPORT-FIT-WYSIWYG |
| 2 | TEXT-BLOCK-CATEGORY-INLINE-CREATE | PROMPT-FREEBUFF-TEXT-BLOCK-CATEGORY-INLINE-CREATE |
| 3 | TEXT-LIBRARY-INSERT-ON-ADD | PROMPT-FREEBUFF-TEXT-LIBRARY-INSERT-ON-ADD |
| 4 | SELECTED-INSERT-PARTY-TEXT | PROMPT-FREEBUFF-SELECTED-INSERT-PARTY-TEXT |
| 5 | UI pack ×4 | PROMPT-FREEBUFF-DOCSTUDIO-UI-PACK |

**Параллель:** Freebuff passport/category можно после старта Claude #1–2 (BE); **не** параллелить Freebuff с Claude #3 (TEXT-PROPS / studio-editor).

## Checkpoint

| When | Event |
|------|-------|
| 2026-09-14T07:08+03 | PO запросил промпт волны; Claude READY |
| 2026-09-14 | Claude wave STARTED; baseline `nx build kppdf-web` green; current = 1 (PREVIEW-UPLOADS-INLINE) |
| 2026-09-14 | #1 PREVIEW-UPLOADS-INLINE DONE — SHA pending push; BE tsc/tests(1366)/lint + architecture:check PASS; archived `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.done.md`; current = 2 (UNSCOPED-ORG-SCOPE) |
