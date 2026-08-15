# TZ-UX-321-FIX: восстановить anchor rails и правую панель

## Статус

READY FOR EXECUTION — product-код пока не изменять автоматически.

## Инцидент

После closeout `TZ-UX-321` стрелки снова визуально уехали в левое поле. Closeout заявляет «DONE», но реализован только левый rail, а его `position: absolute` не имеет гарантированного positioned parent.

## Доказательства в текущем `main`

- HEAD содержит merge UX-321 `85dbcc57` и feat `21f32f11`.
- DOM содержит только `data-test="app-chrome-rail-left"`; `app-chrome-rail-right` отсутствует.
- Обе кнопки `app-nav-back` и `app-nav-forward` находятся внутри левого rail.
- `.app-chrome-rail-left` использует `position: absolute`, но `.pi-page-frame` не имеет `position: relative`.
- CSS якорит rail через `left: 64px`, то есть относительно viewport/initial containing block, а не относительно frame. Поэтому в широком окне rail появляется примерно у левого края, а не на вертикали бренда.
- Checklist/визуальный smoke проверяют наличие DOM, ширину и `position: absolute`, но не проверяют computed `getBoundingClientRect()` и координаты относительно `.pi-page-frame`.

## Канонический результат

На viewport 1920px при `--screen-max: 1400px` и padding frame 64px:

- `.pi-page-frame` rect left ≈ 260px;
- левый rail: left ≈ 260px, width 64px;
- внутренний контент начинается ≈ 324px;
- правый rail: left ≈ 1596px, width 64px;
- rail boundaries прозрачны: нет border/background/shadow на rail;
- `←` находится в левом rail, `→` — в правом rail;
- на `<1680px` оба rail скрыты.

## Обязательное исправление

1. Добавить `relative` к `.pi-page-frame`.
2. Оставить rails DOM-элементами shell под header, но сделать два контейнера:
   - `data-test="app-chrome-rail-left"`;
   - `data-test="app-chrome-rail-right"`.
3. Позиционировать относительно frame:
   - left rail: `position:absolute; inset-block: var(--header-h) 0; left:0; width:64px`;
   - right rail: `position:absolute; inset-block: var(--header-h) 0; right:0; width:64px`.
4. Убрать `left:64px`, `right:64px`, `position:fixed` и любые viewport-пиксельные якоря у rails/стрелок.
5. Обе панели сделать прозрачными: не добавлять `border`, `border-inline`, отдельный `background`, `box-shadow`.
6. Сохранить `AppHistoryStore`, disabled, aria и `data-test` кнопок.
7. Не переносить в эту исправляющую TZ фильтр или другие page-tools; их projection — отдельная TZ-UX-322.

## Acceptance criteria

- DOM: back — child left rail, forward — child right rail.
- `getComputedStyle(.pi-page-frame).position === 'relative'`.
- Browser smoke 1920 light/dark:
  - `leftRail.getBoundingClientRect().left === frame.left` с допуском 1px;
  - `rightRail.getBoundingClientRect().right === frame.right` с допуском 1px;
  - левый rail right совпадает с content-start frame;
  - правый rail left совпадает с content-end frame;
  - ни один rail не находится у `viewport.left + 64px` случайно;
  - rail не перекрывает таблицу.
- Browser smoke 1440/1280: оба rail `display:none`.
- Jest проверяет parent/DOM ownership и отсутствие старого `app-nav-gutter`.
- Typecheck, focused layout Jest, build PASS.
- Closeout не может быть `DONE`, если отсутствует computed-geometry evidence.

## Prompt executor

```text
Исправь регрессию TZ-UX-321 по tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md.
Сначала CLAIM и проверь чужой WIP; product-код не трогай.

Причина уже установлена: `.app-chrome-rail-left` absolute, но `.pi-page-frame`
не relative, поэтому left:64px считается от viewport. Плюс в текущем DOM нет
правого rail, обе стрелки находятся слева.

Сделай только shell fix:
- `.pi-page-frame` => position: relative;
- два прозрачных rail под header: left/right, width 64px, inset-block
  var(--header-h) 0, anchors left:0/right:0 относительно frame;
- ← только в left rail, → только в right rail;
- удалить fixed/left:64/right:64 у history controls;
- не менять AppHistoryStore, aria, data-test и page-tools.

Добавь/исправь focused tests и browser smoke с getBoundingClientRect на 1920px
(light/dark) и display:none на узком viewport. Не принимай self-score без
координат geometry evidence. Запусти tsc, focused Jest и build. Deploy не делать.
После проверки оставь READY FOR REVIEW с screenshot/json evidence; не коммить
без отдельной команды PO.
```
