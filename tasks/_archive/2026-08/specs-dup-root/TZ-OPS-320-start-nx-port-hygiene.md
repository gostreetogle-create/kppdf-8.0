# TZ-OPS-320: start.mjs — nx frontend port hygiene (Windows)

**РОЛЬ АГЕНТА:** executor (Freebuff / локальный)  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** ops (`start.mjs` root)  
**CONFLICT KEYS:** `start.mjs`

## ИСХОДНОЕ СОСТОЯНИЕ

PO: `node start.mjs --nx` — backend поднимается, frontend «всё ещё ждём…» 60s+ и сессия обрывается. Ручной `pnpm exec nx serve kppdf-web --port=4201` в `frontend-nx/` работает за ~3s.

Воспроизведено Cursor:

1. Если порт **4201 занят** (ручной `nx serve` или зомби), spawn из `start.mjs` печатает:
   `Port 4201 is already in use. Would you like to use a different port? (Y/n)` и **висит** (stdio piped, нет TTY).
2. `node start.mjs --stop` итерирует **все** ключи `.start.pids.json`, включая `startedAt` (ISO-строка) → ложный `taskkill` и **не убивает** сиротский `nx serve` вне PID-файла.
3. Health-check frontend: HTTP 2xx на `localhost:4201` — ложноположительный, если старый dev-server уже слушает порт, пока новый child завис на prompt.

Файлы: `start.mjs` (spawn ~L1215, stop ~L1093–1108, `waitFor` ~L430).

## ЧТО ДЕЛАТЬ

1. **stop:** убивать только числовые pid по ключам `backend` | `frontend`; игнорировать `startedAt` и прочие meta.
2. **Перед spawn (шаг 5):** освободить порты `3000` и `FRONTEND_PORT` (4200 legacy / 4201 nx) — Windows: `netstat -ano` + `taskkill /PID … /F` для LISTEN; Unix: `lsof`/`fuser`. Лог: `освобождён порт 4201 (pid …)` или `порт свободен`.
3. **Nx spawn:** вместо голого `pnpm start` — `pnpm exec nx serve kppdf-web --port=<FRONTEND_PORT>`; env child: `CI=1` (отключить интерактив при конфликте порта → fail fast, не prompt).
4. **Health (опционально, если ≤15 строк):** для frontend проверять body содержит `<app-root` или `kppdf-web` — отсечь случайный HTTP на порту.
5. **Док:** одна строка в help `start.mjs --nx`: «если frontend завис — закройте ручной nx serve на :4201 или `node start.mjs --stop`».

## ИЗМЕНЯТЬ

- `start.mjs`

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**`, `backend/**`, `docker-compose.yml`

## КРИТЕРИИ ПРИЁМКИ

1. `node start.mjs --stop` не пытается kill по `startedAt`.
2. При занятом :4201 (ручной `nx serve`) повторный `node start.mjs --nx --no-browser`:
   - либо освобождает порт и стартует за <60s;
   - либо явная ошибка «порт 4201 занят» без интерактивного зависания.
3. Чистый старт: backend + frontend ready, `http://localhost:4201/kit/overview` открывается.
4. Регрессия legacy: `node start.mjs --no-browser` (без `--nx`) — :4200 как раньше.

## CLAIM

```
agent_id: freebuff-ops-320
claimed_at: <ISO-8601>
```
