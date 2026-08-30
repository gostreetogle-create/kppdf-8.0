# TZ-DOC-STUDIO-BUILD-FIX — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: claude

## Origin

PO ran `node start.mjs`; frontend never became ready (polled 148s+ against
the 180s timeout). The `frontend` child process had already died (pid dead,
port 4200 free) with no error visible in the pasted log tail. Reproduced via
`ng build --configuration development`: 3 real compile errors in
`doc-constructor/studio/*`, landing with the recent Doc Studio closeout
(commit `e87da7bd`) — `ng serve` fails the same way, so the dev server never
opens a port, and `start.mjs`'s `waitFor` just polls a dead port until
timeout with no error surfaced (the child exits before producing output the
proxy-race filter would explain).

## Root causes and fixes

1. `studio-panel-layers.component.ts:71` — `[value]="String(page)"` called
   the global `String()` from inside an Angular template (templates can only
   reach component-instance members). Added `protected pageValue(page:
   number): string { return String(page); }` and used `[value]="pageValue(page)"`.
2. `studio-panel-layers.component.ts:99` — `{{ typeLabel(block) }}` —
   `typeLabel` is `input.required<(block: TemplateBlock) => string>()`, i.e.
   a **signal holding a function**, not a plain method — calling it directly
   with an argument passes 1 arg to the signal getter (which takes 0).
   Fixed to `{{ typeLabel()(block) }}` — unwrap the signal, then call the
   function it holds.
3. `studio-ribbon.component.ts:21` — `(valueChange)="viewModeChange.emit($event
   as StudioViewMode)"` — the `as` TypeScript cast operator is not valid
   Angular template-expression syntax (only valid inside `*ngIf...as` /
   `@if(...); as` structural bindings). Moved the cast into a new method:
   `protected onValueChange(value: string): void { this.viewModeChange.emit(value
   as StudioViewMode); }`, template now calls `(valueChange)="onValueChange($event)"`.

## Verification

```text
ng build --configuration development                → SUCCESS (was: 2 TS errors + 2 NG5002 parser errors)
tsc -p tsconfig.app.json --noEmit                    → 0 errors
eslint (scoped: the 2 edited files)                  → 0 errors, 0 warnings
```

Remaining build output shows only 3 pre-existing NG8102 warnings
(redundant `??` in `studio-panel-properties.component.ts` /
`studio-panel-table.component.ts`) — harmless, not touched, not blocking.

## Files changed

- `frontend/src/app/pages/doc-constructor/studio/studio-panel-layers.component.ts`
- `frontend/src/app/pages/doc-constructor/studio/studio-ribbon.component.ts`

## Executor report

PO can re-run `node start.mjs` — frontend should now compile and become
ready normally.
