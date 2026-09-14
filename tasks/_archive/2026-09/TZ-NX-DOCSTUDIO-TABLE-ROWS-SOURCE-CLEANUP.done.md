# TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP: убрать блок «Строки» (статус/Обновить/Сменить)

**РОЛЬ АГЕНТА:** Executor (frontend-nx studio table props) — freebuff или claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP` A (этот UI появился там)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (только снять wiring `refreshCatalogRows` / мёртвые handlers если осиротеют) ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-13-docstudio-table-rows-source-cleanup.md` (короткий note)

IMPLICIT CONFLICT: nx build kppdf-web  
Не параллелить claim с TEXT-PROPS на editor, если трогаешь editor — лучше **только props** + удалить Output без правок editor (оставить dead handler один релиз) или sequential.

### Preflight / вердикт PO

PO прав для Insert-потока: Выбрано → Вставить таблицу.  
`onCatalogSelectionChange` уже `putDataSet` таблицы того же kind — **«Обновить строки» дубль**.  
«Сменить…» / status «Из Выбрано» — редкий/шумный UX.

**KEEP (не трогать):** блок **«Строки таблицы»** (превью сетки + qty) — это другое.  
**DELETE:** секция `data-test="studio-table-source-status"` (label «Строки» + статус + Обновить + Сменить).

**KEEP select «Источник строк»** только когда таблица **не** catalog-Insert status path:
- `manual` / `quotation-items` / `order-items` — select остаётся (Elements «+ Таблица», КП, заказ).
- Для `catalog-*`: select **не** показывать по умолчанию (ни status, ни enum). Смена kind = новая Insert / удалить слой.

### ЧТО ДЕЛАТЬ

1. Убрать UI status + кнопки; убрать `sourceChangeOpen` flow для catalog.
2. Убрать `refreshCatalogRows` Output + `refreshActiveTableCatalogRows` wiring (или no-op delete).
3. Specs necessity A, ожидавшие status/Обновить/Сменить — переписать на отсутствие.
4. Smoke checklist в AC: Insert изделия → qty в превью; add/remove в Выбрано → строки на A4 обновляются **без** кнопки; «+ Таблица» → select источника жив; КП/заказ select жив.
5. page.md: канон «строки каталога = Выбрано + Insert; без блока Обновить/Сменить».

### НЕ

- Ломать auto-refresh в `commitCatalogSelectionChange`
- Убирать превью «Строки таблицы» / LINE-QTY
- WIDTH-BY-HEADER / PHOTO-EMPTY (отдельные TZ)
- Возвращать всегда-видимый enum для catalog

### AC

1. Catalog table props: нет «Обновить строки» / «Сменить…» / «Из Выбрано: …».
2. Изменить Выбрано → лист обновляется без этой кнопки.
3. Elements «+ Таблица» → «Источник строк» select доступен.
4. Gates: table-properties specs + `nx build kppdf-web`.

### Claim
```
agent_id: claude
claimed_at: 2026-09-14T08:35:59Z
branch: main
baseline_sha: 9114b6a5
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 3 listed + gates, including live smoke — see checklist Gates section)
  - typecheck: PASS (nx build)
  - tests: PASS
  - lint: PASS (0 new errors, 5 fewer warnings, verified via git-stash -u A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
