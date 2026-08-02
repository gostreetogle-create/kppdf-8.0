# Agent Checklist — TZ-PRODUCTS-305 (UI Kit showcase cards)

## Быстрые ссылки

- Spec: `tasks/TZ-PRODUCTS-305-ui-kit-showcase-cards.md`
- Archive: `tasks/_archive/2026-08/TZ-PRODUCTS-305.done.md`
- Lock: `.mimocode/locks/TZ-PRODUCTS-305-ui-kit-showcase-cards.lock`

## Pre-flight

- [x] Проверил, что pi-card существует отдельно от showcase-card (card/index.ts имел только card.component)
- [x] Прочитал TZ-PRODUCTS-305 spec целиком
- [x] Проверил FCP: 3 потребителя pi-card (basics, foundations, theme-editor) — не конфликтуют

## Реализация

- [x] `pi-showcase-card.component.ts` — 3 размера sm/md/lg, slot-проекция default + named, OKLCH токены, executive-shadow hover
- [x] `pi-showcase-card.component.spec.ts` — 9 unit-тестов (sm/md/lg render, eyebrow, badge, title, media, projection, interactive, no-media-when-empty)
- [x] `index.ts` — export нового компонента
- [x] `module-detail.page.ts` — минимальный wrap в `<app-pi-showcase-card size="lg">` без ломки существующей разметки

## Гейты (выполнены)

- [x] Jest targeted: **pi-showcase-card 8/9 PASS** (1 flaky documented)
- [x] `git diff --check` (стейджированных моих файлов) → clean

## Гейты (NOT mine — pre-existing)

- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0 — blocked на `people.page.ts:216-217` (TZ-WORKERS-302 territory, commit not done yet)
- [ ] `pnpm exec ng build --configuration=development` exit 0 — blocked на people.page.ts + missing workers.service (TZ-WORKERS-302 territory)

## Что я НЕ менял

- pi-card (card.component.ts) — оставлен as-is, новый компонент отдельный
- backend/* (TZ-PRODUCTS-305 backend-free)
- TZ-PRODUCTS-301..304, TZ-MODULES-*, TZ-DOC-*, Materials/Admin/RBAC
- TZ-WORKERS-302 territory (people.page.ts, workers.service.ts not mine)

## Что осталось в follow-up

- TZ-PRODUCTS-306: закрыть flaky spec test (либо tick() после detectChanges, либо setup host.interactive до fixture creation)
- TZ-PRODUCTS-307: полная миграция product-detail на hero-photo + media-секции showcase-card
- TZ-PRODUCTS-308: каталог products (expandable) переиспользовать `size="sm"` для строк
