# TZ-NX-DOCSTUDIO-S15-DATA-VITRINA-UNIFIED: «Данные» + витрина каталога

**РОЛЬ АГЕНТА:** Executor (frontend-nx + точечный backend)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3.3  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**ЗАВИСИМОСТИ:** S14 DONE (`a7d7bb5d`)  
**CONFLICT KEYS:** `studio-data-panel.component.ts`; `studio-showcase-panel.component.ts`; `studio-editor.page.ts`; `studio-workspace-chrome.ts`; `studio-document.service.ts` (putDataSet hydrate)

## Domain preflight

**Проверено:** `docs/PO-CANON.md` · `docs/architecture/document-studio-data-anchors.md` · `studio-showcase-panel.component.ts` · `studio-data-panel.component.ts`

| Говорят | Код |
|---------|-----|
| Изделие | `Product` / `catalog-products` |
| Клиент | `Counterparty` / `context.counterpartyId` |
| Витрина | `context.catalogSelections` + rail `showcase` (убрать) |

**Не в scope:** формулы, save-as-template semantics, three-way merge, отдельная сущность Quotation.

## ИСХОДНОЕ

1. Витрина — **отдельный rail «Витрина»** (`studio-workspace-chrome.ts:8`), чекбокс-список (`studio-showcase-panel.component.ts`).
2. «Данные» — только селекты контрагентов/КП/заказ (`studio-data-panel.component.ts`), без каталога.
3. Выбор в витрине пишет `catalogSelections`, но **строки на холсте не обновляются**: `onCatalogSelectionChange` (`studio-editor.page.ts:1432`) не вызывает `applyLiveRowsFromDataSet`.
4. Оператор должен вручную: таблица → «Источник строк → Изделия» → открыть другой rail.
5. Shell уже имеет **wide panel** (`panelWide`, `.kp-ws-panel--wide` ≈ 58rem) — не используется для «Данные».
6. Kit: `PiShowcaseCard` size `md` — готов для сетки витрины (`pi-showcase-card.component.ts`).

## ЦЕЛЬ (PO)

Один rail **«Данные»**: сверху красивая витрина (категория → карточки → выбор), снизу контрагенты и связи. Выбранные позиции **сразу** попадают в таблицу на листе (live rows).

## ЧТО ДЕЛАТЬ

### 1. Объединить панели

1. Убрать rail `showcase` из `STUDIO_RAIL_ITEMS` и `@case ('showcase')` в `studio-editor.page.ts`.
2. Встроить витрину **вверху** `pi-studio-data-panel` (или child `pi-studio-data-vitrina` в том же файле/папке).
3. При `activeSection() === 'data'` включать `[panelWide]="true"` на shell.

### 2. UX витрины (дизайн)

1. **Сегмент сверху** (не 2×2 grid tabs): `Изделия | Модули | Детали | Материалы` — один ряд, активный с gold border (как PO: «хлебные крошки / кнопки категории»).
2. Поиск под сегментом.
3. Сетка **`app-pi-showcase-card` size="md"`**, 2 колонки в wide panel; фото, название, артикул/SKU; toggle выбора (checkbox или selected state на карточке).
4. Пустое состояние: «Ничего не найдено» / «Загрузка…».
5. Секции ниже витрины (свернуть/развернуть допустимо):
   - **Контрагенты:** Исполнитель (read-only), Клиент, Плательщик, Поставщик
   - **Связи:** КП, Заказ
   - **Выбрано:** chips (якоря + «N изделий» с удалением) — перенести из текущего data panel

### 3. Выбор → таблица (ядро)

1. При toggle позиции в витрине — существующий `onCatalogSelectionChange` / `patchDocumentContext`.
2. **Авто-привязка таблицы:** если на странице ровно одна таблица без источника или с `manual`, при первом выборе из витрины — выставить `dataSource.type = catalog-{kind}` (как `onTableSourceChange`).
3. **Live rows на холсте:** после успешного `putDataSet` для catalog-таблиц строки видны в editor canvas без переключения в Preview.
   - Минимальный путь: в `putDataSet` (`studio-document.service.ts`) для `quotation-items|order-items|catalog-*` **гидратировать** `rows` в ответе через `StudioDataResolverService.resolveDataSets` (live-read, не bake); фронт — `applyLiveRowsFromDataSet(result.data, blockId, resolvedEntry)`.
   - Альтернатива только если hydrate в putDataSet невозможен без регрессии: отдельный `GET resolve` — зафиксировать в archive evidence.
4. `refreshPreviewIfActive()` после выбора — как сейчас при смене источника.

### 4. Тесты

1. Spec: data panel рендерит сегмент категорий + vitrina grid (`data-test="studio-data-vitrina"`).
2. Spec или editor smoke: selection change вызывает putDataSet + liveRows на block settings.
3. `studio-data-resolver` / `putDataSet` spec если трогали backend.

## ИЗМЕНЯТЬ

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts` (+ spec)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-showcase-panel.component.ts` (рефактор в vitrina или merge)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts`
- `backend/src/modules/studio-document/studio-document.service.ts` (+ spec при hydrate)
- `docs/pages/document-studio.page.md` §3.3 (кратко: одна панель «Данные»)

## НЕ ИЗМЕНЯТЬ

- Геометрию A4 / overlay law (лист не reflow).
- Legacy `frontend/**`.
- Реестры, новые коллекции, формулы.
- Three-way merge.

## КРИТЕРИИ ПРИЁМКИ

1. Rail «Витрина» отсутствует; каталог только в «Данные».
2. «Данные» открывается wide; витрина — карточки `PiShowcaseCard`, 4 категории сегментом.
3. Сценарий: вставить таблицу → открыть «Данные» → выбрать 2 изделия → **на листе 2 строки** (editor mode, не только Preview).
4. Клиент/КП/заказ работают как до TZ (регрессия нет).
5. `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-data` (или studio-data-panel spec) — PASS.
6. `cd frontend-nx && pnpm exec nx build kppdf-web` — exit 0 **последним**.

## Gates (факт)

```bash
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-data
cd backend && pnpm test -- studio-document.service
cd frontend-nx && pnpm exec nx build kppdf-web
```

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S15-DATA-VITRINA-UNIFIED.done.md`  
Обновить `docs/agent-checklists/_NOW.md`, `tasks/QUEUE-LIVE.md`.
