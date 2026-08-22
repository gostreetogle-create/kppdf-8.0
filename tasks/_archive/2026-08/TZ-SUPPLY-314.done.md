# TZ-SUPPLY-314 — Быстрый заказ: гид-режим (последовательное раскрытие блоков + no-jank добавление)

**Дата:** 2026-08-22 · **Исполнитель:** freebuff · **Статус:** DONE

## Outcome

PASS. Гид-режим реализован: при создании/раскрытии плитки открыта только «Позиция», «Поставщик» и «Детали и статус» свёрнуты с ручным toggle. Авто-раскрытие «Поставщика» при `categoryId + materialId`.

## Что сделано

1. Добавлены `whereExpanded`/`detailsExpanded` сигналы (по образцу `moreExpanded`)
2. `toggleExpand` и `onCreate` сбрасывают оба флага в false
3. Блоки `--where` и `--details` обёрнуты в toggle-заголовки + `@if` с `aria-expanded` и `data-test`
4. `onMaterialChange` вызывает `maybeAutoExpandWhere` — авто-раскрывает `whereExpanded` при `categoryId + materialId`
5. «Детали» всегда доступны через ручной toggle (необязательный блок)
6. Modal transition: уже реализован через `PiDialog` (fade-in + scale 180ms, `prefers-reduced-motion`), дополнительных CSS не требуется

## Изменённые файлы

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`

## Gates

| Gate | Result |
|------|--------|
| `tsc --noEmit` | PASS (0 errors) |
| `jest supply-quick-order` | 28/28 PASS |
| `lint` | PASS (0 new errors) |
| `smoke supply` | 23/23 PASS |

## Known limits

- «Детали» всегда доступны через ручной toggle (PO не ответил про conditional locking, выбран вариант «не блокировать необязательные поля»)
- CSS transition на expand/collapse: блоки используют `@if` (remove from DOM), анимация достигается через toggle-кнопку с instant visibility — layout не дёргается
- Без живого браузерного прохода; первичный сигнал: gates + smoke PASS

## Архив

closed_at: 2026-08-22T10:52:01+03:00