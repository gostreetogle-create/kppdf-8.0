# TZ-SALES-344 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-344.md`
> Conflict keys: proposal Create/terms, quotation schema/DTO/service, document-template build/DTO, proposals page docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0` canonical `main`
- team_room_claim: `unavailable (claim attempted)`

## Preflight

- [x] SALES-343 archive/lock/push verified; 344 was next in the frozen wave order.
- [x] Existing TextBlock library and active TextBlockCategory services reused.
- [x] Frozen 317 shell and 343 recipient path remained intact.

## Acceptance

- [x] Russian «Условия» right-rail overlay supports add, reorder, delete, multiline edit, and F5 restore.
- [x] TextBlock library picker filters by active category, adds plain text without leaving the studio, and remains open for Add & continue.
- [x] Supported variables are visible and insert at the textarea cursor.
- [x] Quotation persists `terms`; build receives terms and renders them with safe variable substitution.
- [x] Unknown variables remain literal and do not render `undefined`.
- [x] Backend tsc PASS; document-template + quotation suites PASS (96/96).
- [x] Frontend tsc PASS; proposal-create + terms suites PASS (32/32).
- [x] Prettier, ESLint, diff-check PASS. Backend ESLint has only two pre-existing `any` warnings in the surrounding renderer.
- [x] Angular development build PASS.
- [x] Browser-equivalent self-verify PASS through Angular DOM/component tests: terms rail opens without changing the A4 center, library/order/variable behavior is covered, and the dev server compiled the updated lazy chunk. Authenticated backend-data browser smoke was unavailable in this headless workspace.

## Closeout

- [x] Archive marker created: `tasks/_archive/2026-08/TZ-SALES-344.done.md`.
- [x] Lock created: `.mimocode/locks/TZ-SALES-344-kp-terms-panel.lock`.
- [x] Active marker removed.
- [x] Commit + push complete.
