# TZ-SALES-317 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-SALES-317.done.md`
> Commit/push: closeout only (Cursor Verdict PASS visual shell)
> TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-317-create-kp-focus-shell.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T02:56:45Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-SALES-317; registry not synced)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (`_active/` был empty)
- [x] Прочитаны: TZ-SALES-317, `docs/ux/kp-create-studio-spec.md` v2, audit `2026-08-09-kp-create-studio-layout-audit.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-317.md` на месте

## Acceptance

- [x] Нет H1 «Создать КП» и zone-titles; жёлтый chip активен (chrome не тронут)
- [x] Default desktop: оба icon-rail свёрнуты
- [x] Left cascade ≥2 панели; click-outside + Escape закрывают
- [x] Right flyout с inspector; default closed
- [x] Нет document scroll от списка товаров; A4 fit viewport / top-aligned (CSS contain)
- [x] draftLines add из rail работает (регресс 314 нет)
- [x] Page doc обновлён

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `cd frontend && pnpm test -- --testPathPattern=proposal-create` → PASS 7/7

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS (visual shell) — 2026-08-09 orchestrator

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-09T09:52:00Z

## Executor report (auto)

- Overlay RMK принят PO («уже красота») — LOCK в spec §0 + page doc
- Flush: пустой `group-tools` скрыт (`:not(:has(*))`); Create КП `flushBody`; studio height `100vh - 7.25rem`
- Left: Шаблон + Товары; panels absolute; center fixed
- Gates: tsc + jest proposal-create + pi-group-workspace
- Closeout: Cursor PASS → archive `tasks/_archive/2026-08/TZ-SALES-317.done.md`
