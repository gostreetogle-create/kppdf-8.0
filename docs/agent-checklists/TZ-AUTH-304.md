# TZ-AUTH-304 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-AUTH-304.md`
> Commit/push: **NO** unless PO says so

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim:

## Preflight

- [ ] TZ-AUTH-303 DONE подтверждён
- [ ] Root/worktree и conflict keys проверены
- [ ] Active marker создан до кода
- [ ] Password login и Desktop UI объявлены read-only

## Acceptance

- [ ] Получатель вводит только имя компьютера
- [ ] Regular link создаётся только с заранее выбранной ролью
- [ ] Имя компьютера → immediate entry строго в подготовленной роли
- [ ] Owner-only link подключает второй owner browser без второго owner
- [ ] F5/bootstrap и renew работают без пароля
- [ ] Admin role-select/create/copy/change/revoke устройства работает
- [ ] Все тексты RU; browser smoke PASS

## Integrity slot

- [ ] Тип: page + auth UI
- [ ] FIC §A–E пройден
- [ ] `enroll.page.md`, `admin-devices.page.md`, PAGE-TZ-INDEX обновлены
- [ ] Чужой WIP исключён

## Gates

- [ ] frontend tsc
- [ ] auth service/interceptor tests
- [ ] enroll tests
- [ ] devices-admin tests
- [ ] browser/DOM smoke

## Review handoff

- [ ] READY FOR REVIEW; Cursor/PO PASS до archive

## Executor report (auto)

_(исполнитель заполняет ≤15 строк перед archive)_
