# TZ-OPS-301 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-OPS-301.md` (создать при CLAIM)
> Commit/push: **NO** unless PO says so
> TZ: `tasks/_backlog/ops/TZ-OPS-301-quiet-dev-boot-logs.md`
> Review: **да** — archive только после Cursor/PO PASS

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(заполнить)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] `_active-map` + `tasks/_active/` — нет чужого CLAIM на `main.ts` / `start.mjs`
- [ ] Прочитал TZ-OPS-301 (keep WARN TZ-248; не глушить HTTP access logs)
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-OPS-301.md` на месте

## Acceptance

- [ ] Нет Nest DI-спама (`InstanceLoader` / `dependencies initialized` / Starting Nest…) при обычном старте
- [ ] Bootstrap URL/Health (+ Swagger) видны
- [ ] TZ-248 weak-secret WARN остаётся (короткий admin password)
- [ ] `NEST_BOOT_VERBOSE=1` или `LOG_LEVEL=debug` возвращает verbose boot
- [ ] Proxy ECONNREFUSED до backend ready подавлен в `start.mjs`
- [ ] `.env.example`: `LOG_LEVEL=info` + комментарий
- [ ] Не stage чужой dirty (icons, FE pages, MCP WIP)

## Gates (факт)

- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [ ] `node --check start.mjs`
- [ ] (опц.) cold start evidence → `docs/agent-checklists/evidence/TZ-OPS-301.txt`

## Executor report

- _(после работы)_

## Review handoff

- [ ] READY FOR REVIEW
- [ ] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_

## Executor report (auto)

_(заполнить перед archive — ≤15 строк; `commit:` full SHA)_
