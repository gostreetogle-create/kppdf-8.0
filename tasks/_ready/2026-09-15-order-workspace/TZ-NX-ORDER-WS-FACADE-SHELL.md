# TZ-NX-ORDER-WS-FACADE-SHELL: facade + thin page skeleton

> **SIZE:** L · **PAGES:** orders · **PAGE_DOCS:** `docs/pages/orders.page.md`  
> Audit: `docs/audits/2026-09-15-order-workspace-mockup-audit.md`

**РОЛЬ:** Executor frontend-nx · **LAYER:** 3  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-detail.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-detail.page.spec.ts`; `frontend-nx/libs/features/src/lib/order-workspace/**`; `frontend-nx/tsconfig.base.json` (secondary path); `docs/pages/orders.page.md`

### Preflight
- **Context read:** audit; `order-detail.page.ts`; `order-hub` facade pattern; `pi-orders.service.ts`; `docs/TZ-NX-BUILD-INTEGRITY.md`
- **Проверено:** page thin today; no order-workspace lib yet; Order GET populate exists
- **Necessity:** оператор не может работать с заказом на thin card — да

## ИСХОДНОЕ
`order-detail.page.ts` — loading/error + banner + заказчик/объект + flat items + КП + isPaid. Нет секций/facade.

## ЧТО ДЕЛАТЬ

### 1. Lib skeleton
- Создать `libs/features/src/lib/order-workspace/` + `index.ts`
- Secondary path `@kppdf/features/order-workspace` (как doc-studio / order-hub)
- `OrderWorkspaceFacade` (Signals): `bind(host)`, load `getById`, signals `order/status/error/paid`, methods stub `reload()`, `setPaid()` (уже живой PATCH), placeholders для later TZ
- `providers: [OrderWorkspaceFacade]` **на page**, не `providedIn:'root'`

### 2. Thin page shell
- Page: inject facade, load by route `:id`
- Layout slots (empty section hosts OK): header / composition / execution / logistics / documents
- Eyebrow `Сделки`, h1 `Заказ №{{number}}` (или «Заказ» пока loading)
- Keep existing loading/error/`PiStatusBanner` status
- Keep isPaid wiring via facade (не regress)
- **Не** добавлять demo rails / scenario switcher

### 3. Specs + docs
- Spec: facade provided on page; load success path
- `orders.page.md`: target workspace + lib path (коротко)

## НЕ
- Полный UI секций (TZ 2–6)
- Backend schema
- Hub tray changes
- unitPrice / audit

## AC
1. Lib + secondary path; page imports facade from features path (or local then move — предпочтительно сразу в features).
2. providers page-scoped.
3. Existing paid toggle + load still work.
4. Visible section placeholders with short RU titles: Состав / Исполнение / Логистика / Документы (можно `pi-dashed-panel` «скоро в волне» **запрещено** — лучше пустой host без disabled CTA).
5. `nx build kppdf-web` LAST PASS; focused specs PASS.
6. Archive + commit своих файлов.

### Gates
```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=order-detail --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
