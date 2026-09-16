# TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE: полный прогон + починка до green

> **SIZE:** L · **PAGES:** orders, home · **PAGE_DOCS:** `docs/pages/orders.page.md`, `docs/pages/home.page.md`  
> **РОЛЬ:** Executor (claude) — VERIFY + FIX до green · **LAYER:** 3  
> **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/**`; `frontend-nx/libs/features/src/lib/order-workspace/**`; `frontend-nx/libs/features/src/lib/order-hub/**`; `frontend-nx/apps/kppdf-web/src/app/pages/home/**`; `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`; `scripts/**` (smoke only); `docs/audits/2026-09-15-order-workspace-verify.md`; `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md`

### Preflight
- **Context:** `docs/audits/2026-09-15-order-workspace-mockup-audit.md`; `WAVE-NX-ORDER-WORKSPACE.md` (6/6 DONE); `GEMINI.md`; `docs/TZ-NX-BUILD-INTEGRITY.md`
- **Wave SHAs must be ancestors:** `d07a2112` `11f10ce6` `1e6524bb` `1d76170b` `0af6d942` `d8fa10d6` (+ home CTA `6f0eeb79`)
- **Necessity:** PO will do visual QA only after agent proves green — да

## ЦЕЛЬ

Довести контур **Order Workspace + Home edit CTA** до состояния «можно смотреть глазами»: все релевантные тесты/build зелёные; найденные баги в scope — починить; live smoke (если backend доступен) — PASS или честный WARN с причиной среды.

## ЧТО ДЕЛАТЬ

### 1. Claim + baseline
- `_active` пуст → claim этот TZ
- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` — если red, чинить on-path до продолжения

### 2. SHA / archive evidence
- Таблица 6 WS + home CTA: ancestor of HEAD? archive `.done.md` exists?

### 3. Automated gates (чинить до PASS, цикл)
Повторять fix→re-run пока не green (в CONFLICT KEYS; чужой WIP не трогать):

```bash
cd frontend-nx
pnpm exec nx test kppdf-web --testPathPattern="order-detail|orders-list|home.page" --skip-nx-cache
pnpm exec nx test features --testPathPattern="order-workspace|order-hub-tray" --skip-nx-cache
pnpm exec nx test data-access --testPathPattern="pi-orders" --skip-nx-cache
pnpm exec nx build kppdf-web
cd ../backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- --testPathPattern="order" --passWithNoTests
cd .. && pnpm architecture:check
```

Lint: 0 **new** errors в своих файлах; baseline fail вне scope — задокументировать, не раздувать.

### 4. Live smoke (если возможно)
Если локально/VM поднимается NX+API:
- Login → `/home` → expand row → видна «Редактировать заказ» → `/orders/:id`
- На карточке: секции Шапка/Состав/Исполнение/Логистика/Документы; chips; add/qty или ready на draft; kit-reserve dialog opens; ship button state honest
- Скрипт опционально: `scripts/tz-verify-order-workspace-smoke.mjs` (создать если нет) + screenshots в `reports/`
- Нет LAN/API → **WARN среда**, не FAIL продукта; не выдумывать PASS smoke

### 5. Fix policy
- Баги в order-workspace / order-detail / home CTA / pi-orders wrappers / specs — **чинить полностью** в этой TZ
- Scope creep (studio god, supply residual, PARK audit/print) → отдельный deferred TZ в `_ready`, не тащить
- Нет новых backend endpoint’ов без крайней необходимости; если нужен — disclose + минимальный

### 6. Closeout
- Audit: `docs/audits/2026-09-15-order-workspace-verify.md` (таблица area|PASS/FAIL/WARN|evidence)
- Update `_NOW.md` + WAVE tracker note VERIFY
- Archive этот TZ; commit: код-фиксы отдельно от docs verify если оба есть
- **Не deploy** без явной команды PO

## НЕ
- Deploy / Wipe / SSH
- React mockup port
- PARK.md фичи
- Чужой dirty WIP в commit
- Объявлять PASS без зелёных gates п.3

## AC
1. Все команды п.3 — PASS (или documented skip с причиной только для BE pattern passWithNoTests если 0 tests — но tsc обязателен).
2. `nx build kppdf-web` PASS last.
3. Audit файл с verdict **VERIFY PASS** (или **PASS + WARN smoke env**).
4. `_active` empty after archive.
5. Отчёт PO: одной строкой verdict + что смотреть глазами на `/orders/:id`.

### known_limitation
Visual/UX polish после PO screen — successor TZ, не этот прогон.
