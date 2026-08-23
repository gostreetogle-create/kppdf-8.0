# TZ-DESK-428 — tray padding + disclosure affordance

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-executor

## DoD

| Критерий | Статус |
|----------|--------|
| AC 1: cards ≥16px padding | PASS (p-4 карточки, gap-5, pb-4 summary, pl-5 состав) |
| AC 2: chevron вращается на toggle | PASS (lucide `ChevronDown` + `rotate-180`, тест) |
| AC 3: Enter/Space на disclosure | PASS (native `<button>`, preventDefault нет) |
| AC 4: tray-тесты обновлены | PASS (+1 тест 428; tray 15/15, весь спек-сет 67/67) |
| AC 5: frontend gates | PASS |
| Proof of adoption | ✅ consumer: `/desk` + `/orders` (shared tray, обе моды); тест chevron; docs manager-desk + orders |

## Что сделано

- **Spacing:** summary bar `pb-3→pb-4`; xl-grid `gap-4→gap-5`; список состава
  `pl-4 space-y-0.5 → pl-5 space-y-1`. Карточки уже `p-4` (TZ-DESK-431), wrapper уже `px-4` — flush ok.
- **Disclosure (все три: состав / снабжение+производство / логистика+документы):**
  - ведущий chevron `<lucide-icon [img]="chevronDownIcon">` с `transition-transform`
    и `[class.rotate-180]` по состоянию (a11y: `aria-hidden`);
  - hover-поверхность `hover:bg-paper-2 rounded-sm px-2 -mx-2` (расширенная зона клика);
  - trailing «раскрыть/свернуть» → видимый бейдж `border hairline px-2 py-0.5 text-xs rounded-sm`;
  - `aria-expanded`/`aria-controls` и `data-test` без изменений; `pi-focus-ring` добавлен на все три.
- **Hub parity:** компонент общий — обе моды (`desk`/`hub`) получают аффорданс автоматически.
- **Тест:** `order-hub-tray.component.spec` — chevron рендерится, без rotate в collapsed,
  `rotate-180` после toggle, бейдж «раскрыть»→«свернуть», hover-класс на кнопке.
- **Docs:** `manager-desk.page.md` (+строка 428), `orders.page.md` (TZ-таблица + строка 428).

## Proof of adoption

- **Consumer (production):** `/desk` tray и `/orders` expand (`order-hub-tray`, mode desk/hub).
- **Тесты:** tray 15/15 (включая новый 428), desk+orders 67/67 суммарно.
- **Docs:** manager-desk.page.md, orders.page.md обновлены.
- **Migration note:** text «· раскрыть» в tray заменён на бейдж — спеки/селекторы на текст
  отсутствовали; `data-test` и aria-атрибуты не менялись.
- **Legacy leftover:** нет (визуально-изолированная TZ; бизнес-логика не тронута).

## Gates

```text
frontend tsc --noEmit: 0
frontend jest order-hub-tray|manager-desk|orders: 67/67 PASS
frontend eslint (файлы tray): 0
git diff --check: PASS
pre-commit hook: PASS (SUPPLY-GATE skip — контур не затронут)
pre-push hook: PASS
```

## SHA

- Код: `TBD` (заполняется после push)
