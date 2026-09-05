# TZ-NX-DEALS-D4-CONTRACTS-THIN checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DEALS-D4-CONTRACTS-THIN.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T02:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на deals-ключи
- [x] TZ / канон / deps прочитаны: `tasks/_ready/nx-deals/TZ-NX-DEALS-D4-CONTRACTS-THIN.md`, backend `modules/contract/*` (schema/controller/DTO — подтвердил, что create требует `organizationId`+`customerId`+`items[]`, не thin-form fit), `docs/pages/contracts.page.md` (legacy реестр SoT)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DEALS-D4-CONTRACTS-THIN.md` на месте

## Acceptance

- [x] `/contracts` список из API; TOC кликабелен (chip «Договоры» разблокирован из D1 disabled-состояния)
- [x] Карточка открывается (`/contracts/:id`)
- [x] `nx build kppdf-web` PASS

## Integrity slot

- [x] Тип изменения: новая page (read-only) + новый data-access client
- [x] FIC: page.md обновлён; остальные N/A (нет новых permission — read-only GET эндпоинты, RBAC не менял)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/contracts.page.md` — новая секция «NX thin CRUD (D4, read-only)», заменяет устаревшую пометку «successor / PARK»
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Baseline PASS (D1–D3 чистые)
- [x] Нет другого `tasks/_active/*` с пересекающимися путями (`pages/contracts/**`, `app.routes.ts`, `deals-group-chips.ts`)
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test data-access --testPathPattern=pi-contracts → PASS (3/3, новый клиент)
pnpm exec nx test kppdf-web --testPathPattern="contract" → PASS (79 suites, 490 passed, 0 failed; 8 новых тестов: list 4 + detail 4)
pnpm exec nx lint kppdf-web / data-access → 1 self-introduced warning (unused RouterLink import в contract-detail.page.ts) найден и убран → 0 в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- Новый read-only client `PiContractsService` (`list`/`getById` только) + типы `Contract`/`ContractItem`/`ContractsListParams` в `libs/data-access/src/lib/sales/`. **Осознанно не** `create`/`update`/`sign`/`attach` — `CreateContractDto` требует `organizationId`+`customerId`+`items[]` заранее (не thin-form fit, как и предвидел TZ «минимум list+detail»), а sign/attach/activate — отдельный юр.workflow (файл-аплоад multipart), явно исключённый TZ («НЕ: PDF editor», «Не строить полный юр. workflow»).
- Новые страницы `contracts-list.page.ts` (chrome через D1 `PiGroupWorkspaceComponent`/`DEALS_TOC_CHIPS`, tocActiveId=`contracts`) и `contract-detail.page.ts` (номер/статус/заказчик/КП/позиции/сумма).
- `app.routes.ts`: добавлен `/contracts` (list) + `/contracts/:id` (card).
- `deals-group-chips.ts`: чип «Договоры» разблокирован — убран `disabled: true`, поставленный в D1 как reserved-id заглушка.
- Docs: `docs/pages/contracts.page.md` — заменил устаревшую пометку «NX UI /contracts: successor / PARK» на полноценную секцию «NX thin CRUD (D4, read-only)» с явным known_limitation (create/sign/attach остаются backend-only).
- Conflict disclosure: чужой WIP Freebuff в дереве (registries/work-types), не staged, не трогал.

## Review handoff

- [x] READY FOR REVIEW — WAVE-NX-DEALS
- Archive без отдельного Cursor Verdict (Executor-only wave, как D1–D3)

## Closeout

- archive сразу вслед за отчётом — переходим к D5 (последний TZ волны).
