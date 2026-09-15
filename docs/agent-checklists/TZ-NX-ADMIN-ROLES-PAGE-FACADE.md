# TZ-NX-ADMIN-ROLES-PAGE-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ADMIN-ROLES-PAGE-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:34:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ4 archived `2dee3113`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ADMIN-ROLES-PAGE-FACADE.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ADMIN-ROLES-PAGE-FACADE.md` на месте

## What changed

Created `admin-roles.facade.ts` (`@Injectable()`, component-scoped via
`providers: [AdminRolesPageFacade]`). `RolesAdminPage` is a plain route
page with no `input.required<T>()`/`@Input()` — the facade's own
constructor safely calls `refresh()` directly, same shape as
`ShippingFacade`/`PairingDialogFacade` (TZ3), no `bind(host)` needed.

Moved as-is: every signal (`roles`, `loading`, `error`, `loadingRowId`,
`page`, `total`, `searchQuery`), the `cols` table-column defs (already
importing `RoleFormDialogComponent`/`RoleFormData`/`RoleFormResult` from
`@kppdf/features/admin-roles` — that dialog was already moved to features
in an earlier wave, B4), and every method (`refresh`, `onSearchInput`,
`onPageChange`, `onCreate`, `onEdit`, `onView`, `onDelete`, `createRole`,
`updateRole`, `silentRun`, `describe`). No role/permission rule change.

`caps` (`CapabilitiesService`), `toc`/`chips`/`copy` stay on the thin page —
used directly by the template for capability-gating and static labels, not
by any facade method. The `@ViewChild('rowActionsTpl', { static: true })`
binding + `ngOnInit()` stay on the component per this program's standing
rule (template-ref resolution can't move to a facade).

Checked `admin-roles.page.spec.ts` (115 LOC) before touching anything: zero
`fixture.componentInstance['xxx']` access — purely DOM-based. Every
facade-owned member aliased/delegated under its original name on the thin
page, consistent with every prior facade TZ this program.

Page: 384 → 200 LOC. New facade: 233 LOC.

## Acceptance

- [x] admin-roles specs green (`admin-roles.page.spec.ts` explicitly confirmed PASS)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no role/permission rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/UI change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: admin-roles.page.ts, admin-roles.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (roles CRUD semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ4 closure (`8e9c2c5b`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB; `admin-roles-page` lazy chunk 45.78 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (83/83 suites, 559/566 passed, 7 skipped, 0 failed) — `admin-roles.page.spec.ts` explicitly confirmed PASS
- `pnpm architecture:check` → PASS (1551 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state (Signals) и все
list/search/paginate/CRUD методы `RolesAdminPage` в новый
`AdminRolesPageFacade` — без изменения бизнес-правил ролей/прав.
`RoleFormDialogComponent` уже жил в `@kppdf/features/admin-roles` (более
ранняя волна B4), facade просто переиспользует его напрямую. `caps`/`toc`/
`chips`/`copy` и `@ViewChild` остались на тонкой странице (шаблонные/
capability-gating нужды, не относятся к facade). Спека чисто DOM-based,
поэтому все члены алиасированы/делегированы под оригинальными именами.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
