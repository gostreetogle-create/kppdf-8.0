# WAVE — Project Knowledge Integrity (OPS-302 → 304)

> **Цель:** усилить «склад знаний» проекта для агентов — целостность docs, связность домен↔код↔UI, без потери уже созданного.  
> **Не цель:** Graphify, product FE/BE, деплой.  
> **SoT workspace:** `D:\kppdf-8.0` / `main`  
> **Анализ:** `docs/audits/2026-08-09-project-knowledge-integrity-analysis.md`  
> **Промпт:** `PROMPT-OPS-KNOWLEDGE-CONTINUOUS.md`

## Очередь (строго по порядку)

| # | TZ | Файл | Слой |
|---|-----|------|------|
| 1 | **TZ-OPS-302** | `TZ-OPS-302-project-memory-pack.md` | тонкий Project Memory + проводка входа |
| 2 | **TZ-OPS-303** | `TZ-OPS-303-docs-integrity-closeout.md` | протокол integrity + checklist slot |
| 3 | **TZ-OPS-304** | `TZ-OPS-304-domain-canon-map.md` | DOMAIN-MAP + gap inventory |

## Правила волны

- Только docs / skills / GEMINI / AI-AGENT-GUIDE / checklists template. **Ноль** `frontend/**` и `backend/**` product code.
- Не трогать conflict keys активных DOC-344 / DOC-TABLES-305 / SALES-*.
- После каждой TZ: gates → `## Executor report (auto)` → archive → commit+push scoped → Checkpoint `_active-map` → next.
- Deploy: **NO**.
- mid-queue «поехали?»: **запрещено**.

## BAN

- Graphify / Neo4j / vector DB
- Перепись всего ARCHITECTURE / data-model
- Массовое создание всех missing page.md (только таблица gaps в 304)
- `deploy.ps1`
- Чужой WIP в коммите

## После 304 DONE

NEXT idle по этой волне. Successor (отдельные TZ, не эта волна): заполнение missing page.md по gap-таблице; опциональный drift-script routes↔docs.
