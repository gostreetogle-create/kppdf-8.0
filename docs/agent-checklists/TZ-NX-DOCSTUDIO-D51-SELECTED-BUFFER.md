# TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T12:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] D50 DONE (тот же диф, тот же файл) — прочитан целиком перед правкой
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.md` на месте

## Acceptance

- [x] Пустой буфер понятен — muted «Ничего не выбрано — добавьте товары или укажите клиента»
- [x] После «Добавить» на Товарах — счётчик/список в «Выбрано» обновляется (badge = сумма catalog-чипов `count` + число заполненных party-якорей; спек проверяет 1 anchor + 2 продукта = badge «3»)
- [x] Build PASS

## Integrity slot

- [x] Тип изменения: page (frontend-nx UI IA)
- [x] FIC: page.md — отложено до D54 (единая точка)
- [x] Чужой WIP не в коммите
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (79 suites, 501 passed, 0 failed)
pnpm exec nx lint kppdf-web → 0 ошибок в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- «Выбрано»: пустое состояние (`studio-selected-empty`, muted RU copy) когда нет ни anchors, ни catalog chips; иначе — существующий список chips (не дублирую write-path, те же `catalogRemove` emitter).
- TOC badge на «Выбрано» = **число позиций**: `selectedAnchors().length + Σ catalogChips[].count` (не число групп-чипов) — так буквально просил TZ («catalog counts + заполненные party fields»); нашёл и исправил свою же первую попытку (сумма `.length` вместо `.count`) через failing test до правки кода.
- Не менял resolver / `context` API — только видимость и подсчёт на чистом presentational input.

## Review handoff

- [x] READY FOR REVIEW — WAVE-DOCSTUDIO-DATA-IA
- Archive без отдельного Cursor Verdict

## Closeout

- archive сразу — переходим к D52 (insert suggest, самый сложный шаг волны).
