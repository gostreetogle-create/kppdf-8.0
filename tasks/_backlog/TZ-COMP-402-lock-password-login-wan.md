# TZ-COMP-402: путь A — пароль owner не с улицы

> **Park до закрытия COMP-401.** PO выбрал A (без VPN). Device-компьютеры не задеты.
> Закрывает remaining дыру: `POST /api/auth/login` с интернета.

РОЛЬ: ops nginx. DEPENDENCIES: TZ-COMP-401 DONE.

CONFLICT KEYS: VPS `/etc/nginx/sites-available/kppdf-proxy` (location `/api/auth/login` only)

ЧТО: с WAN отдавать 404/403 на `POST /api/auth/login`; разрешить с LAN `192.168.1.0/24` (и localhost). Device enroll/session/status не трогать. `/api` целиком auth_request **не** включать (сломает Desktop).

НЕ: wipe, VPN, FE login page logic кроме уже сделанного в 401.

AC: с интернета POST login → не 401 JSON приложения, а отказ nginx; с enrolled device cookie UI работает; Desktop pairing жив.

PO выдаёт отдельно после 401.
