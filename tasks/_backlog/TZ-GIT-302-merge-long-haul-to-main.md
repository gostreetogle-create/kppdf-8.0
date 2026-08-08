═══════════════════════════════════════════════════════════════
TZ-GIT-302: Merge long-haul branch → main
═══════════════════════════════════════════════════════════════

STATUS: READY · **NEXT #1**

РОЛЬ: Executor git + FE conflict resolve

LAYER: 3

Проверено: long-haul commits на
  `origin/freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c`
  (DEDUP-302…304, FORM-306, UX-309 `f407fb78`, UX-310 `5bf1999c`)
  **не** ancestors of origin/main (`a730beb2`).

CONFLICT KEYS:
(merge) frontend/src/app/pages/modules/**;
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/materials/material-detail.page.ts;
frontend/src/app/shared/ui/quick-create/**;
frontend/src/app/pages/supply/**;
frontend/src/app/pages/shipping/**;
frontend/src/app/pages/design/**;
frontend/src/app/pages/doc-constructor/documents/**;
docs/**;
tasks/_archive/2026-08/**;
docs/agent-checklists/_active-map.md;

НЕ: deploy; rewrite DETAIL wave; SALES-304; desktop WIP

---

## ЧТО ДЕЛАТЬ

1. `git fetch` · checkout main · pull --ff-only.
2. Merge `origin/freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c` → main.
3. Conflicts: сохранить main docs (QUEUE/DETAIL wave) + long-haul product code.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` + точечные jest затронутых зон.
5. Map: long-haul DONE on main; NEXT DETAIL-301.
6. Commit merge + push main. Archive this TZ-GIT-302.

## AC

- [ ] 5d2b6033…5bf1999c ancestors of origin/main
- [ ] tsc PASS; push; deploy нет
