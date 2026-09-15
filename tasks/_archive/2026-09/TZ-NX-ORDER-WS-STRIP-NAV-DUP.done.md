# TZ-NX-ORDER-WS-STRIP-NAV-DUP — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- `order-ws-header.component.ts`: removed «← К списку» (`/orders`) and
  «На Главную» (`/home`) — both duplicated the sticky workflow chips
  (`TZ-NX-ORDER-WS-CHROME-TOP`, landed just before this TZ) and
  browser/shell-rail history. Lifecycle CTAs (Подтвердить/Отменить)
  untouched.
- `order-ws-composition.component.ts`: removed the «Править строки
  заказа» pseudo-button (`composition-focus-line`) — it only focused/
  scrolled to the qty input already visible on the row, no real action of
  its own. Kept «Открыть в каталоге» as the sole deep-link CTA per line.
  Cleaned up the now-dead `focusLine()` method, `qtyInputs` viewChildren
  query, and the unused `#qtyInput` template ref / `ElementRef`/
  `viewChildren` imports that only existed to support it.
- No spec files (dedicated or via `order-detail.page.spec.ts`) asserted
  on any of the three removed test-ids — confirmed via grep across
  `frontend-nx/` before editing, nothing to update there.
- `docs/pages/orders.page.md`: updated the `TZ-NX-ORDER-WS-HEADER`/
  `TZ-NX-ORDER-WS-COMPOSITION` sections to drop the stale CTA mentions
  and note this cut.

## Gates

- `nx test kppdf-web` (full suite): `order-detail.page.spec.ts` PASS. Same
  one pre-existing unrelated `app-shell.component.spec.ts` failure as
  every recent TZ this session.
- `nx test features` (full suite): 52/52 suites, 457/457 PASS — unchanged
  count, confirms no hidden spec depended on the removed code.
- `nx build kppdf-web` (forced): PASS, ran last.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: N/A (not required by this TZ's gates; no new errors introduced)
  - checklist: N/A (S-size TZ)
  - progress.md: N/A
  - status synchronization: N/A (updated once at end of chain)
