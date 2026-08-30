# TZ-OPS-NX-start-fast-path: faster repeat `node start.mjs --nx`

**РОЛЬ:** executor  
**DEP:** TZ-OPS-NX-start-diagnostics PASS  
**CONFLICT KEYS:** `start.mjs`; `docker-compose.yml` (mongo healthcheck only)

## Цель

Ускорить повторный локальный запуск без изменения product behavior.

## Зона

- `start.mjs`
- `docker-compose.yml` (mongo healthcheck)
- `scripts/start-fast-path-*.mjs` (tests/helpers)
- task artifacts

## Не менять

- `backend/**`, `frontend/**`, `frontend-nx/**`
- API/порядок зависимостей
- `--stop`, `--reset`, legacy start без `--nx`

## AC + gates

See user prompt gates + `node --test scripts/start-fast-path.test.mjs`.
