# TZ-AUTH-307 checklist

> Status: **PARKED** / blocked on TZ-AUTH-305 cutover + PO
> Spec: `tasks/_park/TZ-AUTH-307-auth-cutover-cleanup.md`
> Marker: нет в `_active` (не live queue)
> Commit/push: только после 305 DONE + PO unblock

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] TZ-AUTH-305 DONE и post-cutover smoke PASS
- [ ] Полный caller/route/header/cookie inventory составлен до удаления
- [ ] Owner break-glass и Desktop pairing объявлены KEEP
- [ ] Backup/rollback понятен; wipe запрещён

## Acceptance

- [ ] Public register удалён
- [ ] User-admin CRUD дедуплицирован
- [ ] Basic/browser workaround очищен по evidence
- [ ] Один regular invite + один owner-device flow
- [ ] Dead DTO/routes/imports/tests/docs удалены
- [ ] Owner/device/Desktop regression smoke PASS

## Integrity slot

- [ ] Тип: auth refactor + removal
- [ ] FIC §A–E пройден
- [ ] Page docs/architecture обновлены
- [ ] Route/header inventory приложен

## Gates

- [ ] backend/frontend typecheck + lint
- [ ] targeted auth/admin/desktop tests
- [ ] architecture check
- [ ] browser smoke
- [ ] security diff review + diff-check

## Review handoff

- [ ] READY FOR REVIEW; Cursor/PO PASS до archive

## Executor report (auto)

_(исполнитель заполняет ≤15 строк перед archive)_
