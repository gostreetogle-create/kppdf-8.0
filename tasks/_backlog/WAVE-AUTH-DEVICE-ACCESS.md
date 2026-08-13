# WAVE-AUTH-DEVICE-ACCESS — вход по именованному компьютеру

## Цель PO

Обычный администратор заранее выбирает готовую роль и копирует одноразовую ссылку. Получатель вводит только имя компьютера и сразу работает строго в этой роли. Браузер помнится 365 дней. Логин/пароль приглашённому устройству не нужны.

Owner один и скрыт, но может создать короткую ссылку `Добавить мой компьютер` и подключить рабочий ПК к тому же owner User. Второй owner не создаётся.

## Канон

- `docs/ops/home-host-access.md` §4
- `docs/PO-DIARY.md` §1–§4
- Desktop `kppd_` не менять
- IP binding / mTLS / Cloudflare / Tailscale вне этой волны
- password login owner сохраняется как break-glass
- новый путь строится и проверяется **до** удаления старого

## Порядок

1. `TZ-AUTH-306-hidden-owner-invariant.md`
   - единственный hidden owner;
   - owner-only role editor;
   - server-side защита от enumeration/escalation.
2. `TZ-AUTH-303-device-enrollment-backend.md`
   - regular invite с заранее выбранной ролью;
   - owner-device invite;
   - BrowserDeviceGrant cookie 365d;
   - короткая device app-session, revoke ≤5m.
3. `TZ-AUTH-304-device-enrollment-ui.md`
   - ссылка → имя компьютера → immediate scoped entry;
   - `Устройства`: роль/link/copy/change/revoke;
   - owner-only `Добавить мой компьютер`.
4. `TZ-AUTH-305-device-access-rollout.md`
   - только после явного `деплой`;
   - nginx auth_request;
   - снять Basic после smoke;
   - rollback без wipe.
5. `TZ-AUTH-307-auth-cutover-cleanup.md`
   - только после PASS cutover;
   - удалить public register, API/UI дубли и доказанно мёртвые Basic workaround;
   - сохранить owner break-glass, device grant, JWT, Desktop pairing.

## Continuous / resume

- После каждой TZ: gates → review → archive/lock/progress → commit+push → checkpoint → следующая.
- Для большого зелёного подэтапа: отдельный mid-commit+push и запись в checklist.
- При обрыве новый агент читает `origin/main`, верх `_active-map`, `tasks/_active/<ID>.md` и checklist; продолжает с первого незакрытого пункта, не начинает заново.
- Один и тот же handoff: `tasks/_backlog/PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md`.
- Не коммитить `ruvector.db`, `__pycache__` или чужой WIP.

## Mandatory stops

- conflict keys заняты живым агентом;
- неоднозначно, какой существующий User является owner;
- секрет/опасная операция;
- перед production deploy без явного слова PO `деплой`;
- перед wipe — всегда STOP; wipe этой волне не нужен.

## Definition of done

Волна DONE только когда 306/303/304/305/307 архивированы, все gates зелёные, новый browser flow и second-owner-device проверены, Basic снят с rollback evidence, Desktop/MCP жив, dead auth paths удалены по caller inventory, `origin/main` содержит все closeout-коммиты.
