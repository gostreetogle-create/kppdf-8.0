# SESSION QUEUE — parallel agents 2026-08-06 evening

**Updated:** 2026-08-06 · **WAREHOUSE-UX-301 DONE on main** · 320/14 DONE · next **311** / **TZD-15**

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **311** | products/modules/composition tree | **GO** |
| **#2** (was admin/WH) | **WAREHOUSE-UX-301** | inventory | **DONE** — next: catalog tsc-hygiene OR close |
| **#3 Desktop** | **TZD-15** | `desktop/**` | **GO** |
| **Cursor** | docs / merge / review | docs + closeouts | active |

## Later

| TZ | After |
|----|--------|
| **311** | now |
| **315** | 311 |
| **TZD-15** | now |
| **PRODUCTION-303** | PO «стартуем Гант» |
| Warehouse ACL / HARDENING | separate TZ after PO |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick/merge to `main`
- Catalog tsc-drift `materials.page.ts` ← chips exports — hygiene task if agent #2 continues
