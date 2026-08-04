# Catalog backlog — Wave 2+ и мосты FE

Канон: `tasks/TZ-CATALOG-300.md`  
Audits:  
- `docs/audits/2026-08-04-catalog-coherence-audit.md`  
- **`docs/audits/2026-08-04-catalog-readiness-fe-be.md`** ← FE↔BE readiness  
Wave 1: `tasks/CATALOG-WAVE1.md` · Review inbox: `docs/agent-checklists/CATALOG-WAVE1-REVIEW.md`

## Done (docs / FE bridges)

| ID | Title | Archive |
|----|-------|---------|
| **319** | Docs sync | `tasks/_archive/2026-08/TZ-CATALOG-319.done.md` |

## Un-park now (параллельно с 302)

| ID | Title | Who | Notes |
|----|-------|-----|-------|
| **316** | Material FE 301 fields | **DONE** `tasks/_archive/2026-08/TZ-CATALOG-316.done.md` | — |

## Gate перед prod 304

| ID | Title | Who | Notes |
|----|-------|-----|-------|
| **317** | FE composition cutover | **DONE** `tasks/_archive/2026-08/TZ-CATALOG-317.done.md` | GATE 304 снят |

## Wave 1 backend (уже в `tasks/`)

| ID | Title | Who |
|----|-------|-----|
| 302→305 | composition → guards → migrate → complex | другой ИИ |

## Wave 2 (после 305)

| ID | Title | После | Тяжесть |
|----|-------|-------|---------|
| 306 | Audit trail | — | docs |
| **310** | Where-used API | 305 | средняя |
| **311** | CompositionTree / Editor (полная) | 317+ | тяжёлая |
| **312** | Material detail | 310 | средняя |
| **313** | Photo unify | 305 | средняя |
| **314** | Soft-delete / archive | 304 | средняя |
| **315** | Lists polish + a11y | 311 | лёгкая |

## Правила

- Не un-park 311 UI tree на legacy.
- Не prod-apply 304 без 317 (или redirect-моста в 304 report).
- Не параллелить backend 302–305.
- Cursor: review inbox; 316 если свободен.
