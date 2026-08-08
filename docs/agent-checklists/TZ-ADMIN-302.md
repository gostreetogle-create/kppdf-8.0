# TZ-ADMIN-302 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-ADMIN-302.done.md`
> Commit/push: **YES** (PO). Deploy: **NO**

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T08:31:05Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task) — claimed via `_active` + inbox send
- closed_at: 2026-08-08T08:32:30Z

## Preflight

- [x] Root `D:\kppdf-8.0`; `_active` empty before claim
- [x] CONFLICT KEYS free (no peer on roles dialog)
- [x] Claim before code

## Acceptance

- [x] Администратор view → full catalog pages+caps checked, disabled; banner «Системная · нельзя изменить (полный доступ)»
- [x] Custom / non-system director·manager → Edit works
- [x] No Save on system view
- [x] tsc + jest admin PASS; archive; push

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS

cd frontend && pnpm exec jest --testPathPattern="pages/admin/(role-form-dialog|roles-admin|permission-labels)" --no-coverage
→ 3 suites / 30 tests PASS
```

## Executor report

- Root cause: system role stores `permissions: ['*']` → checkboxes unbound → empty read-only matrix.
- Fix: `applyFullAccessDisplay()` after catalog load in `mode: 'view'`.
- Banner copy updated in `ROLE_FORM_COPY`.
- Conflict disclosure: `permission-labels.ru.ts` (banner) beyond strict CONFLICT KEYS list.
- Peer dirty: users-admin / user-form / chrome pages — **not staged**.
- Deploy: NO. app-layout: not touched.

## Closeout

- [x] archive + lock + progress + remove `_active`
- Status = DONE
- closed_at: 2026-08-08T08:32:30Z
