# WAVE — NX Sales canon S30→S39 (continuous chain)

Status: **DONE** · S30–S39 DONE · Doc Studio S16–S26 DONE

> Resume: `tasks/PROMPT-FREEBUFF-SALES-CANON-RESUME.md`
> Roadmap: `docs/architecture/nx-sales-canon-roadmap.md`

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/TZ-AUTHORING.md`, `docs/TZ-NX-BUILD-INTEGRITY.md`, `docs/architecture/MASTER-CORE.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md` §A, `docs/pages/orders.page.md`, `docs/pages/proposals.page.md`, `backend/src/modules/order/order.schema.ts`, `backend/src/modules/order/order.service.ts`, `backend/src/common/seed/currencies.seed.ts`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`
- **Key Constraints:** Mode A wrote TZ; Freebuff executor sequential; implicit `nx build kppdf-web` for FE TZ; no auto-reserve / statusOverride / KP family
- **Planned Deliverable:** S30→S39 claim→code→gates→archive→push; NX `/orders` + paid + no stub KP
- **Validation Path:** FIC §A on S34; Integrity slot; gates per TZ; `nx build kppdf-web` last on FE TZ

## Preflight

- [x] baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (exit 0; existing Angular budget warnings only)

## Chain

| # | TZ | Archive | Commit |
|---|-----|---------|--------|
| 1 | [x] S30 CURRENCY-RUB | `tasks/_archive/2026-09/TZ-NX-SALES-S30-CURRENCY-RUB.done.md` | `e7c824e7` |
| 2 | [x] S31 ORDER-PAID | `tasks/_archive/2026-09/TZ-NX-SALES-S31-ORDER-PAID.done.md` | `2a7d4a58` |
| 3 | [x] S32 SITES-ENSURE | `tasks/_archive/2026-09/TZ-NX-SALES-S32-SITES-ENSURE.done.md` | `28d8950a` |
| 4 | [x] S33 PI-ORDERS-CRUD | `tasks/_archive/2026-09/TZ-NX-SALES-S33-PI-ORDERS-CRUD.done.md` | `b0caff70` |
| 5 | [x] S34 ORDERS-LIST | `tasks/_archive/2026-09/TZ-NX-SALES-S34-ORDERS-LIST.done.md` | `851aa755` |
| 6 | [x] S35 ORDER-DETAIL | `tasks/_archive/2026-09/TZ-NX-SALES-S35-ORDER-DETAIL.done.md` | `508cf33d` |
| 7 | [x] S36 ORDER-CREATE | `tasks/_archive/2026-09/TZ-NX-SALES-S36-ORDER-CREATE.done.md` | `b48ef6b3` |
| 8 | [x] S37 QUOTATION-CONVERT | `tasks/_archive/2026-09/TZ-NX-SALES-S37-QUOTATION-CONVERT.done.md` | `8065eeeb` |
| 9 | [x] S38 STUB-KP-HIDE | `tasks/_archive/2026-09/TZ-NX-SALES-S38-STUB-KP-HIDE.done.md` | `a6d768ea` |
| 10 | [x] S39 OPERATOR-DOCS | `tasks/_archive/2026-09/TZ-NX-SALES-S39-OPERATOR-DOCS.done.md` | `a0306c2a` |

## Closeout

- [x] all [x] · `_active/` пуст · QUEUE/_NOW updated

### Completed evidence

- S30 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S30-CURRENCY-RUB.done.md` · commit `e7c824e7`
- S31 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S31-ORDER-PAID.done.md` · commit `2a7d4a58` · focused tests/typecheck/lint PASS
- S32 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S32-SITES-ENSURE.done.md` · commit `28d8950a`.
- S33 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S33-PI-ORDERS-CRUD.done.md` · commit `b0caff70`.
- S34 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S34-ORDERS-LIST.done.md` · commit `851aa755`.
- S35 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S35-ORDER-DETAIL.done.md` · commit `508cf33d`.
- S36 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S36-ORDER-CREATE.done.md` · commit `b48ef6b3`.
- S37 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S37-QUOTATION-CONVERT.done.md` · commit `8065eeeb`.
- S38 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S38-STUB-KP-HIDE.done.md` · commit `a6d768ea`.
- S39 archive: `tasks/_archive/2026-09/TZ-NX-SALES-S39-OPERATOR-DOCS.done.md` · commit pushed (see chain row).
- Wave closeout complete: all 10 chain rows [x].

## Запреты волны

- Не семья КП / не авто-резерв склада / не `statusOverride` / не Invoice
- Не deploy / wipe
- Не два TZ параллельно на `kppdf-web/src/**`
- Не завершать turn после одной TZ
