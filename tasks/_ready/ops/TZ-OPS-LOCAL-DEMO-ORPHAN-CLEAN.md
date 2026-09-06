═══════════════════════════════════════════════════════════════
TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN: аккуратная чистка локальных демо-хвостов
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Ops / data hygiene (local Mongo + uploads only)
ЗАВИСИМОСТИ: желательно после `TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE` (или в той же сессии сразу после commit hotfix)
LAYER: 4 (скрипт/ops; product UI не трогать)
PAGES: supply, stock-movements, doc-studio (данные экранов)

CONFLICT KEYS: scripts/clean-local-demo-orphans.mjs; docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md; docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md

═══════════════════════════════════════════════════════════════
АВТОРИЗАЦИЯ PO (2026-09-06)
═══════════════════════════════════════════════════════════════

PO явно: NX строится с нуля; текущие данные в локальной базе — **все виртуальные/демо**; «надо чистить аккуратно»; в новый контур — только актуальное для показа работы экранов.

Это **не** разрешение на:
- production / Synology wipe
- `dropDatabase` / `deploy -Wipe`
- удаление всех заказов/каталога «ради чистоты»

Это разрешение на: **локальный** Mongo (+ uploads на диске dev) — вырезать **битые ссылки и осиротевшие демо-хвосты**, оставить/восстановить **цельную** демо-картинку для глаз.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Live QA зафиксировала (локальная shared-dev DB):

1. ~5 записей закупок/supply с `orderId` на несуществующий Order → 404.
2. ~6 stock movements с product/material, которого нет даже soft-deleted → «—» после hotfix populate.
3. ~14 ссылок на картинки в Doc Studio, файлов нет на диске → 404 превью.

Аудит: `docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md`.
Демо-seed уже есть: `scripts/seed-local-demo.mjs` (API, отказывается от production).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Подтвердить контур

  1.1 Только local: `docker`/localhost Mongo из `.env` / compose. Если URI указывает на remote/prod — **STOP**.
  1.2 Backend/NX могут работать — чистка через mongosh **или** одноразовый `scripts/clean-local-demo-orphans.mjs` (создать, если удобнее).
  1.3 Сначала **dry-run**: список id + краткая причина, counts. Потом apply в том же скрипте флагом `--apply`.

ШАГ 2: Удалить только битое

  2.1 SupplyRequest / SupplyTask (что реально отдаёт UI «Закупки»): записи с `orderId`, которого нет в `orders` → delete.
  2.2 StockMovement: `productId`/`materialId` задан, документа нет в products/materials (даже с includeSoftDeleted) → delete эти движения. Не трогать строки с живыми/soft-deleted refs.
  2.3 Doc Studio: блоки/поля с image URL/upload id, файла нет на disk → снять ссылку из документа **или** удалить битый image-block (минимально; не сносить целые шаблоны).
  2.4 Не каскадить в «все заказы»; не чистить catalog wholesale.

ШАГ 3: Вернуть цельную демо-картинку

  3.1 Если после чистки экраны пустые/дырявые — `node scripts/seed-local-demo.mjs` (idempotent).
  3.2 Глазом: Закупки без 404-заказа; Движения без бессмысленных «—»; Студия без битых превью на затронутых доках.

ШАГ 4: Отчёт + closeout

  4.1 В checklist: counts dry-run / applied; подтверждение local-only.
  4.2 Обновить audit § «data residue» → CLEANED + дата.
  4.3 Commit только скрипт + docs/checklist (если скрипт новый). Push.
  4.4 Archive TZ.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- frontend-nx / backend app services (кроме уже отдельного hotfix)
- production, Synology, wipe всей БД
- чужой WIP вне conflict keys

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Dry-run лог с counts до delete
- [ ] Apply только orphan/broken; local URI only
- [ ] UI: нет 5 битых закупок; нет 6 «мёртвых» движений; нет известных 404 studio images
- [ ] Демо-экраны читаемы (seed при необходимости)
- [ ] Отчёт SHA / counts в checklist; `_NOW` слот свободен

CLAIM: `agent_id: freebuff` (или claude), conflict keys vs `_active`.
