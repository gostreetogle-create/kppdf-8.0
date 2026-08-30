# TZ-NX-F4: Kit shell — 4 канонических `/kit/*` routes

**РОЛЬ АГЕНТА:** Executor (Freebuff)  
**ЗАВИСИМОСТИ:** `TZ-NX-F2a-ui-primitives.md` — **DONE**  
**LAYER:** 2 (app shell + kit pages)  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/**`; `frontend/kit-layout`; `frontend/app-routes`

**PAGES:** `/kit/overview`; `/kit/foundations`; `/kit/forms`; `/kit/overlays`  
**PAGE_DOCS:** N/A (kit = regression gate, не production page.md)

---

## ИСХОДНОЕ СОСТОЯНИЕ

- **F2a DONE:** Pi primitives в `@kppdf/ui/*`, ThemeService в `@kppdf/ui/theme`, global.css wired.
- **nx app:** `app.routes.ts` пустой; root = `<router-outlet />` only.
- **Legacy источник (read-only):**
  - `frontend/src/app/layout/kit-layout.component.ts`
  - `frontend/src/app/layout/theme-toggle.component.ts`
  - `frontend/src/app/pages/kit/kit-overview.page.ts`
  - `frontend/src/app/pages/foundations/foundations.page.ts`
  - `frontend/src/app/pages/forms/forms.page.ts` (+ spec опционально)
  - `frontend/src/app/pages/overlays/overlays.page.ts`
  - `frontend/src/app/app.routes.ts` §kit (строки ~597–625)

**Проверено:** legacy kit routes; `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`; `@kppdf/ui/*` paths в `tsconfig.base.json`.

---

## ЧТО ДЕЛАТЬ

### F4a — Kit layout в app shell

1. Скопировать `kit-layout.component.ts` → `apps/kppdf-web/src/app/layout/`
2. Скопировать `theme-toggle.component.ts` → `apps/kppdf-web/src/app/layout/`
3. **Импорты переписать:**
   - `ThemeService` → `import { ThemeService } from '@kppdf/ui/theme'` (или path к theme.service)
   - Lucide icons — как в legacy
4. **NAV_GROUPS** в kit-layout — **только 4 канона:**
   - `/kit/overview`, `/kit/foundations`, `/kit/forms`, `/kit/overlays`
   - Убрать basics, navigation, playground из sidebar (план F4: не весь legacy kit)

### F4b — Kit pages (4 шт.)

5. Скопировать 4 page-файла в `apps/kppdf-web/src/app/pages/` (структура как legacy).
6. **Все** импорты `../../shared/ui/*` и `../../shared/page/*` → `@kppdf/ui/*` secondary entries:
   ```ts
   // было
   import { ButtonComponent } from '../../shared/ui/button/button.component';
   // стало
   import { ButtonComponent } from '@kppdf/ui/button';
   ```
7. Table/dialog/toast imports — через `@kppdf/ui/...` (не deep paths в lib).

### F4c — Routes + app config

8. `app.routes.ts`:
   ```text
   '' → redirect 'kit/overview'
   kit → lazy KitLayoutComponent
     '' → redirect overview
     overview | foundations | forms | overlays → lazy pages
   ```
9. `app.config.ts` — добавить **только если build требует:**
   - `provideAnimationsAsync()` (CDK overlays)
   - Не добавлять auth interceptors (F3)

### F4d — Smoke verify

10. Gates (AC ниже).
11. Ручной smoke: `nx serve kppdf-web` :4201 → 4 URL открываются, console clean, theme toggle работает.

---

## STOP RULES

1. **Только 4 kit routes** — не копировать basics/navigation/playground routes.
2. **Не трогать** `frontend/**`, `libs/ui/**` (кроме import paths в app pages).
3. **Не добавлять** auth guards / data-access (F3).
4. **Stop Rule UI:** новых примитивов не создавать — только `@kppdf/ui/*`.
5. **Не копировать** весь `app.routes.ts` legacy (27KB).

---

## ИЗМЕНЯТЬ

- `frontend-nx/apps/kppdf-web/src/app/**`
- `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`
- `frontend-nx/apps/kppdf-web/src/app/app.config.ts` (минимально)

## НЕ ИЗМЕНЯТЬ

- `frontend/**`
- `libs/ui/paper-and-ink/**` (логика Pi)
- `libs/data-access/**` (F3)
- `libs/util/http/**`

---

## КРИТЕРИИ ПРИЁМКИ

```bash
cd frontend-nx
pnpm exec nx build kppdf-web
pnpm exec nx test kppdf-web --passWithNoTests
pnpm exec nx run-many -t lint --all
pnpm exec nx serve kppdf-web
```

- [ ] `GET /kit/overview`, `/foundations`, `/forms`, `/overlays` — рендер без chunk errors
- [ ] F5/deep-link: refresh на каждом URL не 404
- [ ] Theme toggle light/dark на kit-layout
- [ ] Sidebar — только 4 пункта (без basics/navigation/playground)
- [ ] Imports pages — `@kppdf/ui/*`, не relative `shared/`
- [ ] `nx build` SUCCESS; lint 0 errors
- [ ] Legacy `frontend/` git-clean

### Proof of adoption

- App-shell **потребляет** ≥4 разных `@kppdf/ui/*` entries на kit pages (button, dialog, page, theme).

---

## CLAIM

```text
agent_id: freebuff-nx-f4
claimed_at: (ISO-8601)
task: TZ-NX-F4-kit-shell
```

## ARCHIVE

`tasks/_archive/2026-08/TZ-NX-F4-kit-shell.done.md`
