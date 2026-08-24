# TZ-KP-BIND-513: подстановка org/клиента/КП в build preview и PDF

PAGES: `/proposals/create` ; `/doc-constructor/builder/:id`
PAGE_DOCS: kp-workspace.page.md ; builder.page.md
РОЛЬ АГЕНТА: executor (Claude terminal / `agent_id: claude`)
ЗАВИСИМОСТИ: TZ-KP-BIND-512 DONE (registry labels). Параллельно с TZ-KP-BIND-514 — другие keys.
LAYER: backend (primary) + smoke FE wiring check
CONFLICT KEYS: `backend/src/modules/document-template/document-template.service.ts` (только bag/substitute/mergeDraft); `backend/src/modules/document-template/document-template.service.spec.ts` или e2e build spec; опционально `proposal-workspace-draft.service.ts` (только если build body не доходит)

## Domain preflight

- **Проверено:** PO-CANON — Organization = наша фирма; Counterparty = клиент/покупатель.
- **Проверено:** KP workspace шлёт `organizationId`, `counterpartyId`, `proposalNumber`, dates в `buildPreview()` ([proposal-workspace-draft.service.ts](frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-draft.service.ts) ~1300–1327).
- **Проверено:** BE `resolveSourceIds()` уже грузит org/counterparty по id ([document-template.service.ts](backend/src/modules/document-template/document-template.service.ts) ~1303–1323), но **draft-поля КП** (`proposalNumber`, dates, totals) попадают в bag **только** через `renderQuotationTerms()` — alias `{{client_name}}`, `{{kp_number}}` **не работают в теле шаблона**, только в блоке условий (~952–975).
- **Проверено:** `substitute()` regex `\{\{\s*([\w.]+)\s*\}\}` (~1817) — ломается если TipTap разорвал токен span-ами (primary fix = TZ-DOC-525 atomic node; здесь — minimal legacy fallback).
- **WIP conflict:** `document-template.service.ts` может быть dirty (photo-column WIP). Менять **только** методы bag/substitute/merge — не трогать photo/table continuation WIP hunks. Перед commit: `git diff document-template.service.ts` — только ожидаемые строки.

## ИСХОДНОЕ СОСТОЯНИЕ

PO smoke 2026-08-24:

1. В КП выбрана «Наша фирма» в Параметрах — в iframe шапка без `{{organization.name}}` / пустое имя.
2. Выбран клиент — `{{counterparty.*}}` в шаблоне не заполняется.
3. В конструкторе колонка с `{{organization.name}}` — в editor/preview первая строка пустая (TipTap + нет build preview в builder — частично DOC-525).

## ЧТО ДЕЛАТЬ

### 1. BE — `mergeDraftContextIntoBag(dto, bag)` (новый private)

После `resolveSourceIds()` + `applyIssuerOrganization()` в `build()` (~655–656), слить в bag:

- `bag.proposal` (или `bag.quotation` stub без DB id) с полями из `BuildDocumentDto`:
  - `number` ← `dto.proposalNumber`
  - `date` ← `dto.proposalDate`
  - `validUntil` ← `dto.validUntil`
  - `total` ← `dto.totalPrice`
  - `prepaymentPercent`, `productionDays`, `deliveryDays` ← `dto.dealTotals`
- Top-level aliases для `substitute()` (как в terms, ~952–975):
  - `client_name` ← counterparty.name
  - `kp_number` ← proposalNumber
  - `total_price`, `date`, `valid_until`, `prepayment_percent`, `production_days`, `delivery_days` — formatted через существующие `formatValue` helpers

`substitute()` must resolve `{{client_name}}` и `{{organization.name}}` одинаково надёжно.

### 2. BE — legacy TipTap fallback (minimal, не primary)

Добавить `normalizeSubstitutionHtml(html: string): string` — **только** перед `substitute()`:

- strip tags **между** `{`, `}`, `.` внутри token-like sequences (conservative regex)
- не ломать обычный HTML контент
- покрыть unit test: `'<span>{{organization</span><span>.name}}</span>'` → resolves when bag has org

Primary path для новых токенов — TZ-DOC-525 (atomic node); здесь — не блокировать legacy templates.

### 3. BE — counterparty render shape

Убедиться что `bag.counterparty.name` доступен после enrich (~1522–1537). Если counterparty lean doc uses `shortName` only — map `name` fallback.

### 4. FE smoke (read-only unless gap found)

- `buildPreview()` уже шлёт ids — **не менять** если POST body в Network содержит `organizationId` + `counterpartyId`.
- Если не шлёт — минимальный fix в `proposal-workspace-draft.service.ts`.

### 5. Tests

- Unit: `mergeDraftContextIntoBag` — `{{client_name}}`, `{{kp_number}}`, `{{organization.name}}` substitute non-empty
- Unit: TipTap-split token fallback
- Extend e2e [document-templates-build.e2e-spec.ts](backend/test/e2e/document-templates-build.e2e-spec.ts): build with `counterpartyId` + body `{{counterparty.name}}`; build with `proposalNumber` + `{{kp_number}}`

## ИЗМЕНЯТЬ

- `backend/src/modules/document-template/document-template.service.ts` — bag merge, substitute pipeline, normalize helper
- `backend/src/modules/document-template/document-template.service.spec.ts` (create if missing focused describe)
- `backend/test/e2e/document-templates-build.e2e-spec.ts` — 1–2 cases
- `docs/agent-checklists/TZ-KP-BIND-513.md` — checklist
- `progress.md` — краткая строка
- `tasks/QUEUE-LIVE.md` — NEXT/DONE row

## НЕ ИЗМЕНЯТЬ

- Photo column / table continuation / orientation WIP hunks в `document-template.service.ts`
- `data-field-picker-dialog.component.ts` (BIND-514)
- Builder TipTap atomic node (DOC-525)
- Registry labels (512 done)

## КРИТЕРИИ ПРИЁМКИ

1. POST `/document-templates/:id/build` с `organizationId` + template body `{{organization.name}}` → HTML содержит имя org, **нет** сырого `{{organization.name}}`.
2. То же с `counterpartyId` + `{{counterparty.name}}` / `{{client_name}}`.
3. `proposalNumber` + `{{kp_number}}` в body → номер в HTML.
4. Legacy split-token HTML test passes.
5. Gates:

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm exec jest --testPathPattern="document-template" --no-coverage
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm architecture:check
```

6. Archive: `tasks/_archive/2026-08/TZ-KP-BIND-513.done.md`; очистить `tasks/_active/TZ-KP-BIND-513.md`.

## PO smoke (глазом после deploy/local)

- `/proposals/create?new=1` → Параметры → выбрать нашу фирму → превью: реквизиты с именем.
- Клиент → выбрать контрагента → в шаблоне с `{{counterparty.name}}` имя видно.
