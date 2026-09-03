# TZ-NX-DOCSTUDIO-S32-DOC-RENAME: переименование с ribbon

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1.2
**ЗАВИСИМОСТИ:** S31
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

`doc.name` только display (`ribbon-label` / badge). PATCH name через `documents.update` доступен для других полей.

## ЧТО ДЕЛАТЬ

1. Клик по имени или кнопка «Переименовать» → dialog/inline.
2. PATCH `{ name, expectedRevision }` → update signal.
3. Пустое имя → toast error, не слать.
4. 409 → conflict().

## КРИТЕРИИ ПРИЁМКИ

1. Новое имя на ribbon и в `/studio` списке после reopen.
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.done.md`

---

## Реализация (S32)

Файлы:
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-rename-document-dialog.component.ts` (новый)

- Ribbon-label теперь `<button data-test="studio-rename" (click)="openRenameDialog()">{{ doc.name }}</button>` вместо статичного `<span>` — клик по имени открывает диалог переименования. Стиль сохранён (`.ribbon-label`), добавлен `.ribbon-label--rename` (button reset + hover underline), визуально не отличим от прежнего label до наведения.
- `StudioRenameDocumentDialogComponent` — новый диалог по образцу уже принятого `StudioSaveAsTemplateDialogComponent`: reactive form с полем `name` (`Validators.maxLength(256)`), `submit()` триммит значение; если после трима строка пустая — `PiToastService.error('Название документа не может быть пустым')` и диалог **не закрывается** (PATCH не отправляется) — прямое соответствие пункту 3 TZ.
- `openRenameDialog()` (`studio-editor.page.ts`) — открывает диалог с `currentName: doc.name`; на подтверждении вызывает `documents.update(id, { expectedRevision: doc.revision ?? 1, name })`. Успех → `this.document.set(r.data)` (ribbon обновляется реактивно через существующий `{{ doc.name }}` bind) + `toast.success('Документ переименован')`. Любая ошибка PATCH (включая 409 optimistic-concurrency mismatch) → `this.conflict()` — тот же паттерн, что уже используют все остальные PATCH-точки этого файла (`setOrientation`, `setBackgroundIndex`, `setBackgroundOpacity`, `togglePageNumbering` и т.д.), файл не различает 409 от прочих ошибок на уровне UI ни в одном из существующих обработчиков.
- Backend не менялся: `PATCH /studio-documents/:id` уже принимал и применял `name` до этого TZ — `UpdateStudioDocumentDto.name` (`@IsOptional() @IsString() @IsNotEmpty()`) и `studio-document.service.ts:234` (`if (dto.name !== undefined) doc.name = dto.name`). Не хватало только UI-входа для вызова этого поля.
- `/studio` список (`studio-list.page.ts`) уже читает документы через `documents.list()` (сервер) — после PATCH и reopen списка новое имя видно без дополнительных правок на списочной странице.

### Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec nx run kppdf-web:test --testPathPattern=studio
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    идентично документированному в S31 (344 passed / 7 skipped / 353 total);
    у studio-editor.page.ts / нового rename-dialog нет отдельного spec-файла (baseline)

cd frontend-nx && pnpm exec nx run kppdf-web:lint
  → FAIL: 21 errors / 75 warnings — идентично baseline S31 (96 problems);
    новый файл studio-rename-document-dialog.component.ts не добавил ни
    одной новой ошибки/warning; rename-кнопка — нативный <button>, вне
    scope click-events-have-key-events/interactive-supports-focus правил

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (tsc --noEmit + nx build kppdf-web включает Angular AOT type-check)
  - tests: FAIL (baseline debt, идентично S31, не связано с TZ — см. Gates)
  - lint: FAIL (baseline debt, идентично S31, не связано с TZ — см. Gates)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
