# TZ-UI-405 checklist

> Status: **DONE** (archive 2026-08-22)
> Marker: `tasks/_active/TZ-UI-405-breadcrumb-detail-cleanup.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T13:40:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
      (в `_active/` только TZ-UI-404 — group-workspace/chips, пересечений нет;
      TZ-DESK-422 manager-desk — не трогаю)
- [x] TZ / канон / deps прочитаны (TZ-UI-405, audit 2026-08-22-breadcrumb-consistency-audit.md)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-405-breadcrumb-detail-cleanup.md` на месте

## Acceptance (из TZ)

- [x] module-detail / material-detail / order-detail — крошки в 2 уровня
      («Раздел → имя/номер»), без повторного route-сегмента; product-detail не менялся
- [x] module-detail / product-detail / material-detail — единственный back-affordance;
      ghost-кнопка «← Назад» убрана; `onBack()`/`backLabel()` оставлены (используются
      в loadError-блоке `back-button-error`)
- [x] `data-test="back-button"` встречается на странице один раз (только первая крошка
      page-chrome; `back-button-error` — другой id)
- [x] `pi-breadcrumb.component.ts` / `pi-breadcrumb-item.component.ts` помечены
      `@deprecated` в JSDoc; `/navigation` kit-демо не менялось
- [x] `builder.page.ts` — короткий комментарий про intentional exception (B-04),
      поведение не менялось
- [x] `order-detail.page.ts` — изменена только глубина крошек (п.1)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (template-only, frontend)
- [x] FIC §A–E — N/A: template-only правки существующих detail-страниц,
      нет новых routes/permissions/modules/capabilities
- [x] page.md / PAGE-TZ-INDEX обновлены (module-detail.page.md, material-detail.page.md,
      PAGE-TZ-INDEX строки 4 detail-маршрутов)
- [x] SECTION-READINESS — N/A (контур разделов не менялся)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
      (TZ-UI-404 group-workspace и TZ-DESK-422 manager-desk не тронуты)
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm test -- module-detail product-detail material-detail order-detail`
  → PASS 23/23 (3 suites), включая новый регресс-ассерт AC-3 (один `back-button`)
- `cd frontend && pnpm exec eslint <8 файлов зоны>` → PASS (0 errors)
- Browser primary: **environment-BLOCKED** — FE dev-server :4200 упал в процессе
  (чужой контур TZ-UI-404 агента, не перезапускал); BE :3000 жив, прямой
  `POST /api/auth/login` admin/admin123 → 200 с токеном, т.е. auth-среда рабочая

## Executor report

- B-02: убраны дублирующие route-сегменты крошек на module/material/order-detail
  (было 3 уровня, стало 2: «Раздел → имя/номер»); product-detail не тронут (эталон)
- B-01: ghost «← Назад» убрана с module/product/material-detail; `onBack()`/`backLabel()`
  оставлены (используются в loadError-блоке `back-button-error`); `data-test="back-button"`
  теперь только один (первая крошка page-chrome) — добавлен регресс-ассерт в material.spec
- B-03: `pi-breadcrumb`/`pi-breadcrumb-item` помечены `@deprecated` в JSDoc,
  код и `/navigation` showcase не тронуты
- B-04: комментарий «confirmed intentional exception» добавлен в builder.page.ts
  рядом с TZ-DOC-324, поведение не менялось
- Conflict disclosure: чужой WIP (TZ-UI-404) в working tree не стейджился и не коммитился
- Known limits: browser-проход не выполнен (FE сервер другого агента упал);
  покрыто jest (рендер крошек + count back-button) и статически

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-UI-405.done.md` + commit + push
- [x] Status = DONE
- closed_at: 2026-08-22T14:15:00+03:00

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (CATALOG / DICT / …) — N/A (TZ не требует review,
      решения PO уже в файле)
- [ ] **Не** archive до Cursor Verdict PASS (если TZ требует review) — N/A

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
