# KP Workspace — полный прогон (QA evidence)

> Автоматизировано: 2026-08-23. Ручной browser-pass — PO.

## Маршруты и chips

- [x] `/proposals/create` = workspace (тот же компонент) — _spec: ProposalWorkspacePage mounts_
- [x] Chip «Коммерческое предложение» → `/proposals/workspace` — _deals-group-chips.spec PASS_
- [x] Chip «Создать КП» → `/proposals/create?new=1` — _deals-group-chips.spec PASS_
- [x] Chip «Все КП» → `/proposals` — _deals-group-chips.spec PASS_
- [ ] TOC КП / Договоры / Заказы — корректные переходы — **manual PO**

## Панель «Шаблон»

- [x] Без шаблона: empty A4 + CTA «Выбрать шаблон» — _proposal-workspace.page.spec PASS_
- [ ] Picker выбирает шаблон → превью на листе — **manual PO**
- [ ] «Переименовать» / «Дублировать» работают при выбранном шаблоне — **manual PO**
- [x] «Фон» — toast «Сначала выберите шаблон» без выбранного шаблона — _proposal-workspace.page.spec PASS_
- [x] «Создать черновик шаблона» — диалог с инструкциями (не пустой `/import-todos`) — _proposal-workspace.page.spec PASS_
- [x] «Создать шаблон вручную» → `/doc-constructor/templates` — _spec DOM presence PASS_
- [ ] «Редактировать» в picker → builder с returnUrl — **manual PO**

## Rails L/R

- [x] Каталог · Шаблон · Клиент (L) — _proposal-workspace.page.spec PASS_
- [x] Параметры · Таблица · Условия · Вывод (R) — _proposal-workspace.page.spec PASS_
- [ ] Панель overlay не двигает A4 (portrait + landscape) — **manual PO**

## Ribbon

- [ ] Ориентация · сумма · статус сохранения — **manual PO**
- [ ] PDF gold CTA · Печать — **manual PO**

## Регрессии PO

- [x] Chrome chips без лишнего вертикального зазора (`group-chrome--flush`) — _pi-group-workspace CSS fix_
- [x] `/import-todos` empty state объясняет Desktop → Импорт / Конструктор — _import-todos.page.ts_
- [x] Нет dead-end экранов без объяснения — _AI draft dialog + import-todos copy_

## Gates (2026-08-23)

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- proposal-workspace deals-group-chips proposal-workspace-ai --runInBand
pnpm lint
```

_Заполнить SHA после commit._

**Commit:** `ea95e13a` — gates PASS (tsc, 65 tests, lint).
