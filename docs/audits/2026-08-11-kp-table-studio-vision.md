# KP Table Studio — vision (2026-08-11)

## Проблема

Кнопка «Таблица» в Create КП была узким списком колонок (←→ / Видна) на 20rem.
Менеджер не чувствовал **таблицу своего КП** — только «настройки колонок».
Состав уже стал usable таблицей строк (355/355.1); «Таблица» должна стать редактором **вида** на A4.

## Решение волны WAVE-KP-TABLE-STUDIO

| TZ | Что |
|----|-----|
| **356** | «Своя строка» вниз состава; рейл Параметры → Состав → Таблица → Условия |
| **357** | KP Table Studio: flyout ≈ A4 (`min(794px,…)`), chrome toolbar, column strip + width%, live HTML table, qty/цена → тот же `draftLines` |
| **358** | Build HTML применяет `widthPercent` + `borderWeight` / `headerWeight` на line-items таблицу |

## Канон

- Экземпляр КП (copy-on-write): `kpTableLayout` (+ `widthPercent`) и `kpTableChrome`.
- Shared `TableTemplate` в Документах **не** пишется.
- Состав = данные (qty/цена/сумма); Таблица = вид на бланке. Merge в один pane — **не** в этой волне.
- Полный конструктор колонок (типы/формулы) — только в Документах.

## Связанные файлы

- FE: `proposal-create-table-studio.component.ts`, composition footer, page rail/flyout
- BE: `BuildTableLayoutColumnDto.widthPercent`, `BuildTableChromeDto`, `table-template.service` preview
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-TABLE-STUDIO.md`
