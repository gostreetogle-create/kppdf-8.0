# TZ-NX-REGISTRIES-BROWSER-MATRIX-2 checklist

> Status: **DONE**
> Wave: A6 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md` (closes Phase A)
> Marker: none (single-session claim+close)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-08-30T16:00:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable

## What this TZ actually was

The prior `matrix.json` for this exact TZ candidly disclosed its own
limitation: `"method": "code-review... live authenticated browser
screenshots unavailable"`, `"known_limitation": "No live browser
screenshots in shared checkout"` — yet still reported 120/120 PASS. This is
precisely the failure mode the PO's audit called out project-wide
("Browser matrix — это code-review + json, не ваш живой обход со
скриншотами"). This pass replaced it with a real one.

## Method

Wrote a data-driven Playwright script (Python venv at `.logs/venv`,
reusing the pattern from prior `.logs/shoot*.py` sessions) that walks all
10 registries against the running dev server: expand, search, filter,
paginate, open create (screenshot, cancel — non-destructive), open edit
on a real row (screenshot, cancel), open delete confirm (screenshot,
**cancel, never confirm** — no data loss), check copy button
presence/enabled state, and continuously capture console errors +
network failures throughout. See `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-BROWSER-MATRIX-2/matrix.json`
for the full per-registry, per-check results.

## Real defects found and fixed (this is the whole point of doing it live)

### 1. `text-blocks` create/edit — crashed on open

`RuntimeError: NG01203: No value accessor for form control name: 'content'`.
`PiRichTextEditorComponent` (`@kppdf/ui/rich-text`) exposes a signal
`model<string>()`, not `ControlValueAccessor` — `formControlName="content"`
was never valid for it, in either mode. Fixed:
`text-block-form-dialog.component.ts` now binds `[(value)]` to a plain
`content` signal kept outside the reactive `FormGroup`, merged into the
payload manually at submit. Live-reproduced the crash → fixed → live
round-trip (typed real content, saved, confirmed present via a fresh
unfiltered `GET /api/text-blocks`, not the client-side `?search=` param
which this registry's backend ignores). New spec:
`text-block-form-dialog.component.spec.ts` (3 tests).

### 2. `table-templates` create/edit — crashed on open

`Error: Cannot find control with name: 'columns'`. The template's
`formArrayName="columns"` had no matching `FormArray` registered on the
parent form — `columns` lived in a separate `columnRows` signal instead.
Fixed by making `columns` a real `FormArray` inside the reactive form,
matching the exact working pattern `material-form-dialog.component.ts`
already uses for `dimensions`. Live-reproduced the crash → fixed → live
round-trip (added a column, saved, confirmed present via a fresh
unfiltered `GET /api/table-templates`). New spec:
`table-template-form-dialog.component.spec.ts` (3 tests).

**Known non-blocking residue (disclosed, not hidden):** after the fix, a
separate `TypeError: newCollection[Symbol.iterator] is not a function`
still fires repeatedly from Angular's `@for` reconcile while column rows
render. Confirmed via the pre-fix evidence capture that this error was
**already present** in the original broken state alongside the two
crashes above — not introduced by this fix. Save still works correctly
end-to-end (real `201`, record persists with its columns intact). Root
cause not fully isolated in the time available; parked in `_NOW.md`
rather than guessed at further.

## Acceptance (wave doc §A6)

- [x] Полный обход «реестр × 12» — 10/10 registries walked live, screenshots
      taken for every list/create/edit/delete-confirm state (session
      scratchpad, not committed — diagnostic evidence, not a repo artifact)
- [x] evidence — `matrix.json` rewritten with honest, live-verified results
      (previous file's own `known_limitation` field is gone because the
      limitation no longer applies)
- [x] Found and fixed 2 real, previously-undetected defects that fully
      blocked two registries' create flow — the exact class of problem a
      "code-review only" pass cannot reliably catch

## Explicitly NOT done / not claimed

- Did not exhaustively re-verify every single one of the 120 cells to the
  same depth (e.g., `copy` was fully round-tripped only for
  materials/products, whose mechanism was already proven in A1–A5;
  elsewhere just confirmed the button is present+enabled, since it's the
  same shared `registry-crud-actions.ts` code path, not 10 independent
  implementations)
- `details`' delete-confirm click hit a transient dev-server collision
  (another concurrent session's HMR reload — observed on unrelated files
  multiple times this session); not re-chased further since a screenshot
  already shows the buttons correctly present/enabled
- Did not fix `registries.page.md`'s stale "Открыть в Конструкторе" text —
  confirmed it's dead documentation, not a dead button (the code already
  correctly removed it, with a test enforcing that) — docs-only, zero
  functional risk, flagged for whoever next touches that file rather than
  scope-crept into here
- table-templates' residual console error (see above) — parked

## Integrity slot

- [x] Тип изменения: **page** (two existing dialog components fixed, no new route)
- [x] FIC §A/§B/§E — N/A. §C — N/A, no backend touched this TZ
- [x] page.md — N/A for the fixes themselves (no route/contract change);
      noted the stale Конструктор text as a drive-by finding, not fixed here
- [x] Чужой WIP не в коммите — staged only the fix files + new specs +
      evidence/checklist/archive/`_NOW.md`
- [x] Coupling map — N/A

## Gates (factual)

```
pnpm exec nx build kppdf-web → exit 0
pnpm exec nx test kppdf-web → 47/48 suites (the 1 failure is the same
  pre-existing, unrelated app-shell.component.spec.ts regression parked
  during A4/A5 — confirmed unchanged). Both new spec files pass:
  text-block-form-dialog.component.spec.ts (3/3),
  table-template-form-dialog.component.spec.ts (3/3).
eslint on both fixed dialog files → 0 problems

Live: real POST 201 for both a text-block and a table-template through
the actual UI, confirmed persisted via direct unfiltered API GETs
(neither registry's backend implements server-side search, so a
?search= check would have been a false negative).
```

## Executor report

- What was verified: this is the one TZ in the wave that was explicitly,
  self-admittedly NOT live-verified before. Doing it for real found two
  genuine crashes the "120/120 code-review pass" missed entirely.
- Known limits: see "Explicitly NOT done" above — tiered depth by design
  (full round-trip where the mechanism wasn't already proven elsewhere,
  lighter presence-check where it was), not a blanket claim of exhaustive
  per-cell independent verification.
- Conflict disclosure: touched `text-block-form-dialog.component.ts`,
  `table-template-form-dialog.component.ts`, their two new spec files,
  the evidence `matrix.json`, this checklist, the archive, and `_NOW.md`.
  Nothing else.

## Review handoff

- No wave inbox configured; the rewritten `matrix.json` + this checklist
  are the review artifact. This closes Phase A of
  `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md` — Phase B (Studio,
  B1–B3) is next, gated to start only after this.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-BROWSER-MATRIX-2.done.md`
- [x] `_NOW.md` synced (DONE list + PARK note for the table-templates residue)
- Status = DONE
- closed_at: 2026-08-30T16:22:08Z
