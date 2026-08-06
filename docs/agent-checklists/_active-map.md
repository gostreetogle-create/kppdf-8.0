# SESSION QUEUE — parallel agents 2026-08-06 evening

**Updated:** 2026-08-06 · **WAREHOUSE-UX-301 DONE on main** · 320/14 DONE · next **311** / **TZD-15**

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **311** | products/modules/composition tree | **311 CLAIMED / IN PROGRESS** |
| **#2** (was admin/WH) | **WAREHOUSE-UX-301** | inventory | **DONE** — next: catalog tsc-hygiene OR close |
| **#3 Desktop** | **TZD-15** | `desktop/**` | **GO** |
| **Cursor** | docs / merge / review | docs + closeouts | active |

## Active catalog claim

- **TZ-CATALOG-311** — CLAIMED / IN PROGRESS
  - agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
  - claimed_at: `2026-08-06T16:51:25Z`
  - workspace: `D:\\kppdf-8.0` (rebased onto `origin/main` `4f19bc74`)
  - conflict keys: shared composition UI, composition service, product/module detail and composition dialogs, two page docs
  - TZ-CATALOG-320: DONE on canonical main; no overlapping active product/module owner detected

## Later

| TZ | After |
|----|--------|
| **315** | 311 |
| **TZD-15** | now |
| **PRODUCTION-303** | PO «стартуем Гант» |
| Warehouse ACL / HARDENING | separate TZ after PO |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick/merge to `main`
- Catalog tsc-drift `materials.page.ts` ← chips exports — hygiene task if agent #2 continues

## Out of scope

- Deploy/wipe, MCP/TZD-14 implementation, backend catalog-graph/composition, BOM/cost/order snapshot, Excel/desktop Wave 4, TZ-CATALOG-315.
