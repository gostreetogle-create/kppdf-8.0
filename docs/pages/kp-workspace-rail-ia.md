# КП Single Workspace — Rail IA (left / right / ribbon)

> **Назначение:** финальная информационная архитектура rails и ribbon для single workspace
> (Layer 1, TZ-402; источник — часть B TZ-KP-WS-400). Сверка demo `/proposals/demo-workspace`
> ↔ production `/proposals/create` (data-test `kp-create-toggle-*`).
> **Закон геометрии:** `docs/pages/kp-workspace-geometry.md` (immutable). Панель = overlay 480px,
> левый rail в chrome через `PiChromeToolsService`, ribbon не двигает лист.
> **Программа:** `docs/audits/2026-08-23-kp-single-workspace-program.md` §3 (таблица IA).
> **Ограничение:** только архитектура. Внутренности панелей (кнопки, фильтры) — по аудиту
> `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` (часть A, отдельный артефакт).

## 1. Финальная IA — сводная таблица

Правило: **rail = разделы** (навигация по инструментам), **ribbon = действия документа**
(ориентация, №/дата, статус/сумма, вывод). Одна функция — ровно одно место (см. §4, §5).

### Left rail (через chrome-rail-left, `chrome-tool-{id}`)

| # | Секция | Иконка Lucide | Откуда (create) | data-test (create) | Tier | data-test (workspace) |
|---|--------|---------------|-----------------|--------------------|------|-----------------------|
| 1 | Каталог (изделия/модули/материалы) | `Package` | flyout «Товары» | `kp-create-toggle-left` | S | `chrome-tool-catalog` |
| 2 | Шаблон (+ «Редактировать в конструкторе») | `FileText` | flyout «Шаблон» | `kp-create-toggle-template` | S | `chrome-tool-template` |
| 3 | Клиент (контрагент · контакт · объект) | `ContactRound` | flyout «Получатель» | `kp-create-toggle-recipient` | S | `chrome-tool-client` |

### Right rail (через chrome-rail-right, `chrome-tool-{id}`)

| # | Секция | Иконка Lucide | Откуда (create) | data-test (create) | Tier | data-test (workspace) |
|---|--------|---------------|-----------------|--------------------|------|-----------------------|
| 4 | Параметры (документ · деньги · сроки · org) | `SlidersHorizontal` | right pane `params` | `kp-create-toggle-right` | S | `chrome-tool-params` |
| 5 | Редактор таблицы (состав + chrome таблицы) | `TableProperties` | right pane `table` | `kp-create-toggle-table` | **L** | `chrome-tool-table` |
| 6 | Условия (+ библиотека TextBlock) | `ScrollText` | right pane `terms` | `kp-create-toggle-terms` | S | `chrome-tool-terms` |

### Ribbon (не rail!)

| Действие | Иконка Lucide | Откуда (create) | data-test |
|----------|---------------|-----------------|-----------|
| Ориентация книжная/альбомная | `RectangleVertical` / `RectangleHorizontal` | — (только demo) | `kp-orient-toggle` |
| Шаблон · Фирма · Клиент (сводные селекторы) | `ChevronDown` (текст+chevron) | inspector (`kp-insp-*`) | `kp-ws-ribbon-*` |
| № · дата | — (текстовые поля) | `kp-insp-number` / `kp-insp-date` | `kp-ws-ribbon-*` |
| Статус · сумма | — (badge + total) | `kp-status-select` / итог | `kp-ws-ribbon-*` |
| Печать | `Printer` | `kp-output-print` | `kp-ws-ribbon-print` |
| PDF | `Download` | `kp-output-pdf` | `kp-ws-ribbon-pdf` |
| Ещё (архив и пр.) | `Ellipsis` | `kp-output-archive` | `kp-ws-ribbon-more` |
| Fit (масштаб viewport) | `Maximize2` | — (demo toolbar) | `kp-ws-viewport-fit` |

**Вывод (п. 7 программы):** отдельная rail-кнопка «Вывод» упраздняется — Печать/PDF/Архив
переезжают в ribbon (всегда видимы, не reflow). Это единственный rail-→ribbon перенос.

> **STATUS 2026-08-23 (TZ-KP-WS-402):** «Вывод» временно зарегистрирован в правом rail
> (`chrome-tool-output`, иконка `Printer`) до прихода панелей/ribbon-действий (TZ-403/404);
> ribbon-перенос — по мере ввода ribbon-кнопок в TZ-404.

## 2. Сверка demo ↔ create (data-test parity)

Demo rail рендерится chrome-ралем (`chrome-tool-{id}`, side left, 6 секций); create имеет
**собственный инлайн-rail** (`kp-rail-left`/`kp-rail-right` + `kp-create-toggle-*`) — это
основное расхождение, которое закрывает Layer 1.

| demo (id → `chrome-tool-*`) | create (toggle) | Совпадение смысла | Решение |
|-----------------------------|-----------------|-------------------|---------|
| `catalog` (Package) | `kp-create-toggle-left` «Товары» | ✅ каталог изделий | merge → секция **Каталог**, id `catalog` |
| `template` (FileText) | `kp-create-toggle-template` | ✅ | остаётся, id `template` |
| `composition` (List) | (в create — внутри `kp-create-toggle-table`) | ⚠️ состав = часть таблицы | merge в **Редактор таблицы**, id `table` |
| `params` (Settings) | `kp-create-toggle-right` (SlidersHorizontal) | ✅ | остаётся, иконка → `SlidersHorizontal` |
| `client` (User) | `kp-create-toggle-recipient` (ContactRound) | ✅ | остаётся, иконка → `ContactRound` |
| `terms` (ScrollText) | `kp-create-toggle-terms` | ✅ | остаётся, id `terms` |
| — (нет) | `kp-create-toggle-output` (Printer) | — | **убрать из rail** → ribbon |
| — (нет) | `kp-create-toggle-table` (TableProperties) | — | остаётся, id `table`, tier L |

Итог: 6 chrome-tool секций (3 left + 3 right) вместо 7 инлайн-кнопок; `kp-create-toggle-output`
ликвидируется на cutover 408 (переезд в ribbon), остальные `kp-create-toggle-*` → алиасы
`chrome-tool-*` до очистки 409.

## 3. Icon dedup — конфликты и резолюции

| Конфликт | Где | Резолюция |
|----------|-----|-----------|
| `Package` дважды: demo `catalog` и create «Товары» | rail | Один смысл — одна секция «Каталог» с `Package`. Дубликат кнопки исчезает с merge секций |
| `FileText` дважды: demo `template` и create `template` | rail | ОК (та же секция), но в workspace `FileText` — **только** rail; ribbon «Шаблон» — текстовая кнопка без иконки, чтобы не было двух `FileText` на экране |
| `User` (demo `client`) vs `ContactRound` (create `recipient`) | rail | Финал — `ContactRound` (контакт точнее «пользователя»). `User` освобождается |
| `Settings` (demo `params`) vs `SlidersHorizontal` (create `params`) | rail | Финал — `SlidersHorizontal` (create SoT, ближе к «настройки документа») |
| `List` (demo `composition`) vs `TableProperties` (create `table`) | rail | Финал — `TableProperties`; `List` освобождается (не использовать для «Состав» отдельно) |
| `Printer` дважды: demo ribbon «Печать» и create rail `output` | rail vs ribbon | Ribbon SoT; rail-кнопка удаляется |
| `Download` (PDF) — только demo ribbon | ribbon | Остаётся в ribbon; create `kp-output-pdf` сливается |

Проверка после Layer 1: каждый Lucide-икон в rails/ribbon встречается ровно один раз
(грепом по `[img]="...Icon"`), кроме `ChevronDown` (селекторы) и `Ellipsis` (меню «Ещё»).

## 4. Dedup кнопок (не иконок)

| Кнопка | create | workspace | Решение |
|--------|--------|-----------|---------|
| Печать / PDF | `kp-output-print` / `kp-output-pdf` (flyout «Вывод») | ribbon | перенос; flyout «Вывод» не рендерится |
| Сохранить в архив | `kp-output-archive` | ribbon → «Ещё» | перенос в меню |
| Открыть «Товары» | `kp-table-editor-open-products` (в таблице) | внутри L-панели таблицы | остаётся — контекстный шорткат, не дубль rail (открывает rail-секцию «Каталог») |
| Добавить шаблон | `kp-tpl-add` (empty-state центра) | empty-state центра | остаётся; rail-кнопка «Шаблон» не дублируется CTA |
| Редактировать шаблон | `kp-tpl-edit` | панель «Шаблон» → embedded (Wave 405) | остаётся в панели, не в rail |
| Изменить получателя | `kp-insp-edit-recipient` (inspector) | панель «Клиент» | остаётся — короткий путь к rail-секции |

Запрещено: rail-кнопка + ribbon-кнопка на одно действие (см. §1 правило).

## 5. Tier S/L панелей

- **S (standard):** фиксированная 480px overlay, контент `max-width: 272px` (закон #4).
  Все левые секции + Параметры + Условия.
- **L (large):** wide ~A4 / full overlay — только **Редактор таблицы** (состав + chrome),
  `data-flyout-tier="l"`.
- Дельта от create: сейчас `products` и `recipient` помечены tier `l` — в workspace это S.
  Правило: tier L получает панель только если ей нужна ширина листа (таблица); списки — S.

## 6. Действия на cutover (408) и leftover

- **TZ-402:** chrome-tool секции по таблице §1; demo `catalog|template|composition|params|client|terms`
  переименовать/слить по §2 (id = финальные).
- **Leftover (legacy, до 409):** инлайн `kp-rail-left`/`kp-rail-right` + `kp-create-toggle-*`
  в `proposal-create.page.ts`; flyout «Вывод» (`kp-output-*`); секция demo `composition`.
- **Parity-тесты** (408): `chrome-tool-catalog/template/client/params/table/terms` рендерятся
  и открывают панель; `kp-ws-ribbon-print/pdf/more` присутствуют; rail не содержит кнопки
  «Вывод»; `Package/FileText/ContactRound/SlidersHorizontal/TableProperties/ScrollText`
  встречаются в rails ровно по одному разу.

## 7. Migration note

- Не хардкодить второй инлайн-rail поверх chrome rails (закон #5 геометрии).
- Не добавлять rail-кнопку «Вывод» — вывод живёт в ribbon.
- Не использовать освобождённые иконки (`List`, `User`, `Settings`) в новых секциях без
  новой резолюции в этой таблице.
- Ручной дубль rail-раздела в ribbon (например, «Клиент» и в rail, и в ribbon-селекторе) —
  запрещён: ribbon-селектор «Клиент» — сводка, панель «Клиент» — редактирование.
