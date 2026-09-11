# Аудит: студия КП — таблица «Продукты» (фото / qty / reorder / панель)

**Дата:** 2026-09-11  
**Триггер:** PO скрин — колонка Фото пустая; нет Количества; нет порядка колонок; узкие «Строки таблицы»; где правятся виды таблиц.

### Preflight Check Output
- **Context read:** `studio-table-properties.component.ts` (`columnsEditable`); `studio-data-resolver.ts` (S48 photo + qty aliases); `studio-blocks-canvas` photo cell; `table-templates.registry.ts`; `--kp-panel-w: 340px`; `WAVE-NX-CATALOG-PHOTOS` DONE
- **Key Constraints:** Mode A TZ; не ломать Paper&Ink rail geometry canon без явного widen; reuse aliases
- **Planned Deliverable:** WAVE + TZ pack
- **Validation Path:** studio specs S48; nx build

---

## Вердикты (просто)

| Жалоба | Факт | Что делать |
|--------|------|------------|
| Фото не видно | Binding S47/S48 **есть**. Пусто = нет URL у изделия/материала **или** ключ колонки не в photo-aliases (тогда даже не «Нет фото»). | Диагностика + честный empty + убедиться что у каталога есть mainPhoto; smoke |
| Где виды таблиц | **Реестры → Документы → «Виды таблиц»** (`table-templates`). Подсказка в props есть, слабо заметна. | Ссылка «Открыть реестр» + после DROP-REFERENCE нет путаницы со «Справ.» |
| Нет «Количество» | Чекбоксы = только колонки **вида**. Добавить qty нельзя, пока выбран template. Catalog insert всегда `quantity: 1`. | Palette «добавить колонку Количество» + edit qty в строках |
| Нет сдвига колонок | `moveColumn` есть, но **заблокирован**, если выбран вид таблицы (`columnsEditable` = false). | Unlock reorder при template + persist order на блоке |
| Узкое меню строк | Flyout **340px** → H-scroll. PO: ×2–2.5 → **~800–850px**. | Widen props panel (table focus) |
| Несколько «Продукты» | Виды из БД/seed; seed-канон PO 6-col может отсутствовать. | Опционально seed + CRUD уже в реестре |

**Сырьё/материалы фото в формах:** wave catalog photos DONE — если на карточке нет фото, в таблице тоже пусто.

---

## WAVE

`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md`

## Closeout 01/5 (2026-09-11) — `TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH` DONE

Панель уже была overlay (`position: absolute` в `.kp-ws-body`) — закон 1
`kp-workspace-geometry.md` (не reflow A4) архитектурно уже соблюдался, ничего
чинить не пришлось. Новый scoped `panelTable`/`kp-ws-panel--table` (820px,
только для properties секции с выбранным table-блоком) рядом с уже
существующим `panelWide`/`kp-ws-panel--wide` (58rem, только `data`) — text/
image properties остались на 340px. SHA `0df45baf`.

## Closeout 02/5 (2026-09-11) — `TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE` DONE

`columnsEditable()` блокировал reorder/add-column ОБОИМИ условиями:
`rowSource==='manual'` И `!templateId` — при выбранном виде (любом, включая
catalog-источники типа «Продукты») структура была read-only целиком. Свёл к
одному условию (`customColumns !== false`) — структура (`tableTemplateColumns`)
и так физически хранится на блоке (snapshot при выборе шаблона), никакого
PATCH реестра не требовалось никогда, просто UI не давал трогать. Добавлена
quick-add палитра стандартных полей (qty/sku/photo/unit/description/price,
ключи = canonical BE `COLUMN_ALIASES`) — чтобы добавленная «Количество»
реально гидрировалась из catalog/quotation/order rows, а не висела пустой
колонкой из-за несовпадения ключа. Rehydrate `liveRows` при смене структуры
для live-источников — уже существовавшая инфраструктура (TZ-NX-DOCSTUDIO-S47),
сработала без единой правки. SHA `24e2ae14`.

## Closeout 03/5 (2026-09-11) — `TZ-NX-DOCSTUDIO-TABLE-LINE-QTY` DONE

Первый план (переиспользовать `mergeRowOverrides`/`dataSets.rows` sparse-override,
тот же механизм, что у manual-таблиц) оказался небезопасным при проверке:
клиент нигде не хранит «чистый» override-массив — и `block.settings.liveRows`,
и `document.dataSets[key].rows` после любого `putDataSet`/hydrate — это уже
СМЕШАННЫЙ (merged) результат. Переслать его назад как «manual override» —
заморозить имя/цену/фото навечно, а не только qty. Вместо этого — qty-override
хранится **на блоке** (`tableQtyOverrides`, ключ = индекс строки), тот же
уровень хранения, что и `tableTemplateColumns`; backend-резолвер применяет
его заново при каждом live-фетче — имя/цена/фото остаются всегда живыми,
только qty (и пересчитанный `total = price * quantity`) — sticky. Найден и
исправлен попутный баг формулы: `total` раньше всегда равнялся `price`
(корректно выглядело только при qty=1 по совпадению). SHA `d042de05`.

## Closeout 04/5 (2026-09-11) — `TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE` DONE

Прямой запрос к реальной локальной Mongo (`table_templates`) подтвердил: живые
шаблоны «Продукты» ключуют фото-колонку `photoIds`, не `photo` — и это УЖЕ
покрыто `PHOTO_COLUMN_KEY_ALIASES` регистронезависимо. Пункт аудита закрыт
как **verified-OK**, не как баг. Копнув на слой глубже — сверил все 304
документа `photos` с реальными файлами в `backend/uploads/`: **237 из 304
(78%) — orphaned-ссылки** (Photo-документ есть, файла на диске нет). Именно
это, а не «нет фото у товара», скорее всего и стоит за скрином PO — товар без
фото УЖЕ рендерился как «Нет фото» корректно; сломанной была именно эта
ситуация (raw broken `<img>`). Проверил, что client-side `onerror`-фикс не
сработает для превью — `<iframe sandbox="allow-same-origin">` без
`allow-scripts` не исполняет инлайн-JS. Починил один раз на сервере
(`resolveCatalogPhotoUrls` теперь проверяет файл на диске) — canvas, preview
HTML и PDF потребляют один и тот же `photoUrl`, чинится сразу везде без
правок в каждом рендер-пути отдельно. Upload pipeline не тронут (не входило
в scope). SHA `7d904839`.
