# TZ-CORE-304 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-CORE-304.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T21:00:26Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `QUEUE-LIVE.md` + `tasks/_active/` — CORE-304 explicitly reserved for Claude slot
- [x] TZ / канон прочитаны: `GEMINI.md`, `docs/PO-CANON.md`, `tasks/TZ-CORE-304-land-core-302-group-b.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-CORE-304.md` на месте

## Acceptance

- [x] CONFLICT KEYS (44 schema.ts + soft-delete-coverage.spec.ts) на origin (commit `c4322e4b`)
- [x] `backend/src/database/soft-delete-coverage.spec.ts` PASS (1/1)
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- [x] `git status` без `M` на этих schema-файлах после push
- [x] `ContractItem` (`_id: false` subdoc) — deletedAt снят; та же проблема найдена и исправлена ещё в 4 файлах (не в исходном TZ, но того же класса дефекта)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: backend schema
- [x] FIC §A–E: N/A
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (стейджили только перечисленные CONFLICT KEYS, не `git add -A`)
- [x] Coupling map: N/A
- [x] `frontend/**`, `desktop/**`, `docs` PO-CANON/CLAUDE.md — не тронуты

## Gates (факт)

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit                          → exit 0 (PASS)
cd backend && pnpm exec jest src/database/soft-delete-coverage.spec.ts --runInBand   → 1/1 PASS
```

## Executor report

- Landed все 44 `*.schema.ts` из CONFLICT KEYS + новый
  `soft-delete-coverage.spec.ts` (был untracked) — все несли только
  `deletedAt?: Date | null` (`@Prop({ type: Date, default: null, index: true })`)
  относительно `origin/main` на момент старта (`bafac3ea` → фактически
  `53eba37e` после `git pull --ff-only`).
- **Найден и исправлен дефект того же класса, что TZ явно предупреждал про
  `ContractItem`**: полный скан всех 44 файлов на `_id: false` subdoc-классы
  (регэксп `@Schema\(\{\s*_id:\s*false`) нашёл 7 файлов с такими subdoc'ами
  (`bom`, `contract`, `document-table-type`, `purchase-order`,
  `purchase-request`, `storage-item`, `tech-process`). Проверил каждый:
  `bom.schema.ts` и `storage-item.schema.ts` уже правильно несли `deletedAt`
  на коллекции; но **5 файлов** имели `deletedAt` только на вложенном
  `_id: false` line-item subdoc (`ContractItem`, `DocTableColumn`,
  `PurchaseOrderItem`, `PurchaseRequestItem`, `TechProcessOperation`) —
  сам коллекционный класс (`Contract`, `DocumentTableType`,
  `PurchaseOrder`, `PurchaseRequest`, `TechProcess`) `deletedAt` не имел
  вовсе. Перенёс поле с subdoc на родительский коллекционный класс во всех
  пяти файлах (тот же паттерн, что уже был в `bom`/`storage-item`) —
  `deletedAt` на subdoc без своего `_id` бессмысленен для soft-delete
  запроса. Итоговый коммит против origin показывает чистый ADD только на
  коллекции — промежуточное неверное состояние subdoc-`deletedAt` никогда
  не попадало в git-историю (было только на диске).
- Ещё раз прогнал полный regex-скан по всем 44 файлам после фикса — других
  `_id: false` subdoc-классов с ошибочным `deletedAt` не осталось (только
  ложное срабатывание в `text-block.schema.ts` — там `_id: false` это опция
  inline-схемы `@Prop({ type: [...], _id: false })`, не отдельный класс
  subdoc'а; `deletedAt` там и так стоит на `TextBlock`, коллекции).
- Стейджил и коммитил строго перечисленные CONFLICT KEYS через `git add --`
  с явным списком путей (не `git add -A`); `git status` после push подтверждает
  ноль `M` на этих файлах.
- Conflict disclosure: `tasks/_active/` на старте содержал `TZ-UX-345`,
  `TZ-UX-FORM-310`, `TZ-UX-FORM-311` — Angular, другие conflict keys, не
  пересекались. `docs/`, `frontend/**`, `desktop/**` не трогал.

## Review handoff

- [x] READY FOR REVIEW — N/A, TZ не запрашивала отдельный review-wave

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
