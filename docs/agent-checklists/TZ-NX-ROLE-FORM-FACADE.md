# TZ-NX-ROLE-FORM-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ROLE-FORM-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T05:39:02Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (DECOMP batch B1→B3 complete, verified)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ROLE-FORM-FACADE.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ROLE-FORM-FACADE.md` на месте

## What changed

Created `role-form.facade.ts` (`@Injectable()`, component-scoped via
`providers: [RoleFormFacade]` on the dialog). Moved from
`role-form-dialog.component.ts` **as-is** every signal (`name`, `label`,
`description`, `error`, `submitting`, `sections`, `groups`, `pageGroups`,
`catalogLoading`, `catalogError`, `selected`, `selectedPages`), every
method (`dialogTitle`, `permissionLabel`, `pageLabel`, `onNameInput`,
`onLabelInput`, `onDescriptionInput`, `loadCatalog`, `applyFullAccessDisplay`,
`selectedCount`, `selectedPagesCount`, `isSelected`, `isPageSelected`,
`toggleKey`, `togglePage`, `selectAllPermissions`, `clearAllPermissions`,
`selectAllPages`, `clearAllPages`, `groupAllSelected`, `pageGroupAllSelected`,
`toggleGroup`, `togglePageGroup`, the deprecated `sectionAllSelected`/
`toggleSection`, `actionLabel`, `canSubmit`, `onSubmit`, `onCancel`,
`describe`, `readOnly`), and the two exported pure helpers
(`regroupPermissions`, `regroupPages` + their `GROUP_ORDER`/
`SECTION_TO_GROUP`/`ACTION_RU` support consts). No ACL rule changes.

**Special case vs. every prior facade in this program:** this is a
*dialog*, not a page/route component — its inputs come from
`PI_DIALOG_DATA`/`PI_DIALOG_REF` (Angular DI tokens the dialog service
provides on the injector that creates the component), not `@Input()`/
`input()`. Since the facade is provided in the *same* component's
`providers` array, it sits in the same injector chain and can `inject()`
these tokens directly — **no `bind()`-host workaround needed** (unlike
`OrderHubFacade`, which genuinely needed one because its host used a
real `input.required()` signal).

The template references `data.mode` directly in two spots (not just via
methods), so `data` itself is aliased on the component
(`protected readonly data = this.facade.data;`) — same live-object
reference, since both the dialog and the facade resolve the identical
`PI_DIALOG_DATA` token instance. `copy = ROLE_FORM_COPY` stayed on the
component (trivial, no DI dependency, matches the "leave presentational
constants" precedent).

Verified template coverage exhaustively (extracted every method-call and
`data.` property access from the ~270-line template and cross-checked each
against the component's aliases/delegates) — **no dedicated spec exists**
for this dialog's internals; `admin-roles.page.spec.ts` only asserts
`dialog.open` was called with `RoleFormDialogComponent` as an argument (a
mock check), it never renders/instantiates the dialog itself. This is a
pre-existing test-coverage gap, not something introduced here — flagged
as a known limitation below, not fixed (out of this TZ's scope).

Fixed one self-inflicted mechanical slip mid-edit: an `Edit` replacement
that was meant to remove the whole class body + the two trailing exported
functions matched only up to one line inside `regroupPermissions`, leaving
the rest of both functions (now referencing moved-away identifiers) and a
stale `export type { PermissionCatalogEntry };` dangling in the file.
Caught immediately by inspection before running any gate; removed cleanly.

Dialog: 925 → 674 LOC (includes the unchanged ~270-line template + full
styles block). New facade: 386 LOC.

## Acceptance

- [x] Role/admin-related specs green: `admin-roles.page.spec.ts` (4/4) — the only spec referencing this dialog
- [x] tsc clean
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no ACL/permission rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (dialog, no route change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: role-form-dialog.component.ts, role-form.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (permission/pageKey ACL semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (confirmed before claim)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `npx jest --config apps/kppdf-web/jest.config.ts admin-roles.page.spec.ts` → PASS (4/4 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="role|admin"` → PASS (106/106 suites, 741/748 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state (Signals) и все
matrix/toggle/submit методы `RoleFormDialogComponent` в новый
`RoleFormFacade` — без изменения ACL-правил. Т.к. это диалог (не
route-страница), его вход — DI-токены `PI_DIALOG_DATA`/`PI_DIALOG_REF`, а
не `@Input()`; facade, будучи в том же `providers`, инжектит их напрямую
без bind()-паттерна. `data` алиасирован на компонент отдельно (template
дважды читает `data.mode` напрямую). Спека `admin-roles.page.spec.ts` не
рендерит сам диалог (только проверяет вызов `dialog.open` с моком) —
существующий пробел покрытия, не устранял (вне рамок TZ). Вручную сверил
каждый вызов из template с алиасами/делегатами компонента — расхождений
нет.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет прямого unit-теста на внутреннюю логику диалога (matrix
toggle/select-all/submit) — существовавший пробел до этого TZ, не входит в
scope. `permission-labels.ru.ts` остаётся общим с `admin-roles.page.ts` —
актуально для R2 (features move), не для этого TZ.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
