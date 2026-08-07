# SESSION QUEUE — 2026-08-07 stabilize

**Updated:** 2026-08-07 · Plan: close WIP → smoke → park new features  
**HEAD note:** Cursor docs on stabilize; product WIP still local until **303.1** executor

## Hard ban (сегодня / до smoke)

| Запрещено стартовать | Почему |
|----------------------|--------|
| PRODUCTION-304…307 | plug-ins после стабильного показа |
| drag / resize Ганта | только после **309** DONE |
| TZ-SHIPPING-301 | parked; не мешать Gantt |
| YouGile seed/import в product-код | data TZ отдельно; не сегодня |
| Новые «фичи ради фич» | сначала 303.1 closeout |

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **Executor #2** | **303.1** | production/** + orders `?q=` | **READY** — handoff `tasks/HANDOFF-PRODUCTION-303.1-executor-prompt.md` · TZ `tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` · checklist RESERVED |
| **Cursor** | docs/TZ | audits, 308–310, drawings, map, smoke | **IN PROGRESS → DONE** (Mode A, no product code) |

## Later (после PO smoke 303.1)

| TZ | After |
|----|--------|
| **PRODUCTION-308** | polish/nav — `_backlog/TZ-PRODUCTION-308-cockpit-polish-nav.md` |
| **PRODUCTION-309** | safe estimate / order-level days — **до resize** |
| **PRODUCTION-310** | a11y — после 308 |
| **DRAWINGS-301** | чертежи в cockpit — parked |
| **SHIPPING-301** | остаётся parked |
| Peer security child-TZ | только если появится evidence в `tasks/AUDIT-2026-08-07-…` |

## Rules

- Never `git add .` with kit dirty
- Board truth: this map + `tasks/_active/` + `progress.md` (не STATUS §READY dump)
- Deploy: только явная команда PO после smoke
- After 303.1 DONE → cherry-pick/push already on main; PO smoke checklist: `docs/pages/production-cockpit-smoke-303.1.md`
