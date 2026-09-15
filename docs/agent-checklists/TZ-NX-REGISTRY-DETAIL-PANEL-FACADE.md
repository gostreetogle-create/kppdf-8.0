# TZ-NX-REGISTRY-DETAIL-PANEL-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-DETAIL-PANEL-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:18:45Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B7 archived `0cf20cfb`)
- [x] TZ / канон / deps прочитаны (`tasks/_ready/2026-09-15-decomp-b8-registries-desktop-admin/WAVE-MAP.md` + `TZ-NX-REGISTRY-DETAIL-PANEL-FACADE.md`, full pack intact this wave)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-DETAIL-PANEL-FACADE.md` на месте

## What changed

Created `registry-detail-panel.facade.ts` (`@Injectable()`, component-scoped
via `providers: [RegistryDetailPanelFacade]`). `RegistryDetailPanelComponent`
has `readonly definition = input.required<RegistryDefinition<RegistryRow>>()`
— an injected facade can't read a host's own input signal directly at its own
construction time, so this uses the `bind(host)` pattern already established
by `OrderHubFacade`/`GanttBarsFacade`: the host passes itself (as
`RegistryDetailPanelFacadeHost`, exposing `definition: Signal<...>`) once from
its own constructor (`this.facade.bind(this)`), and every facade-owned
`computed()` reads `this.host.definition()` lazily (safe — `computed()`
never evaluates eagerly). The one `effect()` (query-state → load orchestration,
previously in the component's own constructor) is created *inside* `bind()`,
not the facade's own constructor, since `effect()` schedules a near-eager
first run and the facade's constructor runs via DI field-injection on the
host *before* the host's own constructor body executes `bind()` — creating it
there risked firing with `host` still unset.

Moved as-is: query-state ↔ URL sync (`queryState`, `navigateToState`), every
computed (`hasRowActions`, `hasExpandable`, `cols`, `tableRows`,
`toolbarPaginationTotal`, `showToolbarPagination`, `expandedRowWhenFn`,
`expandedRowLabelFn`), `pageState`/`expandedRowId` signals, load/retry
(`runQuery`, `reload`), row-action orchestration incl. the confirm-dialog
flow (`onRowAction`, `runAction`, `runOnDialogCloseOnce`), create-action
(`onCreate`, `runActionContext`, `actionContext`), and every filter/sort/page
handler. No registry query/action/URL-param behavior change.

Checked `registry-detail-panel.component.spec.ts` (619 LOC) before touching
anything: zero `fixture.componentInstance['xxx']`/`.xxx()` access anywhere —
purely DOM-based (`data-test` attributes, `nativeElement.querySelector`).
Still aliased every signal/computed and delegated every method under its
original name on the thin host (rather than rewriting the ~155-line template
to `facade.xxx`), consistent with every prior facade TZ this program. The two
`@ViewChild('rowActionsTpl'/'expandedTpl', { static: true })` `TemplateRef`
bindings + `ngOnInit()` stay on the component — they resolve against the
component's own view and cannot move to a facade.

Panel: 442 → 291 LOC. New facade: 270 LOC.

## Acceptance

- [x] registry-detail* + registries specs green
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no registry query/action/URL behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/UI change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: registry-detail-panel.component.ts, registry-detail-panel.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (registry query/action semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0, bundle 503.38 kB (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (84/84 suites, 573/580 passed, 7 skipped, 0 failed) — incl. `registry-detail-panel.component.spec.ts` explicitly confirmed PASS
- `pnpm architecture:check` → PASS (1547 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; `registries-page` lazy chunk 110.89 kB)

## Executor report

Что сделано: механически вынес весь domain-state (Signals/computed) и все
query-state/load/retry/expand/row-action/create методы
`RegistryDetailPanelComponent` в новый `RegistryDetailPanelFacade`, используя
`bind(host)` паттерн (`OrderHubFacade`-эталон) из-за `input.required<T>()` на
хосте — без изменения бизнес-правил реестра. `@ViewChild` template-ref
биндинги остались на компоненте (не переносятся в facade). Спека чисто
DOM-based, поэтому все члены алиасированы/делегированы под оригинальными
именами на тонком хосте — консистентно с предыдущими TZ этой программы.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
