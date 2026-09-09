# TZ-NX-UX-17-admin-roles checklist (AUDIT + FIX) — final stage of the continuous sweep

> Status: **DONE**
> Marker: `tasks/_active/` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T19:54:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM
- [x] `admin-roles.page.ts`, `PiRowActionsComponent` source, `CapabilitiesService`,
      `admin-roles.page.md`, `app.routes.ts` (owner-only guard) read in full
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE

### Preflight Check Output
- **Context read:** page source; `pi-row-actions.component.ts` (confirmed genuinely gold, not an
  A1 anti-pattern); `capabilities.service.ts` (confirmed admin-role shortcut); `app.routes.ts`
  (confirmed `/admin/roles` is owner-only at the route level, which downgrades the T1 finding's
  real-world reachability); `role-form-dialog.component.ts` (confirmed `isSystem` on `data.role`
  is currently unread, so the found `isSystem: true` hardcode was harmless today but worth fixing
  now that `onView()` gets a new call site)
- **Key Constraints:** single-file conflict key; no BE changes; be honest about downgraded
  severity once the owner-only route context was discovered rather than overstating impact
- **Planned Deliverable:** «Смотреть» fallback for custom roles + `data-testid`→`data-test` fix
- **Validation Path:** focused `nx test kppdf-web --testPathPattern=admin-roles`; `nx build kppdf-web`

## Acceptance

- [x] Audit file `docs/audits/2026-09-09-nx-ux-admin-roles-audit.md` — verdict PASS-FIX (2xP2).
- [x] T1: read-only fallback added for custom roles with no manage capability.
- [x] C1-adjacent: `data-testid` → `data-test` fixed.
- [x] `nx build kppdf-web` PASS.
- [x] Focused + full test run PASS, 0 regressions.
- [x] WAVE row 17 updated; page.md UX note added.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, same route, additive read-only fallback +
      attribute fix + latent-bug correctness fix, no new permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing route extended in place
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/admin-roles.page.md` — NX UX sweep note added
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (single file `admin-roles.page.ts` +
      new spec + audit file + page.md + WAVE row 17)
- [x] Coupling map: N/A (pure UI read + attribute fix, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=admin-roles → PASS 105/105 suites, 704/711 (7 skipped), 0 regressions (+4 new tests, new suite)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (exit 0, same 2 pre-existing unrelated warnings)
```

## Executor report

- **T1 (P2, downgraded from an initial P1 read) fixed:** custom-role row actions now show a
  read-only «Смотреть» fallback (reusing the existing `onView()` method) when the viewer has
  neither `role:write` nor `role:admin` — mirroring the system-role branch's existing fallback.
  Reachability caveat documented in the audit: `/admin/roles` is owner-only at the route level
  (`ownerOnlyRouteGuard`) and the owner virtually always gets the `CapabilitiesService` admin
  shortcut (`user.role === 'admin'`), so this gap is unlikely to be hit in practice — fixed anyway
  as cheap, safe, zero-risk parity, not because it's a live complaint.
- **Found-while-fixing correctness bug, fixed:** `onView()` hardcoded `isSystem: true` — harmless
  today (the dialog never reads that field) but wrong for the new custom-role call site; changed
  to pass the real `r.isSystem`.
- **P2 fixed:** `data-testid="roles-admin-error"` → `data-test="roles-admin-error"` (the only
  `data-testid` on the page; every other selector already used `data-test`).
- **Test coverage gap closed:** this page had zero spec file before this TZ (same gap
  `/admin/devices` had at stage 16). Added a focused 4-test spec.
- No BE, no new features, no `/production`, no other routes touched.
- Files: `admin-roles.page.ts`, `admin-roles.page.spec.ts` (new),
  `docs/audits/2026-09-09-nx-ux-admin-roles-audit.md` (created), `docs/pages/admin-roles.page.md`
  (UX note), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 17 DONE), this checklist,
  `tasks/_active/` marker (created → archived).
- **This is the final stage of the continuous sweep queue (08b, 09, 10, 12–17; 11 SKIP).** After
  this TZ's docs sync, `UX-SWEEP-CONTINUOUS-CHECKLIST.md` moves to `status: COMPLETE` and `_NOW`
  Claude → IDLE, per the Phase 1 instruction's final-state requirement.

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T20:02:00Z
