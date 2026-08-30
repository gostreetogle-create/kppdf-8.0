# QUEUE-LIVE

> **Модуль №1 переноса на NX (решение PO):** единая страница **студии документов** — одна поверхность вместо legacy
> Studio + Builder + КП Workspace. КП становится типом документа внутри неё.
> **План (SoT):** `docs/architecture/nx-doc-studio.md` — там же порядок срезов S0–S8 и дельта backend D1–D4.
> **DEPLOY-READY = INVALID** (warm deploy failed @ `4d55d0ea`; doc-studio closeout @ `e87da7bd` not deployed)

| # | Задача | Кому | Промпт / статус |
|---|--------|------|-----------------|
| 1 | `TZ-NX-DOCSTUDIO-S0-FOUNDATION` — реестры «Тексты» + «Виды таблиц», публичный rich-text | Freebuff #1 | `PROMPT-FREEBUFF-DOCSTUDIO-S0.md` |
| 2 | `TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER` — порядок в `tasks/` + съёмка legacy живьём | Freebuff #2 | `PROMPT-FREEBUFF-DOCPLAT-01.md` · параллельно с #1, зоны не пересекаются |
    10|| 3 | Ревизия плана студии | Cursor + MCP `claude_code` | `PROMPT-CLAUDE-DOCSTUDIO-REVIEW.md` · analysis-only, только `docs/adr/**` |
| 4 | S2 `…-SHELL` → S8 `…-TEMPLATES-OUTPUT` | TZ от Cursor | после S0 и ревизии; порядок в плане § 6 |
| 5 | `TZ-NX-REGISTRY-CRUD-UNIFY` — единый CRUD во всех реестрах + снос «Конструктора» | Freebuff | `tasks/_backlog/nx/` · заказ PO 2026-08-30, выдать после S0 |
| 6 | Склад: один склад + разделы | park | решение PO в `docs/PO-CANON.md`; отдельный модуль |
| 7 | Дефекты из `defects.md` · Deploy · DESK-441 / PRICE-HIST · TZ-DOC-STUDIO-2006 | park | deploy — только по русской фразе PO |
