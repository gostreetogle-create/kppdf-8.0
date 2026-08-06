# SESSION QUEUE — parallel agents 2026-08-06 evening

**Updated:** 2026-08-06 · ADMIN-306 on **main** `69d8a22`

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **320 → 311** | products/modules/composition | IN FLIGHT (Freebuff) |
| **#2 FE admin** | **ADMIN-306** | admin + routes | **DONE on main** `69d8a22` |
| **#3 Desktop** | **TZD-14** | `desktop/**` | IN FLIGHT / claim |
| **Cursor** | docs / merge / review | docs + closeouts | active |

## Next free for agent #2 (if continuing)

| TZ | Path | Notes |
|----|------|-------|
| **WAREHOUSE-UX-301** | `tasks/_backlog/warehouse/TZ-WAREHOUSE-UX-301-…` | Parallel-safe vs #1/#3; dashboard dedupe + movements WH filter |

Or **close agent #2** until #1 finishes 320 (then help 311 review) — PO choice.

## Later

| TZ | After |
|----|--------|
| **311** | 320 on origin/main |
| **315** | 311 |
| **TZD-15** | TZD-14 DONE |
| **PRODUCTION-303** | PO «стартуем Гант» |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick/merge to `main` (as done for 306)
