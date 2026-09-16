# Audit 2026-09-13 — DocStudio «+ Страница» без реакции

> PO: панель **Страницы** → «Добавить страницу» / `+ Страница` — ноль UI, страница не появляется, в консоли ошибки. Раньше работало.

## Preflight (paths opened)

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-pages-panel.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (`addPage`, `conflict`, `hydrateTablesSerially`, optimistic `revision + 1`)
- `frontend-nx/libs/data-access/src/lib/doc-studio/pi-studio-documents.service.ts`
- `backend/src/modules/studio-document/dto/update-studio-document.dto.ts` (`manualPageCount` `@Min(1)`)
- `docs/pages/document-studio.page.md` (§Страницы)

## Wiring (не мёртвая кнопка)

| UI | Handler |
|----|---------|
| `data-test="studio-add-page"` → `addPage.emit()` | `(addPage)="addPage()"` в editor |
| Успех | `document.set` + `currentPage` + toast `Страниц: N` |
| Fail `!r.ok` | `conflict()` → диалог «Документ изменён в другом месте» |

BE path `PATCH` + `manualPageCount` — живой (`studio-document.service.ts` присваивает поле). Симптом **не** «DTO забыли».

## Наиболее вероятные причины (ранг)

1. **409 race вне write-queue.** После open редактора `refreshLiveDataSetsOnLoad` / `healStale…` гоняют `putDataSet` через `catalogWriteChain`. `addPage` / `setOrientation` / фон / нумерация читают `doc.revision` **вне** этой цепи → stale `expectedRevision` → `SilentResult` ok:false → conflict. На Network: `PATCH …/studio-documents/:id` **409**.
2. **Второй conflict без UI.** `conflict()`: `if (this.conflictDialogOpen) return;` — повторный fail **молча** («кнопка не работает»).
3. **Optimistic `revision + 1`** после create table/text/image и layout save — без `document.set` с серверным revision. Если create/layout bump’ит иначе (или параллельный hydrate уже ушёл вперёд) — локальный счётчик уезжает → те же 409 на «простые» PATCH.

## Necessity

KEEP: мультистраничный лист + `manualPageCount` + список страниц — операторский сценарий (фон/ориентация по странице, многолистовой КП). Не удалять панель «ради упрощения».

## Не чинить заодно

Necessity-таблицы / photo broken-img — другие conflict keys; этот баг = **document write serialization + conflict UX**.

## Следующий артефакт

`tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md`
