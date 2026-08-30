# QUEUE-LIVE

> **Модуль №1:** студия документов NX. План: `docs/architecture/nx-doc-studio.md` § 6 (S0–S8).

| # | Задача | Кому | Промпт |
|---|--------|------|--------|
| 1 | `TZ-NX-REGISTRY-CRUD-UNIFY` — **НЕ ЗАКРЫТ** | Freebuff #1 | см. ниже |
| 2 | `TZ-BACKEND-PDF-FONT-READY` — closeout (архив) | Freebuff #2 | `PROMPT-FREEBUFF-PDF-FONT-READY-CLOSEOUT.md` |
| 3 | `TZ-NX-DOCSTUDIO-S2-SHELL` — после #1 | Freebuff #1 | `PROMPT-FREEBUFF-DOCSTUDIO-S2.md` |

## Закрыто

| TZ | Итог |
|---|---|
| `TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE` (D1) | BlockStyle, sanitize, render, шрифты self-hosted, live PDF proof |
| `TZ-NX-DOCSTUDIO-S0` | реестры «Тексты» + «Виды таблиц» |
| `TZ-NX-DOCPLAT-01` | порядок tasks/, legacy evidence, геометрия, defects D1–D9 |

## Долги

- Backend lint: 51 error / 198 warn — repo-wide, не блокер волны.
- `architecture:check`: 3 старых в `frontend/**`.
- Чужой WIP: `backend/auth`, `backend/common`, `unit`, `docker-compose`, `login.page.md`.
- `document_table_types` — снос после подтверждения PO.
