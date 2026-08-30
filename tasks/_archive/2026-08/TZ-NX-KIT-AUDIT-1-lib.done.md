# TZ-NX-KIT-AUDIT-1-lib — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: claude-nx-kit-lib

## Scope

`frontend-nx/libs/ui/paper-and-ink/**` only. Did not touch `apps/**`,
`libs/data-access/**`, `backend/**`, or legacy `frontend/**` — confirmed clear
of `TZ-NX-F3-data-access` (still `CLAIMED / IN PROGRESS`, live, at both
start and end of this task) by scope, not by chance.

## Root causes (5 distinct, not 1)

`nx test paper-and-ink` had 6 failing suites at claim time. Investigated each
rather than patch-by-symptom — turned out to be five unrelated pre-existing
bugs, not one shared timing issue as originally guessed in the audit:

1. **`pi-toast.service.spec.ts` / `pi-notification-center.service.ts`** —
   `PiNotificationCenterService` was a bare `push(): void {}` no-op stub
   (deliberately minimal per F2a's own TZ, to stay `type:ui` with no
   `data-access` import). But the byte-copied spec still asserted the real
   contract (`items()` signal, ring buffer, toast-mirrors-into-inbox). Checked
   the excluded legacy source
   (`frontend/src/app/shared/ui/notifications/pi-notification-center.service.ts`)
   — it's pure `@angular/core` signal state, zero domain/data-access coupling,
   safe to restore in full within `type:ui`. Restored the real implementation
   (signal-based FIFO ring, `items`/`panelOpen`/`unreadCount`) instead of
   gutting the test to match a stub that was never meant to be permanent.
2. **`badge.component.spec.ts`, `card.component.spec.ts`,
   `pi-showcase-card.component.spec.ts`** — `NG0304: 'i-lucide' is not a known
   element`. Each spec already tried `.overrideComponent(X, { remove: {...},
   set: { schemas: [CUSTOM_ELEMENTS_SCHEMA] } })` in one call — Angular's
   `MetadataOverrider` throws "Cannot set and add/remove DecoratorFactory at
   the same time" when `remove` and `set` are combined in a single override
   object for a standalone component. Split into two chained
   `.overrideComponent()` calls (one `remove`, one `set`) — same net effect,
   valid API usage.
3. **`pi-table-tree.component.spec.ts`** — a `CdkDragDrop` mock object was
   missing `dropPoint`/`event`, fields the installed `@angular/cdk` version
   requires that an older CDK didn't. Added both fields to the mock.
4. **`pi-alert-dialog.component.spec.ts`** — `Array.from(NodeList).find(...)`
   inferred as `unknown[]` under this project's TS config, so a
   `(el: Element) => boolean` predicate didn't type-check. Added an explicit
   `Element[]` cast.
5. **`pi-showcase-card.component.spec.ts`** (separate from #2) — four regexes
   used the `s` (dotAll) flag, which needs `target >= ES2018`; this project's
   tsconfig doesn't set that. None of the four patterns actually needed
   dotAll (they use `[^}]*`, which already matches newlines) — dropped the
   flag rather than touch the shared tsconfig for one spec file.
6. **`pi-toast.service.spec.ts`** (separate bug, same file as #1) — a
   `snapshot()` helper's return type was
   `ReturnType<PiToastService['subscribe']> extends () => void ? never :
   unknown[]`. Since `subscribe`'s return type IS `() => void`, this
   conditional always resolved to `never`, so returning `captured: unknown[]`
   failed to typecheck. Replaced with a plain `unknown[]` return type — the
   conditional never did anything useful.

## Verification

```text
nx test paper-and-ink                                     → PASS (31/31 suites, 332/332 tests)
nx run paper-and-ink:lint                                 → PASS (0 errors, 35 warnings — down 1 from 36, unused-var removed)
tsc -p libs/ui/paper-and-ink/tsconfig.lib.json --noEmit    → PASS (0 errors)
```

## Files changed

- `lib/notifications/pi-notification-center.service.ts` (real implementation, not a stub)
- `lib/badge/badge.component.spec.ts`
- `lib/card/card.component.spec.ts`
- `lib/card/pi-showcase-card.component.spec.ts`
- `lib/dialog/pi-alert-dialog.component.spec.ts`
- `lib/pi-table-tree.component.spec.ts`
- `lib/toast/pi-toast.service.spec.ts`

No API/behavior change to any non-test production file except the
notification-center service, which went from a no-op stub to its documented
real behavior (additive — nothing depended on the no-op).

## Executor report

`nx test paper-and-ink` now genuinely green — this was previously undetected
because F2a's own closeout checklist verified `tsc`/`build`/`lint` but never
ran `nx test` to green (see prior audit note in
`TZ-NX-KIT-AUDIT-table-display.done.md`). No conflict with `TZ-NX-F3-data-access`
— re-verified via mtime probe before and after that it stayed untouched by
anyone outside this task.

## Next

Phase B (`TZ-NX-KIT-AUDIT-2-kit-demos`, spec drafted at
`tasks/TZ-NX-KIT-AUDIT-2-kit-demos.md`) is blocked on `TZ-NX-F3-data-access`
archiving — it touches `frontend-nx/apps/kppdf-web/**`, currently live-claimed.
