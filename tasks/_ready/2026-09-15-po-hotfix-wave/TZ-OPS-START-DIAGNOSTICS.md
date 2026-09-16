# TZ-OPS-START-DIAGNOSTICS: понятный stall + фикс false reuse :4201

> **SIZE:** S · **РОЛЬ:** Executor (Freebuff/Claude) — ops tooling · **LAYER:** 2  
> **CONFLICT KEYS:** `start.mjs`; `scripts/start-*.mjs` (если есть helpers reuse/probe); `docs/how-to-connect-ai.md` (короткая строка про `--verbose` / log path)  
> **НЕТ** `frontend-nx/**` product UI · **НЕТ** backend app logic

### Preflight
- **Факт инцидента 2026-09-15:** `node start.mjs --nx` → backend `/api/health` OK за ~15s; frontend 100s+ «всё ещё ждём»; `.start.pids.json` имел `"frontendReused": true`, `"frontend": null`, а `:4201` **не слушал** → spawn nx serve **пропущен**, wait крутился впустую.
- **Context:** `start.mjs` (`tryMarkFrontendReuse`, `waitFor`, `FRONTEND_LOG=.logs/launcher-frontend.log`)
- **Necessity:** оператор не видит этап stall — да; false reuse — security/ops fact

## ЦЕЛЬ

1. **Не врать reuse:** если пометили reused — сразу же (и каждые N сек wait) проверить HTTP; если порт/HTML мертвы → снять reuse, **spawn** nx serve, залогировать `REUSE INVALID → spawn`.
2. **Стадии в логе** (как делают нормальные launcher’ы): на каждом tick «ждём frontend» печатать **этап + улику**, не только секунды.
3. **Timeout dump:** последние 20 строк `launcher-frontend.log` + pid + port listen yes/no + hint (`node start.mjs --stop` затем `--nx`).

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Fix false reuse
- После `tryMarkFrontendReuse` / в начале wait frontend: если `frontendReused` и probe fail → `frontendReused=false`, вызвать spawn path (тот же `buildNxFrontendSpawn`), обновить pids.
- Не считать occupied port достаточным без `evaluateFrontendProbe` htmlOk (уже почти так — усилить: reused must re-validate before skipping spawn).

### ШАГ 2 — Стадии waitFor (frontend)
Минимум этапы (угадывать по log + probe):
| stage | признак |
|-------|---------|
| `spawn` | pid записан / процесс жив |
| `nx-boot` | лог есть, ещё нет «Application bundle» / «Local:» |
| `compiling` | bundle generation / webpack/esbuild lines |
| `listening` | порт :4201 LISTEN но HTTP ещё нет |
| `http-up` | HTTP 2xx |
| `ready` | probe htmlOk (Angular index) |

Каждые ~10s:  
`ждём frontend… 48s · stage=compiling · last: Application bundle generation…`  
или `stage=reuse-stale · port=4201 closed → respawning`.

Backend wait: оставить health; на tick можно `stage=nest-watch|listening|health`.

### ШАГ 3 — Итог таймингов
В конце успешного/failed start одна таблица:
```
Mongo  Xs · Backend Ys · Frontend Zs (stage timeline)
```
Писать также в `.logs/launcher-timing.json` (optional, overwrite).

### ШАГ 4 — Docs
1 абзац в `docs/how-to-connect-ai.md` или рядом ops: при зависании смотреть `.logs/launcher-frontend.log` + stage в консоли; false reuse починен этой TZ.

## НЕ
- TUI rewrite
- Менять ports 3000/4201
- pnpm install always
- Deploy

## AC
1. Симуляция/тест: если reuse=true но probe fail → реально стартует nx (unit test helper если вынесен; иначе ручной сценарий в done.md).
2. При wait >10s в консоли виден `stage=…` и last log line.
3. На timeout — dump 20 строк frontend log.
4. Happy path `node start.mjs --nx` по-прежнему доходит до ready (не ломает).
5. Archive + commit только start/docs.

### Gates
```bash
node --check start.mjs
# если есть unit на probe/reuse:
node --test scripts/start-reuse.test.mjs   # создать при выносе helpers
```
