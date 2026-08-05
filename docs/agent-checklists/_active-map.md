# SESSION QUEUE — Catalog Wave 2 (PO start 2026-08-05)

**Updated:** 2026-08-05 · previous DICT/UI-TABLE wave CLOSED · new queue below

## Closed previous wave (do not redo)

DICT-308…312 · UI-TABLE-301…303,305 · Catalog Wave 1 · **SKIP** UI-TABLE-304

## Must finish (in order) — Catalog Wave 2

| # | TZ | Source | Notes |
|---|-----|--------|--------|
| 1 | **TZ-CATALOG-310** | `tasks/_backlog/catalog/TZ-CATALOG-310.md` | Where-used API (BE read) — first |
| 2 | **TZ-CATALOG-313** | `tasks/_backlog/catalog/TZ-CATALOG-313.md` | Photo/docs unify |
| 3 | **TZ-CATALOG-314** | `tasks/_backlog/catalog/TZ-CATALOG-314.md` | Soft-delete / archive consistency |
| 4 | **TZ-CATALOG-312** | `tasks/_backlog/catalog/TZ-CATALOG-312.md` | Material detail FE (needs 310) |
| 5 | **TZ-CATALOG-311** | `tasks/_backlog/catalog/TZ-CATALOG-311.md` | CompositionTree/Editor (heavy FE) |
| 6 | **TZ-CATALOG-315** | `tasks/_backlog/catalog/TZ-CATALOG-315.md` | Lists polish + a11y |

## Out of scope this queue

- Deploy / wipe / «поехали»
- TZ-UI-TABLE-304
- PRODUCTION-* / Z-series / commerce chain (later wave)
- Re-doing archived DICT/UI-TABLE

## Rules

- Skill: `.agents/skills/kppdf-executor-continuous/SKILL.md`
- CLAIM → code → gates → archive → commit+push → next; no mid-queue stops
- Empty queue end → propose deploy readiness; **no** auto `deploy.ps1`
- Checkpoint `_active-map.md` every ~5–7 min
- Do not commit `__pycache__/`, `tasks/Данные/`
