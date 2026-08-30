# TZ-NX-COMPOSITION-LEGACY-AUDIT checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-COMPOSITION-LEGACY-AUDIT.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (docs-only, review perед push)

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T17:55:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `git status --short` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитан `_NOW.md` — ACTIVE/LIVE пуст, конфликтов нет
- [x] `tasks/_active/` — пуст на момент claim, конфликтов нет
- [x] TZ прочитан (сформулирован из промпта PO, исходного `tasks/TZ-NX-COMPOSITION-LEGACY-AUDIT.md` в репо не было)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-COMPOSITION-LEGACY-AUDIT.md` на месте

## Acceptance

- [x] Реальные модели/DTO/endpoints/поля зафиксированы для materials, products, product-modules, composition (complexes/sets).
- [x] Существующие связи между сущностями задокументированы.
- [x] Состав и количество (BOM/composition-line, quantity) описаны.
- [x] Размеры и единицы измерения описаны.
- [x] Цвет и его переопределения описаны.
- [x] Покупные/изготовленные сущности описаны.
- [x] Версии, архивирование, удаление описаны.
- [x] Текущие ошибки и неоднозначности зафиксированы.
- [x] Рекомендации "переносить / не переносить" даны с обоснованием.
- [x] Код и файлы `frontend/**`, `backend/**`, `frontend-nx/**`, `package.json` не изменены.

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive).
- [x] FIC §A–E: N/A — no product behavior changed.
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route changed.
- [x] SECTION-READINESS: N/A.
- [x] Чужой WIP не в коммите; conflict keys: read-only audit (никаких product-файлов).
- [x] Coupling map: N/A — не менял общее поле/статус.
- [x] Канон: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- Analysis-only — typecheck/tests/lint/architecture:check не запускались (нет изменений кода).
- Проверено: `git status --short` после работы показывает изменения только в `tasks/**` и `docs/agent-checklists/**`.

## Auditor report

См. `tasks/_archive/2026-08/TZ-NX-COMPOSITION-LEGACY-AUDIT.done.md` — полный отчёт с путями,
строками, endpoints и рекомендациями. **Outcome: PASS.**

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T18:02:23Z
