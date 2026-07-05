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

## Что НЕ нужно делать

- ❌ Создавать `*.module.ts` — Angular 20 standalone-only.
- ❌ Подписываться на observables вручную — используй `signal()` / `effect()`.
- ❌ Использовать `*ngIf` / `*ngFor` — Angular 20 control flow: `@if` / `@for`.
- ❌ Трогать `app.config.ts` (если не нужен новый provider) — defaults достаточно.
- ❌ Трогать `app.ts` (если не нужен host component) — `<router-outlet />` уже в нём.
