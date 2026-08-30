# Страница: Конструктор (`ConstructorPage`)

**Краткое описание:** `frontend-nx`-only рабочее место для создания и
редактирования паспортов каталога и live BOM. В первой волне — только
каркас: выбор типа создаваемой сущности и честный placeholder «раздел
готовится». Реестры (`/registries`) остаются master table сохранённых
записей; Конструктор не вложен в строку реестра и не размещён в shell rails.

## Route

```
/constructor                    — workspace + четыре CTA (ConstructorPage)
/constructor/create/:kind       — placeholder «готовится» (ConstructorCreatePlaceholderPage)
```

`:kind` — typed `ConstructorCreateKind`: `material` | `part` | `module` | `product`.
Неизвестный kind → alert + ссылка назад. **Комплекс** среди create kinds отсутствует.

Только `frontend-nx` (`apps/kppdf-web/src/app/pages/constructor/**`). Вложен в
`AppShellComponent` (`canMatch: [authGuard]`), **без** `capabilityRouteGuard` —
нет backend-seeded permission для `constructor` (паттерн как у `/registries`).

## Navigation

- Header chip «Конструктор» (`nav-categories.ts`, `id: 'constructor'`, `skipPageAcl: true`).
- **Не** добавлен в left/right tool rails (`tool-rail-definitions.ts` не менялся).

## Domain copy (canon)

| UI label | Persisted entity | Notes |
|----------|------------------|-------|
| Материал | `Material` | Сырьё и прочие `materialKind`, кроме part-пресета |
| Деталь | `Material` (`materialKind = part`) | Отдельной коллекции Part нет |
| Модуль | `ProductModule` | Переиспользуемый модуль |
| Изделие | `Product` | Комплекс — derived Product (product-строка в составе), не create kind |

Источник: `tasks/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md`.

## Components

- `ConstructorPage` — `PiPageChrome`, domain note, grid из `app-pi-card` (CTA links).
- `ConstructorCreatePlaceholderPage` — `PiStatusBanner` (info), copy + back button.
- `constructor.types.ts` — `CONSTRUCTOR_CREATE_KINDS`, guards.

## Tests

- `constructor.page.spec.ts` — workspace, 4 CTA, no Complex, hrefs.
- `constructor-create-placeholder.page.spec.ts` — placeholder, part/product copy, unknown kind, back navigation.
- `constructor-create-placeholder-a11y.spec.ts` — placeholder aria-labelledby (known + unknown kind).
- `constructor.routes.spec.ts` — router integration.
- `constructor-a11y.spec.ts` — aria-labelledby, list semantics.
- `app-shell-constructor-nav.spec.ts` — header chip navigation.
- `nav-categories.spec.ts`, `app-shell.component.spec.ts`, `route-paths.spec.ts` — updated counts.

## History

| TZ | Change |
|----|--------|
| TZ-NX-CONSTRUCTOR-SHELL | Initial shell: route, header nav, kind chooser, placeholders |
| TZ-NX-CONSTRUCTOR-PLACEHOLDER-FIX | Back button navigation; placeholder a11y for unknown kind |
