# TZ-VERIFY-VM52-SSH-REMAINDER-2026-09-13: два пункта VERIFY, требующих LAN/SSH до VM .52

> **SIZE:** XS · **PACK:** single
> **РОЛЬ АГЕНТА:** QA-валидатор / Ops-verificator (read-only)
> **ЗАВИСИМОСТИ:** после `TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52` (checklist `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md`, вердикт WARN)

**CONFLICT KEYS:** нет (read-only, отчёт в новый файл)

## Контекст

Основная VERIFY (`docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md`) выполнена почти
полностью, включая核 E2E enroll через свежий инвайт (PASS) — но исполнитель работал в сессии
**без сетевого доступа к LAN 192.168.1.52** (`ssh ... tiit@192.168.1.52` → `Connection timed out`,
даже без sandbox-ограничений). Всё, что можно было проверить через публичный origin
(`https://kppdf-crm.ru`), проверено и подтверждено (см. evidence того TZ). Остались ровно два пункта,
которые *обязательно* требуют shell на VM:

1. **Sha256-сверка секретов** (TZ п.6.3): `ADMIN_PASSWORD` / `JWT_SECRET` / `JWT_REFRESH_SECRET` в
   `/opt/kppdf-8.0/.env` на VM должны совпадать (по хэшу, без вывода значений) с
   `deploy/synology/config.env` локально.
2. **Прямая проверка tunnel unit** (TZ п.4.2): `systemctl is-active kppdf-tunnel` на VM → `active`
   (публичный health/ready косвенно подтверждает, что туннель жив, но литеральная команда не
   выполнялась).

Заодно можно закрыть литеральные VM-localhost варианты п.3.1/4.1 (curl на `localhost:3000` с самой
VM), если исполнитель уже там — не обязательно, эквивалент через публичный origin уже подтверждён.

## ЧТО ДЕЛАТЬ

Выполнять **из окружения, у которого реально есть маршрут до LAN 192.168.1.52** (домашняя сеть PO,
или сессия, запущенная непосредственно там) — не эта cloud/executor-сессия.

1. `ssh -i ~/.ssh/kppdf80-vm tiit@192.168.1.52 "systemctl is-active kppdf-tunnel"` → ожидание `active`.
2. На VM посчитать sha256 трёх значений из `/opt/kppdf-8.0/.env` (`ADMIN_PASSWORD`, `JWT_SECRET`,
   `JWT_REFRESH_SECRET`) — **не печатать значения**, только хэши. Аналогично посчитать sha256 тех же
   трёх переменных из локального `deploy/synology/config.env`. Сравнить попарно.
3. Результат (PASS/FAIL по каждому из двух пунктов + хэши, без значений) дописать как раздел
   `## SSH remainder check` в `docs/agent-checklists/VERIFY-2026-09-13-ENROLL-DEPLOY.md`
   (или новый файл `docs/agent-checklists/VERIFY-2026-09-13-SSH-REMAINDER.md`, на усмотрение
   исполнителя) + evidence.
4. Если расхождение хэшей — **не ротировать секреты**, зафиксировать как WARN-факт для PO.
5. Если оба PASS — общий вердикт основной VERIFY можно поднять с WARN до PASS (обновить статус в
   исходном checklist).

## ФАЙЛЫ

**ИЗМЕНЯТЬ:** только отчётные артефакты (см. выше).
**НЕ ИЗМЕНЯТЬ:** product-код, deploy-скрипты, секреты не ротировать.

## known_limitation

- Если и в этой сессии нет маршрута до 192.168.1.52 — тот же блокер повторится; тогда это делает
  только PO вручную или сессия, запущенная физически в домашней сети.
