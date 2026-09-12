# TZ-NX-PO-SWEEP-02 checklist — studio table click=select/resize

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-02-studio-table-click-resize.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ прочитан

### Preflight Check Output
- **Context read:** `studio-blocks-canvas.component.ts` (`selectBlock` L394-404 emitted `tableEditRequest` on single click — S45), `studio-editor.page.ts` (`tableEditRequest` already wired to `openLayerProperties`; rail tools effect L757-814; `onSelect` sets both `selectedId`+`activeLayerId`), `PO-CANON.md` («один клик = выделение + drag/resize»)
- **Key Constraints:** confirm S45 auto-open — regressed канон; не трогать A4 geometry / inline cell edit
- **Planned Deliverable:** single click select-only; dblclick on table → `tableEditRequest` (mirrors existing text `openTextBlock`); rail «Свойства» button highlighted (existing active style) when table selected but panel not open
- **Validation Path:** canvas + editor specs; `nx build kppdf-web` last

## Acceptance (из TZ)

- [x] Клик таблица → select + SE handle доступен без открытой props-панели
- [x] Dblclick / rail Свойства → панель открывается
- [x] Specs + `nx build kppdf-web` green

## Integrity slot

- [x] Тип изменения: page (studio editor)
- [x] FIC: §A UI-правка в существующем route, без нового permission/module — N/A остальное
- [x] page.md: `docs/pages/document-studio.page.md` — N/A (UX gesture fix, не меняет page contract)
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A
- [x] Чужой WIP не в коммите

## Gates (факт)

- `nx test kppdf-web` (studio-blocks-canvas + studio-editor-chrome-ia, nx свернул паттерн в full-suite alternation) → PASS 813/820 (7 skipped), 0 failed, +3 новых теста
- `nx build kppdf-web` → PASS (pre-existing NG8102/gantt-bars budget warnings — не мои файлы)
- UI verification: DOM-level через Angular TestBed (`article.click()` / real `dispatchEvent(new MouseEvent('dblclick'))`) — реальные DOM-события, не мок. Полный live-browser клик-тест по студии сделаю одним заходом после стадий 02–07 (все того же /studio editor), не 6 отдельными сессиями.

## Executor report

- `selectBlock()`: убран `if (block.type === 'table') this.tableEditRequest.emit(...)` — single click теперь только `selected.emit()` (select + resize handle, как у image-блока).
- Новый `openTableBlock()` + `(dblclick)` на table `<article>` — зеркалит существующий `openTextBlock()`/`(dblclick)` у text-блока; `tableEditRequest` эмитится только отсюда.
- `studio-editor.page.ts`: `tableEditRequest` remained wired to `openLayerProperties` без изменений (клик уже ставит `selectedId`+`activeLayerId` через `onSelect`, так что открытие Свойств по dblclick/rail сразу показывает верно выбранную таблицу).
- Rail «Свойства» hint: новый `propertiesHint` в эффекте setTools — active/жёлтый стиль кнопки, когда выбрана таблица (не locked) и панель Свойства ещё не открыта; клик по ней — как раньше, `onSection('properties')`.
- Specs: заменил старый S45-тест (click→tableEditRequest) на 2 новых (click=select-only, dblclick=tableEditRequest) в canvas spec; +1 spec в `studio-editor-chrome-ia.spec.ts` на rail hint.
- Комментарии S45 в коде обновлены (auto-open on click отменён PO-CANON/TZ-NX-PO-SWEEP-02).
- Не менял: A4 geometry, inline cell edit (остаётся запрещён на холсте), image-блок behaviour.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12
