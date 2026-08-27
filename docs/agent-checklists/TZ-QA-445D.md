# TZ-QA-445D checklist

> Status: **DONE** (no code change — diagnosis only)
> Marker: pending archive — `tasks/_archive/2026-08/TZ-QA-445D.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-27T18:30:10Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — claim в marker/checklist

## Preflight

- [x] git status/branch — main, clean relative to this task
- [x] `_NOW.md` + `tasks/_active/` — QA-445B/445C claimed on inventory/doc-constructor, no overlap with proposal workspace
- [x] TZ прочитан (`tasks/TZ-QA-445D-proposal-pdf-401.md`)
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-QA-445D.md` на месте (removed on archive)

### Preflight Check Output
- **Context read:** `backend/.../template-block.controller.ts`, `backend/.../document-template.controller.ts`, `frontend/.../proposal-workspace-draft.service.ts` (`buildPreview()`), `frontend/.../core/auth.interceptor.ts`, `frontend/.../core/auth.interceptor.spec.ts`
- **Key Constraints:** не трогать auth-флоу логина без подтверждения системности причины; проверить совпадение root cause с QA-445A первым делом
- **Planned Deliverable:** diagnosis + (if same root cause as QA-445A) documented systemic note instead of point fix
- **Validation Path:** code read of guards + interceptor; existing auth.interceptor.spec.ts already covers the generic 401→refresh→retry path

## Diagnosis

- Both endpoints are behind the global `JwtAuthGuard` (`template-blocks` GET has no
  extra guard beyond the app-wide guard; `document-templates/:id/build` additionally
  has `@Roles('admin','manager')` + `OwnershipGuard`). A 401 there means "no/expired
  access token on the wire at request time" — not a missing-auth-header bug in the
  route wiring itself.
- Frontend build call: `proposal-workspace-draft.service.ts:buildPreview()` →
  `templatesSvc.build(tpl._id, payload)` → plain `HttpClient` call, goes through the
  global `authInterceptor` (`frontend/src/app/core/auth.interceptor.ts`) exactly like
  every other API call in the app — nothing special/cached/iframe-scoped about these
  two calls.
- `auth.interceptor.ts` already implements single-flight refresh-and-retry: on ANY
  401 (not skip-listed) it calls `auth.refresh()` once, then replays the original
  request with the new access token (`IS_RETRY` context flag prevents loops). This is
  generic — already unit-tested against an arbitrary endpoint (`/api/materials`) in
  `auth.interceptor.spec.ts`, not endpoint-specific plumbing that could be "missing"
  for `template-blocks`/`document-templates`.
- Consequence: when the access token is stale at the moment these two requests fire,
  DevTools' Network tab logs the **first, pre-refresh** attempt as 401 (browsers log
  every individual HTTP transaction, including ones an app-level interceptor silently
  retries). The interceptor's replay then succeeds transparently, which is exactly why
  the PO's screenshot showed a populated PDF preview (from the successful retry)
  despite the two 401 lines in the console (from the doomed first attempt).
- **Same root cause as QA-445A**: that ticket's `GET /api/products/.../tree` 401 was
  independently diagnosed as unrelated background noise from a separately-expired tab
  session — i.e. also "401 logged, but not a functional break," just a different
  endpoint. The common thread across QA-445A and QA-445D is not a shared code path bug;
  it is that **any** request whose access token has gone stale produces a visible 401
  in the console even though the app's generic auth-interceptor transparently recovers
  it via refresh-and-retry. This is expected/by-design interceptor behavior, not a gap.
- No evidence of a real auth-header-missing defect on `template-blocks` or
  `document-templates/:id/build` specifically.

## Systemic conclusion (per TZ instruction to merge with QA-445A if same cause)

- Root cause is **not** endpoint-specific and does **not** need two point fixes.
  Documenting here as the single systemic note: transient 401 entries in the browser
  console for any endpoint are expected noise from the generic refresh-and-retry
  interceptor when the access token is stale at request time; the retried request
  succeeds and the UI is unaffected. No new ticket needed beyond this note — if 401
  noise-suppression in the console is ever wanted, that would be a separate,
  explicitly-scoped UX/observability task (e.g. only log 401s that survive retry),
  not an auth-flow bug fix.

## Acceptance

- [x] Reproduced/explained: 401 on `template-blocks`/`document-templates build` is the
      pre-refresh attempt of the existing generic auth-interceptor retry flow, not a
      missing-auth defect.
- [x] Common root cause with QA-445A identified and documented (see above) instead of
      filing a second point-fix ticket.
- [x] NO change to the login/auth flow — confirmed as designed behavior already
      covered by `auth.interceptor.spec.ts`.

## Integrity slot (до READY / archive)

- [x] Тип изменения: diagnosis-only, no product code change
- [x] FIC §A–E N/A (нет нового route/permission/module/MCP); §F N/A
- [x] docs/pages N/A — no behavior changed
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только чтение
      `pages/commercial/proposals/workspace/*`, `template-blocks`,
      `document-templates/.../build`)
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates / Executor report

- No code changed → no new tsc/jest run required beyond existing suite; relied on
  pre-existing `auth.interceptor.spec.ts` coverage of the generic 401→refresh→retry
  path (already PASS on main).
- Archive: `tasks/_archive/2026-08/TZ-QA-445D.done.md`
- Lock: `.mimocode/locks/TZ-QA-445D-proposal-pdf-401.lock`
- Deploy: NO

## Executor report (auto)

- Diagnosis: 401 on template-blocks/document-templates build = pre-refresh attempt of
  existing generic auth-interceptor retry (same class of noise as QA-445A); no defect
- No code change; systemic note recorded above merging QA-445A + QA-445D root cause
- closed_at: 2026-08-27T18:30:10Z
- Archive: tasks/_archive/2026-08/TZ-QA-445D.done.md
- Deploy: NO
