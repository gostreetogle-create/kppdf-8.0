# Audit — Related-entities UI: peer verdict (2026-09-15)

> Источник: ответ peer на `docs/peer/PROMPT-PEER-UI-RELATED-DISPLAY-2026-09-15.md`.  
> Роль Cursor: принять / отсечь; **не** авто-TZ на 90 дней.

## Принято (канон)

**Primary SoT related-entities:** expand-in-row Hub Tray + L/R chrome-rail + overlay flyouts.

| Кандидат | Вердикт |
|----------|---------|
| A Master-Detail / cascade split | Reject (DESK-401) |
| B Graph | Reject |
| C Semantic zoom ops | Reject |
| D Multi-level kanban everywhere | Reject (kanban only комбайн: ряд=изделие) |
| E Split + mini-views (reflow) | Reject |
| F Contextual tabs / sidecar | Secondary = **только** flyout из chrome-rail, без сжатия таблицы |
| G Finder columns | Reject |
| H Adaptive widgets | Reject |

Исключения (как в peer): Гант cascade strips · Студия rail+flyout · Комбайн kanban-изделие.

Checklist parity §6 peer — **принять** как критерий нового hub-tray (с оговоркой: «моноширинный шрифт для артикулов» — только если уже так в Paper & Ink эталоне; иначе обычный tabular nums / текущий ритм registries).

## Правки фактов (peer слегка ошибся)

1. **NX order-hub уже не чисто read-only.** Есть write: kit-reserve confirm, ship, cancel-shipment (см. `docs/pages/orders.page.md`). Недостаёт относительно legacy desk: notebook / add-line / часть desk-CTA — да; «всё read-only» — нет.
2. **Шаг 3 (порт `/desk` + kill legacy за 90 дней)** — **не канон и не план.** `PO-SHARED` §8: hub на `/orders` первая волна; `/desk` — отдельное решение **только PO**. Cutover = NX целиком по команде, не partial delete.
3. **Шаг 2 «единый UI-контейнер на все реестры»** — только после явного списка экранов от PO / скрина; иначе busywork против `PO-SHARED` §2.

## Что можно планировать (если PO скажет Да)

- Тонкая WAVE: **order-hub Write-CTA parity** — перечислить конкретные кнопки из legacy `mode="desk"`, которых нет в NX, каждая через доменный сервис (no dual write-path).
- Не смешивать с портом всей страницы `/desk`.

## Anti-patterns §5 peer

Принять все 5 (модалка², dashboard, Finder scroll, dual create-order UI, canvas-граф).

## Next

Промптов исполнителю **нет**, пока PO не подтвердит scope Write-CTA (список кнопок) или не даст скрин gap.
