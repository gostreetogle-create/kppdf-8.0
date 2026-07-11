# Добавить новую страницу

> **5-шаговый tutorial**: от `mkdir` до видимой в browser страницы.

## Шаг 1: создать файл

```bash
mkdir -p frontend/src/app/pages/my-page
```

## Шаг 2: page component

```bash
cat > frontend/src/app/pages/my-page/my-page.page.ts << 'EOF'
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';

@Component({
  selector: 'app-my-page-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, PiSectionComponent],
  template: `
    <app-pi-page-header
      eyebrow="My Page"
      title="Заголовок"
      subtitle="Подзаголовок в одну строку"
    />

    <app-pi-section title="Секция 1" eyebrow="I">
      <p class="text-sm">Контент секции.</p>
    </app-pi-section>
  `,
})
export class MyPagePage {}
EOF
```

## Шаг 3: зарегистрировать route

`frontend/src/app/app.routes.ts`:

```ts
{
  path: 'my-page',
  loadComponent: () =>
    import('./pages/my-page/my-page.page').then((m) => m.MyPagePage),
  title: 'Paper & Ink — My Page',
},
```

Добавить внутрь `children: [...]` массива в `KitLayoutComponent` роуте.

## Шаг 4: добавить sidebar link (опционально)

`frontend/src/app/layout/kit-layout.component.ts` — найти NAV const и добавить:

```ts
{ label: 'My Page', path: '/my-page', icon: 'file' },
```

## Шаг 5: verify

```bash
pnpm dev
# открыть http://localhost:4200/my-page
```

`pnpm exec tsc -p tsconfig.app.json --noEmit` — должен быть exit 0.

## Чек-лист Paper & Ink compliance

- [ ] `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Все inputs через `input<T>()` / `input.required<T>()` (НЕ `@Input()` decorator)
- [ ] Никаких `any`, `OnInit`, `OnDestroy` — только `effect()`, `computed()`, `afterNextRender()`
- [ ] Никаких `box-shadow`, `drop-shadow`, `#[hex]`, `bg-white`, `border-dashed`
- [ ] Используй `<pi-page-header>` + `<pi-section>` (TZ-68)
- [ ] Page selector — `app-<name>-page` (lowercase, kebab)
- [ ] Class name — `<Name>Page` (PascalCase, exported)
- [ ] `pnpm exec tsc --noEmit` exit 0

## Border & focus-ring конвенции

### Hairline-first (TZ-AUDIT-8)

Все границы в проекте — 1px (`hairline`). Акцент делается через **цвет**, не через толщину. Используй ТОЛЬКО канонические утилиты:

```html
<!-- ✅ Правильно -->
<div class="hairline">все 4 стороны</div>
<div class="hairline-b">только снизу</div>
<div class="hairline-t">только сверху</div>
<div class="hairline-r">только справа</div>
<div class="hairline-l">только слева</div>

<!-- Цветовые оверрайды (hairline использует longhand, поэтому классы-цвета всегда побеждают) -->
<div class="hairline border-ink">чёрный hairline</div>
<div class="hairline border-destructive">красный hairline</div>
```

```html
<!-- ❌ НИКОГДА так не делай -->
<div class="border hairline border-rule">     <!-- избыточно -->
<div class="border-b hairline border-rule">   <!-- используй hairline-b -->
<div class="border-r hairline border-rule">   <!-- используй hairline-r -->
<div class="hairline border border-rule">      <!-- избыточно -->
<div class="border-2">                         <!-- не 2px, не 4px -->
```

> **Статус:** Миграция завершена (2026-07-08). Во всех 25+ компонентах проекта используется только canonical `hairline` / `hairline-b/r/l`. Ни одного `border hairline border-rule` в коде не осталось (кроме JSDoc).

### Focus-ring (TZ-AUDIT-6)

Не хардкодь `focus-visible:ring-2 ring-ink ring-offset-2 ring-offset-paper` — используй единый класс `pi-focus-ring`:

```html
<!-- ✅ Правильно -->
<button class="pi-focus-ring" type="button">Нажми</button>
<input class="pi-input pi-focus-ring" />

<!-- ❌ НИКОГДА так не делай -->
<button class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ...">
```

Класс `pi-focus-ring` определён в `styles.css` и использует `--focus-ring-shadow` (2px paper gap + 4px ink ring). Изменение в одном месте применяется ко всем компонентам.

> **Статус:** Миграция завершена (2026-07-08). Все 11 интерактивных компонентов (Button, Input, Textarea, Checkbox, Switch, Tab, Pagination, Dialog, Sheet, Drawer, AccordionItem) используют `pi-focus-ring`.

## Что НЕ нужно делать

- ❌ Создавать `*.module.ts` — Angular 20 standalone-only.
- ❌ Подписываться на observables вручную — используй `signal()` / `effect()`.
- ❌ Использовать `*ngIf` / `*ngFor` — Angular 20 control flow: `@if` / `@for`.
- ❌ Писать `border hairline border-rule` — используй просто `hairline`.
- ❌ Хардкодить `focus-visible:ring-2 ring-ink...` — используй `pi-focus-ring`.
- ❌ Использовать `border-2`, `border-4`, `border-dashed` — 1px hairline, цветовой акцент.
- ❌ Трогать `app.config.ts` (если не нужен новый provider) — defaults достаточно.
- ❌ Трогать `app.ts` (если не нужен host component) — `<router-outlet />` уже в нём.
