# WAVE-NX-PRE-UAT-SMOKE — перед ручной проверкой PO

**TZ:** `tasks/TZ-NX-PRE-UAT-SMOKE-2026-09-12.md`  
**PROMPT:** `tasks/PROMPT-CLAUDE-PRE-UAT-SMOKE.md`  
**Зачем:** PO устал находить дыры глазами — агент гоняет gates + CDP smoke по свежим волнам, чинит FAIL, пишет тесты.

| # | SIZE | TZ | Status |
|---|------|-----|--------|
| 01 | L | `TZ-NX-PRE-UAT-SMOKE-2026-09-12` | DONE — 18/18 smoke PASS, 0 FAIL, 0 fixes needed |

**НЕ:** deploy, wipe, Soup, полный site crawl.

**WAVE COMPLETE (2026-09-12).** Аудит: `docs/audits/2026-09-12-pre-uat-smoke.md`. Все gates (backend/NX/desktop) + весь 18-пунктовый Chrome CDP smoke прошли зелёным на первом холодном прогоне — ни одного FAIL, ни одного продуктового фикса. Единственная находка — стейл-данные в ОДНОМ существующем документе PO (не код, не фикшу без FAIL evidence), задокументирована как «PO смотри глазками». SHA `af78049d`.
