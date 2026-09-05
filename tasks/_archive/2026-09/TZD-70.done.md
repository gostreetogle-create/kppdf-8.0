# TZD-70: Desktop — кнопка «Записать» только когда готово (green UX)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — invalid/needs_review anywhere blocks commit even with sendable rows; only-ok_* rows enable + green accent; duplicate-alone does not block.
- desktop typecheck: PASS — `npx tsc --noEmit`.
- desktop svelte-check: PASS (0 errors/warnings).
- desktop tests: PASS — `npx tsx --test src/core/*.test.ts src/importers/*.test.ts` (101 tests, 4 suites, 0 fail).

## Delivered

- `evaluateSendReadiness(blocks, busy)` pure function in `multi-import.ts` (6 new unit tests).
- Green/red readiness banner above the "Отправить N строк" button in `App.svelte`.
- Send button now `disabled={!canCommit}` with a green `.btn--ready` accent when ready; send-eligibility rule (only ok_new/ok_update sent) unchanged.

## Scope disclosure

- `frontend-nx/**` not touched.
- Extracted the readiness logic into `multi-import.ts` per the TZ's own suggestion ("если вынесете в .ts") for real unit test coverage instead of Svelte-only characterization.

## Wave status

WAVE-DESKTOP-EXCEL-NX-ALIGN chain 68→69→70 complete. 71–73 (NX pairing/download port) are Freebuff's successor prompt, not started here.

## Commit

- see git log
