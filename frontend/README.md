# Paper & Ink · UI Kit

> **Редакторский UI-кит** для Angular 20. Типографика Syne и Plus Jakarta Sans. Палитра paper и ink на OKLCH. Tailwind v4 primitives. Без зависимости на Material.

Paper & Ink — это не shadcn-порт и не Material-look. Это **editorial-style** китинг:
- **OKLCH** вместо hex (perceptually uniform).
- **Hairlines** (1px solid) вместо shadow.
- **Шрифт важнее декора** — Syne display, Jakarta body, mono для metadata.
- **Zero deps** — все примитивы hand-rolled, без Material/CDK overlay (Angular CDK только).

---

## Установка

```bash
pnpm install
pnpm dev
```

Открыть http://localhost:4200 — вы попадёте на `/overview`.

## Сборка

```bash
pnpm build              # CSR + SSR (dist/frontend/{browser,server})
pnpm start              # запустить SSR preview на :4000
```

## Структура

```
frontend/src/app/
  layout/                        ← KitLayoutComponent (sticky sidebar + header + theme toggle)
  pages/                         ← Lazy-loaded routes
    overview/                    hero + 4 sections + Sonner toast panel
    foundations/                 палитра + типографика + spacing + grid
    basics/                      buttons + inputs + badges + cards
    forms/                       validated form + sortable paginated table
    overlays/                    dialogs + sheet+drawer + tooltip+popover + dropdown + toast
    navigation/                  tabs + breadcrumb + accordion + charts + separator + scrollarea
    playground/
      theme-editor.page.ts       /playground/theme — OKLCH live sliders
  shared/
    ui/                          ← 30+ primitives (Button, Badge, Card, Input, FormField, …)
    page/                        ← PageHeader / Section / Demo wrappers (TZ-68)
    command/                     ← ⌘K command palette (TZ-75)
    playground/                  ← Prop Playground Button + Badge (TZ-76)
    theme/                       ← Theme Editor service + component (TZ-77)
    core/theme.service.ts        ← light/dark mode toggle (TZ-33)
```

## Технологии

| Lib | Версия | Роль |
|-----|--------|------|
| Angular | ^20 | Standalone components, Signals, OnPush |
| Tailwind | ^4.0 | @theme inline OKLCH tokens |
| @angular/material | ^20 | (опционально, не используется для UI) |
| @angular/cdk | ^20 | (опционально, не используется) |
| lucide-angular | ^0.460 | Hairline iconography (1.5px stroke) |
| highlight.js | ^11 | Live code preview (опционально) |
| @angular/ssr | ^20 | SSR + hydration (опционально) |

## Архитектурные решения

| Решение | TZ | Дата |
|---------|----|----|
| Mongoose Replica Set → atomic counters | TZ-03 | 2026-07-04 |
| AsyncLocalStorage → user context для audit | TZ-04 | 2026-07-04 |
| Audit-action interceptor глобально | TZ-05 | 2026-07-04 |
| Soft-delete plugin | TZ-03 | 2026-07-04 |
| **Material MD3 + density -3 + 3 ui-kit обёртки** | rework | 2026-07-04 |
| **Editorial SPA rework: 30+ primitives + 6 pages + ⌘K + Playground + Theme Editor** | TZ-30..77 | 2026-07-05 |

## Лицензия

MIT © 2026

## Автор

kppdf-8.0 team · editorial design inspired by Werkplaats Typografie, Kinfolk, Monocole.
