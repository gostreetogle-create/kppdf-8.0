# TZ-NX-ORDER-WS-CHROME-TOP — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- `order-detail.page.ts` wrapped in `<app-pi-group-workspace [toc]="[]"
  tocActiveId="" [chips]="chips()" activeId="order"
  dataTestPrefix="order-workflow-chip">` — same chrome pattern as
  `home.page.ts` (`TZ-NX-HOME-CHROME-TOP`) and every list page's `[toc]`
  slot. `eyebrow «Сделки»` + `h1 «Заказ №…»` unchanged (category ≠ title —
  no duplicate-title bug here, unlike Home).
- Workflow chips (Главная/КП/Гант/Снабжение/Отгрузка/current Заказ) are
  now a computed `GroupChip[]` signal on the page (empty until the order
  loads, same gate the old component had) instead of the standalone
  `OrderWsWorkflowChipsComponent` body-level `<nav>`. The "Заказ" current
  chip self-links to its own `/orders/:id` route (same self-link pattern
  as Home's active chip) instead of rendering as a non-navigating
  `<span>`.
- `OrderWsWorkflowChipsComponent` deleted (`order-ws-workflow-chips.component.ts`)
  — zero other consumers after this change, no dedicated spec existed;
  removed its `ui/index.ts` barrel export too.
- `order-detail.page.spec.ts`: added `AuthService` mock (`{ user: () =>
  null }`) to all 4 `TestBed.configureTestingModule` blocks —
  `PiGroupWorkspaceComponent` injects the real `AuthService`
  (`providedIn: 'root'`, itself injecting `HttpClient`/`API_BASE_URL`),
  which this spec never provided; matches the same pattern already used
  by `orders-list.page.spec.ts`. Updated the workflow-chips test for the
  new anchor-not-span "Заказ" chip (checks `href`/`aria-current` instead
  of `tagName === 'SPAN'`), and added a new test asserting the chips
  render inside `[data-test="group-chips"]` (the sticky chrome), not a
  body-level nav.
- `docs/pages/orders.page.md`: added a TZ-NX-ORDER-WS-CHROME-TOP note,
  corrected the now-stale `OrderWsWorkflowChipsComponent` reference.

## Gates

- `nx test kppdf-web` (full suite): `order-detail.page.spec.ts` PASS
  (including 2 chip tests). Same one pre-existing unrelated
  `app-shell.component.spec.ts` failure as every recent TZ this session
  (concurrent `WAVE-NX-HOME` chip-count regression).
- `nx test features` (full suite, since a features-lib file was deleted):
  52/52 suites, 457/457 PASS — unchanged count confirms nothing else
  depended on the deleted component.
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
