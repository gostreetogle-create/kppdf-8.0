# TZ-NX-DEALS-D3-COUNTERPARTIES checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DEALS-D3-COUNTERPARTIES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T01:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на deals-ключи
- [x] TZ / канон / deps прочитаны: `tasks/_ready/nx-deals/TZ-NX-DEALS-D3-COUNTERPARTIES.md`, backend `counterparty.controller.ts`/DTO/schema (проверил полный CRUD существует), `docs/pages/counterparties.page.md` (legacy FullEditor SoT)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DEALS-D3-COUNTERPARTIES.md` на месте

## Acceptance

- [x] `/counterparties` не 404; список из API (`PiCounterpartiesService.list`)
- [x] Create/edit/delete работают (BE полный CRUD существовал — не read-only, escalate не потребовался)
- [x] `nx build kppdf-web` PASS

## Integrity slot

- [x] Тип изменения: новая page + расширение data-access client (CRUD methods)
- [x] FIC: page.md обновлён (см. ниже); остальные N/A (нет новых permission/RBAC — backend `@Roles('admin','manager')` уже существовал на create/update/delete, не менял)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/counterparties.page.md` — новая секция «NX thin CRUD (D3)» (legacy-секция не тронута/не переписана)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Baseline PASS (D1/D2 чистые)
- [x] Нет другого `tasks/_active/*` с пересекающимися путями (`pages/counterparties/**`, `app.routes.ts`)
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test data-access --testPathPattern=pi-counterparties → PASS (5/5, новые CRUD-методы)
pnpm exec nx test kppdf-web --testPathPattern="counterpart" → PASS (12 новых: form-dialog 4 + list-page 8)
pnpm exec nx test kppdf-web --testPathPattern="app-shell.component.spec" → PASS (2 теста обновлены под новый /counterparties роут — легитимный nav-chip, не регрессия)
pnpm exec nx lint kppdf-web / data-access → 0 ошибок в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- `PiCounterpartiesService` расширен: `create`/`update`/`remove` (было только `list`/`getById`). Типы `CreateCounterpartyPayload`/`UpdateCounterpartyPayload` — тонкий payload (name/inn/roles/phone?/email?), не полный legacy `CreateCounterpartyDto` (banking/signer/legalType и т.д. остаются недоступны из NX UI, как и требовало «НЕ: полный EAV»). `Counterparty` тип расширен полями, которые реально возвращает API (`inn`, `phone`, `email`, `roles`, `isActive`, `innIsStub`) — раньше в NX было только `_id`/`name`/`shortName`.
- Новая страница `counterparties-list.page.ts` + диалог `counterparty-form-dialog.component.ts` (thin: Название/ИНН/Телефон/Email; `roles` дефолтится к `['customer']` на create, сохраняется как есть на edit — тот же дефолт, что у backend `quickCreateParty`, не изобретён).
- Route `/counterparties` добавлен в `app.routes.ts` (моя зона). Nav-пункт «Заказчики» (категория «Клиенты») уже был описан в `nav-categories.ts`, но фильтровался как несуществующий роут — теперь появляется автоматически, правка `nav-categories.ts` не потребовалась.
- **Побочный фикс (ожидаемое поведение, не баг):** `app-shell.component.spec.ts` жёстко проверял точное число видимых quicknav-чипов (5→теперь 6, 4→теперь 5) — обновил тест на новую легитимную реальность (категория «Клиенты» теперь видна) вместо игнорирования; добавлен `clientsQuickNav()` helper по аналогии с admin/registries/docs.
- **Known limits (по TZ «НЕ»):** полный legacy EAV-редактор (банк/подписант/легал-тип/справочник ролей), sites CRUD, `/desk` — не портированы.
- Conflict disclosure: чужой WIP Freebuff (`tasks/_active/TZ-NX-REGISTRIES-WORK-TYPES.md`) в дереве, не staged, не трогал.

## Review handoff

- [x] READY FOR REVIEW — WAVE-NX-DEALS
- Archive без отдельного Cursor Verdict (Executor-only wave, как D1/D2)

## Closeout

- archive сразу вслед за отчётом — переходим к D4.
