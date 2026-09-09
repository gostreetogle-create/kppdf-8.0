# NX UX cross-cut — `pi-button-*` → `<app-pi-button>` sweep

**TZ:** `TZ-NX-UX-08b-PI-BUTTON-SWEEP` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 08b
**Fact:** `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` §Cross-cutting finding (#08)
**Fix reference:** `warehouses.page.ts` after `71b57377`
**Canon:** `<app-pi-button variant="default|secondary|outline|ghost|destructive">`
**Live class, not touched:** `.pi-outline-btn` / `.pi-outline-btn-destructive` (`global.css`) — a
real, defined chip/small-button class, unrelated to the fake `pi-button-*` family. Verified
untouched — see closeout.

## Inventory (Step 0)

`rg 'class="pi-button' frontend-nx/apps/kppdf-web/src/app/pages --include=*.ts` at start of this
TZ, before `/warehouses` (#08) fix:

| # | File | Occurrences |
|---|------|-------------|
| 1 | `contracts/contracts-list.page.ts` | 1 (anchor, routerLink) |
| 2 | `counterparties/counterparties-list.page.ts` | 3 |
| 3 | `counterparties/counterparty-form-dialog.component.ts` | 2 |
| 4 | `orders/order-create.page.ts` | 4 (incl. 1 anchor, routerLink) |
| 5 | `orders/order-detail.page.ts` | 1 |
| 6 | `orders/orders-list.page.ts` | 2 (incl. 1 anchor, routerLink) |
| 7 | `proposals/proposal-attach-orgs.dialog.ts` | 2 |
| 8 | `proposals/proposals-list.page.ts` | 3 |
| 9 | `shipping/shipping.page.ts` | 7 |
| 10 | `studio/studio-list.page.ts` | 5 (incl. 1 anchor, routerLink) |
| 11 | `studio/studio-templates-list.page.ts` | 1 |
| 12 | `supply-requests/supply-requests.page.ts` | 5 |
| 13 | `supply/supply.page.ts` | 7 |
| 14 | `warehouse/storage-adjust-dialog.component.ts` | 2 |
| 15 | `warehouse/storage-items.page.ts` | 2 |
| 16 | `warehouse/storage-put-on-stock-dialog.component.ts` | 2 |
| — | `warehouse/warehouses.page.ts` + `warehouse-form-dialog.component.ts` | already fixed in `71b57377` (#08), not re-touched here |

**Total: 16 files, 50 occurrences** (4 of them native `<a routerLink>`, the rest `<button>`).

**One spec-level reference to the dead class also found and fixed:**
`counterparties/counterparty-form-dialog.component.spec.ts:101` selected `.pi-button-outline`
directly — updated to a `data-test` selector (see closeout).

### Related finding, explicitly OUT of this TZ's scope

While reading these files, found a **second, distinct fake-class family**: `pi-icon-button`
(note: "icon" — different from the real `.pi-icon-btn`, confirmed real and defined in
`global.css`). `class="pi-icon-button` doesn't match this TZ's `class="pi-button` inventory
pattern, so it wasn't caught by the Step 0 `rg` and is **not** fixed here. Affects 3 files, all in
`studio/`: `studio-list.page.ts`, `studio-template-picker-dialog.component.ts`,
`studio-templates-list.page.ts`. Flagged for the PO — smaller blast radius than the
`pi-button-*` family, likely worth a quick follow-up TZ or folding into `/studio`'s own wave
(#15) rather than expanding this TZ's scope.

## Mapping applied (Step 1)

| Was | Now |
|-----|-----|
| `<button class="pi-button pi-button-primary" …>` | `<app-pi-button variant="default" …>` |
| `pi-button-secondary` | `variant="secondary"` |
| `pi-button-outline` | `variant="outline"` |
| `pi-button-ghost` | `variant="ghost"` |
| `<a class="pi-button pi-button-*" routerLink>` | **kept as native `<a>`** with the literal Tailwind classes `<app-pi-button>` would compute for that variant (see below) — **not** converted to `<app-pi-button [routerLink]>` |

### Why the 4 `<a routerLink>` cases stayed native `<a>`, not `<app-pi-button>`

Tried `<app-pi-button [routerLink]="…">` first (Angular's `RouterLink` directive selector
matches any element in this Angular version, not just `<a>`). It compiled and **`nx build`
passed** — but two existing tests caught a real regression:
`contracts-list.page.spec.ts` and `orders-list.page.spec.ts` both assert
`link.getAttribute('href')` and got `null`. Root cause: `ButtonComponent` only renders a real
`<a [attr.href]>` when **its own** `href` input is set; `RouterLink`'s href-setting host binding
targets the `<app-pi-button>` custom-element host, which `ButtonComponent`'s internal template
never reads. Net effect: no `href` attribute anywhere — silently losing hover-URL and
right-click/middle-click "open in new tab" for what were previously real links. This is a genuine
UX regression, not a test artifact, so all 4 cases (`contracts-list` "Карточка",
`orders-list` "Карточка", `order-create` "Отмена", `studio-list` "Шаблоны") were **reverted to
native `<a [routerLink]>`**, with the literal `BASE_CLASS` + `VARIANT_CLASS[x]` + `SIZE_CLASS.md`
strings copied verbatim from `button.component.ts` (visually identical output to
`<app-pi-button variant="x">`, zero behavior change, full anchor semantics preserved) and a short
comment explaining why the component isn't used there.

### A second, jsdom-only test issue (not a real bug) — also found and fixed

Two more categories of test failure surfaced, **both confirmed to be test-simulation artifacts,
not real browser bugs**:
- **`.disabled` property reads** (`proposal-attach-orgs.dialog.spec.ts` ×2,
  `counterparty-form-dialog.component.spec.ts` ×1) — `data-test` sits on the `<app-pi-button>`
  **host** element (a plain custom element with no `.disabled` DOM property), not on the real
  inner `<button>` `ButtonComponent` renders. Fixed by querying `'[data-test="x"] button'`
  (the real control) instead of `'[data-test="x"]'` alone.
- **Native form-submit-via-submit-button** (`supply.page.spec.ts` "creates a manual task") —
  `.click()` dispatched on the outer `<app-pi-button type="submit">` host doesn't trigger the
  browser's native "click on `<button type=submit>` inside a `<form>` submits it" behavior in
  jsdom, because the native `<button type="submit">` is a descendant, and the synthetic click
  never reaches it. **Confirmed this is jsdom-only, not a production bug:** several *already
  existing, unrelated* pages (`login.page.ts`, `enroll.page.ts`, `forms.page.ts`,
  `registries/dialogs/simple-registry-form-dialog.component.ts`) already used
  `<app-pi-button type="submit">` before this sweep touched anything — if this broke real
  submission, those pages would already be broken in production. A real user's click lands on the
  visually-rendered inner `<button>` directly, which correctly bubbles into the real `<form>`.
  Fixed the *test* by clicking the inner `'[data-test="x"] button'` instead of the wrapper.
  (Angular's own `(click)` **output** binding, e.g. `<app-pi-button (click)="fn()">`, is
  unaffected by any of this — confirmed via multiple still-passing tests, e.g.
  `proposal-attach-orgs.dialog.spec.ts`'s "closes with items…" test clicks the wrapper directly
  and correctly reaches `confirm()`. Only the *native form-submit-on-click* and *native
  `.disabled` DOM property* mechanisms are affected, because those specifically require the real
  `<button>`/`<input>` element, not any wrapping custom element.)

## Step 2 — confirmed not touched

- `.pi-outline-btn` / `.pi-outline-btn-destructive` — **0 diff** in `global.css`; still used
  unmodified in 5 page files (`order-hub-tray.component.ts`, `shipping.page.ts`,
  `supply-requests.page.ts` ×2 files, `supply.page.ts`) from prior waves' fixes.
- `/production` — not touched (SKIP, per every wave this far).
- No handler logic, no BE, no new features — every change is markup-level (`class="pi-button
  pi-button-x"` → `<app-pi-button variant="x">`, or → native `<a>` with literal classes for the 4
  routerLink cases).

## Step 3 — Specs

- `counterparty-form-dialog.component.spec.ts`: `.pi-button-outline` selector → `data-test`
  attribute added to the "Отмена" button (`data-test="counterparty-form-cancel"`) + selector
  updated; `.disabled` check query fixed to reach the inner `<button>`.
- `proposal-attach-orgs.dialog.spec.ts`: 2× `.disabled` check queries fixed to reach the inner
  `<button>`.
- `supply.page.spec.ts`: submit-button click query fixed to reach the inner `<button>`.
- Added `data-test` to 2 previously-untested "Отмена"/cancel buttons that had none
  (`attach-orgs-cancel` in `proposal-attach-orgs.dialog.ts`, `adjust-cancel`/`put-cancel` in the
  2 warehouse dialogs) — harmless, no existing test relied on their absence, done for future
  testability consistency with sibling dialogs.

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0; same 2 pre-existing unrelated warnings: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 687 passed / 7 pre-existing skipped / 694 total — identical to pre-sweep baseline, 0 regressions
rg 'class="pi-button' frontend-nx/apps/kppdf-web/src/app/pages --include=*.ts → 0 hits
```

Mid-sweep, this same `rg` briefly caught a genuine miss on first pass (`supply.page.ts`'s
«Обновить» refresh button, line 99) — fixed immediately, re-verified 0 hits before closing.

## Verdict

**Acceptance criteria met.** 0 remaining fake `pi-button-*` class strings across
`frontend-nx/apps/kppdf-web/src/app/pages/**`. 16 files converted (19 including 3 spec-file
fixes). `.pi-outline-btn` untouched. `nx build` + `nx test kppdf-web` both green, identical test
count to baseline. Two follow-ups explicitly flagged for the PO, not actioned here: the
`pi-icon-button` fake-class sibling family (3 studio files), and whether the 4 native-`<a>`
literal-class exceptions are worth a small shared helper if more routerLink+button cases turn up
in future waves (not worth inventing for just 4 call sites now).
