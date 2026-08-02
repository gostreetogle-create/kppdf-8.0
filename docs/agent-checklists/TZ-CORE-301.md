# Checklist — TZ-CORE-301 (Snapshot-on-transition immutability pattern)

**Status:** IN PROGRESS (created before any code edits)
**Created:** 2026-08-02

## Preconditions / context

- [x] TZ прочитан: `tasks/_backlog/TZ-CORE-301-snapshot-immutability-pattern.md`
- [x] Зона: новые файлы в `backend/src/common/` (snapshot helper) + `ARCHITECTURE.md` + docs — чистая (dirty только seed/* — не пересекаем)
- [x] Зависимости: none (foundational)
- [x] No conflicting peers

## Implementation

- [x] Спека helper: `backend/src/common/snapshot/snapshot.helper.ts` (чистая функция, SessionRunner-friendly — no DI/no DB)
- [x] Контракт inline snapshot: `_snapshot { stage, capturedAt, sourceId, hash, version:1 }` + deep-frozen data
- [x] Reference impl: unit spec демонстрирует переход (order payload → snapshot) + immutability + hash-verification (AC «тест или thin service method»)
- [x] Документ в `ARCHITECTURE.md` (секция Snapshot-on-transition immutability pattern) + companion note
- [x] НЕ мигрировал БД; legacy Proposal/Quotation merge не тронут

## Tests / gates

- [x] backend tsc — PASS
- [x] backend jest (snapshot.helper.spec 5/5) — PASS
- [x] git diff --check — PASS

## Notes / decisions

- `cloneImmutable` делает **deep** freeze (рекурсивный `Object.freeze`), не только верхний уровень — строгая immutability гарантия.
- `snapshotHash` использует stable key-sorted serialization — `{a,b}` == `{b,a}`.
- Reference impl не встроен в OrderService: модуль может быть занят параллельной сессией; AC покрыт тестом-демонстрацией. Succesor — на реальном переходе (PRODUCTION-301 / ARCHIVE-301).

## Executor report (auto)

- TZ-CORE-301 выполнен: snapshot-on-transition immutability helper + контракт + документ.
- Helper: createInlineSnapshot / snapshotHash / snapshotMatches / cloneImmutable (deep-freeze, structuredClone).
- Контракт: `_snapshot` per stage с sha256 hash-фингерпринтом и sourceId-прослеживаемостью.
- Тесты: 5/5 (immutability AC, key-order независимость hash, tamper detection, deep-freeze).
- Gates: backend tsc ✓, backend jest 5/5 ✓, diff-check ✓.
- Docs: ARCHITECTURE.md секция; чеклист создан до кода.
- Push/commit не выполнялись (правило: только по запросу PO).
