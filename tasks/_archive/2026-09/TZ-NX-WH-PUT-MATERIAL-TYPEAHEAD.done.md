# TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD: «Поставить на склад» — поиск + «+» материал

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет (WH-GROUP-CHIPS DONE)  
**LAYER:** 3 · **SIZE:** S–M  
**PAGES:** `/storage-items` (dialog)  
**PAGE_DOCS:** `storage-items.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-put-on-stock-dialog.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-put-on-stock-dialog.component.spec.ts` (create/extend) ;  
`docs/pages/storage-items.page.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** скрин PO «Поставить на склад» (native `<select>` Материал); `storage-put-on-stock-dialog.component.ts:46-66`; gold typeahead+create: `supply-request-form-dialog.component.ts:67-79` + `MaterialFormDialogComponent`; gold «+» icon: `registry-create-button.component.ts` (`pi-icon-btn registry-icon-btn-accent` + Lucide Plus); optional `app-pi-overflow-select` searchable
- **Key Constraints:** reuse MaterialFormDialog / registry create btn style; не invent зелёный вне токенов — **accent Plus** как в реестрах (gold Paper & Ink). Warehouse select можно оставить native (короткий список).
- **Planned Deliverable:** searchable material pick + icon «+» → create material → auto-select
- **Validation Path:** focused jest + nx build last

**Проверено:** put dialog сейчас грузит все materials в `<select>` без поиска и без create.

---

## ИСХОДНОЕ

Диалог: Материал = full list `<select>`; нет быстрого создания; PO не находит метиз → уходит в другой раздел.

## ЧТО ДЕЛАТЬ

1. **Поиск материала:** заменить native select на searchable pick:
   - предпочтительно паттерн supply-request: input «название/артикул» (debounce ≥2 символа или фильтр client list) + список совпадений; **или** `app-pi-overflow-select` `[searchable]="true"` / `"auto"` с items name+article.
   - Выбранный материал — chip/label + очистить (как supply).
2. **Кнопка «+»** справа от поля материала в одном `flex items-end gap-2`:
   - UI: как `pi-registry-create-button` / `class="pi-icon-btn registry-icon-btn-accent"` + Lucide `Plus` (рамка, не голый текст «+ Новый»).
   - `aria-label="Создать материал"`, `data-test="put-material-create"`.
3. Клик «+» → `PiDialogService.open(MaterialFormDialogComponent, { mode: 'create', … })` (тот же dialog, что registry/supply). После успешного close с `Material` → выбрать его в поле и обновить options.
4. Prefill `data.materialId` / `materialName` — сохранить поведение.
5. Specs: search filters; create opens dialog; after create materialId set. page.md note.
6. Gates + archive.

## НЕ

- BE API changes; Desktop; переписывать supply-request; green hex вне DS; Product put (остаётся material-only unless already supported)

## AC

1. В диалоге нет «тупого» полного `<select>` материалов без поиска.
2. Ввод текста фильтрует список по имени/артикулу.
3. «+» в рамке (icon-btn accent) рядом с полем; открывает создание материала; после Save материал выбран.
4. Поставить на склад с найденным/новым материалом работает как раньше (POST storage-items).
5. `nx build kppdf-web` PASS last.

## BUILD INTEGRITY

`docs/TZ-NX-BUILD-INTEGRITY.md` §5.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T12:20:00Z — see docs/agent-checklists/TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD.md for SHA
