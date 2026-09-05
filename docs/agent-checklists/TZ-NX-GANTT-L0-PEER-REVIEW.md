# TZ-NX-GANTT-L0-PEER-REVIEW checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-GANTT-L0-PEER-REVIEW.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T04:39:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] `git status` → main; только чужой `TZ-NX-GANTT-G7-SMOKE-DOCS.md` в `_active/` (Freebuff, frontend-nx) — не пересекается
- [x] SoT прочитан: `TZ-NX-GANTT-L0-PEER-REVIEW.md`, спеки `production-gantt-studio-spec.md` + `production-cockpit.page.md`
- [x] Claim slot заполнен

## Сделано

### Review (`docs/audits/2026-09-05-gantt-nx-l0-peer-review.md`)

Прочитаны G3–G6 diffs + текущее состояние `production-cockpit.page.ts`,
`gantt-bars.component.ts`, `production-read.facade.ts`, `gantt-bar.model.ts`,
`gantt-workers-view.spec.ts` против legacy spec/page.md. 5 пунктов «matches
legacy» подтверждены фактами (path:line), 3 findings (1×P0, 1×P1, 1×P2).

**P0 (backend, исправлен в этом TZ):** `patchEstimateDays`/`patchEstimateStart`
читали заказ через unscoped `findByIdRaw` (`Model.findById` без organizationId);
единственная защита — `OrgScopeGuardInterceptor`, который фильтрует ОТВЕТ
**после** обработчика — для записи `doc.save()` уже случился к этому моменту.
Cross-org write возможен (пользователь одной организации мог изменить
estimate-days/start заказа другой, получив 404 в ответ, но запись уже сохранена).
Не регрессия G3-G6 (код старше), но точно тот класс бага, который TZ разрешала
чинить напрямую.

**Фикс:** `order.controller.ts` — оба endpoint'а теперь берут `@CurrentUser()`
и передают `organizationId`; `order.service.ts` — новый `assertOrgAccess()`
(тот же bypass-паттерн, что `ProductService.organizationFilter`: нет org ни у
кого — legacy/system, пропустить), вызывается сразу после `findByIdRaw`, до
любой мутации. 4 новых regression-теста (cross-org reject + save() не вызван;
same-org allow — для обоих endpoint'ов). **Проверено на старом коде:**
`git stash` фикса → тест-файл **не компилируется** (TS2554: неверное число
аргументов) — даже более строгое доказательство, чем runtime fail.

**Blast radius запаркован:** тот же паттерн (unscoped find + только post-hoc
interceptor) есть в `update()` (тот же путь, что использует plannedDate/priority
из Ганта!), `patchLineBoardLane`, `patchModuleLane`, `setItemStatus` — чинить
их всех не входит в разрешённый «≤1 файл» mini-fix этого TZ; нужен отдельный
backend security TZ.

**P1 (finding, FE, не патчил):** `refitRangeAfterShift` виджет только
`rangeStart` на более раннем сдвиге; сдвиг ВПЕРЁД (forward plannedDate drag /
start-offset) никогда не расширяет `rangeEnd` — полоса может отрендериться за
пределами сетки timeline (нет grid/scale колонок позади неё). Подтверждено:
ОБА existing теста (`deltaDays: -3/-7` и «starts before rangeStart») тестируют
только «раньше» направление — асимметрия в реализации ТОЧНО совпадает с
асимметрией в покрытии тестами.

**P2 (finding, FE, не патчил):** `gantt-workers-view.spec.ts` claims read-only
guarantees «покрыто компонентными тестами» — grep не находит НИ ОДНОГО реального
теста на `canResizeBar`/`canMoveBar`. Сам guard в продуктовом коде корректен
(проверено прямым чтением) — это test-hygiene пробел, не runtime баг.

### Successor TZ

`tasks/_ready/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.md` — P1 fix + P2 test,
FE-only, с предложенным диффом и acceptance criteria.

## Integrity slot

- [x] Тип изменения: backend security bugfix (P0) — без нового route/permission/module; FIC N/A
- [x] Чужой WIP не в коммите (Freebuff G7 на `frontend-nx` не тронут)

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1169 tests (incl. 4 new)
cd backend && pnpm lint  → PASS, 0 errors
```

## Executor report

- Review нашёл 5 «matches legacy» подтверждений + 1 P0 (исправлен + тест) +
  1 P1 + 1 P2 (оба — findings + successor TZ, без FE-патчей, как требовала TZ).
- P0 — реальная, эксплуатируемая cross-tenant уязвимость на запись, не
  косметика; исправлена узко (2 endpoint'а), более широкий blast radius
  задокументирован и запаркован отдельным пунктом.
- Не тронул `frontend-nx/.../production/**` — конфликт с Freebuff G7 отсутствует.

## Review handoff

- [x] Готово к архивации
