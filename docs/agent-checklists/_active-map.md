# SESSION QUEUE — Catalog Wave 2

**Updated:** 2026-08-06 night · hygiene pass · Buffy stop fixed in DAY-07

## `_active/` сейчас

| Marker | Status |
|--------|--------|
| `TZ-CATALOG-314.md` | **READY FOR REVIEW** — код в WT, gates PASS, **нет** commit/archive/push |

Других active catalog markers **нет** (stale 312 claim удалён; 312 → archive).

## Checkpoint — где остановился Buffy (канон)

| Файл | Роль |
|------|------|
| `docs/agent-handoff-2026-08-06-TZ-CATALOG-314.md` | **Stop/resume 314** (keys, gates, allowlist, запреты) |
| `tasks/_backlog/catalog/TZ-DAY-2026-08-07-…320.md` | **Завтра A→B**: closeout 314 → claim 320 |

Кратко: 313 DONE (`cde79fc`); 314 READY FOR REVIEW в WT без commit; session dead — стоп; завтра handoff→DAY-07.

## Очередь

| # | TZ | Status |
|---|-----|--------|
| DONE | 310, 312, 313 | archive |
| **NOW** | **314** | READY FOR REVIEW / uncommitted |
| **TOMORROW** | **DAY-07** → 320 | script in backlog |
| NEXT | 311 → 315 | parked |

## Out of scope tonight / tomorrow script

- Deploy, склад, MCP/TZD-14, UI-kit dirty, `tasks/Данные`
- CompositionTree **311** (после 320)
