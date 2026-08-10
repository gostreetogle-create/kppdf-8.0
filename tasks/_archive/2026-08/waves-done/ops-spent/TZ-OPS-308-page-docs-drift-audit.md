# TZ-OPS-308: Аудит дрейфа routes ↔ page.md (+ тонкий фикс)

PAGES: _(все бизнес-routes; docs-only)_  
PAGE_DOCS: docs/pages/README.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/DOMAIN-MAP.md  
Аудит-выход: `docs/audits/2026-08-09-page-docs-drift-audit.md`  
Зачем: после WAVE-PAGE-DOCS-GAPS убедиться, что индекс и page.md не разъехались с `app.routes.ts`.

РОЛЬ АГЕНТА: docs-only  
ЗАВИСИМОСТИ: OPS-305…307 DONE  
LAYER: 4  
CONFLICT KEYS: docs/audits/2026-08-09-page-docs-drift-audit.md; docs/pages/README.md; docs/pages/PAGE-TZ-INDEX.md; docs/DOMAIN-MAP.md; docs/agent-checklists/TZ-OPS-308.md; progress.md; docs/agent-checklists/_active-map.md

Проверено: `frontend/src/app/app.routes.ts` (read-only); `docs/pages/*.page.md`; DOMAIN-MAP §1.3; DOCS-INTEGRITY §2; analysis P2 «нет авто-drift gate».

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Gaps «нет page.md» закрыты (OPS-307). Остаётся риск: **неверный route в page.md**, страница есть а route ушёл, README/INDEX/DOMAIN-MAP строка врёт.
2. Авто-скрипт routes↔page.md — later P2; сейчас **ручной аудит + тонкий фикс фактов**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Инвентарь (READ):** из `app.routes.ts` собрать бизнес-paths (без `**`, без чистых redirect-only если нет page; redirects вроде `dictionaries/documents-ref` → отметить как redirect).
2. **Сверка:** для каждого path — есть ли `docs/pages/<x>.page.md` с тем же Route; для каждого `*.page.md` — живой ли route (или явный stub/child/kit).
3. **Аудит-файл** `docs/audits/2026-08-09-page-docs-drift-audit.md` (≤120 строк):  
   - таблица OK / MISMATCH / ORPHAN page / ORPHAN route / REDIRECT;  
   - severity P0 (ложный route в индексе) / P1 (устаревший API в page.md — только отметить, не чинить пачкой) / P2 note;  
   - итог: сколько OK.
4. **Тонкий фикс только P0 фактов в docs** (если нашлись): поправить route-строку в page.md шапке, строку README / PAGE-TZ-INDEX / DOMAIN-MAP.  
   **Не** переписывать целиком body page.md; **не** «улучшать» продукт.
5. Checkpoint `_active-map` + Integrity slot docs-only.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `frontend/**` `backend/**` `desktop/**` product code
- Полный rewrite всех page.md / SECTION-READINESS wholesale
- Graphify / авто-скрипт drift gate (можно **одна строка** hint в аудите «successor script»)
- SALES-* / DOC-TABLES-305 / DOC-343 WIP; deploy

known_limitation: глубокая сверка API endpoints внутри каждого page.md = выборочно при явном MISMATCH; не полный API-аудит всех 40 файлов.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Аудит-файл существует; таблица покрывает все бизнес-routes из routes.ts (или явный exclude-list redirects).
2. P0 несоответствия либо исправлены в docs, либо явно BLOCKED с причиной.
3. `git diff --name-only` без frontend/backend/desktop.
4. ## Executor report (auto) → archive + lock → commit+push.

Verification:
```
Test-Path docs/audits/2026-08-09-page-docs-drift-audit.md
git diff --name-only
# optional: сравнить число page.md vs число бизнес-routes в аудите
```
