# TZ-OPS-307: page.md — stubs design/shipping + README hygiene

PAGES: /design ; /shipping  
PAGE_DOCS: design.page.md ; shipping.page.md  
WAVE: `tasks/_backlog/ops/WAVE-PAGE-DOCS-GAPS.md`

РОЛЬ АГЕНТА: docs-only  
ЗАВИСИМОСТИ: TZ-OPS-306 DONE  
LAYER: 4  
CONFLICT KEYS: docs/pages/design.page.md; docs/pages/shipping.page.md; docs/pages/README.md; docs/pages/PAGE-TZ-INDEX.md; docs/pages/inventory-dashboard.page.md; docs/DOMAIN-MAP.md; docs/agent-checklists/TZ-OPS-307.md; progress.md; docs/agent-checklists/_active-map.md

Проверено: `design.page.ts` / `shipping.page.ts` — stubs TZ-NAV-301 + PiGroupWorkspace; DOMAIN-MAP §1.3; README index устарел (`/dashboard` vs `/inventory`, не все страницы в таблице).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. `/design` и `/shipping` — заглушки «скоро», не READY продукт.
2. `docs/pages/README.md` индекс отстаёт (DOMAIN-MAP уже отметил drift).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Тонкие `design.page.md` + `shipping.page.md` (≤60 строк каждый): route, stub status, chips, data-test, «полный поток — later TZ», не invent API.
2. Hygiene `README.md`:  
   - inventory route = факт из `app.routes.ts` / `inventory-dashboard.page.md` (сейчас в README ошибочно `/dashboard` если код `/inventory`);  
   - добавить в индекс недостающие живые страницы из DOMAIN-MAP (warehouses, supply, people, import-todos, form-profiles, color-references, proposals/create, tables…) **кратко**, без копипасты целиком;  
   - поправить устаревший счётчик «22/22».
3. DOMAIN-MAP: все 6 former-NO → yes; итог gaps = 0 (или «stubs documented»).
4. PAGE-TZ-INDEX строки для design/shipping.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- FE stubs (не «оживлять» design/shipping)
- product code; deploy
- не создавать missing product features

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. design + shipping page.md; README без ложного `/dashboard` если route = `/inventory`.
2. DOMAIN-MAP §1.3: 0 × **NO** (или явная пометка stub-documented).
3. Нет product paths в diff.
4. Wave CLOSED checkpoint; Executor report → archive → commit+push.

Verification:
```
Test-Path docs/pages/design.page.md, docs/pages/shipping.page.md
Select-String -Path docs/DOMAIN-MAP.md -Pattern '\*\*NO\*\*'   # ожидаем 0 в gap-таблице routes
git diff --name-only
```
