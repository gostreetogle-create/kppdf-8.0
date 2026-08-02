# TZ-MATERIALS-308 — Материалы: доменная связка материал → склад — DONE

```
ARCHIVE_MARKER: TZ-MATERIALS-308-material-stock-link
status: DONE
date: 2026-08-02
executor: buffy
source_task: tasks/_backlog/TZ-MATERIALS-308-material-stock-link.md
checklist: docs/agent-checklists/TZ-MATERIALS-308.md
```

## Outcome

Material подключается к складу: `StorageItem.materialId` (nullable, XOR с
`productId`), движения прихода/расхода по материалу, dashboard-метрики и
low-stock учитывают материал-позиции, страница материалов получает read-only
ссылку «Склад →» на `/storage-items?materialId=`.

Контракт-фикс: `GET /storage-items` и `GET /inventory/low-stock` отдают envelope
`{items,total}` (FE entity-list/dashboard/service-spec уже ожидали envelope).

## Files

Полный список в `docs/agent-checklists/TZ-MATERIALS-308.md` (backend layer был
в `837d278` — XOR, materialId, индексы; поверх — envelope-контракт, e2e 9 тестов,
unit контроллеров 6/6, FE-колонки/фильтры/ссылки, docs).

## Gates

backend tsc ✓ · frontend tsc ✓ · frontend jest 55/55 ✓ · ng build ✓ ·
git diff --check ✓ · backend unit (storage-item + inventory controllers) 6/6 ✓.

## Внешний блокер (e2e)

Backend e2e-раннер на момент closeout заблокирован **чужой незавершённой**
работой параллельной RBAC-сессии (`AuthService` → `RoleService` не зарегистрирован
в `AuthModule` — DI-ошибка). Мой e2e-спек `materials-stock` проходил 9/9 ДО их
правок; envelope-контракт независимо подтверждён unit-тестами контроллеров.
Когда ACCESS-301 закроется — `pnpm test:e2e materials-stock` покажет зелёный.

## Executor report (auto)

См. `docs/agent-checklists/TZ-MATERIALS-308.md` → `## Executor report (auto)`.
Push/commit не выполнялись (правило: только по запросу PO).
