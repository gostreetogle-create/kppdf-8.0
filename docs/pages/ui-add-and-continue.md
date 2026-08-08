# UI: Add & continue (пикеры каталога)

**Канон PO (2026-08-08):** когда нужно добавить **несколько** позиций подряд
(состав, позже фото…), диалог **не** закрывается на каждое «Добавить».

## Паттерн

1. Выбрал в списке → **Добавить** → запись сразу применена → селект очищен →
   диалог остаётся открыт.
2. Под селектом — короткий список «Добавлено сейчас» (feedback).
3. **Закрыть** / ✕ — выйти, когда закончил. Уже добавленное не откатывается.

## Когда так

- Состав изделия/модуля (`product-composition-picker`) — TZ-UX-DIALOG-303
- Любой сценарий «N однотипных добавлений подряд»

## Когда иначе

| Сценарий | Паттерн |
|----------|---------|
| Одна позиция и ушёл | close-on-submit (как было) |
| Много **однородных** id без per-line полей | checkbox multi + одно «Добавить» (module multi) |
| Создание сущности с id после save | create→остаться (FORM-304/306) |

## Реализация (composition picker)

- Data: `onAdded?: (result) => void | Promise<void>` в `ProductCompositionPickerData`
- UI: session list `data-test="picker-session-added"`; footer «Закрыть»; primary
  не закрывает при успехе
- Parent: `ProductBomPanel.openAddPicker` → `applyCompositionLine` на каждый Add
- Legacy без `onAdded`: close(result) как раньше

## Не делать

- Открывать диалог заново на каждый пункт.
- Checkbox multi там, где у строки есть цена/qty per pick (состав с override).
