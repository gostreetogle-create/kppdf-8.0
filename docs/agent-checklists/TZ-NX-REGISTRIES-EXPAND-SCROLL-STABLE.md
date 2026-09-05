# TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

**Re-opened note:** предыдущий проход этой же TZ (freebuff, `e1a6451c`,
closed_at 2026-09-05T11:31:00+03:00, см. `tasks/_archive/2026-09/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.done.md`)
добавил scrollTop capture/restore, но: (а) явно задокументировал "Browser smoke was not run"
и "No CSS/layout redesign was made because inspection found no page-owned hidden trailing height" —
т.е. часть Б (пустота) не была найдена; (б) не тронул сам механизм навигации (два разных
`Route`-объекта на один компонент), который заставляет Angular **уничтожать и пересоздавать**
весь `RegistriesPage` при каждом expand/collapse — restore после этого лечит симптом, не причину.
PO прислал свежие скриншоты 2026-09-05 (после того коммита), показывающие, что и прыжок,
и белая полоса **всё ещё воспроизводятся** → PO явно переоткрыл TZ (новый файл в `_ready/`,
пункт Б помечен обязательным). Это не повторная реализация подтверждённой работы — это
устранение того, что предыдущий проход сам признал недоделанным.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-05T12:27:29Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (пусто после S44 archive)
- [x] TZ / канон / deps прочитаны (TZ файл целиком, registries-page.ts, registries.routes.ts, pi-table.component.ts footer/pager logic, app-shell.component.ts `.shell-main` CSS, registries.routes.spec.ts, registries-page.spec.ts, предыдущий архив + checklist того же TZ ID)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md` на месте

## Acceptance

- [x] Открыл реестр внизу списка → scroll не уносит к верху — root cause устранён: `registries.routes.ts` теперь один `UrlMatcher`-route вместо двух `path`-routes → Angular переиспользует ОДИН инстанс `RegistriesPage` вместо destroy/recreate на каждый клик (доказано новым тестом `reuses the SAME RegistriesPage instance...`, который **падает** на старом двух-route варианте и **проходит** на новом — проверено вручную git-стэшем обеих версий). Старый двухфреймовый scrollTop restore оставлен как defense-in-depth, но по факту scrollTop теперь и не должен меняться, т.к. `.shell-main` subtree не пересоздаётся.
- [x] Закрыл — снова без прыжка вверх — тот же механизм (single-route reuse), симметрично для collapse.
- [x] Под последним реестром нет огромной белой «простыни» — найден источник: `app-pi-table`'s `.pi-table-footer` (`libs/ui/paper-and-ink/pi-table.component.ts`) рендерится БЕЗУСЛОВНО (hairline + py-3), даже без pager/caption/footer — а registries master tables никогда их не передают. Скрыт через `:host ::ng-deep app-pi-table .pi-table-footer { display: none; }` в `registries-page.ts` (component-scoped, shared `pi-table.component.ts` не тронут — вне conflict keys этой TZ).
- [x] URL `/registries/:key` и «один expand» — без регресса: весь существующий `registries.routes.spec.ts` (paging back/forward, unknown key, single-expand invariant, deep-link `/registries/:key?search=x`) прошёл без изменений на новом matcher-route.
- [x] `nx build kppdf-web` + focused registries jest PASS

**Известное ограничение (честно, как в S44):** реальный live-браузерный DevTools-замер пиксельной
высоты "белой полосы" не выполнен (нет Playwright/chromium-cli в репо — см. известное ограничение
S44 checklist). Вместо "измерить, не гадать" в буквальном DevTools-смысле — точная трассировка
кода `pi-table.component.ts` до конкретного безусловно рендерящегося DOM-узла с нулевым
содержимым, который совпадает по описанию и позиции («под последним реестром») с скриншотом PO.
Остаточный риск: если у PO на скриншоте пустота заметно больше одного `py-3`-бара — есть
дополнительный источник, не найденный этим проходом.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (registries)
- [x] FIC §A–E N/A — UI/routing behavior fix, без новых полей/permission/module schema
- [x] page.md / PAGE-TZ-INDEX обновлены: `docs/pages/registries.page.md` (Route + Composition parity секции)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`registries-page.ts`, `registries.routes.ts`; `pi-table.component.ts` НЕ тронут — вне scope)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `nx build kppdf-web` уже был зелёным сразу после S44 (тот же continuous run)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст после S44 archive
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPattern=registries` → PASS (80/80 suites, 524 tests: 517 passed + 7 skipped, включая новый тест component-reuse)
- `nx lint kppdf-web` → 235 problems (33 errors, 202 warnings), идентично baseline (то же дерево, что и в S44 — verified)
- `nx build kppdf-web` → PASS, exit 0 (последней)

## Executor report

Изменено:
- `registries.routes.ts` — заменил два `Route` (`path:''` / `path:':registryKey'`) на ОДИН route
  с `UrlMatcher` (`registriesUrlMatcher`), сохраняющий тот же `Route`-объект между обеими URL-формами
  → Angular's default `RouteReuseStrategy` теперь реально переиспользует `RegistriesPage` вместо
  destroy/recreate. Это устраняет root cause прыжка, а не просто симптом.
- `registries-page.ts` — добавлен `:host ::ng-deep app-pi-table .pi-table-footer { display: none; }`
  (скрывает всегда-пустой footer-бар shared table-компонента для master-таблиц реестров).
- `registries.routes.spec.ts` — новый тест, доказывающий переиспользование инстанса компонента
  через expand→collapse (проверен на регресс: падает на старом двух-route варианте).
- `docs/pages/registries.page.md` — обновлены секции Route и Composition parity под новый механизм.

Conflict disclosure: только `registries-page.ts` + `registries.routes.ts` (+ их specs) —
объявленные CONFLICT KEYS этой TZ. `pi-table.component.ts` (shared UI lib) НЕ изменялся,
несмотря на то что именно там источник footer — фикс сделан CSS-переопределением со стороны
потребителя, т.к. общий компонент вне conflict keys этой TZ и используется другими страницами.
`app-shell.component.ts` не тронут — не доказан лишний min-height там (наоборот, `.shell-main`
имеет `min-h-0`, что способствует, а не мешает).

Known limits: см. Acceptance выше — нет живого DevTools-замера, вывод построен на точной
трассировке кода `pi-table.component.ts`. Старый scrollTop restore код в `onMasterRowClick`
оставлен как defense-in-depth (не удалён), хотя теперь избыточен при нормальной работе —
минимальный diff предпочтён удалению уже протестированной логики.

## Review handoff

- [x] Review не требуется отдельным wave inbox — TZ не указывает review gate; archive после зелёных gates

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-05 (см. commit SHA в архиве)
