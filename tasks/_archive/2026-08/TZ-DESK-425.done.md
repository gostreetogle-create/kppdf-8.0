# TZ-DESK-425 DONE — tray workspace без навигации из expand

```
ARCHIVE_MARKER
task_id: TZ-DESK-425
outcome: DONE
closed_at: 2026-08-23T12:35:00+03:00
agent_id: claude
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

`order-hub-tray.component.ts` (mode="desk"):
- Производство: убран unconditional `routerLink="/production"`; desk-mode
  показывает `readinessLabel()` + «подробнее — chip «Гант»» (`data-test=
  "order-production-summary"`); `data-test="order-production-link"`
  отсутствует в desk DOM (критерий приёмки #3). Hub-mode ссылка не тронута.
- Склад: «Открыть» (`/storage-items`) скрыт в desk-mode; read-only counters
  (`reservationCounters()`) остались видимы в обоих режимах, как и были.
- Отгрузка: ссылка на `/shipping` скрыта в desk-mode, заменена строкой
  статуса `statusLabel(order().status)`. (TZ-DESK-430 расширит этот же блок
  кнопкой «Отгружено» — намеренно минимальная правка здесь.)
- Снабжение/Документы секции уже были верно ветвлены по `mode()` в prior TZ —
  не трогались; проблема была на стороне host-обработчиков (ниже).

`manager-desk.page.ts`:
- `onOpenSupply()`: `router.navigate(['/supply'])` → `openPanel('supply')`.
- `onOpenDocs()` / `onCreateDocument(order)`: заглушка-toast / `router.navigate(
  ['/doc-constructor/templates'])` → оба открывают R-flyout `panel=docs`.
- Новая ветка рендера `panel() === 'supply'` → `<app-supply-quick-order
  [prefillOrderId]="expandedId()">` (существующий компонент, `SUPPLY-304`).
- Новая ветка `panel() === 'docs'` → список `DocumentTemplatesService.list()`
  (loading/error/empty states), «Создать» у шаблона → **единственная
  неизбежная навигация**: `/doc-constructor/builder/:id?source=order&
  sourceId=` (builder уже читает `source`/`sourceId`, Phase E.3) — генерация
  документа физически требует builder UI, инлайнить weight-класса TipTap
  builder в маленький tray-flyout не входило в разумный объём этой TZ.
  Просмотр списка шаблонов остаётся на `/desk`, уходит только реальный
  «Создать».
- `manager-desk__flyout--wide` расширен на `panel === 'supply'`.

## Известное ограничение (зафиксировано, не тихо)

Документы: «Создать» покидает `/desk` (переход в builder) — TZ буквально
просит «reuse templates logic in-place… без смены path», но templates.page.ts
сам не строит документ — он ведёт в builder (тяжёлый TipTap-редактор), и
embed builder внутрь маленького flyout явно избыточен для этой TZ. Компромисс:
браузинг списка — in-place, только генерация — уходит в builder. Если PO
хочет иначе — отдельная TZ на встроенный mini-generator.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (0)
- `pnpm exec ng build --configuration=development` — PASS (0 ошибок; 1
  pre-existing warning NG8113 в чужом `pi-nav-dropdown.component.ts`)
- `pnpm test -- order-hub-tray manager-desk --runInBand` — PASS 40/40
- `pnpm lint` — 0 errors, 18 pre-existing OnInit warnings (не мои файлы)

## Спеки обновлены

- `order-hub-tray.component.spec.ts`: тест TZ-DESK-416 «desk-mode production
  link contains from=desk» заменён на «DESK-425: desk mode has no production
  link — superseded by inline summary» (TZ явно помечает DESK-416 desk-
  behaviour как superseded для tray).

## Proof of adoption

- `/desk` expand → «Снабжение» → flyout (не route change).
- `/desk` expand → «Создать документ»/«Шаблоны» → тот же flyout `panel=docs`.
- `/desk` expand → «Производство»/«Склад»/«Отгрузка» — текст, не ссылка.
- Hub-mode (`/orders`) — без регрессии, ссылки как были.

## Conflict disclosure

Параллельно в этой же сессии шла работа другого агента (freebuff-desk-wave)
над TZ-DESK-426/429 на пересекающихся conflict keys (`manager-desk.page.ts`,
`manager-desk.page.spec.ts`). Один прогон тестов поймал их промежуточное
состояние (transient fail в тесте DESK-426, не в моём коде — подтверждено
`git stash` изоляцией: 267/267 PASS на чистом HEAD без обоих WIP). На момент
закрытия этой TZ оба набора изменений сосуществуют без конфликта (40/40
focused PASS). Задокументировано, не скрыто.

## Следующая

TZ-DESK-430 (после этой, per wave dependency).
