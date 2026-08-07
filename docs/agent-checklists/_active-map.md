# SESSION QUEUE — 2026-08-07 stabilize

**Updated:** 2026-08-07 · PO передал HANDOFF исполнителю · Cursor в wait  
**Wait protocol:** `docs/agent-checklists/CURSOR-WAIT-303.1.md`

## Hard ban (до PASS smoke 303.1)

| Запрещено стартовать | Почему |
|----------------------|--------|
| PRODUCTION-304…307 | plug-ins после стабильного показа |
| drag / resize Ганта | только после **309** DONE |
| TZ-SHIPPING-301 | parked |
| YouGile seed/import в product-код | data TZ отдельно |
| TZ-SECURITY-MT-FOLLOWUP | park до peer-файла с evidence |
| Новые фичи | сначала 303.1 closeout |

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **Executor #2** | **303.1** | production/** + orders `?q=` | **IN FLIGHT** — промпт выдан PO; checklist ещё RESERVED; **`tasks/_active/` пуст** → executor должен CLAIM ASAP |
| **Cursor** | docs only | wait + park TZ | **WAITING** — не трогает CONFLICT KEYS 303.1 |

## Later (после PO smoke 303.1)

| TZ | After |
|----|--------|
| **PRODUCTION-308** | `_backlog/TZ-PRODUCTION-308-cockpit-polish-nav.md` |
| **PRODUCTION-309** | safe estimate — **до resize** |
| **PRODUCTION-310** | a11y после 308 |
| **DRAWINGS-301** | parked |
| **SHIPPING-301** | parked |
| **SECURITY-MT-FOLLOWUP** | только после `tasks/AUDIT-2026-08-07-…` |

## Rules

- Never `git add .` with kit/чужой dirty
- Board truth: this map + `tasks/_active/` + `progress.md`
- Deploy: только явная команда PO после smoke
- Smoke: `docs/pages/production-cockpit-smoke-303.1.md`
- Когда executor DONE → Cursor verdict ≤200 tokens (см. CURSOR-WAIT-303.1)
