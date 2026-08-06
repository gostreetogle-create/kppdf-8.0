# SESSION QUEUE — parallel agents 2026-08-06 evening

**Updated:** 2026-08-06 · **TZD-14 DONE on main** · **320 DONE** · next **311** / **TZD-15**

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **311** | products/modules/composition tree | **GO** after 320 |
| **#2 FE admin** | **ADMIN-306** | admin + routes | **DONE on main** `69d8a22` |
| **#3 Desktop** | **TZD-15** | `desktop/**` | **15 DONE** 2026-08-06T17:19:18Z — archive + lock; next по PO |
| **Cursor** | docs / merge / review | docs + closeouts | active |

## Next free for agent #2 (if continuing)

| TZ | Path | Notes |
|----|------|-------|
| **WAREHOUSE-UX-301** | `tasks/_backlog/warehouse/TZ-WAREHOUSE-UX-301-…` | Parallel-safe vs #1/#3 |

Or **close agent #2**.

## Later

| TZ | After |
|----|--------|
| **311** | **now** (320 on main) |
| **315** | 311 |
| **TZD-15** | **now** (14 on main) |
| **PRODUCTION-303** | PO «стартуем Гант» |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick/merge to `main`
- Full-app tsc may be red from inventory/materials group-chips WIP — scoped/allowlist gates OK with Cursor waive
