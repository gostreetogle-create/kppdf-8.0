═══════════════════════════════════════════════════════════════
TZ-DICT-311: Retire dictionaries hub + redirects
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-DICT-309 DONE; TZ-DICT-310 DONE (все group routes живы)
LAYER: 3
PAGES: /dictionaries ; group routes from 308–310
PAGE_DOCS: dictionaries.page.md ; measurements-group.page.md ; (+ group docs 310)

SoT: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md §2.1.3
Проверено: frontend/src/app/pages/dictionaries/dictionaries-hub.page.ts ;
  app.routes.ts path dictionaries → DictionariesHubPage ;
  PO-DIARY §5 Group Chip Workspace (hub cards не основной вход)

CONFLICT KEYS:
  frontend/src/app/pages/dictionaries/dictionaries-hub.page.ts ;
  frontend/src/app/app.routes.ts ;
  frontend/src/app/layout/app-layout.component.ts ;
  docs/pages/dictionaries.page.md ;
  docs/PO-DIARY.md (§5 short) ;
  docs/agent-checklists/TZ-DICT-311.md ;
  tasks/_active/TZ-DICT-311.md

ИСХОДНОЕ СОСТОЯНИЕ:
- `/dictionaries` = hub-карточки (дубль nav).
- SoT: «Обзор» cards больше не основной вход; redirect → первая группа или
  last-selected (выбрать одно и зафиксировать в docs; default = Измерения
  или Классификация — указать в executor report).

ЧТО ДЕЛАТЬ:
1. `/dictionaries` → redirect на выбранный group default (не рендерить card grid
   как primary). Hub component удалить или оставить dead-code-free redirect-only.
2. Проверить: нет nav пункта «Обзор»; только группы.
3. Specs: route dictionaries redirects; smoke group screens still load.
4. Docs + PO-DIARY §5 one-liner «hub retired»; PAGE-TZ-INDEX; READY FOR REVIEW.

ИЗМЕНЯТЬ: conflict keys.
НЕ ИЗМЕНЯТЬ: backend; table kit; group body CRUD (310); commit/push без PO;
  archive до Cursor PASS.

КРИТЕРИИ ПРИЁМКИ:
- [ ] Открытие /dictionaries не показывает card-hub как основной UX.
- [ ] Redirect целевой group screen работает; fe tsc + jest PASS.
- [ ] Docs/PO-DIARY согласованы; Cursor PASS before archive.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "dictionaries|measurements-group" --no-coverage
```

known_limitation: session last-selected group — optional; можно default
  фиксированный route в 311, last-selected → successor.

∥: после 310 only.
