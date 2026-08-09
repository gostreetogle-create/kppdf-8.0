# TZ-SALES-317 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-SALES-317.md` (создаёт исполнитель при CLAIM)
> Commit/push: по `kppdf-executor-loop` после PASS
> TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-317-create-kp-focus-shell.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(заполнит исполнитель)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [ ] `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys
- [ ] Прочитаны: TZ-SALES-317, `docs/ux/kp-create-studio-spec.md` v2, audit `2026-08-09-kp-create-studio-layout-audit.md`
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-SALES-317.md` на месте

## Acceptance

- [ ] Нет H1 «Создать КП» и zone-titles; жёлтый chip активен
- [ ] Default desktop: оба icon-rail свёрнуты
- [ ] Left cascade ≥2 панели; click-outside + Escape закрывают
- [ ] Right flyout с inspector; default closed
- [ ] Нет document scroll от списка товаров; A4 fit viewport / top-aligned
- [ ] draftLines add из rail работает (регресс 314 нет)
- [ ] Page doc обновлён

## Gates (факт)

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] `cd frontend && pnpm test -- --testPathPattern=proposal-create`

## Review handoff

- [ ] READY FOR REVIEW
- [ ] **Не** archive до Cursor/PO PASS (visual layout)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_

## Executor report (auto)

_(заполняет исполнитель перед archive; ≤15 строк)_
