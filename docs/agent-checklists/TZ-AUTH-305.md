# TZ-AUTH-305 checklist

> Status: **IN PROGRESS — PREP ONLY** (deploy blocked)
> Marker: `tasks/_active/TZ-AUTH-305.md`
> Commit/push: **NO deploy**; prep-docs commit allowed

## Claim slot

- agent_id: Buffy (prep) — rollout executor TBD (needs SSH + PO)
- claimed_at: 2026-08-13T22:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no (room task registry stale)

## Plan (prep only — «до команды»)

1. Описать целевую nginx-политику `auth_request` + rollback (Шаг 1 из TZ).
2. Проверить, что `auth_request` путь только через `internal` location; `/api` без Basic/HTML challenge.
3. Зафиксировать честно: device barrier закрывает UI/login, API остаётся сетево достижимым (JWT/pairing).
4. Заполнить checklist до состояния «готово к деплою», НЕ переключая nginx.

## Acceptance (для актуального переключения — НЕ выполнено, ждёт PO)

- [ ] Основной UI без Basic popup.
- [ ] Неизвестный браузер не видит `/login` и ERP.
- [ ] Одноразовая ссылка подключает компьютер без Basic и без app-пароля.
- [ ] Устройство помнится 365 дней; отдельный revoke.
- [ ] `/api` без Basic/auth_request redirect; JWT/`kppd_` работают.
- [ ] Rollback возвращает Basic без wipe и без отката БД.
- [ ] `nginx -t` PASS · preflight.ps1 PASS · incognito+active+revoked smoke PASS · Desktop/MCP smoke PASS · evidence без secret.
- [ ] Cursor/PO PASS.

## BLOCKERS (стоп, не деплой)

- PO не сказал явно «деплой» в текущем чате.
- Нет Cursor/PO browser PASS по новому flow (A–E smoke).
- Переключение требует SSH на VPS `193.222.62.240` (секреты в gitignored `CREDENTIALS.md`).

## Executor report (auto)

- Prep: см. `docs/ops/home-host-access.md` §4.1 (nginx auth_request политика + rollback) и `deploy/synology/DEPLOY.md` §15b (rollout/rollback runbook).
- Deploy НЕ выполнялся.
