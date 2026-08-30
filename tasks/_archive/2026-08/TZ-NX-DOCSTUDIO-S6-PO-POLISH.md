# TZ-NX-DOCSTUDIO-S6-PO-POLISH — студия: A4-рамка, слои, свойства, навигация

**РОЛЬ АГЕНТА:** executor (Claude CLI / Freebuff), frontend-nx only  
**СТАТУС:** ACTIVE — claim в `tasks/_active/TZ-NX-DOCSTUDIO-S6-PO-POLISH.md`  
**ЗАВИСИМОСТИ:** S3–S5 DONE; локальный WIP studio (uncommitted)  
**LAYER:** 3 — `frontend-nx/apps/kppdf-web/src/app/pages/studio/**`  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-blocks-canvas.component.ts`; `studio-properties-panel.component.ts`; `studio-layers-panel.component.ts`; `studio-workspace-shell.component.css`

**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` (обновить § NX Studio S2 shell — рамка A4, изоляция слоя)

**Проверено:** `docs/pages/kp-workspace-geometry.md`; `docs/PO-CANON.md` п.17; `studio-editor.page.ts:75` (build FAIL `panelSide`); `studio-workspace-shell.component.css:288-323` (A4 aspect-ratio); PO screenshot 2026-08-30 (ghost layers, мелкие стрелки, непонятные «Свойства»).

## ИСХОДНОЕ СОСТОЯНИЕ

1. **`nx build kppdf-web` FAIL:** `panelSide` не объявлен в `StudioEditorPage`; `[activeLayerId]` на `pi-studio-properties-panel` без `@Input`.
2. **Ghost-текст на листе:** `studio-blocks-canvas` рендерит все блоки страницы; неактивные слои — `.inactive-layer { opacity: 0.45 }` → наложение «Слой N».
3. **Нет видимой рамки A4:** ранее `sheetHost=true` убирал border/shadow; частично переключено на `false`, canvas-host должен заполнять лист внутри `.kp-ws-sheet`.
4. **Стрелки страниц:** мелкие `‹`/`›` в ribbon — PO не попадает.
5. **Свойства:** заголовок «Свойства» без контекста; тип `text`/`image`/`table` на англ.; нет категорий.
6. **Геометрия:** закон `kp-workspace-geometry.md` — overlay 480px, A4 не reflow, portrait/landscape aspect-ratio 210/297 и 297/210, flex-end + 8px справа.

## ЧТО ДЕЛАТЬ

### 1. Починить сборку (блокер)

- В `studio-editor.page.ts` восстановить:
  ```ts
  readonly panelSide = computed(() => studioPanelSide(this.activeSection()));
  ```
- Убрать `[activeLayerId]` с properties **или** реализовать fallback в editor:
  ```ts
  readonly propertiesBlock = computed(() => this.selectedBlock() ?? this.activeLayerBlock());
  ```
  Передавать `[block]="propertiesBlock()"`.

### 2. Рамка A4 и масштаб листа

- `[sheetHost]="false"` на shell (уже в editor — проверить).
- Контент `[kpWsSheet]` — `studio-canvas-host`: `width/height 100%`, белый фон **внутри** `.kp-ws-sheet` (рамка/тень — у shell).
- Альбомный режим: лист width-first на stage, видимая рамка + тень; лист **не** меняет rect при open/close панели (smoke: collapsed vs open Δ ≤ 0.5px — ручная проверка или unit на aspect-ratio классов).
- Не менять `justify-content: flex-end` и padding-right 8px в shell CSS.

### 3. Изоляция активного слоя на canvas (Photoshop-like)

- При заданном `activeLayerId` рендерить **только** блок с `_id === activeLayerId` на текущей странице.
- Удалить/не использовать `.inactive-layer` opacity-стек на canvas.
- Drag/resize/select — только для активного слоя (как сейчас `isEditable`).
- Пустой activeLayerId → не рендерить блоки (или pickDefaultLayer при загрузке страницы — сохранить текущую логику).

### 4. Навигация по страницам

- Кнопки prev/next: min **32×32px**, `ChevronLeft`/`ChevronRight`, `aria-label` на русском.
- Метка `Стр. N / M` — tabular-nums, читаемый контраст.
- `data-test`: `studio-page-prev`, `studio-page-next`, `studio-page-nav`.

### 5. Панель «Свойства» — категории и контекст

Переработать `studio-properties-panel.component.ts`:

| Секция | Содержимое |
|--------|------------|
| **Контекст** (subhead) | «Слой: {название}» · тип: Текст / Изображение / Таблица |
| **Слой** | Название, lock hint если locked |
| **Контент** | textarea (текст) / preview+кнопки (image) / summary (table) |
| **Типографика** | только text: размер, цвет, выравнивание |
| **Геометрия** | X/Y/Ширина/Высота/z-index (read-only %) |
| **Действия** | «На весь лист» (image), «Удалить слой» destructive |

- Empty state: «Выберите слой в панели «Слои» слева» (не «блок на листе»).
- Заголовок overlay-панели в editor: `Свойства: «{имя}»` когда есть `propertiesBlock`.

### 6. Панель «Слои»

- Убрать `opacity` на `.layer-tile--inactive` — только border/фон для active vs rest.
- Клик по плитке: activate layer, панель остаётся «Слои».
- Кнопка/иконка «Свойства» на плитке **или** второй клик / явная кнопка «Настроить» → `activeSection=properties` + `selectedId` (на выбор исполнителя, главное — предсказуемо).

### 7. Клики по листу

- `onSheetClick`: снять `selectedId`, **свернуть панель** (закон geometry §7) — оставить.
- Клик по блоку: `stopPropagation` уже есть — проверить, что не схлопывает панель при выделении.

## ИЗМЕНЯТЬ

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/**` (перечисленные файлы)
- `docs/pages/document-studio.page.md` — краткое дополнение про изоляцию слоя и рамку A4
- `tasks/_active/TZ-NX-DOCSTUDIO-S6-PO-POLISH.md` (claim)
- archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S6-PO-POLISH.done.md`

## НЕ ИЗМЕНЯТЬ

- `backend/**`, `frontend/**` (legacy), `registries/**`
- TipTap / rich-text (successor S7)
- Редактор ячеек таблицы
- Геометрию overlay (480px) и flex-end A4
- PDF/preview API контракты

## КРИТЕРИИ ПРИЁМКИ

- [ ] `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0
- [ ] `pnpm exec nx test kppdf-web --testPathPattern=studio` exit 0 (добавить/обновить тест на `propertiesBlock` или canvas filter если нет)
- [ ] На `/studio/:id` альбомный лист: видимая рамка A4, пропорция ~1.414, максимальный размер на stage
- [ ] При 10+ слоях на странице на листе виден **только** активный слой (нет ghost «Слой N»)
- [ ] Стрелки страниц ≥32px, кликабельны
- [ ] Панель «Свойства» показывает категории и русский тип; empty state понятен
- [ ] `data-test` сохранены: `studio-a4-sheet`, `studio-properties-panel`, `studio-layers-panel`, `studio-page-nav`

## Gates (порядок)

```bash
cd frontend-nx
pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
pnpm exec nx test kppdf-web --testPathPattern=studio
pnpm exec nx build kppdf-web
```

## known_limitation (successor S7)

- Rich-text TipTap, table cell editor, multi-object per layer, Fit/100% toolbar wiring.

## Integrity

- FIC: UI page change → `docs/FEATURE-INTEGRATION-CHECKLIST.md` § page shell
- Claim slot: `agent_id: claude|gemini`, `claimed_at` ISO-8601
