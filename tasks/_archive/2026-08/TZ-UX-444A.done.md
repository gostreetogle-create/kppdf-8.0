# TZ-UX-444A: PiStatusBanner — полоса жизненного цикла (kit + заказ)

PAGES: `/orders/:id` ; `/kit/overview`
PAGE_DOCS: orders.page.md (если есть order-detail секция) ; kit docs / AI-UI-CONTRACT

РОЛЬ АГЕНТА: Frontend Component Engineer  
ЗАВИСИМОСТИ: Нет (disjoint с DOC-443 / 444B)  
LAYER: 2

### Preflight Check Output
- **Context read:** `docs/audits/2026-08-26-legacy-erp-ux-patterns-audit.md` §5.3+§8; `error-banner.component.ts`; `order-detail.page.ts` (статус = FactCard); `docs/AI-UI-CONTRACT.md`; `docs/ui-rules.md`
- **Key Constraints:** Paper & Ink tokens only; не ErrorBanner; не Dialog/Toast; плотность — наша, не вендорская высота
- **Planned Deliverable:** `app-pi-status-banner` + adoption на order-detail + строка в AI-UI-CONTRACT / ui-rules
- **Validation Path:** FIC N/A (нет нового route) · kit/docs · jest · tsc · lint

CONFLICT KEYS:
`frontend/src/app/shared/ui/status-banner/`;
`frontend/src/app/shared/ui/status-banner/pi-status-banner.component.ts`;
`frontend/src/app/shared/ui/status-banner/pi-status-banner.component.spec.ts`;
`frontend/src/app/shared/ui/status-banner/index.ts`;
`frontend/src/app/pages/orders/order-detail.page.ts`;
`frontend/src/app/pages/orders/order-detail.page.spec.ts`;
`docs/AI-UI-CONTRACT.md`;
`docs/ui-rules.md`

## Domain preflight

- **Проверено:** Order.status = draft|confirmed|in_production|ready|shipped|delivered|cancelled.
- **Проверено:** ErrorBanner = transient load error; lifecycle strip = постоянный элемент страницы.
- **НЕ:** product-detail / material-detail (волна 444C); desk tray; styles.css токены; история цены.

## ИСХОДНОЕ

На `order-detail` статус только в FactCard. Легаси — full-width полоса («Черновик», «в разработке»). Примитива нет.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Компонент `app-pi-status-banner`

Новый standalone OnPush в `shared/ui/status-banner/`:

- Inputs: `tone: 'warning' | 'info' | 'destructive' | 'neutral'`; `message: string`; optional `actionLabel` + `action` output.
- Визуал: full-width контентной колонки; `hairline`; soft bg через токены (`bg-warning/10` / `bg-info/10` / `bg-destructive/10` / paper-2); текст `text-sm`; без shadow/gradient/rounded-lg.
- `role="status"` (не alert, если не destructive emergency).
- `data-test="pi-status-banner"`.
- Экспорт через `index.ts`.

### ШАГ 2 — Order detail

Сразу под chrome / перед fact-stack (или сразу под title):

| status | tone | message (RU) |
|--------|------|----------------|
| draft | warning | Черновик — заказ ещё не подтверждён |
| cancelled | destructive | Заказ отменён |
| confirmed / in_production / ready | info | краткий RU label статуса (без простыни) |
| shipped / delivered | neutral | краткий RU — или **скрыть** баннер (предпочтительно скрыть для terminal success, оставить FactCard) |

Правило: баннер **обязателен** для `draft` и `cancelled`; для остальных non-terminal — info полоса ок; terminal shipped/delivered — без баннера (бейдж/fact достаточно).

Мелкий FactCard «Статус» можно оставить (дубль ок на этой волне) или убрать value если баннер закрывает — **предпочтительно оставить FactCard**, баннер = акцент.

### ШАГ 3 — Документация kit

Строка в `docs/AI-UI-CONTRACT.md` + `docs/ui-rules.md` таблица примитивов: когда StatusBanner vs ErrorBanner vs Toast.

### ШАГ 4 — Тесты

- Unit: tones render; message; optional action click.
- order-detail.spec: draft → banner warning; cancelled → destructive; shipped → нет banner.

## НЕ ИЗМЕНЯТЬ

- `product-detail` / `module-detail` / `material-detail`
- `styles.css` (новые hex запрещены)
- DOC-443 / KP-443 / desk / supply
- Backend

## КРИТЕРИИ ПРИЁМКИ

1. Примитив в shared; импорт без сырого HTML-баннера на order-detail.
2. draft/cancelled — видимая полоса; light+dark читаемы.
3. AI-UI-CONTRACT + ui-rules обновлены.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
5. `cd frontend && pnpm exec jest src/app/shared/ui/status-banner src/app/pages/orders/order-detail.page.spec.ts --no-coverage --runInBand`
6. `cd frontend && pnpm lint` на изменённых файлах (0 новых errors)

## Archive

`tasks/_archive/2026-08/` + checklist + PAGE-TZ-INDEX.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-26T20:44:27+03:00
closed_by: claude (Buffy executor)
source_task: tasks/TZ-UX-444A-status-banner.md
protected_files:
  - frontend/src/app/shared/ui/status-banner/status-banner.component.ts
  - frontend/src/app/shared/ui/status-banner/status-banner.component.spec.ts
  - frontend/src/app/shared/ui/status-banner/index.ts
  - frontend/src/app/pages/orders/order-detail.page.ts
  - frontend/src/app/pages/orders/order-detail.page.spec.ts
  - frontend/src/app/pages/kit/kit-overview.page.ts
  - docs/AI-UI-CONTRACT.md
  - docs/ui-rules.md
  - docs/pages/orders.page.md
  - docs/pages/PAGE-TZ-INDEX.md
verification:
  - acceptance criteria: PASS (scoped implementation and DOM regressions)
  - frontend typecheck: PASS (tsc exit 0)
  - focused tests: PASS (2 suites / 23 tests)
  - changed-file ESLint: PASS; owned Prettier: PASS; diff-check: PASS
  - development build: PASS
  - full lint/test/token/architecture checks: baseline residuals only, documented in checklist and _NOW
  - browser smoke: partial; route guard reached /login, local backend login returned HTTP 500
  - checklist: UPDATED at docs/agent-checklists/TZ-UX-444A.md
  - operational status: SYNCHRONIZED in docs/agent-checklists/_NOW.md and tasks/QUEUE-LIVE.md
  - deploy/wipe: NOT RUN
