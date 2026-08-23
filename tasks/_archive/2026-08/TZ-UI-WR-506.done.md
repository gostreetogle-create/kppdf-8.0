# TZ-UI-WR-506: /kit routes + primitive passports

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-wr-b
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit)
  - tests: PASS (app.routes.spec 6/6)
  - checklist: ADDED
  - progress.md: UPDATED

## Что сделано

1. **Lazy /kit/* routes** под `canMatch: [authGuard]` (auth как /design):
   - `/kit` → KitLayoutComponent (sticky header + sidebar + footer)
   - `/kit/overview` → KitOverviewPage (карта разделов + leftover)
   - `/kit/foundations` → FoundationsPage
   - `/kit/forms` → FormsPage
   - `/kit/overlays` → OverlaysPage
   - `/kit/basics` → KitBasicsPage (placeholder, experimental)
   - `/kit/navigation` → KitNavigationPage (placeholder, experimental)
   - `/kit/playground/*` — ссылки в nav, реальных страниц нет (заглушки не созданы, перечислены в overview)

2. **app.routes.spec.ts** — тест «зарегистрирован /kit» вместо «отсутствует».

3. **Паспорта примитивов** (≤8 строк RU):
   - overlays.page.ts: Dialog, Sheet, Drawer, DropdownMenu, OverflowSelect, Toast
   - forms.page.ts: PiSelect, FormField, Skeleton
   - foundations.page.ts: error-banner

4. **Неполные секции** перечислены в KitOverviewPage.Leftover: basics, navigation, playground.

Product pages (overlays/forms/foundations) НЕ менялись кроме passport-комментариев.

## Изменённые файлы

- `frontend/src/app/app.routes.ts` (+30 строк: /kit route group)
- `frontend/src/app/app.routes.spec.ts` (переписан тест: kit → должен быть)
- `frontend/src/app/pages/kit/kit-overview.page.ts` (новый)
- `frontend/src/app/pages/kit/kit-basics.page.ts` (новый, placeholder)
- `frontend/src/app/pages/kit/kit-navigation.page.ts` (новый, placeholder)
- `frontend/src/app/pages/overlays/overlays.page.ts` (+passports)
- `frontend/src/app/pages/forms/forms.page.ts` (+passports)
- `frontend/src/app/pages/foundations/foundations.page.ts` (+passports)

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  # exit 0
cd frontend && pnpm test -- app.routes.spec                  # 6/6 PASS
```