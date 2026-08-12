# TZ-SALES-368 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-SALES-368.done.md`
> Commit/push: **YES** (executor continuous; deploy НЕ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-12T17:43:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-SALES-368; sync tasks first) — Claim slot = source of truth

## Preflight

- [x] git fetch + checkout main + pull --ff-only → HEAD `e9605cd2`
- [x] `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на `proposal-create.page.ts`
- [x] TZ / канон (`2026-08-12-kp-output-gates-canon.md`) / PO-DIARY §1–§4 прочитаны
- [x] Conflict keys: page.ts / spec.ts / page.md / _active-map — только они и тронуты
- [x] Не тронуты: Desktop, BE PDF engine, table-editor

## Acceptance

- [x] Печать при готовом превью без фирмы → print path, без `canSaveDraft`/save/pendingOutput
- [x] Тост «Дождитесь готового превью и выберите нашу фирму» **не** показывается на Печать
- [x] Печать без превью → короткий тост «Превью листа ещё не готово.» (без слова «фирма»)
- [x] PDF/Архив: есть draft id → сразу; нет id и `canSaveDraft()` → save затем вывод; иначе свой тост «Для PDF/архива нужны шаблон, готовое превью и наша фирма»
- [x] FE tsc + proposal-create.page.spec.ts PASS
- [x] page.md: строка канона вывода + successor авто-PDF на Принято/Оплачено

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage` → PASS 41/41
- `git diff --check` → PASS

## Executor report

- `requestOutput` разведён: print свободный (sync, без save); pdf/archive через draft id → save → отдельный тост
- Autosave write-path не тронут (print его больше не форсит)
- TZ-366 print helper (`printCurrentPreview` → temp iframe) — только вызов, не правлен
- known_limitation/successor: авто-PDF на статусах — отдельная TZ после стабилизации статусов на Все КП
