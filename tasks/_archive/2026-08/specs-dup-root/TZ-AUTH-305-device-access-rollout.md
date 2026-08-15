# TZ-AUTH-305: Переключение внешнего входа

РОЛЬ АГЕНТА: DevSecOps Engineer

ЗАВИСИМОСТИ: TZ-AUTH-303 DONE ; TZ-AUTH-304 DONE ; Cursor/PO browser PASS

LAYER: 4

PAGES: /enroll/:token ; /enroll/waiting ; /admin/devices ; /login
PAGE_DOCS: enroll.page.md ; admin-devices.page.md ; login.page.md

CONFLICT KEYS: deploy/synology/DEPLOY.md ; deploy/synology/RUNBOOK.md ; deploy/synology/preflight.ps1 ; docs/ops/home-host-access.md ; docs/ops/server-harden-evidence.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `docs/ops/home-host-access.md`; `deploy/synology/DEPLOY.md`; TZ-AUTH-303; TZ-AUTH-304.

1. VPS nginx сейчас держит UI за HTTP Basic. `/api` исключён из Basic ради JWT и Desktop/MCP.
2. Новый продуктовый барьер готов только после PASS backend+frontend и реального browser smoke.
3. Снимать Basic заранее запрещено. Нужны staged rollout и проверенный возврат.
4. Это ops-переключение, не новая auth-реализация.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Описать целевую nginx-политику и rollback

1. UI `/` и SPA routes проверяются через nginx `auth_request` по browser device cookie.
2. Subrequest location помечен `internal`, проксируется в cookie-check TZ-AUTH-303 и не доступен напрямую снаружи.
3. Public enrollment surface допускает только необходимое:
   - GET shell `/enroll/*`;
   - POST API consume/status/session из TZ-AUTH-303;
   - необходимые статические assets.
4. `/api` не получает Basic или интерактивный browser challenge; JWT/`kppd_` остаются источником API auth.
5. Зафиксировать честно: device barrier закрывает UI/login; API остаётся сетево достижимым, но защищён JWT/pairing.
6. Rollback одной операцией возвращает предыдущий `auth_basic` без изменения БД и без wipe.

### ШАГ 2. Провести безопасное переключение

1. Только после явного слова PO `деплой`.
2. Снять Basic с enrollment route первым и подтвердить активацию тестового invite.
3. Включить `auth_request` на UI, проверить active/revoked и отдельный owner-device link.
4. Только после PASS убрать Basic с основного UI.
5. Не открывать VM `:3000`, не менять SSH reverse tunnel, DNS или TLS.

### ШАГ 3. Выполнить smoke и собрать evidence

Проверить:

- без cookie `/` и `/login` не открывают ERP;
- invite GET не consume;
- regular link с заранее выбранной ролью + имя компьютера → immediate scoped entry;
- owner-only link → второй owner browser без создания второго owner;
- F5/закрытие браузера → automatic entry;
- revoke → renew закрыт и доступ исчезает максимум за 5 минут;
- expired invite/grant закрыты;
- Desktop/MCP `kppd_` и JWT API работают;
- OPTIONS/CORS не получает browser redirect/Basic;
- nginx config test и reload без downtime;
- rollback Basic проверен конфигурационно до переключения.

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ:

- `deploy/synology/DEPLOY.md`
- `deploy/synology/RUNBOOK.md`
- `deploy/synology/preflight.ps1`
- `docs/ops/home-host-access.md`
- `docs/ops/server-harden-evidence.md` — только новое датированное evidence, историю не переписывать.

НЕ ИЗМЕНЯТЬ:

- frontend/backend product code — уже 303/304.
- Desktop pairing и `/api` Authorization transport.
- DNS, Cloudflare, mTLS, Tailscale, IP allowlist.
- Mongo/data; wipe запрещён.
- production без явной команды PO `деплой`.

## КРИТЕРИИ ПРИЁМКИ

1. Основной UI больше не показывает Basic popup.
2. Неизвестный браузер не видит `/login` и ERP.
3. Одноразовая ссылка подключает новый компьютер без Basic и без app-пароля.
4. Активное устройство помнится 365 дней по умолчанию и может быть отозвано отдельно.
5. `/api` не получает Basic/auth_request redirect и продолжает принимать JWT/`kppd_`.
6. Rollback возвращает Basic без wipe и без отката БД.
7. Gates/evidence:
   - `nginx -t` PASS;
   - `deploy/synology/preflight.ps1` PASS;
   - incognito + active + revoked browser smoke PASS;
   - Desktop/MCP smoke PASS;
   - evidence не содержит invite/grant/password/cookie secret.
8. Перед archive заполнен `docs/agent-checklists/TZ-AUTH-305.md`, приложен `## Executor report (auto)` и получен Cursor/PO PASS.

## known_limitation

- Публичный домен и `/api` продолжают отвечать из интернета; это не VPN-only.
- Статические SPA assets, необходимые публичной enrollment-странице, могут быть скачаны без grant; бизнес-данные и app routes ими не открываются.
- Tailscale остаётся только возможной будущей фазой, не частью этого TZ.

## ФИНАЛИЗАЦИЯ

Root task: следовать `GEMINI.md`, архивировать в `tasks/_archive/YYYY-MM/`, обновить checklist/progress/ARCHITECTURE. Production-действия — только по явной команде PO.
