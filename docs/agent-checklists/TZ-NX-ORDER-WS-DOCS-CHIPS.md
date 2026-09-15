# TZ-NX-ORDER-WS-DOCS-CHIPS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-DOCS-CHIPS.md` (removed on closeout)
> **WAVE STOP reached — Order Workspace WAVE 6/6 DONE.**

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:35:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] `_active/` пуст перед claim
- [x] `home.page.ts` WORKFLOW_CHIPS pattern + `order-hub-tray.component.ts` documents deep-link + `PiStudioDocumentsService` (confirmed: `list()` takes zero params, no order/source filter) read

## Acceptance (из TZ)

- [x] Документы: deep-link «Шаблоны документов» works (ported verbatim from hub tray); honest empty (no fake list — confirmed no filtered list API exists)
- [x] Workflow chips (как `/home`): Главная/КП/Гант/Снабжение/Отгрузка + current Заказ, `orderId` on the ones that need it
- [x] setTools: no live icons wired (none identified beyond the header's existing plain links) — rails stay history-only, documented as a deliberate choice, not an oversight
- [x] `docs/pages/orders.page.md` final operator scenario note + WAVE COMPLETE marker; tracker will show 6/6
- [x] Specs: chips hrefs (2 new tests); no fake audit section (none built — verified by review, not a dedicated negative test)
- [x] `nx build kppdf-web` LAST PASS; **WAVE STOP**

## Gates (факт)

- `nx test kppdf-web` (573 total, was 571, +2 new) — **PASS**, `order-detail.page.spec.ts` all 26 tests, first attempt (no new facade dependencies this TZ — both new components are pure `input()`-only, no DI mocks needed). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` / `nx test features` — PASS.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing); zero new issues.
- `nx build kppdf-web` — **PASS**, exit 0 on first attempt.

## Executor report

- **Документы:** confirmed `PiStudioDocumentsService.list()` takes zero filter params before deciding the empty-state approach — this ruled out both "fetch all + filter client-side" (unbounded fetch for a tiny widget, not what "existing list API" means) and "invent a fake filtered call." Deep-link markup (`routerLink`/`queryParams` shape) copied verbatim from `order-hub-tray.component.ts`'s already-shipped «Документы» block, same `source`/`sourceId` param names.
- **Workflow chips:** copied `home.page.ts`'s `WORKFLOW_CHIPS` array shape and rendering logic (link vs. current-span branch, `needsOrderId` flag) into a new local constant with «Заказ» swapped in as the current item instead of «Главная» — same visual language across the app's two chip-nav usages.
- **setTools:** deliberately did **not** inject `ShellToolRailService`. Considered "open orders list" as a candidate live icon (per the TZ's own example) but it's already a real link in the header («← К списку»), so wiring a duplicate icon would be redundant chrome, not a genuinely new capability — chose the TZ's explicit fallback (history-only rails) over inventing something to fill the slot.
- **Final docs pass:** rewrote the `orders.page.md` section header and lead paragraph to describe the finished workspace (layout order top-to-bottom, hard "nots," a one-paragraph operator scenario) instead of the now-stale "target state" framing from the audit doc; added a wave-closing note that the entire 6-TZ build added exactly two new backend-facing wrapper methods (`cancel()`, `setLineReady()`) and zero new backend endpoints — everything else reused existing APIs/dialogs already shipped elsewhere in the app.
- Caught and fixed one self-introduced typo (`undispатched` — a stray Cyrillic а/т mid-English-word from a copy/paste) in the docs edit before committing.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:38:45Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
