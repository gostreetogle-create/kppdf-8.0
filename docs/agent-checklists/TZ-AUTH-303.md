# TZ-AUTH-303 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-AUTH-303.md`
> Commit/push: **NO** unless PO says so

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] Root/worktree подтверждены; прочитаны `_active-map` и чужие conflict keys
- [ ] TZ-AUTH-306 DONE; `tasks/TZ-AUTH-303-device-enrollment-backend.md` и канон прочитаны
- [ ] Claim slot заполнен; active marker создан до кода
- [ ] Desktop pairing объявлен read-only

## Acceptance

- [ ] Invite и BrowserDeviceGrant разделены; plaintext не хранится
- [ ] Regular invite требует заранее выбранную роль; activation не может её подменить
- [ ] Owner-device invite связывает второй компьютер с тем же единственным owner
- [ ] Cookie-only renew выдаёт JWT ≤5m без refresh
- [ ] Revoke/role change действуют ≤5m и аудируются
- [ ] JWT/password и `kppd_` regression tests PASS

## Integrity slot

- [ ] Тип: module + permission + auth
- [ ] FIC §A–E пройден или N/A объяснён
- [ ] UI/page docs N/A: frontend в TZ-AUTH-304
- [ ] Чужой WIP исключён

## Gates

- [ ] backend tsc
- [ ] device-enrollment unit/e2e
- [ ] auth service regression
- [ ] desktop pairing regression

## Review handoff

- [ ] READY FOR REVIEW; Cursor/PO PASS до archive

## Executor report (auto)

_(исполнитель заполняет ≤15 строк перед archive)_
