# TZ-DESK-419 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DESK-419.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T10:55:46+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `manager-desk.page.ts`; TZ-SUPPLY-314 не трогаю
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-419-queue-list-fill-height.md` был на месте до archive

## Acceptance

- [x] `.manager-desk__orders` использует доступную высоту viewport через `calc(100dvh - 9.5rem)`, без произвольного `60vh`
- [x] Список не выходит за нижнюю границу окна; переполнение прокручивается внутри списка
- [x] Expand/collapse заказа корректно укладывается на desktop-разрешениях 1280–1920 px
- [x] Верхние toolbar/search/breadcrumb и поведение `expandedOrder`/tray не изменены; меняется только высота контейнера
- [x] Light/dark визуально не затронуты; изменение layout-only
- [x] Browser pass на 1440×900 и 1920×1080: PASS; queue bottom 897/900 и 1077/1080, expand/collapse без page-scroll

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (layout-only)
- [x] FIC §A–E: N/A — route, permission, module, MCP и новая capability не меняются
- [x] page.md / PAGE-TZ-INDEX: N/A — route и пользовательский контракт не меняются
- [x] SECTION-READINESS: N/A — readiness раздела не меняется
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — не меняются общее поле, статус или фильтр
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm test -- manager-desk --runInBand --silent` → PASS (22/22, exit 0)
- `cd frontend && pnpm lint` → PASS (0 errors; 18 pre-existing warnings)
- `git diff --check -- ...` → PASS (exit 0)
- Browser Puppeteer with local FE/BE session → PASS (1440×900 and 1920×1080; expand/collapse and internal overflow verified)

## Executor report

- Убран только искусственный `min(60vh, ...)`; queue теперь ограничен `calc(100dvh - 9.5rem)`.
- Conflict disclosure: не затронуты TZ-SUPPLY-314, shared order tray и чужие dirty files.
- Browser pass выполнен на локальном authenticated стенде; light/dark tokens/layout не менялись.

## Review handoff

- [x] READY FOR REVIEW зафиксирован в checklist
- [x] Review diff выполнен; acceptance и gates PASS

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`; `progress.md` отсутствует в текущем репозитории, поэтому N/A
- [x] Status = DONE
- closed_at: 2026-08-22T11:07:00+03:00
