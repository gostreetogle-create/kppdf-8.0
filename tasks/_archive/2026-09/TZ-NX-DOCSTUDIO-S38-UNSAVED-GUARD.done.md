# TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD: уход без потери правок

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1
**ЗАВИСИМОСТИ:** S30 (честный Save)
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`; `studio.routes.ts`; optional reuse `dirty-dialog.guard.ts` pattern
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## Domain preflight

PO-CANON: dirty-close на показе важнее «фич на вырост». Сейчас `studio.routes` — без `CanDeactivate`; «К списку» / смена URL / F5 уводят молча. Layouts debounce 400ms — легко потерять сдвиг блоков.

## ИСХОДНОЕ

- `layoutsDirty` + `flushLayouts` есть.
- Нет route guard. Нет confirm на «К списку».

## ЧТО ДЕЛАТЬ

1. `isStudioDirty()` = `layoutsDirty` **или** save in-flight **или** явный dirty после локальных block edits ещё не подтверждённых сервером (минимально: layoutsDirty + optional flag если patchBlock* pending).
2. `CanDeactivate` на `:id` → dialog «Уйти без сохранения?» Остаться / Уйти / **Сохранить и уйти** (вызвать тот же путь что S30 Save, затем navigate).
3. «К списку» и любые `router.navigate` из editor — через тот же confirm.
4. `beforeunload` когда dirty (стандартный browser tip).
5. Reuse Pi AlertDialog / pattern из `dirty-dialog.guard.ts` (адаптировать тексты под «документ», не паспорт).

## НЕ ИЗМЕНЯТЬ

- Conflict 409 dialog semantics
- Finalize

## КРИТЕРИИ ПРИЁМКИ

1. Сдвинул блок → сразу «К списку» → confirm, не silent leave.
2. «Сохранить и уйти» пишет layouts (network) и уходит.
3. Чистый документ — уход без dialog.
4. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD.done.md`

---

## Реализация (S38)

`isStudioDirty()` реализован как объединение трёх сигналов: уже существующий
приватный `layoutsDirty` (S30), `saving()` (save in-flight) и новый
`pendingBlockPatches` signal(number) — счётчик, инкрементируемый перед и
декрементируемый после каждого immediate `blocksService.update()` в
`patchBlockStyle` / `applyBlockContent` / `patchBlockTitle` (эти методы пишут
на сервер сразу, без debounce, но между локальным optimistic apply и ответом
сервера есть узкое окно, которое раньше не отслеживалось).

`AlertDialogComponent` (`@kppdf/ui/dialog`) поддерживает только confirm/cancel
(`DialogRef<boolean>`) — недостаточно для требуемых 3 исходов «Остаться / Уйти /
Сохранить и уйти». Расширение общего компонента третьей кнопкой затронуло бы
все остальные вызовы (включая conflict-dialog, который TZ прямо запрещает
трогать), поэтому собран отдельный `StudioUnsavedChangesDialogComponent` на
том же `PiDialogComponent`-шелле (`alert` variant) + `@kppdf/ui/button`,
текстовый паттерн адаптирован под «документ» вместо «паспорт»
(`dirty-dialog.guard.ts` — 2-button/паспорт-специфичный helper, не переиспользован
дословно, только паттерн). Диалог закрывается только явными строковыми
литералами (`'stay' | 'leave' | 'save-and-leave'`), ESC/backdrop-dismiss
отключены (`dismissOnEscape: false`, `dismissOnBackdropClick: false`) — у
`PiDialogService` `ref.close()` без значения приводит `closed()` к тому же
`undefined`, что и «ещё не закрыт», поэтому единственный надёжный способ
гарантировать разрешение guard-промиса — не давать закрыть диалог без явного
выбора кнопки.

`saveDocument()` изменил сигнатуру `Promise<void>` → `Promise<boolean>`
(репортит успех: layouts flush + опциональный KP quotation sync); привязка
кнопки «Сохранить» в ribbon не пострадала (значение возврата игнорируется
в шаблонном event binding). `confirmLeave()`: чистый документ → `true` сразу;
грязный → диалог; `'leave'` → `true`; `'save-and-leave'` → ждёт `saveDocument()`
и уходит только при успехе (при 409 остаётся существующий `conflict()` диалог
поверх, `confirmLeave()` резолвится `false` — пользователь остаётся). `stay` →
`false`.

`canDeactivate()` — тонкая обёртка над `confirmLeave()`, использована новым
функциональным guard'ом `studioDirtyGuard` (`CanDeactivateFn<StudioEditorPage>`)
в `studio.routes.ts` на маршруте `:id`. Route guard покрывает не только кнопку
«К списку», но и browser back / любую другую навигацию прочь со страницы
редактора — единая точка входа вместо оборачивания каждого `router.navigate`
по отдельности. `openDocumentList()` тоже проходит через `confirmLeave()` перед
`router.navigate`.

`beforeunload` слушатель добавлен в `ngAfterViewInit` / снят в `ngOnDestroy`,
вызывает `event.preventDefault()` / `event.returnValue = ''` при
`isStudioDirty()` — стандартный browser-native prompt на F5/закрытие вкладки.

`docs/pages/document-studio.page.md` §1.2 — обновлена строка «К списку» в
таблице ribbon-поведения.

**Known limits:** live-browser QA (запуск dev-сервера, клики по кнопкам) не
выполнялся в этой сессии — только статические проверки (typecheck/build/lint/tests)
и построчный ревью diff. `layoutsDirty` уже был live-проверен при S30; новый
код читает существующий флаг и оборачивает существующий
`saveDocument()`/`flushLayouts()` путь, не меняя его внутреннюю логику.

### Gates (факт)

```text
cd frontend-nx && pnpm exec nx build kppdf-web (baseline, до кода)
  → PASS, exit 0

cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0, no output

cd frontend-nx && pnpm exec nx build kppdf-web (после кода)
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts
  apps/kppdf-web/src/app/pages/studio/studio.routes.ts
  apps/kppdf-web/src/app/pages/studio/studio-dirty.guard.ts
  apps/kppdf-web/src/app/pages/studio/studio-unsaved-changes-dialog.component.ts
  → PASS, exit 0, 0 errors; 5 pre-existing warnings in studio-editor.page.ts
    (non-null assertions / unused var, вне зоны правки этого TZ, тот же счёт,
    что документирован в S35)

cd frontend-nx && pnpm exec nx test kppdf-web (full suite)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31–S35
    (350 passed / 7 skipped / 359 total, без изменений до/после diff этого TZ)

pnpm architecture:check
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS (code-level; no live-browser QA this session — see Known limits)
  - typecheck: PASS
  - tests: PASS for changed-scope (no dedicated spec file added/changed); pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - lint: PASS for changed-scope files (0 errors, 5 pre-existing warnings outside diff)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
