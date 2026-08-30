# TZ-NX-CONSTRUCTOR-SHELL-REVIEW — DONE

ARCHIVE_MARKER
outcome: PASS (with one BLOCKER to fix before production-ready)
closed_at: 2026-08-29
closed_by: claude
mode: analysis-only — no product code changed

## Scope

Independent review of the already-archived `TZ-NX-CONSTRUCTOR-SHELL`
(`tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL.done.md`, `outcome: PASS`, `closed_by: cursor`).
Checked: acceptance criteria vs live code, shell canon compliance, visual/UX gaps, dead links,
accessibility, Paper & Ink token usage, and whether a stale active claim remained.

Files read in full: `docs/pages/constructor.page.md`; all 8 files under
`frontend-nx/apps/kppdf-web/src/app/pages/constructor/**`; `app.routes.ts` (nx + legacy);
`layout/nav-categories.ts`; `layout/app-shell.component.ts` +
`app-shell-constructor-nav.spec.ts`; `tasks/TZ-NX-SHELL-CANON.md`; the Paper & Ink `card`,
`button`, `status-banner`, `pi-page-chrome` components the constructor pages consume;
`docs/pages/PAGE-TZ-INDEX.md`.

---

## PASS

1. **Route matrix matches spec.** `/constructor` → `ConstructorPage`, `/constructor/create/:kind`
   → `ConstructorCreatePlaceholderPage` (`constructor.routes.ts:8-18`), nested under `AppShellComponent`
   with `canMatch: [authGuard]` only, no `capabilityRouteGuard`
   (`app.routes.ts:47-52` — comment explicitly matches the `/registries` pattern). Matches
   `constructor.page.md:9-22` and `TZ-NX-CONSTRUCTOR-SHELL.done.md` route table exactly.
2. **Four create kinds, no Complex, verified in three independent places**:
   `constructor.types.ts:6` (`ConstructorCreateKind` union), `constructor.page.spec.ts:31,35`
   (asserts exact kind order + no "комплекс" in labels), `constructor-create-placeholder.page.spec.ts:68-75`
   (asserts label count = 4, no "комплекс", `kind==='complex'` is `false`). Domain copy
   ("Деталь — Material с `materialKind=part`", "Комплекс — derived Product, не create kind") is
   consistent across `constructor.types.ts:23-26,34-38`, `constructor.page.ts:29-34`,
   `constructor-create-placeholder.page.ts:51-61`, and `constructor.page.md:28-37` — no drift.
3. **Header-nav integration is canon-compliant.** Per `tasks/TZ-NX-SHELL-CANON.md:57-69`
   ("Navigate to an application section → Header primary navigation"), the task added a
   `NAV_CATEGORIES` entry (`nav-categories.ts:218-234`) and changed nothing under
   `LEFT_TOOL_RAIL_ITEMS`/`RIGHT_TOOL_RAIL_ITEMS`, no new sidebar, no rail change — confirmed by
   reading `app-shell.component.ts` in full (rails unchanged, same generic
   `@for (cat of navCategories())` chip loop renders the new category exactly like every
   pre-existing one). Canon rule "Do not create a second sidebar or a new global navigation
   column" — respected.
4. **Dead-link filter correctly wired.** `nav-categories.ts:228-232` sets `skipPageAcl: true`
   (no backend page-ACL seed for `constructor`, same as `registries`); `filterNavCategories`
   (`nav-categories.ts:269-295`) drops the category if its route doesn't exist in
   `router.config` — and `app.routes.ts:47-52` uses static `children: CONSTRUCTOR_ROUTES` (not
   `loadChildren`) specifically so `collectPageRoutePaths` can see it (comment `:48-49` mirrors
   the identical `registries` rationale at `:39-43`). Verified: `docs/pages/PAGE-TZ-INDEX.md:125`
   has the entry; legacy `frontend/src/app/app.routes.ts` has no `/constructor` path (only
   unrelated `doc-constructor/*` paths) — no collision.
5. **Paper & Ink token compliance.** No raw hex colors or arbitrary non-token Tailwind values in
   either page — `text-ink`, `text-muted-foreground`, `bg-paper-2/40`, `hairline`, `rounded-sm`
   throughout (`constructor.page.ts:24,30,53`, `constructor-create-placeholder.page.ts:43,46,50`).
   `app-pi-card`/`app-pi-status-banner`/`app-pi-button`/`app-pi-page-chrome` inputs used
   (`title`, `description`, `interactive`, `arrow`, `crumbs`, `tone`, `message`, `variant`, `size`)
   all match their real component contracts (verified against
   `libs/ui/paper-and-ink/src/lib/card/card.component.ts`,
   `.../button/button.component.ts`, `.../status-banner/status-banner.component.ts`,
   `.../src/page/pi-page-chrome.component.ts`) — no phantom inputs.
6. **No stale active claim.** `tasks/_active/` had no `TZ-NX-CONSTRUCTOR-SHELL*` file at review
   start; `docs/agent-checklists/TZ-NX-CONSTRUCTOR-SHELL.md:1-11` already shows `Status: DONE`
   with a clean Claim slot and archive pointer. Nothing to clean up here.
7. **Gates as recorded** (`TZ-NX-CONSTRUCTOR-SHELL.done.md:46-50`) are plausible and not
   contradicted by anything found in this review: `nx build`/`test`/`lint`/
   `architecture:check:nx`/`ui:tokens:nx` all PASS. The BLOCKER below is a real bug that these
   particular gates would **not** catch (see below) — it is not evidence the gate results were
   misreported.

---

## BLOCKER

### B1 — "← К выбору типа" back button does not navigate (dead control)

**Where:** `frontend-nx/apps/kppdf-web/src/app/pages/constructor/constructor-create-placeholder.page.ts:65-68`

```html
<a routerLink="/constructor" class="inline-block">
  <app-pi-button variant="outline" size="sm" data-test="constructor-placeholder-back">
    ← К выбору типа
  </app-pi-button>
</a>
```

**Root cause:** `ButtonComponent.onClick()`
(`frontend-nx/libs/ui/paper-and-ink/src/lib/button/button.component.ts:112-119`) unconditionally
calls `event.stopPropagation()` before emitting its own `click` output:

```ts
onClick(event: MouseEvent): void {
  if (this.disabled()) return;
  // ... without stopPropagation the click can bubble to an outer host listener
  // and fire the parent (click) twice (e.g. «Добавить размер» → length+width in one gesture).
  event.stopPropagation();
  this.click.emit(event);
}
```

This is deliberate (TZ-MATERIALS-305, fixing a double-fire bug for a different consumer), and the
button's own spec (`button.component.spec.ts:118-124`) explicitly asserts an outer host listener
does **not** fire on click — proving, by the component's own test intent, that a click on
`app-pi-button` never bubbles past it. Angular's `RouterLink` directive listens for the native
`click` event on the element it is bound to — here, the wrapping `<a routerLink="/constructor">`.
Because the click originates on the nested `<button>` and is stopped there, it never reaches the
`<a>`'s own click listener, so **`RouterLink` never fires and the page does not navigate** when a
user clicks anywhere on the visible button (which is the entire clickable surface — there is no
other way to activate it).

**Why the existing tests missed it:** `constructor-create-placeholder.page.spec.ts:77-82` only
asserts the anchor's `href` attribute:
```ts
const back = fixture.nativeElement.querySelector('[data-test="constructor-placeholder-back"]');
expect(back.closest('a')?.getAttribute('href')).toBe('/constructor');
```
It never dispatches a `click` and checks the router actually navigated, so this passes green
while the control is functionally dead. `nx build`/`lint`/`architecture:check` cannot catch a
DOM-event-bubbling bug either — this needs either a real click-and-assert-navigation unit test or
a manual browser click.

**Note this is markup-invalid too:** `<button>` is interactive content and the HTML5 content
model forbids interactive content inside `<a>` — `<a><button>…</button></a>` is invalid, on top
of being functionally broken here. It is the **only** place in
`frontend-nx/apps/kppdf-web/src/app/pages/**` that wraps `app-pi-button` in a `routerLink`
anchor instead of using the button's own `href` input (grepped: every other `app-pi-button`
consumer either binds `[href]` directly or uses `(click)` handlers, never an outer `<a>`).

**Fix options (pick one in the next TZ):**
- Simplest: drop the wrapping `<a>` and bind `(click)="router.navigateByUrl('/constructor')"` (or
  inject `Router`) directly on `app-pi-button`.
- Systemic: give `ButtonComponent` a `routerLink` input (delegate to Angular's `RouterLink`
  directive internally when set) so consumers never need to wrap it in an anchor — this removes
  the invalid-markup trap for every future consumer, not just this one.

**Severity:** BLOCKER. This is the only way, per the page's own copy, for a user to leave the
"unfinished section" placeholder without using browser Back or the header chip — on a page whose
entire purpose in this wave *is* being an honest dead-end placeholder, its one explicit escape
hatch is silently non-functional.

---

## P1 (should fix before next wave builds on this page)

### P1-1 — `aria-labelledby` can reference a non-existent id (unknown-kind branch)

**Where:** `constructor-create-placeholder.page.ts:26` vs `:36,45`

```html
<section ... aria-labelledby="constructor-placeholder-heading" data-test="constructor-create-placeholder">
  ...
  @if (meta(); as kindMeta) {
    ...
    <h2 id="constructor-placeholder-heading" ...>{{ kindMeta.label }}</h2>
    ...
  } @else {
    <div ... role="alert" data-test="constructor-unknown-kind">...</div>
  }
</section>
```

The `<section>`'s `aria-labelledby` is a static attribute always pointing at
`constructor-placeholder-heading`, but that `<h2>` only renders inside the `@if (meta(); ...)`
branch. For an unknown `:kind` (e.g. `/constructor/create/complex` — the exact case
`constructor-create-placeholder.page.spec.ts:62-66` tests), the `@else` branch renders instead,
the `<h2>` never exists in the DOM, and the section's accessible name silently resolves to
nothing for assistive tech. `constructor-a11y.spec.ts` never exercises this page at all (it only
covers `ConstructorPage`), so this regression has no test coverage in either direction.

**Fix:** give the alert branch its own heading id (or move to a non-conditional heading / an
`aria-label` on the section that doesn't depend on the branch).

### P1-2 — No a11y-spec coverage for `ConstructorCreatePlaceholderPage` at all

`constructor-a11y.spec.ts` (the file `constructor.page.md:50` cites as a11y coverage) tests only
`ConstructorPage`. The placeholder page — which has the more complex conditional markup (P1-1
above) and the broken back-button (B1) — has zero a11y-focused assertions. Recommend a
`constructor-create-placeholder-a11y.spec.ts` mirroring the existing one, plus a real
click-and-navigate test for the back button.

## P2 (polish, non-blocking)

### P2-1 — Domain-note box background token stacks an opacity modifier on a semantic color

`constructor.page.ts:24`: `class="... bg-paper-2/40 ..."`. Every other constructor surface uses
solid Paper & Ink tokens (`bg-paper`, `hairline`) without opacity modifiers. Not wrong, but it's
the only spot in this delivery mixing a fractional-opacity utility with a semantic background
token — worth normalizing to a plain token (or a dedicated "note" token if the design system has
one) so future editorial boxes don't each invent their own opacity value.

### P2-2 — Card `arrow` deliberately suppressed on interactive CTAs

`constructor.page.ts:58-63`: `app-pi-card [interactive]="true" [arrow]="false"`. `CardComponent`'s
`arrow` input defaults to `true` specifically to signal "this card is a link" — the 4 CTA cards
here are exactly that (wrapped in `<a routerLink>`, `role="listitem"`), so suppressing the arrow
removes a small, already-built affordance without an obvious reason on the page or in comments/
tests. Not a defect, but worth a one-line comment on *why*, or re-enabling it, next time this page
is touched.

### P2-3 — Two different card layout scales for the two constructor screens

`ConstructorPage` uses `max-w-3xl` (workspace + 4-card grid), `ConstructorCreatePlaceholderPage`
uses `max-w-xl` (single-column placeholder). Both are internally consistent with their own content
density, so this is not a bug, but it's worth confirming intentionally in `constructor.page.md`
(currently silent on layout width) so a future contributor doesn't "fix" one to match the other.

---

## What to add to the next Cursor prompt

1. **Fix B1 first, as its own tiny TZ** (or as a fast-follow patch to
   `TZ-NX-CONSTRUCTOR-SHELL`): remove the `<a><app-pi-button></app-pi-button></a>` nesting in
   `constructor-create-placeholder.page.ts:65-68`; add a unit test that dispatches a real
   `click` on the button and asserts `Router.url` (or `Location.path()`) actually changed to
   `/constructor` — not just that an `href` attribute string is correct.
2. **Decide the systemic fix for `ButtonComponent`**: should it grow a `routerLink` input so no
   future page repeats this exact anchor-wraps-button trap? This is a `@kppdf/ui` library
   decision, not a one-page patch — flag it explicitly so it doesn't get silently re-broken
   elsewhere later.
3. **Fix P1-1**: give the unknown-kind `@else` branch its own accessible name, independent of the
   `@if` branch's heading id.
4. **Add `constructor-create-placeholder-a11y.spec.ts`** (P1-2) covering both the known-kind and
   unknown-kind branches, plus the click-and-navigate regression test from item 1.
5. Optional cleanup (P2s) — low priority, bundle only if another TZ is already touching these two
   files.

## Checklist

See `docs/agent-checklists/TZ-NX-CONSTRUCTOR-SHELL-REVIEW.md` — Integrity slot filled, status DONE.
