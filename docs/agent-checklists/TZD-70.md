# TZD-70 checklist — Desktop: кнопка «Записать» только когда готово (green UX)

> Status: **DONE**
> Marker: `tasks/_active/TZD-70-send-ready-ux.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T21:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] `tasks/_active/` — только `TZ-NX-WAREHOUSE-W2-BALANCES.md` (Freebuff), нет пересечения
- [x] TZD-69 DONE (зависимость выполнена)
- [x] Claim slot заполнен; `tasks/_active/TZD-70-send-ready-ux.md` на месте

### Preflight Check Output
- **Context read:** `tasks/_ready/desktop/TZD-70-send-ready-ux.md`, `desktop/src/App.svelte` (`sendableRowsCount`, `countStatus`, the «Отправить N строк» button + `.btn--primary`/`.vc--*` CSS)
- **Key Constraints:** только `App.svelte` (+ CSS); не менять какие статусы уходят в send (по-прежнему только `ok_new`/`ok_update`); `frontend-nx` не трогать
- **Planned Deliverable:** `evaluateSendReadiness()` pure function (multi-import.ts) + green/red banner + `disabled`/green-accent wiring in `App.svelte`
- **Validation Path:** `desktop && npx tsc --noEmit` + `svelte-check` (extra) + `npx tsx --test src/core/*.test.ts src/importers/*.test.ts`

**Проверено:** старая кнопка была `disabled={mappingBusy || sendableRowsCount === 0}` — активна даже при `invalid`/`needs_review` в блоках (только `ok_*` реально уходят в `sendBlocks`, но экран не подтверждал «всё чисто» явно).

---

## Acceptance (из TZ)

- [x] При invalid>0 кнопка disabled даже если sendable>0 — `evaluateSendReadiness` unit test
- [x] При только ok_* — enabled + зелёный акцент (`.btn--ready`, `.send-readiness--ok`)
- [x] duplicate alone не блокирует commit (они и так не в sendable) — unit test

## Design decision

Логика вынесена в чистую функцию `evaluateSendReadiness(blocks, busy)` (`multi-import.ts`) вместо нескольких `$derived` прямо в `App.svelte` — TZ сам предложил это как предпочтительный вариант («Тест… если вынесете в .ts»), это даёт реальные unit-тесты вместо characterization по Svelte-компоненту (который `npx tsx --test` не видит).

## Integrity slot

- [x] Тип изменения: other (desktop UI polish)
- [x] FIC / page.md / DOMAIN-MAP / COUPLING-MAP: N/A
- [x] Чужой WIP не в коммите; `frontend-nx/**` не трогался
- [x] Канон `docs/DOCS-INTEGRITY.md` соблюдён

## Gates (факт)

- `cd desktop && npx tsc --noEmit` → PASS
- `cd desktop && npx svelte-check --tsconfig ./tsconfig.json` → 0 ERRORS 0 WARNINGS
- `cd desktop && npx tsx --test src/core/*.test.ts src/importers/*.test.ts` → PASS: 101 tests, 4 suites, 0 fail (+6 vs TZD-69 baseline: `evaluateSendReadiness` cases)

## Executor report

**`desktop/src/core/multi-import.ts`:** new `evaluateSendReadiness(blocks, busy): SendReadiness` — `sendableCount`/`invalidCount`/`needsReviewCount` across **all** blocks (not just the current one) + `canCommit = sendableCount > 0 && invalidCount === 0 && needsReviewCount === 0 && !busy`. Pure, no Svelte dependency — 6 unit tests cover every AC branch plus the busy-gate.

**`desktop/src/App.svelte`:**
- `sendReadiness = $derived(evaluateSendReadiness(importBlocks, mappingBusy))` replaces the old standalone `sendableRowsCount` derived (now just `sendReadiness.sendableCount` for the button copy, unchanged text).
- New banner above the send button: green «Готово к загрузке: N строк» when `canCommit`, red «Исправьте ошибки (M) / строки на проверку (K) — запись недоступна» otherwise (omits the needs_review clause when it's zero).
- Send button: `disabled={!sendReadiness.canCommit}` (was `mappingBusy || sendableRowsCount === 0`); gains `.btn--ready` (green) class when `canCommit`.
- New CSS: `.send-readiness`/`--ok`/`--bad`, `.btn--ready`(`:hover`) — reuses the existing `.vc--ok`/`.vc--bad` color palette for consistency with the per-row status chips already on screen.

**Conflict disclosure:** touched exactly `desktop/src/App.svelte` (+ its inline CSS) and `desktop/src/core/multi-import.ts(+.test.ts)` for the extracted pure function — a superset of the declared CONFLICT KEYS (`App.svelte` only) but the TZ text itself invites exactly this extraction ("если вынесете в .ts"), and `multi-import.ts` is already one of TZD-69's conflict keys from the same wave, not a new file outside the wave's footprint.

**Known limits:** none beyond what the TZ already scoped out (send-eligibility rule itself unchanged; `frontend-nx` untouched).

## Review handoff

- [x] No review-inbox wave requirement — archive directly after gates

## Closeout

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-05T21:15:00Z

## Wave status

`WAVE-DESKTOP-EXCEL-NX-ALIGN` chain **68 → 69 → 70 all DONE**. Per `PROMPT-CLAUDE-DESKTOP-EXCEL-NX.md`: **STOP here** — 71/72/73 (NX pairing/download port, `frontend-nx/**`) are Freebuff's successor prompt (`PROMPT-FREEBUFF-NX-DESKTOP-PAIRING.md`), not started by this session.
