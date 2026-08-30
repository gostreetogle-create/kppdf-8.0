# QUEUE-LIVE

> **Модуль №1 переноса на NX (решение PO):** единая страница **студии документов** — одна поверхность вместо legacy
> Studio + Builder + КП Workspace. КП становится типом документа внутри неё.
> **План (SoT):** `docs/architecture/nx-doc-studio.md` — порядок срезов S0–S8 и дельты backend D1–D5.
> Ревизия плана кодом: `docs/adr/ADR-NX-DOC-STUDIO-REVIEW.md` (возражения внесены в план).
> **DEPLOY-READY = INVALID** (warm deploy failed @ `4d55d0ea`; doc-studio closeout @ `e87da7bd` not deployed)

| # | Задача | Кому | Промпт / статус |
|---|--------|------|-----------------|
| 1 | `TZ-NX-REGISTRY-CRUD-UNIFY` — единый CRUD во всех реестрах + снос «Конструктора» | Freebuff #1 | `PROMPT-FREEBUFF-REGISTRY-CRUD-UNIFY.md` · закрывает и долг S0 по живой проверке |
| 2 | `TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE` — дельта D1, типографика доживает до PDF | Freebuff #2 | `PROMPT-FREEBUFF-BLOCK-STYLE.md` · backend only, параллельно с #1 |
| 3 | S2 `…-SHELL` → S8 `…-TEMPLATES-OUTPUT` | TZ от Cursor | S2 после #1: делят `app.routes.ts` и навигацию. Порядок в плане § 6 |
| 4 | Склад: один склад + разделы | park | решение PO в `docs/PO-CANON.md`; отдельный модуль |
| 5 | Дефекты из `evidence/TZ-NX-DOCPLAT-01/defects.md` · Deploy · DESK-441 / PRICE-HIST · TZ-DOC-STUDIO-2006 | park | deploy — только по русской фразе PO |

## Закрыто в этой волне

| TZ | Итог |
|---|---|
| `TZ-NX-DOCSTUDIO-S0-FOUNDATION` | реестры «Тексты» и «Виды таблиц», публичный rich-text, 4 сервиса data-access. **Без браузерной проверки** — долг ушёл в задачу №1 |
| `TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER` | порядок в `tasks/`, съёмка legacy, замеры геометрии, `defects.md` |
| Ревизия плана студии | `docs/adr/ADR-NX-DOC-STUDIO-REVIEW.md`, план поправлен: D1 правило конфликта, D2 не перенос, D3 итоги на сервере, новый D5 |

## Долги, которые видны и не потеряны

- `frontend-nx/libs/features/src/lib/pi-group-workspace.component.spec.ts` — ESM-падение Jest, блокирует часть `pnpm test`.
- `pnpm architecture:check` — 3 старых cross-page нарушения в `frontend/**`.
- Незакоммиченный WIP чужой волны: `backend/src/modules/auth/**`, `backend/src/common/**`, `backend/src/modules/unit/**`, `docker-compose.yml`, `docs/pages/login.page.md`, `frontend/**/doc-constructor/studio/**`.
- `document_table_types` — коллекция-сирота, снос отдельной ops-TZ после реестра «Виды таблиц» (ждёт подтверждения PO).
