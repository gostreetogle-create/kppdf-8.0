# WAVE-KP-TABLE-EDITOR — один «Редактор таблицы» вместо двух панелей

**Канон:** `docs/audits/2026-08-12-kp-table-editor-unified-canon.md`
(предшественники: `2026-08-11-kp-table-studio-vision.md`, `2026-08-09-kp-table-config-canon.md`)

**Порядок строгий: 359 → 360 → 361.** Deploy — только по явному «деплой» от PO.

**Пре-условие волны:** WAVE-KP-TABLE-STUDIO (356 / 357 / 358) закоммичена и заархивирована.
Если правки Table Studio ещё лежат в рабочем дереве без коммита — сначала закрыть их,
иначе 359 переписывает незакоммиченный WIP.

## Проверено (источники)

```text
frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-table-studio.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts (rail 385–439, flyout 504–560, --kp-flyout-w 629, data-flyout 727–739)
frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts (ProposalTableLayoutColumn / ProposalTableChrome / ProposalTableTarget)
docs/pages/proposals-create.page.md
```

---

## TZ-SALES-359 — merge UI: один редактор + рейл из трёх кнопок

**LAYER:** 3 (страница Create КП — один агент за раз)
**CONFLICT KEYS:**

```text
frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts (new, из table-studio)
frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts (delete)
frontend/src/app/pages/commercial/proposals/proposal-create-table-studio.component.ts (delete/rename)
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts
docs/pages/proposals-create.page.md
```

**ЧТО ДЕЛАТЬ**

1. `proposal-create-table-studio.component.ts` → `proposal-create-table-editor.component.ts`
   (`app-proposal-create-table-editor`, `data-test="kp-table-editor"`). Заголовок «Редактор таблицы»,
   один хинт, справа «N позиций · Итого».
2. Перенести в него ячейки состава: скидка `%`, `Сумма` (обратный пересчёт цены за ед.), `Опц.`,
   `Ед.`, `Описание`, имя своей строки, `↑↓`, `✎` (карточка каталога), `🗑`, footer `+ Своя строка`.
   Контракт правки строк остаётся один: `ProposalCompositionLineChange` (объявление переезжает
   в новый компонент, обработчик `onCompositionLineChange` на странице не меняем).
3. Зоны таблицы: жёлоб `↑↓ №` слева, колонки раскладки в середине, `%` + `Опц.` в зоне
   «только в КП» (притенённый фон), `✎ 🗑` справа. Между toolbar и таблицей — hairline.
4. Удалить `proposal-create-composition.component.ts` и rail-кнопку «Состав»:
   `rightPane` = `'params' | 'table' | 'terms'`; `data-flyout="table"` шириной `min(794px, …)`;
   `aria-label` / `title` / заголовок flyout = «Редактор таблицы».
5. Spec: rail из трёх кнопок; qty/цена/сумма/скидка/опц. правятся через новый компонент;
   «Своя строка» добавляет строку; кнопки «Состав» нет.

**НЕ ИЗМЕНЯТЬ:** shared `TableTemplate` и `table-template.service`; `preview`/`build` HTML;
левый рейл; DTO раскладки; `duplicate` строки не возвращать.

**AC:** канон §6 пункты 1–4, 7, 8; FE tsc чистый; spec зелёный.

---

## TZ-SALES-360 — полировка: настройка колонки в её шапке

**CONFLICT KEYS:** `proposal-create-table-editor.component.ts`, `proposal-create.page.spec.ts`,
`docs/pages/proposals-create.page.md`

**ЧТО ДЕЛАТЬ**

1. Каретка в ячейке шапки колонки → мини-меню: «Левее · Правее · Ширина % · Скрыть».
   Блок `studio__columns` (chips-стрип) удалить.
2. Тонкая полоса `Скрыто: <колонка> ×` под toolbar — только когда есть скрытые; чип возвращает колонку.
   Полный список колонок — `Колонки ▾` в toolbar.
3. `⋯ Ещё`: «Добавить поля КП (кол-во/цена)», «Открыть пресет в Документах», «Сбросить ширины».
4. Нормализация ширин видимых колонок до 100 %; микро-подписи зон
   («на бланке» / «только в КП»); пустое состояние = подсказка + кнопка «Товары» + скелет шапки бланка.
5. Read-only: поля, меню колонок, «Своя строка» disabled; проверить light + dark, chrome ≥ 11px,
   отсутствие горизонтального скролла при 6 видимых колонках.

**AC:** канон §6 пункты 5, 6, 9–13.

---

## TZ-SALES-361 — фото на бланке (хвост)

**CONFLICT KEYS:** `proposal-create-table-editor.component.ts`,
`backend/src/modules/table-template/table-template.service.ts`,
`backend/src/modules/table-template/table-template.service.spec.ts`

**ЧТО ДЕЛАТЬ**

1. «Фото» = обычная колонка раскладки (порядок / видимость / ширина); в ячейке редактора — миниатюра
   из `ProposalDraftLine.photoUrl`.
2. `preview`/`build` HTML: `<img>` с абсолютным URL лёгкой копии, высота ряда ~30 мм,
   пустая рамка при отсутствии фото (без битой картинки).
3. Менять фото — только через `✎` (карточка каталога); загрузки фото в КП нет.

**AC:** колонка «Фото» скрывается/двигается как остальные; на A4 миниатюры и пустые рамки ровные;
BE tsc + `table-template.service.spec.ts` зелёные.

---

## Out of scope волны

Полный конструктор колонок в КП · DnD строк · запись в shared `TableTemplate` ·
правка внутри iframe A4 · второй write-path строк.

## Gates

- FE: `pnpm exec tsc -p tsconfig.app.json --noEmit` + `proposal-create.page.spec.ts`
- BE (361): `pnpm exec tsc -p tsconfig.build.json --noEmit` + `table-template.service.spec.ts`
- `pnpm architecture:check`
