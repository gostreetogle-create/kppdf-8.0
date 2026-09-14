# TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER: ширина колонок по заголовку

**РОЛЬ АГЕНТА:** Executor (frontend-nx; BE только если нужен тот же helper в resolver — предпочтительно shared FE+copy или общая pure fn) — freebuff или claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY` / necessity C DONE (`columnWidthPercents` живой)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md`

IMPLICIT CONFLICT: nx build kppdf-web  
(Не пересекать claim с TEXT-PROPS-CANON / REVISION-RACE на `studio-editor.page.ts` — этот TZ **не** трогает editor.page.)

### Preflight Check Output
- **Context read:** `studio-table-defaults.ts` (`columnWidthPercents`); `studio-table-properties` width inputs + hint «% — сумма ≈ 100%»; COL-WIDTH apply note in `document-studio.page.md`
- **Key Constraints:** width = относительные веса → scale to 100%; fit = по **label**, не по содержимому ячеек; ручной override сохраняется
- **Planned Deliverable:** pure `fitColumnWidthsByHeader` + button + default on add/standard create
- **Validation Path:** unit + props click + `nx build`

### Domain (PO)
- Кнопка: выровнять ширины **по длине заголовка** (label).
- **По умолчанию** новые/добавленные колонки уже с таким раскладом; потом можно крутить % вручную.
- Аккуратно: не ломать PDF/canvas contract `columnWidthPercents`; не fit по live cell content (дорого и дёргано).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `col.width` = вес 1…100; рендер = пропорционально сумме → %.
2. Шаблоны/quick-add часто ставят одинаковые 20 или «сырые» числа с реестра — заголовок «Наименование» визуально тесен рядом с «Ед.».
3. Кнопки «по заголовку» нет.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Pure helper (FE `studio-table-defaults.ts`)

```ts
fitColumnWidthsByHeader(columns: readonly StudioTableColumn[]): StudioTableColumn[]
```

Алгоритм (зафиксировать в spec):

- Вес колонки = `max(FLOOR, label.trim().length)` в unicode code points (или grapheme-safe trim length).
- FLOOR = 2 (короткие «№»/«Ед.» не схлопываются в 1px после scale).
- Опциональные множители **только по key-aliases** (не по type select):
  - photo → `max(FLOOR, min(weight, 4))` (фото узкое даже если label длинный);
  - name → `weight * 1.4` (имя шире заголовка по смыслу бланка);
  - description → `weight * 1.2`;
  - остальные — чистая длина label.
- Результат: те же keys/labels; `width` = округлённые веса (минимум 1); **не** обязательно сумма 100 — `columnWidthPercents` сам нормализует.
- Не менять align/type/key.

ШАГ 2: Кнопка в Свойствах

- Рядом с «+ Колонка» / под hint ширины:  
  `data-test="studio-table-widths-by-header"`  
  **«По заголовкам»** (или «Ширина по заголовкам»).
- Клик → `fitColumnWidthsByHeader` → тот же save/rehydrate path, что ручная смена width (S47/structure).
- Hint обновить: «Веса → % на листе. «По заголовкам» — пропорционально длине подписи; потом можно править вручную.»

ШАГ 3: Default без сюрпризов на старых документах

Применить fit автоматически **только** когда:

- quick-add standard column (`createStandardStudioTableColumn`) — сразу width из fit одной колонки в контексте полного списка после add; **или** после add пересчитать все колонки fit’ом один раз;
- создание колонки «+ Колонка» с пустым/дефолтным label — после ввода label не авто каждый keystroke; только при add + кнопка.

**Не** гонять fit на каждом open документа (не перетирать ручные ширины PO).

Если при insert из registry все width равны / все 0 / отсутствуют — один fit при apply template на блок (optional, если дешево в том же props path; иначе только кнопка + quick-add).

ШАГ 4: Specs + docs

- Unit: labels `['Артикул','Фото','Наименование']` → name width > photo width; percents sum 100.
- Props: кнопка меняет displayed width inputs.
- `document-studio.page.md` 4–6 строк.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Fit по содержимому ячеек / canvas measureText
- Авто-fit при каждом PATCH label (дребезг)
- Менять BE schema; max width clamp 100 оставить (веса до scale)
- studio-editor.page.ts / TEXT-PROPS / REVISION-RACE
- Убирать ручной input ширины

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Кнопка «По заголовкам» на таблице с длинным «Наименование» и коротким «Ед.» — name-колонка заметно шире на холсте; сумма % = 100.
2. После кнопки ручная правка одного % сохраняется и влияет на лист.
3. Open старого документа **без** клика — ширины как были (no silent rewrite).
4. Gates: `studio-table-defaults` + `studio-table-properties` specs + `nx build kppdf-web`.
5. Archive + STREAM.

### Claim slot

```
agent_id: claude
claimed_at: 2026-09-14T08:01:35Z
branch: main
baseline_sha: 489b9b70
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 4, including live smoke — see checklist Gates section)
  - typecheck: PASS (nx build)
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash -u A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
