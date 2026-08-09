# TZ-OPS-302 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-OPS-302.md` (создать при CLAIM)
> Source: `tasks/_backlog/ops/TZ-OPS-302-project-memory-pack.md`
> Commit/push: после DONE — scoped; чужой WIP не трогать

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id: _(заполнить при CLAIM)_
- claimed_at: _(ISO-8601)_
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [ ] `_active-map` + `tasks/_active/` — нет чужого CLAIM на keys 302
- [ ] Прочитал WAVE + audit + TZ-OPS-302
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-OPS-302.md` на месте

## Acceptance

- [ ] `docs/PROJECT-MEMORY.md` ≤140 строк, 6 секций
- [ ] GUIDE §1.2 ссылается на PROJECT-MEMORY до ARCHITECTURE
- [ ] GEMINI.md включает PROJECT-MEMORY
- [ ] how-to-connect-ai ссылается на PROJECT-MEMORY
- [ ] Нет product code diff

## Integrity slot (docs-only)

- [ ] Тип: docs-only
- [ ] FIC §A–E: N/A (нет page/permission/module/MCP)
- [ ] page.md / PAGE-TZ-INDEX: N/A
- [ ] SECTION-READINESS: N/A
- [ ] Чужой WIP не в коммите

## Gates

- команды из TZ Verification + PASS/FAIL

## Executor report (auto)

_(заполнить перед archive, ≤15 строк)_

## Closeout

- [ ] archive + progress + удалить `_active` + Checkpoint `_active-map`
- [ ] Status = DONE
- closed_at:
