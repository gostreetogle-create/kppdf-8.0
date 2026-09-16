# Audit — Order workspace IA cleanup (2026-09-15 evening)

> Скрин PO: `/orders/:id` · ORD-2026-022 · красные круги: «Наша фирма —» и «← К списку / На Главную».  
> Канон: `PO-CANON` «одна страница — один контекст» · necessity §2 · не плодить CTA.

## Цель страницы (PO)

Менеджер **работает с одним заказом**: правит мета/состав, контролирует исполнение — всё под рукой.  
Не витрина навигации и не демо «сколько кнопок нарисовали».

## KEEP (уже по делу)

| Элемент | Зачем |
|---------|--------|
| Status banner + Подтвердить / Отменить | lifecycle write |
| Оплачен | payment fact |
| КП / КП в студии | deep-link только если есть quotation |
| Состав: qty / ready / delete / add line | ядро write |
| Исполнение / Логистика writes (kit, ship) | живые действия |
| Workflow chips (Главная·КП·Гант·…) | единый cross-route, уже есть |

## CUT (дубли / шум)

| Элемент | Почему CUT |
|---------|------------|
| «← К списку» | дубль: history ← в chrome-rail + chip/nav «Сделки»/список |
| «На Главную» | дубль: chip «Главная» + top nav |
| «Править строки заказа» (focus qty) | псевдо-кнопка; qty уже на строке — не нужен отдельный CTA |

## DENSITY / GROUPING (скрин 2026-09-15 densify)

| Gap | Решение |
|-----|---------|
| Состав full-width + белая дыра | max ~½ страницы (desktop); имя truncate, controls справа плотно |
| Qty input слишком длинный | фиксированная узкая ширина (`w-16`/`w-20`) |
| «Выберите изделие» оторвано от списка | add-form **внутри** той же карточки «Состав» |

TZ: `TZ-NX-ORDER-WS-COMPOSITION-DENSITY`.

## ADD / FIX (реально нужны менеджеру)

| Gap | Решение |
|-----|---------|
| Наша фирма = «—», нет write | Select организаций + PATCH `organizationId`; пусто → «+» inline create/выбор (паттерн `pi-select-add-row` / admin orgs dialog уже в NX) |
| Заказчик / Объект read-only | То же: select (+ ensureDefault site) без ухода в другой раздел «только ради +» |
| Изделие: select без «+» | Рядом с select «+» → quick-create product (reuse registry product form dialog) → сразу выбрать в заказ |
| Filler subtitle на Home | уже в очереди `TZ-NX-HOME-DROP-FILLER-SUBTITLE` |

## Не сейчас (не раздувать)

- Полный CRUD каталога на странице заказа  
- Вторая панель «как desk»  
- Возврат nav-кнопок «на всякий случай»

## TZ chain (в pack hotfix)

1. `TZ-NX-ORDER-WS-STRIP-NAV-DUP` — вырезать К списку / На Главную / «Править строки»  
2. `TZ-NX-ORDER-WS-META-INLINE` — фирма / заказчик / объект editable + «+»  
3. `TZ-NX-ORDER-WS-PRODUCT-SELECT-ADD` — «+» у изделия  

Зависит от / стыкуется с уже queued: ORDER-WS-CHROME-TOP · COMPOSITION-TREE-TOGGLE · HOME-DROP-FILLER.
