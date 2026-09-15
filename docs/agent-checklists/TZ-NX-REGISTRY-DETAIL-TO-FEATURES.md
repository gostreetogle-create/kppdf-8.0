# TZ-NX-REGISTRY-DETAIL-TO-FEATURES checklist (B9, retry)

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T12:45:44Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Source-of-truth disclosure

The TZ spec file itself was gone from `tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/`
by claim time (a concurrent autonomous agent — "Codebuff", `agent_id: claude`
in its own commits — has been consuming/cleaning files from this same pack
while executing an overlapping copy of the B9 plan; see the PO-facing
summary for the fuller picture). Reconstructed the marker from the spec
text captured earlier in-session before it vanished (same pattern as
`TZ-NX-SHIPPING-PAGE-FACADE`'s precedent).

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — only Codebuff's own
      `TZ-NX-COUNTERPARTY-HUB-TO-FEATURES.md` present at claim time, zero
      overlap with this TZ's conflict keys
- [x] TZ / канон / deps прочитаны (reconstructed spec text, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-DETAIL-TO-FEATURES.md` на месте

## Investigation — retry after TZ1 unblocked it; one deliberate scope split

`registry-detail-panel.component.ts`/`.facade.ts`'s only remaining
app-local dependencies (after TZ1 moved `registry.types.ts`/
`registry-query-state.ts` to `@kppdf/features/registries-platform`) were 3
sibling UI files:
- `registry-toolbar-pagination.component.ts` (+spec) — exclusive to the panel
- `registry-row-action-button.component.ts` (+spec) — exclusive to the panel
- `registry-action-icons.ts` (+spec) — pure, exclusive to row-action-button
- `registry-create-button.component.ts` — used by the panel, but **already**
  duplicated byte-for-byte in `libs/features/src/lib/registry-forms/ui/`
  (confirmed via `diff`, zero drift) — reused directly, no new duplicate

All four are genuinely self-contained or already covered. Moved
component+facade+the first 3 siblings into `@kppdf/features/registry-forms`
(conflict-key-specified target).

**`registry-detail-panel.component.spec.ts` deliberately stayed in the
app** — a scope split from the usual "spec always moves with its
component" convention, disclosed here. Its `setup()` helper (backing ~18
of its ~20 tests) builds fixtures via the real `buildRegistriesCatalogDefault()`
(`apps/.../registries/data/registries.catalog.ts`) — the ~40-registry
catalog assembly wired to live service tokens — not the synthetic
`defineRegistry()` builder its own widget-only tests use. That catalog file
is the same class of large, actively-evolving, ~40-consumer app foundation
that made `registry.types.ts` a hard blocker before TZ1 — duplicating it or
dragging it into this "S" TZ was out of scope. The component+facade
themselves carry zero app-local imports; only the spec's *own*
fixture-building needed the app's real catalog, so only the spec's
`import` of `RegistryDetailPanelComponent` was repointed to the new barrel
— everything else in the spec is untouched, still runs from
`apps/kppdf-web/src/app/pages/registries/`, still green.

## What changed

Moved via `git mv` (history preserved):
- `registry-detail-panel.facade.ts` → `registry-forms/registry-detail-panel.facade.ts` (lib root, matches the facade-at-root convention)
- `registry-detail-panel.component.ts` → `registry-forms/ui/registry-detail-panel.component.ts`
- `registry-toolbar-pagination.component.ts` (+spec) → `registry-forms/ui/`
- `registry-row-action-button.component.ts` (+spec) → `registry-forms/ui/`
- `registry-action-icons.ts` (+spec) → `registry-forms/ui/`

Deleted the now-orphaned app-local `registry-create-button.component.ts`
(zero remaining consumers once the panel moved; the identical copy already
in `registry-forms/ui/` is what the panel now imports).

Fixed the one relative import whose depth changed (`registry-detail-panel.component.ts`'s
`./registry-detail-panel.facade` → `../registry-detail-panel.facade`, since
the facade sits at lib root and the component in `ui/`). Every other
sibling import needed no change (all still same-directory or already
pointing at `@kppdf/features/registries-platform` from TZ1). Updated
`registry-forms/ui/index.ts` (+3 new exports) and `registry-forms/index.ts`
(+facade export, extended doc comment). Fixed the 4 app-side consumers of
the old relative path (`registries-page.ts`, and 3 specs:
`registry-detail-panel.component.spec.ts`, `registry-action-matrix.spec.ts`,
`registries-a11y.spec.ts`) to import `RegistryDetailPanelComponent` from
`@kppdf/features/registry-forms` — the intended direction (apps importing
from features).

Panel: 87.56 kB `registries-page` lazy chunk (down from 110.89 kB — the
moved code now shares boundaries elsewhere; no behavior change, initial
bundle unchanged).

## Acceptance

- [x] registry-detail* specs green — `registry-detail-panel.component.spec.ts`, `registries-a11y.spec.ts`, `registries-page.spec.ts`, `registry-action-matrix.spec.ts` all confirmed PASS individually; every other registries-scoped suite in `kppdf-web` unaffected
- [x] nx build last 0

## Pre-existing failure disclosed (not mine, not fixed)

Same `app-shell.component.spec.ts` quicknav-count failures as TZ1
(pre-existing, belongs to a concurrent agent's in-progress nav-chip work —
not touched, outside this TZ's conflict keys).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no registries behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route/behavior change)
- [x] page.md / PAGE-TZ-INDEX — N/A (import path only)
- [x] DOMAIN-MAP — N/A (import path changed, no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged: registry-forms/** changes, the 4 fixed app-side import sites, deleted orphan + this checklist/tracker/task marker — nothing from any concurrent agent's claim)
- [x] Coupling map — N/A (registry query/action semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0, bundle 504.00 kB (post-TZ1 baseline)
- [x] Нет другого `tasks/_active/*` с `apps/.../pages/registries/**` — verified before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle 504.00 kB unchanged; `registries-page` lazy chunk 87.56 kB (down from 110.89 kB — code relocated, not duplicated)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → 79/80 suites, 546/555 passed, 7 skipped, 2 failed (pre-existing/unrelated, disclosed above); all registries-scoped suites individually confirmed PASS
- `cd frontend-nx && pnpm exec nx test features` (full suite) → PASS (52/52 suites, 453/453 passed) — the 3 newly-moved specs explicitly confirmed PASS
- `pnpm architecture:check` → PASS (1556 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 504.00 kB)

## Executor report

Что сделано: перенёс `RegistryDetailPanelFacade`+`RegistryDetailPanelComponent`
+ 3 эксклюзивных sibling UI-файла в `@kppdf/features/registry-forms`,
переиспользовав уже существующий там дубликат `RegistryCreateButtonComponent`
(удалив орфанную app-копию). Спека панели осознанно осталась в app —
её `setup()` завязан на реальный каталог реестров (`registries.catalog.ts`),
тот же класс блокера, что `registry.types.ts` до TZ1 — перенос только
`import` компонента, остальное не трогал.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
не трогал; ноль пересечений с активными claim-конфликт-ключами других
агентов на момент коммита (перепроверено прямо перед `git add`).

Known limits: если `registries.catalog.ts` когда-нибудь получит свой
domain-lib дом (отдельная, гораздо более крупная волна), стоит пересмотреть
и вернуть спеку к панели.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
