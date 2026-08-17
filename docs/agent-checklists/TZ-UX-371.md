# TZ-UX-371 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-371.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `freebuff-gpt-5.6-luna`
- claimed_at: `2026-08-17T18:45:28+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room CLI не предоставлен

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Ветка `main`; `git fetch origin` + `git checkout main` + `git pull --ff-only` выполнены
- [x] `_NOW.md` + `tasks/_active/` прочитаны; чужого активного claim нет
- [x] TZ / GEMINI.md / PO-CANON / GIT-POLICY прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-371.md` создан до product-кода

## Acceptance

- [x] Expanded order row — плоский, без вложенных boxy-контейнеров
- [x] Expanded row использует `bg-paper-2`, `hairline`, `text-ink` и semantic tokens для light/dark
- [x] Заголовки секций используют `.eyebrow`, `border-b hairline`, увеличенный интервал
- [x] Кнопка раскрытия строки становится `bg-gold` в раскрытом состоянии, с RU aria-label и ▸/▾
- [x] Бизнес-логика, API и модели не изменены

## Integrity slot

- [x] Тип изменения: page + shared table presentation
- [x] FIC §A–E: применимо к UI; business/API/data-model изменения отсутствуют
- [x] page.md / PAGE-TZ-INDEX: N/A — отдельный индекс для этой страницы не найден
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — статусы/общие поля не меняются
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- [x] `cd frontend && pnpm exec jest --config jest.config.js src/app/pages/orders/orders.page.spec.ts src/app/shared/ui/pi-table.component.spec.ts --runInBand` — PASS (2 suites / 44 tests)
- [x] `cd frontend && pnpm run build` — PASS (exit 0; существующие budget warnings)
- [x] ESLint owned files — PASS (0 errors; 1 pre-existing `OnInit` warning)
- [x] `git diff --check` owned files — PASS; repository-wide warnings принадлежат чужому dirty WIP

## Executor report

- Expanded order summary переведён на плоскую Paper & Ink разметку: `bg-paper-2`, gold accent, semantic hairlines, `.eyebrow`, `space-y-8`.
- `PiTable` получил read-only disclosure control в первой ячейке только для таблиц с `expandedRow`; клик использует существующий `rowClick`, write-path не добавлен.
- Добавлен regression assertion в OrdersPage на `bg-gold` и aria-состояние.
- Conflict disclosure: до claim в дереве были чужие изменения в seed/data/catalog/production/docs; они не stage/commit.
- Known limit: build оставляет существующие Angular budget warnings; deploy запрещён и не выполнялся.

## Review handoff

- [x] Self-review diff + focused tests выполнены
- [x] Готово к closeout; отдельный Cursor Verdict в TZ не требовался

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: `2026-08-17T18:50:09+03:00`
