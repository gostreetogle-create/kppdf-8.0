# TZ-NX-DOCSTUDIO-S32-DOC-RENAME checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.md` — removed on archive
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T21:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет CLI в этой сессии; conflict keys проверены вручную через `tasks/_active/` и `_NOW.md`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S32`, branch `claude/docstudio-s32`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `studio-editor.page.ts`
- [x] TZ / канон / deps прочитаны (`tasks/_ready/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.md`, `docs/pages/document-studio.page.md` §1.2, S31 done)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE после gates
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.md` на месте

## Acceptance (из TZ)

- [x] Клик по имени на ribbon (`data-test="studio-rename"`, `openRenameDialog()`) → `StudioRenameDocumentDialogComponent`
- [x] PATCH `{ name, expectedRevision }` через `documents.update(current._id, {...})` → `this.document.set(r.data)` на успехе
- [x] Пустое имя → `toast.error(...)`, запрос не отправляется (проверка в `StudioRenameDocumentDialogComponent.submit()` до `ref.close`)
- [x] 409 / любая ошибка PATCH → `this.conflict()` (тот же паттерн, что `setOrientation`/`togglePageNumbering` и другие PATCH в файле)
- [x] Новое имя отражается на ribbon (`{{ doc.name }}` уже bound) и в `/studio` списке после reopen — список читает `documents.list()` с сервера, PATCH персистит имя на backend (`UpdateStudioDocumentDto.name`, уже поддержан)
- [x] `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (document-studio, rename ribbon)
- [x] FIC §A–E: N/A — чистый frontend UI, backend PATCH `name` уже существовал (`update-studio-document.dto.ts`, `studio-document.service.ts:234`), контракт не менялся
- [x] page.md: `docs/pages/document-studio.page.md` §1.2 — не требует правки (rename через ribbon уже в целевом описании; поведение приведено в соответствие)
- [x] SECTION-READINESS: N/A (не трогал)
- [x] Чужой WIP не в коммите; conflict keys (`studio-editor.page.ts`) — только мои правки + новый файл `studio-rename-document-dialog.component.ts`
- [x] Coupling map: N/A (не менял общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: соответствует S31 done baseline (21 lint errors / 75 warnings; 2 failing tests в `registries.catalog.spec.ts`, не связано)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` конфликтом
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, без вывода (exit 0)

cd frontend-nx && pnpm exec nx run kppdf-web:test --testPathPattern=studio
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    идентично S31 (344 passed / 7 skipped / 353 total); нет отдельного
    spec-файла для studio-editor.page.ts / rename-dialog (baseline)

cd frontend-nx && pnpm exec nx run kppdf-web:lint
  → FAIL: 21 errors / 75 warnings — идентично baseline S31 (96 problems),
    новый файл studio-rename-document-dialog.component.ts не добавил ни
    одной новой ошибки/warning; кнопка rename — нативный <button>, не
    попадает под click-events-have-key-events/interactive-supports-focus

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

## Executor report

- Новый компонент `studio-rename-document-dialog.component.ts` (`StudioRenameDocumentDialogComponent`) — reactive-form диалог по образцу `StudioSaveAsTemplateDialogComponent`; поле `name`, `submit()` триммит значение и при пустой строке зовёт `PiToastService.error(...)` и не закрывает диалог (не шлёт PATCH).
- Ribbon-label (`studio-editor.page.ts`) заменён на `<button data-test="studio-rename" (click)="openRenameDialog()">{{ doc.name }}</button>` — клик открывает диалог переименования; визуально — тот же `.ribbon-label` стиль + `.ribbon-label--rename` (button reset, hover underline).
- `openRenameDialog()` — открывает диалог с `currentName: doc.name`; на подтверждении зовёт `documents.update(id, { expectedRevision, name })`; успех → `this.document.set(r.data)` + toast success; неуспех (включая 409) → `this.conflict()`, тот же паттерн, что остальные PATCH-точки этого файла (`setOrientation`, `togglePageNumbering`, `setBackgroundIndex` и др.) — не различает 409 от прочих ошибок на уровне UI, что соответствует существующей конвенции всего файла.
- Backend не менялся: `PATCH /studio-documents/:id` уже принимал `name` (`UpdateStudioDocumentDto.name`, `@IsNotEmpty()`) и применял его (`studio-document.service.ts:234`) — переименование уже было реализуемо технически, не хватало только UI-входа.
- `/studio` список (`studio-list.page.ts`) уже тянет документы через `documents.list()` с сервера — новое имя видно после reopen без дополнительных правок.
- Conflict disclosure: правки только в `studio-editor.page.ts` (импорт + ribbon template + `openRenameDialog()` + CSS) и новый файл `studio-rename-document-dialog.component.ts`. `.mcp.json` и `ORCH-PROMPT.txt` — посторонние, исключены из коммита по инструкции оркестратора.
- Known limits: ручная browser-проверка (клик → диалог → PATCH → ribbon/список) не выполнялась в этой headless-сессии; приёмка полагается на статическую проверку (build/typecheck) + существующий backend-контракт (`name` уже валидировался и применялся до этого TZ, изменений в DTO/service нет) + идентичность структуры с уже принятым `StudioSaveAsTemplateDialogComponent`.

## Review handoff

- [x] TZ не требует отдельной review-волны (нет CATALOG/DICT inbox упоминания) — archive сразу после gates по образцу S27–S31.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-03T21:35:00Z
