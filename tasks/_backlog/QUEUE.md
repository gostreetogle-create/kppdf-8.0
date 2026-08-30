# Очередь (тонкая)

> Устарело: desk-волна (401–422) полностью DONE — см. `docs/agent-checklists/_NOW.md`
> (актуальная живая доска). Этот файл больше не источник правды, оставлен для истории.
> Актуальный backlog: `tasks/_backlog/*.md` (без DESK-40x — заброшенные копии убраны
> в `_archive/2026-08/specs-dup-root/`, сами задачи давно DONE).
> Обновлено 2026-08-30: корневые TZ разложены по темам (TZ-NX-DOCPLAT-01 фаза A).

## NX (готово к выдаче по команде PO)

- [`nx/TZ-NX-REGISTRY-CRUD-UNIFY.md`](./nx/TZ-NX-REGISTRY-CRUD-UNIFY.md) — единый CRUD во всех реестрах (редактировать/копировать/удалить везде, поиск везде, units переименовываются, organizations/supply/passports получают формы) + снос раздела «Конструктор» + вывод демо-`departments` из каталога. Заказ PO 2026-08-30.
- [`nx/TZ-NX-F0-bootstrap.md`](./nx/TZ-NX-F0-bootstrap.md) — bootstrap Nx workspace `frontend-nx/` (foundation wave 0).
- [`nx/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md`](./nx/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md) — verified decision: 3 persisted entities, не 5.
- [`nx/TZ-NX-NEXT-DAY-PLAN.md`](./nx/TZ-NX-NEXT-DAY-PLAN.md) — план подготовки NX-платформы без импорта Excel.
- [`nx/TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md`](./nx/TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS.md) — draft, blocked до `TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION`.
- [`nx/TZ-NX-REGISTRY-UNITS-DELETE-FE.md`](./nx/TZ-NX-REGISTRY-UNITS-DELETE-FE.md) — DELETE Units в реестре (backend hard-delete уже merged).

## Doc-studio (перенос модуля документов — после S0)

- [`doc-studio/WAVE-DOC-STUDIO.md`](./doc-studio/WAVE-DOC-STUDIO.md) — программа волн Document Studio (0–19 DONE; программа актуальна для S0–S8).
- [`doc-studio/TZ-DOC-STUDIO-2006-render-extract-phase2.md`](./doc-studio/TZ-DOC-STUDIO-2006-render-extract-phase2.md) — render extract phase 2 (техдолг, PARK).

## UX hygiene

- [`ux-hygiene/TZ-AUDIT-MGR-530-manager-journey-audit.md`](./ux-hygiene/TZ-AUDIT-MGR-530-manager-journey-audit.md) — manager-journey smoke + волны исправлений (Cursor docs + orchestration).

## Ops

- [`ops/TZ-OPS-AGENT-ORCHESTRATION-AUDIT.md`](./ops/TZ-OPS-AGENT-ORCHESTRATION-AUDIT.md) — PLANNED, audit документации, config не менять.
- [`ops/TZ-OPS-NX-START-CANON.md`](./ops/TZ-OPS-NX-START-CANON.md) — принятый PO канон запуска NX (2026-08-29).

## Park (не брать без PO)

AUTH-307, UTF8, паспорта, TZD-49, MIG-305 branding.
(SALES-377 unparked → `tasks/_backlog/kp-vitrine/`)
