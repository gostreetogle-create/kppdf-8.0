# TZ-SUPPLY-313.done — Стратегия legacy-контура PurchaseRequest/PurchaseOrder

ARCHIVE_MARKER
outcome: DONE (decision recorded, variant A executed)
closed_at: 2026-08-20T21:05:00+03:00
closed_by: freebuff-executor (decision owner: PO)
TZ: TZ-SUPPLY-313
WAVE: SUPPLY-FINALIZATION
DECISION: A — официальный legacy-режим (B — successor, только отдельной волной)

verification:
  - ledger: PASS (`docs/CAPABILITY-LEDGER.md` — строка Procurement legacy + история)
  - domain map: PASS (`docs/DOMAIN-MAP.md` — строка Supply дополнена)
  - code changes: NONE (вариант A = docs-only, ноль риска)
  - data: untouched (коллекции `purchaserequests`/`purchaseorders` не тронуты)

## Обоснование решения A (над B)

1. **Прод-данные неизвестны.** Доступа к прод-БД нет; история (TZ-12/15, июль)
   говорит, что `PurchaseOrder`/`Invoice` использовались на проде. Удаление
   коллекций = риск потери данных (P0) — недопустимо без backup/аудита.
2. **Цена развязки MCP.** Вариант B требует правки 4 инструментов
   (`desktop/mcp/src/supply-tools.ts`), тестов (`supply-tools.test.ts`) и
   `desktop/docs/MCP.md` — отдельная вертикаль, не «заодно».
3. **Пользы от удаления сейчас нет.** UI не строится, модули read-only,
   данных на локальном стенде 0. Заморозка стоит ноль поддержки.
4. `docs/data-model-audit.md` (statusId/status, кэши entityName) — известные
   legacy-дефекты, их исправление остаётся в составе варианта B или отдельной
   TZ, не блокирует решение.

## Outcome

- Контур `PurchaseRequest`/`PurchaseOrder` зафиксирован как **официальный
  legacy-режим**: read-only API + MCP, без UI, без расширения; новые закупки —
  через `SupplyRequest`/`SupplyTask`.
- Ledger и DOMAIN-MAP обновлены; строка Supply-раздела (quick order + registry
  + shipping) помечена `included`.

## Critical files

- `docs/CAPABILITY-LEDGER.md`
- `docs/DOMAIN-MAP.md`
- `docs/agent-checklists/SUPPLY-SMOKE.md` (прод-прогон BLOCKED до пароля)

## Known limitations

- Прод-прогон supply-smoke остаётся BLOCKED (auth 401, нет прод-кредов).
- Backfill `organizationId` для legacy-записей — отдельная задача перед жёстким
  tenant enforcement (не входит в A).

## Successor

- **B (удаление)** — отдельная волна: развязка MCP (desktop/mcp + tests +
  docs) → аудит прод-данных + backup → снятие модулей из app.module → удаление
  коллекций. Требует явного разрешения PO (DANGEROUS-OPS).
- `TZ-PROCUREMENT-301-auto-purchase-from-order` (`tasks/_park/`) — остаётся в
  парке; при реализации использовать новый контур SupplyRequest, не legacy.
