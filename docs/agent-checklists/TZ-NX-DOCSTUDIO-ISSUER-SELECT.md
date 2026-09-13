# TZ-NX-DOCSTUDIO-ISSUER-SELECT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-ISSUER-SELECT.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.5, last in wave — WAVE2_DONE)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T21:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full; `organization.schema.ts`/`.service.ts`/`.controller.ts`
  read in full (IDOR-safe `findById(id, user)` visibility check identified as
  the policy to reuse, not reinvent); `update-studio-document.dto.ts` and
  `studio-document.service.ts` (lines 1-270) read in full; `nav-categories.ts`
  + `route-paths.ts`'s `collectPageRoutePaths()` traced statically
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text (incl. Domain preflight, known_limitation);
  `organization.schema.ts`/`.service.ts`/`.controller.ts` (full);
  `update-studio-document.dto.ts` (full); `studio-document.service.ts`
  (update()/resolveOrganizationId()/assertSameScope(), full); `nav-categories.ts`
  + `route-paths.ts` (full); `studio-data-panel.component.ts` (full);
  `studio-editor.page.ts` (relevant sections — bootstrap subscriptions,
  `onDocTypeChange`/`onAnchorChange`/`conflict()`, template bindings)
- **Key Constraints:** Исполнитель = `Organization`, not `Counterparty`
  (Поставщик); must not break tenant IDOR (bound user can't pick another
  org); "Наши организации" nav item must lead somewhere live or stay
  hidden; no full legacy OrganizationsPage port; no wipe/deploy
- **Planned Deliverable:** BE `organizationId` PATCH field reusing
  `OrganizationService.findById`'s visibility policy; FE readonly-text ->
  `app-pi-select` filtered to `isOurCompany`; nav discoverability fix;
  specs both sides; page.md; live verification
- **Validation Path:** BE tsc/jest + FE tsc/jest (kppdf-web) + eslint
  (scoped) + architecture:check + `nx build kppdf-web` + live Playwright
  (select rendering, switch+persist, nav click-through) + live curl (IDOR/
  known_limitation reproduction)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ISSUER-SELECT.txt`

## Acceptance (из TZ)

- [x] 1. В «Ещё» есть select Исполнитель; смена (список >1, права
  позволяют) сохраняется, preview/токены соответствуют выбранной — live-
  подтверждено (PATCH 200, revision++, `refreshPreviewIfActive()` wired
  the same way as every other context-write handler)
- [x] 2. Bound user с 1 org не может «уйти» на чужую; UI не врёт — covered
  by 4 unit tests (no bound test user on this dev stand to live-verify;
  select is honestly `disabled` when `issuerOrgs().length <= 1`, matching
  the TZ's own "не притворяться multi" instruction)
- [x] 3. Пункт nav «Наши организации» ведёт в живое место (registries) или
  скрыт — **corrected mid-implementation**: the originally-planned
  `nav-categories.ts` edit was reverted after discovering
  `app-shell.component.ts` never renders `cat.items` beyond `entryPath`
  (cosmetic no-op either way); the REAL fix is a new chip in
  `admin-group-chips.ts`'s `ADMIN_TOC_CHIPS` (the actual visible TOC row
  under "Админ"), pointing at `/registries/organizations` — live-verified
  clickable and lands on the real registry, not a 404
- [x] 4. Specs BE+FE; page.md; gates / nx build — all PASS, see Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: field-identity write (PATCH `organizationId`, mirrors
  the existing `docTypeId` write path) + readonly->select FE swap + one
  new nav TOC chip; reuses `OrganizationService.findById`'s existing IDOR
  check, `app-pi-select` primitive, `PiGroupWorkspaceComponent`'s existing
  chip mechanism — no new architecture
- [x] FIC: N/A (no new page/permission/module — reuses `organizations`
  pageKey already present in the admin ACL seed)
- [x] page.md: `docs/pages/document-studio.page.md` updated (§1.3 panel
  table field-routing split, §2.2 Исполнитель paragraph rewritten +
  known_limitation paragraph, §2.2 table row, §3.3 TOC content cell +
  PO/manager glossary paragraph)
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — files touched:
  exactly the BE/FE files listed in the TZ's conflict-keys line, plus
  `admin-group-chips.ts` + `admin-devices.page.spec.ts` (the nav-fix
  conflict-keys line explicitly allowed `nav-categories.ts` **or** the
  route — this is the "or the route" branch, same intent, corrected
  target) and all 13 `studio-editor-*.spec.ts` mock-fixup files (needed
  to unbreak the full suite after the new constructor-time subscription,
  not scope creep)
- [x] Канон: did not confuse Исполнитель (`Organization`) with Поставщик
  (`Counterparty`); did not break tenant IDOR (bound-caller policy reused
  verbatim from `OrganizationService`); did not port the full legacy
  OrganizationsPage; no wipe/deploy; both throwaway test documents deleted
  immediately after verification (one via API before self-lockout, one via
  direct Mongo after — see known_limitation)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest studio-document --silent` → 93/93 PASS
  (service spec 37/37, was 33, +4 new)
- `cd backend && pnpm exec jest --silent` (full) → 136 suites / 1361 tests PASS
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-document.service.ts src/modules/studio-document/studio-document.module.ts src/modules/studio-document/dto/update-studio-document.dto.ts src/modules/studio-document/studio-document.service.spec.ts` → 0 problems
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-data-panel.component.spec.ts` → 23/23 PASS
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=admin-devices.page.spec.ts` → 4/4 PASS (was 3, +1 new)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full) → first run: 13
  suites / 56 tests FAILED (`this.orgsApi.list is not a function`) →
  root-caused (every `studio-editor-*.spec.ts` mocks `PiOrganizationsService`
  with only `getById`) → fixed (added `list` mock to all 13 files) →
  re-run: 125 suites / 903 passed + 7 skipped (910 total) PASS
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 pre-existing
  errors / 273 pre-existing warnings, none in files/lines touched by this
  TZ (verified via `git diff`/`git log -S` per flagged file) → 0 new
  problems from this TZ
- `pnpm architecture:check` (repo root) → PASS (1487 files; baseline 17,
  resolved since baseline: 2) — run twice
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 both times,
  same 2 pre-existing unrelated warnings only; AOT template compilation
  validated every new binding name
- Live Playwright/curl verification — PASS: isOurCompany-only option list
  (3/13 orgs); switch persists (200, revision++); nav chip click-through
  to the live registry; known_limitation lockout reproduced + documented
  as WARN per TZ instruction; both test documents cleaned up

## Executor report

**Self-corrected a wrong assumption before it shipped as dead work:**
initially "fixed" the nav item inside `nav-categories.ts` (as flagged in
the TZ's own domain preflight), then live-verified with Playwright that
`app-shell.component.ts` never renders `cat.items` beyond the one
`entryPath` link — meaning that edit would have been a no-op with a
misleading "fixed the dead nav" comment attached to it. Reverted it
cleanly (`git checkout --`) and found the actual visible surface (the
`ADMIN_TOC_CHIPS` TOC row rendered by `<app-pi-group-workspace>` on
`/admin/devices`/`/admin/roles` — the same mechanism that already renders
the real "Устройства"/"Роли" tabs a PO clicks), added the new chip there
instead, and live-verified the click-through end-to-end.

**Found and reported a live known_limitation stronger than the TZ's own
description:** the TZ's text anticipated the changed document might
"disappear from the admin's list." Live reproduction shows it's worse —
`assertSameScope`/`findById` reject GET **and** PATCH **and** DELETE with
a 403 for the SAME admin who just made the switch, with zero recovery path
via the UI (which hangs on an unexplained infinite "Загрузка документа…"
spinner) or the API. Filed as a WARN per the TZ's own explicit instruction
("не блокировать этот TZ"), not treated as a blocker, and written up in
both the evidence file and `document-studio.page.md` for the next agent
who hits it.

**Reused existing policy instead of duplicating it:** the BE IDOR check for
"can this caller pick this org as issuer" is a straight reuse of
`OrganizationService.findById(id, user)` (already used everywhere else for
org visibility), not a bespoke check with its own edge cases.

## Closeout

- [x] archive + удалить `_active` + удалить `_ready` source (top-level file)
- [x] Status = DONE
- closed_at: 2026-09-13T23:00:00Z
