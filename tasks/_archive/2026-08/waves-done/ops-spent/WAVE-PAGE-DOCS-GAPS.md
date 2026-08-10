# WAVE — Page docs gaps (OPS-305 → 307)

> **Зачем:** закрыть 6 дыр `page.md` из `docs/DOMAIN-MAP.md` §1.3 + подтянуть индекс README.  
> **Для кого:** ИИ-агенты (шпаргалки экранов). **Не** UI в веб-приложении для PO.  
> **SoT:** `docs/DOMAIN-MAP.md`, `docs/pages/_template.md`, эталон `docs/pages/form-profiles.page.md`  
> **Промпт:** `PROMPT-PAGE-DOCS-GAPS-CONTINUOUS.md`

## Очередь (строго)

| # | TZ | Содержание |
|---|-----|------------|
| 1 | **TZ-OPS-305** | `/doc-template-categories` + `/dictionaries/text-block-categories` |
| 2 | **TZ-OPS-306** | `/admin/users` + `/admin/roles` |
| 3 | **TZ-OPS-307** | stubs `/design` + `/shipping` + hygiene `pages/README` (+ DOMAIN-MAP gap → closed) |

## Правила

- **ТОЛЬКО docs** (+ checklist / progress / archive / active-map / PAGE-TZ-INDEX / DOMAIN-MAP строки).
- **BAN:** `frontend/**`, `backend/**`, `desktop/**` product code; deploy; Graphify.
- Routes/pages в коде — **READ only** (чтобы описать факт).
- Не воровать keys у SALES-328 / DOC-TABLES-305 / DOC-343 / TABLES-306 FE.
- После каждой TZ: Executor report (auto) → archive → commit+push → next.
- mid-queue «поехали?»: запрещено.

## После 307

NEXT idle. DOMAIN-MAP gap inventory: 0 NO (или явный stub note). Deploy: NO.
