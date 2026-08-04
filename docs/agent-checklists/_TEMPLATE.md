# Checklist template — kppdf executor

> Скопируй в `docs/agent-checklists/<TASK-ID>.md` **до первой правки кода**.  
> Канон: `GEMINI.md` § Claim · `docs/AI-AGENT-GUIDE.md` § Бронь · audit `docs/audits/2026-08-04-agent-ops-claim-gaps.md`

```md
# <TASK-ID> checklist

> Status: **RESERVED** | **CLAIMED / IN PROGRESS** | **READY FOR REVIEW** | **DONE**
> Marker: `tasks/_active/<TASK-ID>.md` (должен существовать, пока не archive)
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(стабильный id агента / модели)_
- claimed_at: _(ISO-8601, напр. 2026-08-04T19:09:30Z)_
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable _(почему)_

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [ ] TZ / канон / deps прочитаны
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/<TASK-ID>.md` на месте

## Acceptance

- [ ] …из TZ…

## Gates (факт)

- команды + PASS/FAIL

## Executor report

- что сделано / conflict disclosure / known limits

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (CATALOG / DICT / …)
- [ ] **Не** archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
```

### Timestamps

| Поле | Когда |
|------|--------|
| `claimed_at` | момент CLAIM, до кода |
| READY FOR REVIEW date | когда gates зелёные |
| `closed_at` (archive) | после Cursor PASS / PO PASS |
