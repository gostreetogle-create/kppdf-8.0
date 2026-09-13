# TZ-NX-SUPPLY-TASK-UNCONFIRM checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SUPPLY-TASK-UNCONFIRM.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.4)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T20:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full; `supply-task.service.ts`/`.controller.ts` read in full
  (confirmed `STATUS_FLOW` one-way, `confirm()`/`markOrdered()`/`markReceived()`
  all reuse the same `assertTransition` guard); `dirty-dialog.guard.ts` read
  as the canon AlertDialog pattern to reuse (not invent a second one)
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text; `supply-task.service.ts`/`.spec.ts`/`.controller.ts`
  (full); `pi-supply-tasks.service.ts`/`.spec.ts` (full); `supply.page.ts`/`.spec.ts`
  (full — button block, `onConfirm`/`onOrdered`/`onReceived`, existing test
  patterns); `dirty-dialog.guard.ts` (canon AlertDialog + `onDialogCloseOnce`
  pattern, reused verbatim); `supply.page.md` (current API/data-access tables)
- **Key Constraints:** reverse edge ONLY `confirmed->draft`, not `ordered`/
  `received`; unconfirm rejected from any other status with a clear message;
  "Подтвердить" must go through a real confirm dialog, not stay silent;
  don't touch `SupplyRequest` (different entity); no wipe/deploy
- **Planned Deliverable:** BE `unconfirm()` + `STATUS_FLOW` edge + controller
  route; FE service method + "В черновик" button + AlertDialog-gated confirm;
  specs both sides; page.md updated; live verification of the full round-trip
  and the 400-rejection case
- **Validation Path:** BE tsc/jest + FE tsc/jest (kppdf-web AND data-access
  projects) + eslint (scoped) + architecture:check + `nx build kppdf-web`
  last + live Playwright (full UI round-trip) + live curl (400 rejection)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-SUPPLY-TASK-UNCONFIRM.txt`

## Acceptance (из TZ)

- [x] 1. confirmed → «В черновик» → status draft, `confirmedAt` пусто —
  live-подтверждено (UI round-trip) + spec
- [x] 2. Повторно доступно «Подтвердить» — live-подтверждено (кнопка
  переизбрана после unconfirm)
- [x] 3. unconfirm из non-confirmed → 400 — live-подтверждено curl'ом
  (точное сообщение) + `it.each` spec (draft/ordered/received)
- [x] 4. «Подтвердить» с диалогом подтверждения — live-подтверждено
  (AlertDialog с ожидаемым заголовком появляется до вызова API) + spec
  (confirm/cancel paths)
- [x] 5. Specs BE+FE + page.md; gates зоны / nx build — все PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: UX addition (reverse transition + confirm guard),
  переиспользует существующий `AlertDialogComponent`/`onDialogCloseOnce`/
  `assertTransition` — не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: `docs/pages/supply.page.md` обновлён (API table, data-access
  table, новый TZ-абзац, Tests bullet, TZ reference table)
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — ровно перечисленные
  в TZ файлы (BE service+controller+spec, FE data-access service+spec,
  supply.page.ts+spec, page.md)
- [x] Канон: не трогал `SupplyRequest` (другая сущность); не добавлял откат
  `ordered→confirmed`/`received→…`; не трогал складские движения; тестовые
  задачи (2 шт, UI-round-trip + curl 400-check) удалены сразу после проверки

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest supply-task.service --silent` → 11/11 PASS (was 7)
- `cd backend && pnpm exec jest --silent` (full) → 136 suites / 1357 tests PASS (was 1353)
- `cd backend && pnpm exec eslint src/modules/supply/supply-task.service.ts src/modules/supply/supply-task.service.spec.ts src/modules/supply/supply-task.controller.ts` → 0 problems
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache --testFile=supply.page.spec.ts` → 21/21 PASS (was 17)
- `cd frontend-nx && pnpm exec nx test data-access --skip-nx-cache --testFile=pi-supply-tasks.service.spec.ts` → 9/9 PASS (was 8)
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache` (full) → 125 suites / 900 passed + 7 skipped (907 total) PASS (was 904)
- `cd frontend-nx && pnpm exec nx test data-access --skip-nx-cache` (full) → 25 suites / 134 tests PASS (was 133)
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/supply/supply.page.ts apps/kppdf-web/src/app/pages/supply/supply.page.spec.ts libs/data-access/src/lib/supply/pi-supply-tasks.service.ts libs/data-access/src/lib/supply/pi-supply-tasks.service.spec.ts` → 0 problems
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright (full confirm-dialog + unconfirm round-trip on `/supply`)
  + live curl (400 on unconfirm from draft) — both PASS, 0 page errors,
  both test records cleaned up

## Executor report

**Reused the exact existing patterns, invented nothing new:** the reverse
transition is one more edge in the SAME `STATUS_FLOW`/`assertTransition`
table every other transition already uses (not a bespoke check with its own
message format); the confirm-guard dialog is the SAME `AlertDialogComponent`
+ `onDialogCloseOnce()` pattern `confirmDirtyClose` already established for
"no native `confirm()`" — no second dialog mechanism introduced.

**Live-verified both the happy path AND the guard rail:** a full UI
round-trip (draft → dialog-gated confirm → confirmed → В черновик → draft
→ re-confirmable) proved the feature works end-to-end, not just in mocked
unit tests; a separate direct curl call proved the 400 rejection fires with
the correct message for a status the TZ's own ACCEPT explicitly calls out
(unconfirm from a non-confirmed state).

**Testing-harness note (same nuance as the TZ-NX-CATALOG-CATEGORY-INLINE-CREATE
session earlier):** the mocked `AlertDialogComponent`'s reactive `DialogRef`
needed `fixture.detectChanges()` before `fixture.whenStable()` after
`ref.close()` for the resulting `onDialogCloseOnce` effect to actually fire
and drive the subsequent API call in the spec — the same fix already proven
in that earlier session's category-dialog specs, applied here without
re-deriving it from scratch.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T21:15:00Z
