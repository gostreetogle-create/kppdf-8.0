# TZ-NX-ORDER-WS-META-INLINE — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- **Backend fix (prerequisite):** `OrderService.update()` validated
  `organizationId` via the DTO (inherited from `CreateOrderDto`) but never
  applied it to the document — `PATCH { organizationId }` returned 200 and
  silently did nothing. Fixed with the same cast style `create()` already
  uses. 2 new backend tests (`order.service.spec.ts`, `organizationId
  PATCH` describe block).
- **`PiSitesService.create()`** added (+ `CreateSitePayload` type,
  data-access test) — `POST /sites` already existed server-side
  (`SiteController.create`), had no frontend caller before this TZ.
- **`OrderWorkspaceFacade`**: `organizations`/`counterparties`/`sites`
  signals (orgs+counterparties loaded once, sites reloaded per
  counterparty change) + `organizationId()`/`counterpartyId()`/`siteId()`
  getters (unwrap the populated-or-plain union) + `setOrganization()`/
  `setCounterparty()`/`setSite()` PATCH methods +
  `createOrganization()`/`createCounterparty()`/`createSite()` (POST new
  entity, then assign it to the order). `setCounterparty()` resolves the
  new counterparty's default site via `PiSitesService.ensureDefault`
  FIRST and PATCHes `counterpartyId`+`siteId` **together** — the
  backend's `sites.assertBelongsTo` check runs on every update touching
  either field and would reject a stale site from the old counterparty
  if sent as two sequential PATCHes. Removed the now-dead
  `organizationName` signal/`loadOrganizationName()`/`counterpartyName()`/
  `siteName()` — the select-driven UI replaces their entire purpose, zero
  consumers left.
- **`OrderWsHeaderComponent`**: Заказчик/Объект/Наша фирма are now
  `<select>` + a «+» `app-pi-button` each (was static text /
  a plain link / «—»), bound to the facade's new lists/ids, emitting
  `organizationIdChange`/`counterpartyIdChange`/`siteIdChange` (string)
  and `createOrganization`/`createCounterparty`/`createSite` (void). Still
  fully dumb — no dialog access (NX boundary: this component lives in
  `libs/features`, the quick-create dialogs live in `apps/kppdf-web`).
- **Two new quick-create dialogs** (`apps/kppdf-web/src/app/pages/orders/`):
  `OrganizationFormDialogComponent` (name+ИНН, always `isOurCompany:
  true`) and `SiteFormDialogComponent` (name+address, `counterpartyId`
  fixed from dialog data — not user-selectable), both mirroring
  `CounterpartyFormDialogComponent`'s existing thin create-payload-return
  pattern exactly. The Заказчик «+» reuses `CounterpartyFormDialogComponent`
  directly (already existed, already clean).
- **`OrderDetailPage`**: three `open​Create*()` methods open the
  app-level dialogs and hand the resulting payload to the facade's
  `create*()` methods via `onDialogCloseOnce` (same pattern used
  throughout this page already).
- **Caught by `nx build` (not `nx test`):** two OR-condition TS narrowing
  bugs (`if (!result.ok || !result.data)` — the `!result.data` disjunct
  defeats narrowing to the `{ok:false, error}` branch even though
  `SilentResult<T>`'s `data` is never optional on the `ok:true` variant)
  in the three `create*()` methods and in `setCounterparty()`. `ts-jest`
  didn't flag these; the production `tsc` build did — fixed by checking
  only `!result.ok`, matching every other guard already in this facade.

## Gates

- `nx test data-access` (full suite): 25/25 suites, 137/137 PASS (+1 new,
  `pi-sites.service.spec.ts` `create()`).
- `nx test features` (full suite): 52/52 suites, 457/457 PASS.
- `nx test kppdf-web` (full suite): `order-detail.page.spec.ts` +2 new
  dialog specs all PASS. Same one pre-existing unrelated
  `app-shell.component.spec.ts` failure as every recent TZ this session.
  One new test (`creates a new заказчик via «+»...`) needed a second
  `await settle()` — its underlying chain is 3 sequential
  `firstValueFrom()`s (create → ensureDefault → update) behind a
  dialog-close `effect()`; one `whenStable()` only drains the first hop.
  Documented inline in the test.
- `nx build kppdf-web` (forced): PASS, ran last — after fixing the two
  narrowing bugs above.
- Backend: `tsc -p tsconfig.build.json --noEmit` PASS; `jest
  --testPathPattern=order|site`: 5/5 suites, 138/138 PASS (+2 new).
- `pnpm architecture:check`: PASS.
- Direct `eslint` on every touched/new file: 0 new errors (one
  pre-existing baseline `@nx/enforce-module-boundaries` hit on
  `order-detail.page.ts`, documented in `docs/audits/2026-09-15-order-workspace-verify.md`,
  unrelated to this TZ's content).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build, both frontend + backend)
  - tests: PASS
  - lint: BASELINE (one pre-existing issue only, zero new)
  - checklist: N/A (L-size TZ, no dedicated checklist file requested)
  - progress.md: N/A
  - status synchronization: N/A (updated once at end of chain)
