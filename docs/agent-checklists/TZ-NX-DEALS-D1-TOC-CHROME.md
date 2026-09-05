# TZ-NX-DEALS-D1-TOC-CHROME checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DEALS-D1-TOC-CHROME.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на deals-ключи (только `TZ-NX-GANTT-G14-BAR-ASSIGNEE.md`, production zone, не пересекается)
- [x] TZ / канон / deps прочитаны: `tasks/_ready/nx-deals/TZ-NX-DEALS-D1-TOC-CHROME.md`, `docs/agent-checklists/WAVE-NX-DEALS.md`, `docs/agent-checklists/PARALLEL-SLOTS-2026-09-05.md`, legacy `deals-group-chips.ts` + `pi-group-workspace.component.ts` (legacy), NX port `libs/features/src/lib/pi-group-workspace.component.ts`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DEALS-D1-TOC-CHROME.md` на месте

## Acceptance

- [x] `/orders` и `/proposals` показывают один TOC «КП | Договоры | Заказы» (`DEALS_TOC_CHIPS`, `pages/deals-group-chips.ts`)
- [x] Eyebrow/заголовок зоны = «Сделки» на обеих (proposals eyebrow сменён с «Коммерция»)
- [x] Клик TOC навигирует (routerLink на активных чипах; «Договоры» — disabled span, id зарезервирован для D4)
- [x] `nx build kppdf-web` PASS + focused tests (orders-list/proposals-list/pi-group-workspace specs зелёные)
- [x] Inset: chrome не давит текст к рамке — `group-body` уже даёт `--panel-content-inset`; убран дублирующий `px-panel-inset` на `<main>` обеих страниц (оставлен `py-6`)

## Integrity slot

- [x] Тип изменения определён: page (frontend-nx UI chrome)
- [x] FIC: page.md обновлены для orders/proposals (chrome секция актуализирована/подтверждена) — остальные §FIC N/A (нет новых permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/orders.page.md` (chrome секция уже была верной — подтверждена), `docs/pages/proposals.page.md` (обновлена ссылка chip КП → `/proposals`, актуализирован жёлтый ряд)
- [x] SECTION-READINESS N/A (нет нового раздела/доступа)
- [x] Чужой WIP не в коммите — Freebuff registries/work-types WIP (production/registries) не staged
- [x] Coupling map N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` — PASS (перед правками, кэш подтвердил чистое состояние)
- [x] Нет другого `tasks/_active/*` с пересекающимися `apps/kppdf-web/src/app/pages/{orders,proposals}/**` (только G14, production zone)
- [x] Закрытие: `nx build kppdf-web` — **последняя** команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test features --testPathPattern=pi-group-workspace   → PASS (12/12)
pnpm exec nx test kppdf-web --testPathPattern="orders-list.page.spec|proposals-list.page.spec" → PASS (70 suites, 448 passed, 7 skipped)
pnpm exec nx run-many -t lint -p kppdf-web,features → FAIL (33 pre-existing errors, ALL outside touched files — Doc Studio a11y + registries work-type dialog; none in orders/proposals/deals-group-chips/pi-group-workspace)
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- Новый `frontend-nx/apps/kppdf-web/src/app/pages/deals-group-chips.ts` — `DEALS_TOC_CHIPS` (КП→/proposals, Договоры→/contracts disabled, Заказы→/orders).
- `libs/features/src/lib/pi-group-workspace.component.ts`: добавлено optional `GroupChip.disabled` — TOC-чип рендерится как non-navigating `<span aria-disabled="true">`, а не `<a>` (нужно для «Договоры», чья страница ещё не существует — D4).
- `orders-list.page.ts` / `proposals-list.page.ts`: обёрнуты в `<app-pi-group-workspace [toc]="toc" tocActiveId="…" [chips]="[]" activeId="">`; убран дублирующий `px-panel-inset` на `<main>` (group-body уже даёт inset). Proposals eyebrow «Коммерция» → «Сделки». Жёлтый ряд (`chips`) пуст на обеих страницах — на заказах CTA нет, на КП существующая кнопка «Создать в студии» остаётся единственной (без дубля).
- **Инфра-фикс (blocking, вне зоны Deals но нужен, чтобы вообще протестировать shared-компонент):** `libs/features/jest.config.ts` был на голом `ts-jest`/`testEnvironment: node` без Angular preset — юнит-тест `pi-group-workspace.component.spec.ts` падал на `SyntaxError: Cannot use import statement outside a module` (import `@angular/core` esm) при любом запуске, включая baseline до моих правок (проверено `git stash`). Поправил под тот же паттерн, что `libs/data-access`/`libs/ui/paper-and-ink` (`jest-preset-angular` transform + `transformIgnorePatterns` + новый `src/test-setup.ts` с `setupZoneTestEnv`). Conflict keys TZ явно разрешают опциональную правку `libs/features pi-group-workspace`.
- Тесты: добавлен TDD-кейс `renders a disabled TOC chip as non-navigating text` в `pi-group-workspace.component.spec.ts` (red → green до/после реализации `disabled`). `orders-list.page.spec.ts` + `proposals-list.page.spec.ts`: добавлен `{ provide: AuthService, useValue: { user: () => null } } }` во все setup-блоки (компонент теперь инжектит `AuthService` через `PiGroupWorkspaceComponent`).
- Docs: `docs/pages/proposals.page.md` chrome-строка — chip «КП» теперь ведёт в `/proposals` (не `/proposals/create`, как раньше ошибочно писал docs); жёлтый ряд описан как пустой (существующая кнопка «Создать в студии», без нового gold-ряда). `docs/pages/orders.page.md` chrome-секция была уже верна — не менял.
- **Known limits / D4 handoff:** «Договоры» — disabled chip, `route: '/contracts'` зарезервирован; при появлении `/contracts` в D4 достаточно убрать `disabled: true` из `DEALS_TOC_CHIPS`.
- Conflict disclosure: в дереве есть чужой WIP Freebuff (`tasks/_active/TZ-NX-REGISTRIES-WORK-TYPES.md`, `pages/registries/**`) — не staged, не трогал.

## Review handoff

- [x] READY FOR REVIEW — WAVE-NX-DEALS (peer Claude уже accepted; PO defaults приняты)
- Archive допустим без отдельного Cursor Verdict — TZ не требует review-gate явно (Executor-only wave), но при необходимости PO может затребовать PASS до archive.

## Closeout

- archive после подтверждения (или сразу, т.к. TZ не требует отдельного PASS) — см. следующий шаг D2.
