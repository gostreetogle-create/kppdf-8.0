# Архитектурный аудит плана «Цех / Гант — Studio Chrome»

**Дата:** 2026-08-15  
**Статус:** PLAN REVIEW / product-код не менялся  
**Объект:** `/production` и sibling `/work-types`

## Короткий вердикт

Направление выбрано правильно: `/production` должен стать плотной студией план-оценки с максимальным центром, левым и правым icon-rail и overlay-flyout. Переписывать модель `WorkType.days`, `ProductionReadFacade` или вводить факт производства в этой волне нельзя.

Предварительная оценка исходного плана: **84/100**. До 98–99 не хватает не идеи, а исполнимых границ: точного shell-контракта, поведения на узких экранах, keyboard/focus acceptance, запрета изменения данных и обязательного browser geometry smoke. После внесения требований ниже план можно считать **99/100 как план**, но не как реализованный экран.

## Что подтверждено кодом

- `ProductionCockpitPage` сейчас имеет собственный текстовый header, постоянный левый `w-56/w-14` rail и условный inspector справа.
- Header содержит действия `Обновить`, `Сброс фильтров`, `Сегодня`, `Весь горизонт`, `День`, `Неделя` — они крадут высоту и не соответствуют канону плотной studio.
- `PiGroupWorkspace` — это chrome для TOC/chips/tools/body. Он **не** является готовым icon-rail/flyout-компонентом.
- Эталон overlay-поведения уже есть в `ProposalCreatePage`: rails фиксированы, flyout overlay, центр не сжимается, backdrop закрывает панель, Escape закрывает панели.
- `ProductionCockpitContext` и `ProductionReadFacade` уже являются естественными владельцами состояния и чтения; shell не должен забирать у них оценку и фильтрацию.
- `work-types` уже использует `PiGroupWorkspace`; `/production` сейчас живёт отдельным shell-стилем.

## Исправления к исходному плану

1. **Не «перевести Гант на PiGroupWorkspace» буквально.** Обернуть страницу в `PiGroupWorkspace` для единого раздела «Цех», а studio body оставить отдельным локальным shell. Нельзя заставлять общий компонент знать про rails, Gantt, inspector или production state.
2. **Не делать B как большой архитектурный рефактор до первого визуального результата.** Сначала зафиксировать shell-контракт и сделать минимальный shell с поведением 1:1; затем тонко разделить state/render. Иначе получится большой незаметный рефактор без PO-проверки.
3. **Не вводить абстрактный shared `StudioRail` в первой итерации.** КП и Гант имеют разные tool sets и ширины flyout. Повторение третьим местом — evidence для shared primitive; до этого production-local CSS/компонент безопаснее.
4. **Не открывать одновременно левый и правый flyout в v1.** Один активный flyout за раз, backdrop и Escape. Это сохраняет максимум центра и не создаёт перекрывающуюся механику.
5. **Не обещать «весь toolbar в rail» без карты действий.** В v1 перенести только существующие действия без изменения семантики: Заказы, Фильтры, Обновить — слева; Карточка/инспектор, Сегодня, Масштаб — справа. `Сброс фильтров` остаётся внутри flyout «Фильтры», а не отдельной кнопкой.

## Frozen shell contract v1

```text
PiGroupWorkspace (Цех: Гант | Виды работ)
└─ production-studio-body (overflow: hidden; relative)
   ├─ left icon rail 48px: Заказы · Фильтры · Обновить
   ├─ center: только timeline/header Gantt, flex: 1, min-width: 0
   └─ right icon rail 48px: Карточка · Сегодня · Масштаб
      flyout: absolute overlay от выбранного rail, центр не сжимает
```

- В закрытом состоянии центр занимает всё пространство между rail.
- Список заказов и фильтры больше не занимают постоянные `w-56`.
- Inspector не занимает постоянные `20rem`; он открывается справа overlay.
- Заголовок не содержит длинный ряд текстовых кнопок.
- Rail визуально нейтрален и не создаёт лишнюю заливку/рамку; активная кнопка имеет понятное состояние.
- На узком экране `<1280px` flyout может открываться как широкая overlay-панель, но не должен сжимать Гант; если места нет — rail остаётся доступным, центр сохраняет горизонтальный scroll.
- На телефоне/очень узком режиме допустим компактный fallback, но нельзя оставлять одновременно старый docked rail и новый rail.

## Поведение и a11y: обязательный acceptance

- Каждая rail-кнопка имеет русские `aria-label`, `title`, `aria-expanded`, `aria-controls`.
- В одном состоянии открыт максимум один flyout.
- Клик по backdrop и `Escape` закрывают flyout; клик внутри flyout не закрывает его.
- Фокус после открытия уходит в заголовок/первый контрол flyout; после закрытия возвращается на кнопку rail.
- `Tab` не уходит в закрытый flyout; видимый focus ring есть в light/dark.
- Enter/Space работают на rail-кнопках.
- Переходы по `/production?orderId=` и unknown id сохраняются без изменения.
- Выбор заказа, фильтрация, zoom, refresh, today, fit horizon и inspector работают 1:1 до рефактора.
- Нет drag-reschedule, check-in, assign-write, `ProductionSchedule`, `ProductionOrder` или нового API в этой волне.

## Конкретные волны

### A — Spec / no product code
Создать source-of-truth spec с frozen shell contract, mapping старых действий в rails/flyouts, responsive и a11y acceptance. Обновить page-doc и readiness. Старые 308–310 пометить как absorbed/blocked by studio wave, не запускать поверх старого layout.

### B — Shell migration, behavior-preserving
Обернуть в `PiGroupWorkspace`, вынести `leftTool/rightTool/flyoutOpen` в локальный shell state, перенести существующие блоки без изменения facade/context и API. Сначала добиться зелёных unit/typecheck и проверки, что старое поведение сохранилось.

### C — Visual studio pass
Убрать постоянные `w-56/w-14` и текстовый toolbar; добавить L/R rails и overlay flyouts. Маппинг: Заказы/Фильтры/Обновить — left; Карточка/Сегодня/Масштаб — right. Reset — внутри Filters. Центр не сжимается.

### D — Tree and visual consistency
Унифицировать disclosure дерева, hit-target, focus-visible и non-color state; не менять структуру данных. Сверить цвета/типографику с КП Studio и `Paper & Ink`.

### E — Cross-page consistency
Проверить `/production` и `/work-types` как единый раздел «Цех»: один верхний chrome, русский текст, без второго toolbar и без ложного «Каталог».

### F — Evidence-based shared primitives
Только если rail/flyout фактически повторяется третьим production screen, выделить shared primitive. До этого локальная реализация предпочтительнее.

### G — закрытие только после visual PASS
Включить только безопасные хвосты 308–310: scroll-to-today, keyboard navigation и non-color cues. Любые writes/resize/drag вынести в отдельные TZ после studio PASS.

## PO smoke / geometry gate

На ширине 1920 и в light/dark проверить:

1. Открыть `/production`: Гант виден сразу, центр максимален.
2. Закрытые flyout не уменьшают центр при открытии/закрытии.
3. «Заказы» открывает overlay слева; «Фильтры» — overlay с существующими фильтрами.
4. «Карточка» открывает inspector справа; закрытие не сбрасывает выбранный заказ.
5. «Сегодня», «День/Неделя», «Обновить» работают из новых мест.
6. Backdrop/Escape/focus работают.
7. `/production?orderId=<id>` и неизвестный id работают.
8. Light/dark и `<1280px` не дают клиппинга, двойного скролла или наложения на header.

Для geometry smoke измерять `getBoundingClientRect()`: rails находятся внутри studio body, flyout overlay не меняет ширину center, постоянного `w-56`/`w-20rem` docked блока нет. Одного `querySelector` недостаточно.

## Итоговая шкала после реализации

| Слой | Цель |
|---|---:|
| Домен/оценка | 72 — оставить стабильным |
| Angular state/blocks | 78 — без лишнего переписывания |
| Studio chrome | 95 |
| Иерархия/иконки/дерево | 92 |
| Согласованность `/production` ↔ `/work-types` | 92 |
| Docs/readiness/gates | 98 |
| Факт производства | 12 — намеренно вне scope |

**Целевой PO PASS:** 98–99 для studio estimate. Это не означает 100% готовность фактического производства.
