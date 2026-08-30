# Freebuff — Nx F4: Kit shell (4 `/kit/*` routes)

> **TZ:** `tasks/TZ-NX-F4-kit-shell.md`  
> **DEP:** F2a DONE  
> **Conflict keys:** `frontend-nx/apps/kppdf-web/src/app/**`

## Старт

```text
cd D:\kppdf-8.0
git pull --ff-only
```

Читай: `GEMINI.md` · `tasks/TZ-NX-F4-kit-shell.md` · этот файл.

**CLAIM** → `tasks/_active/TZ-NX-F4-kit-shell.md`  
`agent_id: freebuff-nx-f4` · `claimed_at:` ISO-8601 **реальное время**

**Зона:** `frontend-nx/apps/kppdf-web/**` only. `frontend/**` READ-ONLY.

---

## Шаги

### 1) Layout

Скопируй из legacy:
- `frontend/src/app/layout/kit-layout.component.ts` → `apps/kppdf-web/src/app/layout/`
- `frontend/src/app/layout/theme-toggle.component.ts` → `apps/kppdf-web/src/app/layout/`

Правки:
- `theme-toggle`: `ThemeService` from `@kppdf/ui/theme` (export из `libs/ui/paper-and-ink/src/theme/index.ts` — проверь path)
- `kit-layout`: **NAV_GROUPS только 4 ссылки** (overview, foundations, forms, overlays) — убери basics, navigation, playground

### 2) Pages (4 канона)

Скопируй:
- `pages/kit/kit-overview.page.ts`
- `pages/foundations/foundations.page.ts`
- `pages/forms/forms.page.ts`
- `pages/overlays/overlays.page.ts`

→ `apps/kppdf-web/src/app/pages/` (зеркальная структура папок)

**Обязательно** замени все импорты:
```text
../../shared/ui/...     → @kppdf/ui/<entry>
../../shared/page/...   → @kppdf/ui/page (named exports)
```

Примеры:
```ts
import { ButtonComponent } from '@kppdf/ui/button';
import { PiPageHeaderComponent } from '@kppdf/ui/page';
import { PiToastService } from '@kppdf/ui/toast';
import { PiDialogService } from '@kppdf/ui/dialog'; // если есть secondary path — иначе deep import из lib/dialog после проверки index.ts
```

Проверь каждый secondary path в `frontend-nx/tsconfig.base.json` перед import.

**Если нет path** (напр. `dialog`, `pi-table` без index.ts): создай `libs/ui/paper-and-ink/src/lib/<folder>/index.ts` re-export + добавь path в `tsconfig.base.json`. Только re-export, без логики — это долг F2a для kit consumer.

### 3) Routes

`apps/kppdf-web/src/app/app.routes.ts`:

```ts
{ path: '', redirectTo: 'kit/overview', pathMatch: 'full' },
{
  path: 'kit',
  loadComponent: () => import('./layout/kit-layout.component').then(m => m.KitLayoutComponent),
  children: [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', loadComponent: () => import('./pages/kit/kit-overview.page').then(m => m.KitOverviewPage) },
    { path: 'foundations', loadComponent: () => import('./pages/foundations/foundations.page').then(m => m.FoundationsPage) },
    { path: 'forms', loadComponent: () => import('./pages/forms/forms.page').then(m => m.FormsPage) },
    { path: 'overlays', loadComponent: () => import('./pages/overlays/overlays.page').then(m => m.OverlaysPage) },
  ],
},
```

### 4) app.config.ts

Если build падает на animations/CDK overlay — добавь:
```ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// providers: [..., provideAnimationsAsync()]
```
**Не** добавляй auth interceptors.

### 5) Gates

```bash
cd frontend-nx
pnpm exec nx build kppdf-web
pnpm exec nx run-many -t lint --all
pnpm exec nx test kppdf-web --passWithNoTests
```

Опционально smoke: `pnpm exec nx serve kppdf-web` → открыть 4 URL на :4201.

### 6) Archive

- Completion в `tasks/TZ-NX-F4-kit-shell.md`
- `tasks/_archive/2026-08/TZ-NX-F4-kit-shell.done.md`
- Удали `_active` claim

---

## STOP

- Копировать basics/navigation/playground routes → STOP
- Править `libs/ui/**` логику → STOP (только imports в app)
- Создавать новые Pi-компоненты → STOP

---

## Отчёт PO

```text
TZ-NX-F4: DONE|FAILED
Routes: overview foundations forms overlays — OK?
Theme toggle: OK?
nx build: SUCCESS|FAIL
lint: 0 errors?
Sidebar links count: 4?
Archive path: ...
```
