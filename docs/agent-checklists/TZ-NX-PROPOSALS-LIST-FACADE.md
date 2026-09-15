# TZ-NX-PROPOSALS-LIST-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PROPOSALS-LIST-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T05:24:28Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (B2 wave complete, verified by Cursor)
- [x] TZ / канон / deps прочитаны (`TZ-NX-PROPOSALS-LIST-FACADE.md`, `WAVE-MAP.md`, `PROMPT-CLAUDE-B3-CONTINUOUS.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-PROPOSALS-LIST-FACADE.md` на месте

## What changed

Created `proposals-list.facade.ts` (`@Injectable()`, component-scoped via
`providers: [ProposalsListFacade]`). Moved from `proposals-list.page.ts`
**as-is** every domain signal (`rows`, `studioDocs`, `status`, `error`,
`convertingId`, `expandedFamilyId`, `familyByRow`, `familyLoadingId`,
`familyError`, `orgNames`, private `orgRows`/`orgsLoaded`, `filtered`
computed) and every method (`load`, `statusLabel`, `counterpartyName`,
`orgNameOf`, `toggleFamily`, `reloadFamily`, `loadFamily`,
`ensureOrganizations`, `openAttachOrgs`, `attachOrganizations`,
`confirmSyncFromMaster`, `syncFamilyFromMaster`, `createInStudio`,
`openInStudio`, `openVariantInStudio`, `openQuotationInStudio`,
`convertToOrder`) plus `STATUS_LABELS`. `ngOnInit()`'s `load()` call moved
to the facade's own constructor (page has no `@Input`s — route-level page,
same safe pattern as A3/S1/S2/W1). No convert-to-order or studio-bridge
semantics changed; no legacy KP workspace ported (TZ hard rule respected).

Every facade-owned signal/computed is a readonly alias
(`protected readonly xxx = this.facade.xxx;`) — this page has zero mutable
two-way-bound (`[(ngModel)]`) fields, so (unlike S1) no template changes
were needed at all; template is byte-for-byte unchanged. Every
template-bound handler stayed as a same-named delegate to
`this.facade.xxx(...)`.

Checked the 1213-line `proposals-list.page.spec.ts` before editing: it
directly pokes `fixture.componentInstance.familyByRow.set(...)` /
`.familyByRow()` (a signal — alias handles this transparently, same live
reference) and calls `fixture.componentInstance.convertToOrder(row)`
(a method — the delegate wrapper handles this too). **No spec changes
needed.**

**Optional dumb `proposal-row` extract — PARKed** (TZ text: "only if zero
behavior change", i.e. discretionary). The row template (~90 lines) has a
nested family-expand panel with its own loading/error/sync sub-states;
extracting it would need several Input/Output wires for state that's
already cleanly owned by the facade, for a page that's already thin (201
LOC) post-facade-move. Same risk/reward call made for S1's inline
create-form and A2's presentational extracts.

Page: 420 → 201 LOC (includes the unchanged ~120-line template). New
facade: 291 LOC.

## Acceptance

- [x] Specs: `proposals-list.page.spec.ts` (23/23), `proposal-attach-orgs.dialog.spec.ts` (10/10) — 33/33 total, all green
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no convert/studio-bridge rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/behavior change visible to users)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: proposals-list.page.ts, proposals-list.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (Quotation/family/convert-to-order semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from B2 wave closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `npx jest --config apps/kppdf-web/jest.config.ts proposals-list.page.spec.ts proposal-attach-orgs.dialog.spec.ts` → PASS (2/2 suites, 33/33 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="proposals"` → PASS (107/107 suites, 745/752 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state и API/studio-bridge-методы
`ProposalsListPage` в новый `ProposalsListFacade` — без изменения
convert-to-order или studio-bridge семантики, без порта legacy KP
workspace. Ни template, ни spec правок не потребовали — все состояние уже
было Signals (без ngModel-полей как в S1), а прямые обращения спеки к
`familyByRow` (signal) и `convertToOrder` (метод) прозрачно работают через
alias/delegate.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: dumb `proposal-row` extract — PARK, см. обоснование выше;
можно вернуться в P2 если появится реальная причина.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
