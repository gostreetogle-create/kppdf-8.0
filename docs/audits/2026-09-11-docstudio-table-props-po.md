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
