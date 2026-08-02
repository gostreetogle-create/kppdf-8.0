# TZ-CORE-301 — Snapshot-on-transition immutability pattern — DONE

```
ARCHIVE_MARKER: TZ-CORE-301-snapshot-immutability-pattern
status: DONE
date: 2026-08-02
executor: buffy
source_task: tasks/_backlog/TZ-CORE-301-snapshot-immutability-pattern.md
checklist: docs/agent-checklists/TZ-CORE-301.md
```

## Outcome

Единый snapshot-on-transition паттерн: чистый helper `createInlineSnapshot`
(deep-frozen clone + sha256 hash-фингерпринт + `_snapshot` meta per stage).
FK-only утечка каталога в архивные заказы/спеки/отгрузки закрывается
denormalize-per-stage контрактом (Q9 default). SessionRunner-friendly: no DI,
no DB — caller встраивает snapshot в свой stage-документ в той же транзакции.

## Files (только мои)

- `backend/src/common/snapshot/snapshot.helper.ts` — NEW: createInlineSnapshot /
  snapshotHash / snapshotMatches / cloneImmutable (deep freeze + structuredClone).
- `backend/src/common/snapshot/snapshot.helper.spec.ts` — NEW: 5 тестов
  (immutability AC, key-order независимость hash, tamper detection, deep-freeze).
- `ARCHITECTURE.md` — секция «Snapshot-on-transition immutability pattern (TZ-CORE-301)».

## Not done (known_limitation)

- НЕ мигрирована вся БД; не mega-collection; legacy Proposal/Quotation merge не тронут.
- Reference impl на реальном переходе (КП→Order hook point) — суксессор при
  PRODUCTION-301 / ARCHIVE-301; сейчас AC закрыт тестом-демонстрацией.

## Gates

backend tsc ✓ · backend jest 5/5 ✓ · git diff --check ✓

## Executor report (auto)

См. `docs/agent-checklists/TZ-CORE-301.md` → `## Executor report (auto)`.
Push/commit не выполнялись (правило: только по запросу PO).
