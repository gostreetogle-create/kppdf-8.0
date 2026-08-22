# TZ-UI-404 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UI-404.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T12:50:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `tasks/_active/` пуст перед claim, конфликтов нет
- [x] TZ / канон / deps прочитаны (`pi-group-workspace.component.ts`, `proposal-create.page.ts`,
      `contracts.page.ts`, `warehouse-group-chips.ts` — уже канонический toc-паттерн)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-404-group-workspace-toc-parity.md` на месте
- [x] Domain preflight (grep все 4 SECTION_CHIPS consumers) — совпадает со скоупом TZ

## Acceptance

- [x] 9 страниц (`/counterparties`, `/people`, `/products`, `/modules`, `/materials`,
      `/catalog/appearance`, `/supply`, `/shipping`, `/production`, `/work-types`) рендерят
      чёрную TOC-строку через `[toc]`/`tocActiveId` — confirmed live in browser (CDP smoke)
- [x] Золотая chips-строка пустая на этих 9 страницах (`[chips]="emptyChips" activeId=""`) —
      confirmed live: `goldChipsCount === 0` on all 9
- [x] Сделки/Заказы/Договоры/Склад не тронуты (не в diff)
- [x] Навигация между siblings работает, active id подсвечивается верно — confirmed live:
      correct `aria-current="page"` + `bg-ink text-paper` on the matching tocId per route
- [x] `data-test` не сломаны (group-toc/group-chips рендерятся условно самим shared-компонентом,
      unchanged) — `production-cockpit.page.spec.ts`/`supply.page.spec.ts` still green

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (template attribute + local field, 10 файлов) + docs (4 chip-файла comment fix)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP/capability, только смена
      chip-row классификации на существующих страницах
- [x] page.md / PAGE-TZ-INDEX: N/A — не меняет UI contract/route, только визуальную chrome-строку
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (products.page.ts/modules.page.ts —
      staged только мои хунки через `git add -p`, чужой lightbox-import-removal не тронут;
      material/module/product/order-detail.page.ts, pi-breadcrumb*.component.ts,
      supply-quick-order.component.ts — чужой WIP другой TZ, не тронуты и не staged)
- [x] Coupling map: N/A — не меняет статус/FK/общее поле, только chip row source
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS** (0 errors)
- `cd frontend && pnpm test -- counterparties people products modules materials catalog-appearance supply shipping production work-types` →
  **420/424 PASS**; 4 failures all in `production-read.facade.spec.ts` (Gantt bars fetch/cache
  timing, unrelated file, not touched by this TZ — confirmed pre-existing by running that spec
  in isolation, same 4/6 failures reproduce with zero relation to group-workspace/toc).
- `cd frontend && pnpm lint` → **PASS** (0 errors; 18 pre-existing `no-implements-oninit-in-pages`
  warnings across many unrelated pages, not introduced by this TZ)
- `pnpm architecture:check` → **PASS** (979 files; baseline 6; resolved since baseline: 0)
- Browser primary: `node scripts/tz-ui-404-toc-parity-smoke.mjs` against live `pnpm start` (4200)
  + `pnpm start:dev` backend (3000) — see Executor report for result

## Executor report

- 4 группы (Клиенты/Каталог/Снабжение/Цех) переведены с `[chips]` (золото) на `[toc]`
  (чёрный), золотая строка оставлена пустой (`emptyChips`), ровно по образцу
  `contracts.page.ts`/`proposal-create.page.ts`.
- `catalog-appearance.page.ts` подтверждён как sibling «Каталога» (уже смешивал
  `...CATALOG_SECTION_CHIPS` + себя в одном ряду) — включён в TOC тем же паттерном.
- Browser primary (`node scripts/tz-ui-404-toc-parity-smoke.mjs`, headless Chrome CDP,
  admin login, все 10 маршрутов) — **PASS 0 failures**: TOC-строка присутствует, активный
  пункт получает `bg-ink text-paper` + `aria-current="page"`, золотая chips-строка пустая
  на каждом маршруте. Отчёт: `reports/TZ-UI-404-toc-parity-smoke.json`, скриншот
  `reports/TZ-UI-404-counterparties-toc.png`.
- Conflict disclosure: `products.page.ts`/`modules.page.ts` содержали чужой uncommitted
  hunk (удаление неиспользуемого `PiPhotoLightboxComponent` импорта) — staged выборочно
  через `git add -p`, чужой хунк не тронут и не закоммичен. Параллельно другой агент вёл
  WIP по `*-detail.page.ts`/`pi-breadcrumb*.component.ts` (похоже на successor из
  breadcrumb-аудита TZ-UI-403) — файлы не пересекаются с этим TZ, не тронуты.
- known_limitation: dark-theme визуально делает `bg-ink` активного TOC-пункта малоконтрастным
  на тёмном фоне страницы (виден в основном по подчёркиванию/цвету текста) — идентично
  уже принятому поведению `contracts.page.ts`/`proposal-create.page.ts` (тот же class
  binding), не новый дефект этой TZ.

## Review handoff

- [x] READY FOR REVIEW зафиксирован в checklist
- [x] Review diff выполнен; acceptance PASS

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22T13:35:00+03:00
