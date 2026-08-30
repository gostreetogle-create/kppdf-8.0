# TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER — DONE

## Outcome

**PASS** — порядок в `tasks/` наведён (корень: 6 служебных + 5 активных файлов волн),
legacy-модуль документов снят живьём (19 скриншотов), закон геометрии КП подтверждён
числами в обеих ориентациях, дефекты зафиксированы (D1–D9) без патчей.

## Фаза A — порядок в tasks/

- **Из корня убрано 62 файла:**
  - `_archive/2026-08/specs-dup-root/` — **33 файла**: 22 дубля из TZ (корень нёс полную спеку, `.done.md` — краткий архив) + 7 корневых TZ с полным `.done.md` (CATALOG-377, KP-443, SUPPLY-443, TEST-422, UX-440R, UX-442, UX-444B — спеки уникальны, на них ссылаются архивы) + TZ-NX-GATES (архив `.failed.md`), TZ-NX-GATES-2-nx-scoped (`.done.md`), TZ-OPS-320-start-nx-port-hygiene (`.done.md`), TZ-NX-UNITS-DELETE-FE (дубль backlog-задачи).
  - `_backlog/nx/` — TZ-NX-COMPOSITION-ARCHITECTURE-DECISION, TZ-NX-F0-bootstrap, TZ-NX-NEXT-DAY-PLAN, TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.
  - `_backlog/ops/` (создана) — TZ-OPS-AGENT-ORCHESTRATION-AUDIT, TZ-OPS-NX-START-CANON.
  - `_backlog/ux-hygiene/` — TZ-AUDIT-MGR-530-manager-journey-audit.
  - `_backlog/doc-studio/` — WAVE-DOC-STUDIO; `_backlog/ui-density/` — WAVE-UI-DENSITY-PAPER-INK.
  - `_archive/2026-08/prompts-spent/` — **20 отработанных PROMPT-***.
- **В корне осталось:** README.md, QUEUE-LIVE.md, PROMPT-RESUME-ANY.md, PROMPT-FOLLOW-QUEUE.md, PROMPT-UNIVERSAL-CONTINUOUS.md, PROMPT-DEPLOY-READY.md + TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md, TZ-NX-DOCSTUDIO-S0-FOUNDATION.md, PROMPT-FREEBUFF-DOCPLAT-01.md, PROMPT-FREEBUFF-DOCSTUDIO-S0.md, PROMPT-CLAUDE-DOCSTUDIO-REVIEW.md.
- `tasks/README.md` — секция «Сейчас» актуализирована (модуль №1 = студия документов, ссылка на `docs/architecture/nx-doc-studio.md`).
- `tasks/_backlog/QUEUE.md` — строки по каждой перемещённой TZ (nx / doc-studio / ux-hygiene / ops).
- `.done.md` в `_archive/**` не изменены и не удалены.

## Фаза B — съёмка legacy (живьём)

- Приложение: `node start.mjs --no-browser` → frontend `http://127.0.0.1:4200`, backend :3000 (health 200), UI-логин admin.
- Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/` — **19 скриншотов** + `_geometry.json` + `defects.md`.
- Геометрия КП (числа из браузера, Playwright `getBoundingClientRect`, viewport 1440×900):

| # | Проверка | Portrait | Landscape |
|---|----------|----------|-----------|
| 1 | panelW === 480 | **480.00 px** | **480.00 px** |
| 2 | A4 right gap stage ≈ 8px | **8.0 px** | **8.0 px** |
| 3 | A4 rect open vs collapsed Δ ≤ 0.5px | **Δ = 0.0 px** | **Δ = 0.0 px** |
| 7 | Клик по A4 сворачивает панель | ✘ (только rail-тул) → D7 | ✘ → D7 |

- Дефекты: **9 записей (D1–D9)** в `defects.md` — 404 фото шаблона в builder, нет ±страниц и save-as-template в студии, read-only геометрия свойств, нет палитры/drag в builder, клик по A4 не сворачивает панель.

## Gates

- `docs-only`: typecheck/tests/lint **N/A** (product-код не менялся — ни строки в frontend/backend).
- Доказательство запуска legacy: `node start.mjs --no-browser` (лог `.logs/start-docplat.log`), health 200, UI-логин admin, 19 скриншотов.

## Changed files

```
tasks/README.md
tasks/_backlog/QUEUE.md
tasks/_active/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md (удаляется при archive)
tasks/_archive/2026-08/specs-dup-root/* (33 файла)
tasks/_archive/2026-08/prompts-spent/* (20 файлов)
tasks/_backlog/nx/* tasks/_backlog/ops/* tasks/_backlog/ux-hygiene/*
tasks/_backlog/doc-studio/WAVE-DOC-STUDIO.md tasks/_backlog/ui-density/WAVE-UI-DENSITY-PAPER-INK.md
docs/agent-checklists/TZ-NX-DOCPLAT-01.md
docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/** (19 png + defects.md + _geometry.json)
docs/pages/PAGE-TZ-INDEX.md (1 строка)
docs/agent-checklists/_NOW.md (своя секция)
```

Продуктовый WIP не коммитился: `backend/unit, auth, common`, `frontend/**`, `frontend-nx/**`, `start.mjs`, `package.json`, `docker-compose.yml` — не тронуты/не staged.
Примечание по составу delivery-коммита `bc65aa35`: вместе с файлами волны в коммит попали (1) 5 удалений `tasks/_backlog/doc-studio/TZ-DOC-STUDIO-2001..2005*` — это архив-процесс параллельной волны S0 (у всех 5 уже есть `.done.md` в `_archive/2026-08/`, удаление источников соответствует её намерению; попытка снять их с индекса до коммита не удалась из-за неверных имён pathspec); (2) чеклисты и evidence других NX-волн, лежавшие untracked на диске. Итоговое состояние корректно, продуктовый код не затронут.

## Known limits

- Дефекты из `defects.md` не исправлялись — каждый станет отдельной TZ по решению PO.
- Браузерная проверка 9 реестров NX — в park (отдельная TZ `tasks/_backlog/nx/TZ-NX-REGISTRY-CRUD-UNIFY.md`).

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-30
closed_by: freebuff-docplat-01
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED
  - progress.md: N/A (redirect — журнал в docs/_archive_legacy)
  - status synchronization: PASS
