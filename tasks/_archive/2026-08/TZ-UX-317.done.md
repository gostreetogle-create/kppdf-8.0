# TZ-UX-317 DONE — системные ← → в полях app shell (site-wide history)

```
ARCHIVE_MARKER
task: TZ-UX-317
outcome: DONE
closed_at: 2026-08-12
closed_by: agent-158a657202 (freebuff/wave-nav-return)
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (app-layout 4/4 + app-history.store 6/6 + nav-order)
  - lint: PASS (ESLint, Prettier)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

- **`app-history.store.ts` (new):** site-wide SPA history на Router events
  (NavigationStart trigger + NavigationEnd). Imperative навигации пушят same-app URL-стек,
  `popstate` (наш back() через `Location.back()` или браузерная стрелка) двигает индекс,
  `replaceUrl`-тики (например `?categoryId` в builder) не растят стек (same normalized URL),
  `/login` не подставляется предыдущим URL. `canGoBack`/`canGoForward` — computed-сигналы.
  `CatalogReturnStore` (TZ-UX-313) не тронут — store аддитивен, переиспользует `normalizeCatalogUrl`.
- **`app-layout.component.ts`:** кнопки ← (`data-test="app-nav-back"`) и → (`data-test="app-nav-forward"`)
  в **gutters** (position:fixed, лево/право viewport, vertical center, z-index 20 ниже шапки и
  CDK-оверлеев) вне max-width колонки; видны только ≥1680px (реальное поле ≥76px — не наезжают на
  studio rails / builder palette / A4); disabled + aria-disabled без истории (не прыгают на fallback).
- **Specs:** `app-layout.component.spec.ts` (new, 4 теста: render + click → back/forward + disabled states
  через signal-мок — Angular 20 кеширует вызовы plain-функций, поэтому мок реактивный);
  `app-history.store.spec.ts` (new, 6 тестов: single-entry landing, push, popstate, truncate, replaceUrl-dedupe, forward no-op).
- **Docs:** `page-chrome.md` — запрет «глобальных ←→ нет» заменён каноном gutters
  (таблица механизмов + приоритет returnUrl vs history); аудит `nav-return-gutters-canon.md` — блок «Реализовано».
- `catalog-return.util.ts` не изменялся (только импорт); Desktop/PDF/puppeteer не тронуты; Create studio logic не тронута.
- Gates: FE tsc PASS (0 errors); Jest app-layout + app-history + catalog-return + nav-order 26/26 PASS
  (+ picker/builder 31/31 из 316 в общем прогоне 57/57); ESLint/Prettier/diff-check PASS.
