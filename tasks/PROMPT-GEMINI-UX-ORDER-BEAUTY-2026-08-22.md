# PROMPT — Gemini: наведение порядка (красота / IA), не код

> Обсуждение с Gemini. **Не** executor-слот: Claude + 2 Freebuff уже пакуют FORM-308/309/310.  
> Deploy нет. Файлы продукта не трогать. Ответ принести в Cursor.

**PO:** новый чат Gemini, блок ниже целиком.

---

```text
ANALYSIS ONLY. Не писать код, не git, не TZ, не править файлы. Не деплой.

Ты Gemini. Нужен вкус к рабочему B2B-сайту: плотность, иерархия, «не стыдно показать коллеге». Не концепт агентства и не редизайн с нуля.

Продукт: kppdf — цеховой ERP ~10 человек. Русский UI. Light и dark. Viewport оператора 1440×900. Дизайн-система Paper & Ink (тёплая бумага, hairline, gold, OKLCH) — канон, не баг. Репозиторий: D:\kppdf-8.0

Сначала прочитай (не весь репо):
- docs/PO-CANON.md
- docs/paper-and-ink.md
- docs/DIALOG-COOKBOOK.md
- docs/pages/ui-dialog-canon.md
- docs/pages/ui-form-field-capacity.md
- docs/pages/ui-form-sections-canon.md
- docs/pages/page-chrome.md (рейлы с 1024, не откат w-12)
- docs/superpowers/specs/2026-08-22-density-canon-brief.md
- docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md
- docs/pages/manager-desk.page.md
Шаблоны (только взгляд, не патч):
- frontend/src/app/pages/products/product-form-dialog.component.ts  (три вертикальных стека — как раз пакует FORM-309)
- frontend/src/app/pages/modules/module-form-dialog.component.ts
- frontend/src/app/pages/materials/material-form-dialog.component.ts  (секции-эталон, внутри ещё naive grid)
- frontend/src/app/shared/orders/order-hub-tray.component.ts
Если есть браузер — /desk раскрытый черновик, /products → Редактировать, /materials → форма. Иначе хватит шаблонов.

УЖЕ РЕШЕНО (не предлагай снова):
- Стол = expand-in-row. Две панели «список слева / карточка справа» = отклонённый 401 (выбранный уезжает).
- Не новый UI-kit. Не холодная серо-синяя палитра. Не global compact/comfortable token.
- Не плоская таблица вместо app-composition-tree.
- Kind C остаётся диалогом. Сначала packing полей, не раздувать maxWidth, не «15 полей → страница».
- Delete заказа в строке очереди = DESK-418, не выносить без нового решения PO.
- Сейчас в коде: FORM-308 field-capacity; FORM-309 изделие; FORM-310 модуль. Не дублируй эту работу.

ВОЛНА ПЛОТНОСТИ УЖЕ ВЫДАНА. Твоя тема — что стыдно ПОСЛЕ неё и рядом: flyout, tray, списки, типографика внутри Paper & Ink, следующие редакторы.

Ответь по-русски, коротко. Не 50 советов. Не «добавить whitespace / card / shadow».

Формат ответа строго:

## Стыд (макс 5)
Ранг для показа коллеге завтра. Экран + в чём глаз спотыкается + это IA или только визуал.

## Ответы
1. После packing изделия: фото+BOM всё равно толкают body-scroll на 1440. Вкладки в том же окне, внутренний scroll только у BOM, или оставить? Один выбор + почему.
2. Следующий FullEditor после изделия/модуля: материал (секции уже есть, сетка naive), люди, организация/контрагент, форма заказа в flyout, color-reference? Один первый + почему не остальные.
3. Field-capacity на flyout и expand-tray: полный 12-col или только max-w на числах и запрет «всем 50%»? Не размазывать 12-col на стол.
4. Состав в tray: слишком много вложенных рамок. Что убрать в Paper & Ink (hairline/cards), не ломая дерево?
5. Иерархия без новой палитры: номер заказа / имя клиента / статус — чего не хватает в токенах ink/muted/gold? Цветные бейджи статусов — да/нет.
6. Chrome-rail с 1024: риск «ещё не видно» vs «съели контент». Как проверить на 1440×900 за 10 секунд.
7. Dark: один стыдный контраст, который ты видишь в коде/токенах, или «не приоритет».
8. Вечные подписи / underline-как-кнопка: где ещё кроме старого стола это живёт (grep-гипотеза по файлам)?
9. Три следующих executable среза (имя экрана + какие файлы, не тема). Каждый — один агент, разные conflict keys.
10. Что красиво, но НЕ делать в ближайшие две недели (анти-бэклог).

## Вердикт
5–7 буллетов, которые Cursor может вклеить в канон или в следующую TZ. Отметь TAKE / REJECT.

Конец. Без плана на квартал и без «современный мощный инструмент».
```
