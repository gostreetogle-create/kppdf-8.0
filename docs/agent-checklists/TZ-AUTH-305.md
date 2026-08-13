# TZ-AUTH-305 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-AUTH-305.md`
> Commit/push: **NO** unless PO says so

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] TZ-AUTH-303 + TZ-AUTH-304 DONE и browser PASS
- [ ] Получена явная команда PO `деплой` перед production-действиями
- [ ] Текущий nginx config сохранён; rollback Basic подготовлен
- [ ] Wipe/data migration запрещены

## Acceptance

- [ ] Basic popup отсутствует после cutover
- [ ] UI/login закрыты device grant
- [ ] Enrollment доступен без Basic
- [ ] Regular pre-role/F5/revoke + second owner-device smoke PASS
- [ ] JWT/`kppd_`/OPTIONS API regression PASS
- [ ] Rollback Basic проверен

## Integrity slot

- [ ] Тип: ops + auth perimeter
- [ ] FIC §A–Е N/A с причиной
- [ ] Page docs проверены
- [ ] Evidence очищен от секретов

## Gates

- [ ] nginx -t
- [ ] preflight.ps1
- [ ] incognito + active + revoked browser smoke
- [ ] Desktop/MCP smoke

## Review handoff

- [ ] READY FOR REVIEW; Cursor/PO PASS до archive

## Executor report (auto)

_(исполнитель заполняет ≤15 строк перед archive)_
