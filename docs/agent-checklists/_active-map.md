# SESSION QUEUE — parallel agents 2026-08-06 evening

**Updated:** 2026-08-06 · Cursor docs track ∥ Buffy FE catalog ∥ Buffy admin ∥ Buffy desktop

## Parallel claims (do not steal keys)

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **320 → 311** | `frontend/.../products|modules|pi-product-modules` + page docs | Freebuff worktree claim |
| **#2 FE admin** | **ADMIN-306** | `frontend/.../admin/` (+ careful routes) | claimed by second agent |
| **#3 Desktop** | **TZD-14** | `desktop/**` only | claimed by third agent |
| **Cursor** | docs / checklist / map | `docs/**`, `tasks/_backlog` specs — **no** product TS | this session |

## Canonical `_active/` on main disk

May lag Freebuff worktrees — trust worktree markers until merge. After each DONE: sync archive + map to `origin/main`.

## Next after parallels land

| TZ | After |
|----|--------|
| **311** | 320 DONE on origin |
| **315** | 311 |
| **TZD-15** | TZD-14 DONE (Cursor or executor) |

## Out of scope / do not mix

- Deploy wipe, `tasks/Данные`, UI-kit removal dirty into any TZ commit
- `git add .`
- PRODUCTS-306 / PRODUCTION-303 while admin has `app.routes` / catalog has product form

## Cursor deliverables this pass

- `docs/FEATURE-INTEGRATION-CHECKLIST.md` on origin + wired guides
- `scripts/seed-demo-five.mjs` (server demo×5 helper)
- This map
