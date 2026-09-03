# TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD.md` (removed after archive)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-03T21:55:13Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S38
- team_room_claim: unavailable (no Team Room CLI in this worktree)

## Preflight

- [x] `git status` / `git branch --show-current` → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S38`, branch `claude/docstudio-s38`
- [x] `_NOW.md` + `tasks/_active/` read — only this TZ in `_active`, no other CLAIM on `studio-editor.page.ts` / `studio.routes.ts` / `nx build kppdf-web`
- [x] TZ read; S30 dependency (честный Save) already present (`layoutsDirty`/`flushLayouts`/`saveDocument` in `studio-editor.page.ts`)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S38-UNSAVED-GUARD.md` on place (copied from `_ready`)

## Investigation

- [x] `studio.routes.ts` — no `CanDeactivate` guard on `:id` route
- [x] `studio-editor.page.ts` — `openDocumentList()` navigates via `router.navigate(['/studio'], ...)` with no confirm; ribbon "К списку" button wired to it
- [x] `layoutsDirty` (private field) + `flushLayouts()`/`saveLayouts()` already implemented (S30); `saveDocument()` calls `flushLayouts()` then optional `syncKpQuotationItems()`, returned `Promise<void>` (no success signal to callers)
- [x] `patchBlockStyle` / `patchBlockContent` (via `applyBlockContent`) / `patchBlockTitle` fire immediate `blocksService.update()` calls with no local pending flag — narrow window between local optimistic apply and server confirmation was not tracked
- [x] `AlertDialogComponent` (`@kppdf/ui/dialog`) only supports 2-button confirm/cancel (`DialogRef<boolean>`) — insufficient for the required 3-way "Остаться / Уйти / Сохранить и уйти"; reused `PiDialogComponent` (alert variant) + `@kppdf/ui/button` directly in a new dedicated dialog component instead of extending the shared `AlertDialogComponent` (kept out of scope, per "не изменять conflict 409 dialog semantics")
- [x] `PiDialogService.open()` ref: `close()` with no explicit value resolves `closed()` signal indistinguishably from "not yet closed" (`isClosed() ? closedSig() : undefined` collapses to `undefined` either way) — new dialog closes with explicit string literals (`'stay' | 'leave' | 'save-and-leave'`) for every button and disables ESC/backdrop dismiss (`dismissOnEscape: false`, `dismissOnBackdropClick: false`) so the guard Promise always resolves

## Реализация

1. `studio-editor.page.ts`:
   - added `pendingBlockPatches` signal(number), incremented/decremented around the three immediate-save block-patch methods (`patchBlockStyle`, `applyBlockContent`, `patchBlockTitle`)
   - added `isStudioDirty(): boolean` = `layoutsDirty || saving() || pendingBlockPatches() > 0`
   - `saveDocument()` now returns `Promise<boolean>` (was `Promise<void>`) reporting overall success (layouts + optional KP sync); ribbon Save button usage unaffected (return value ignored by template binding)
   - added `confirmLeave(): Promise<boolean>` — opens `StudioUnsavedChangesDialogComponent` when dirty, resolves `true`/`false` per user choice; "Сохранить и уйти" awaits `saveDocument()` and only resolves `true` on success (failure keeps the conflict dialog on top and returns `false`, i.e. stay)
   - `openDocumentList()` now routes through `confirmLeave()` before navigating
   - added `canDeactivate(): boolean | Promise<boolean>` method used by the new functional guard
   - added `window.beforeunload` listener (added in constructor/`ngOnInit`-equivalent init, removed in `ngOnDestroy`) that sets `event.returnValue` when `isStudioDirty()`
2. New file `studio-unsaved-changes-dialog.component.ts` — 3-button alert-variant dialog (`Остаться` / `Уйти` / `Сохранить и уйти`), texts adapted for "документ" per TZ point 5 (reuse pattern from `dirty-dialog.guard.ts`, adapted — that helper is 2-button/passport-specific and was not reused verbatim)
3. New file `studio-dirty.guard.ts` — functional `CanDeactivateFn<StudioEditorPage>` calling `component.canDeactivate()`
4. `studio.routes.ts` — wired `canDeactivate: [studioDirtyGuard]` on the `:id` route

## Acceptance

- [x] Сдвинул блок → сразу «К списку» → confirm dialog, not silent leave — verified by code path: layout drag sets `layoutsDirty = true` synchronously (existing S30 code), `openDocumentList()` now calls `confirmLeave()` first which checks `isStudioDirty()` before navigating; no live-browser QA performed for this TZ (CLI-only executor session, see Known limits)
- [x] «Сохранить и уйти» writes layouts (network) and leaves — `confirmLeave()` on `'save-and-leave'` awaits `saveDocument()` (calls `flushLayouts()` → `blocksService.updateLayouts` network write) and only resolves `true`/navigates on success; failure (409) surfaces the existing `conflict()` dialog and keeps the user on the page
- [x] Clean document — leave without dialog — `isStudioDirty()` false (no layoutsDirty, not saving, no pending block patches) → `confirmLeave()` returns `true` immediately, no dialog opened
- [x] `nx build kppdf-web` PASS — see Gates

## Integrity slot

- [x] Тип изменения: frontend-nx `apps/kppdf-web` studio page — new route guard + dialog, no backend/contract change
- [x] FIC §A–E: N/A — no new permission/module/MCP surface, no backend contract touched
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/document-studio.page.md` §1.2 ribbon table — updated "К списку" row to document the new confirm-dialog behavior
- [x] Conflict 409 dialog semantics untouched; Finalize untouched — `conflict()` method body unchanged; `finalize`/archive flow not touched
- [x] Чужой WIP не в коммите; conflict keys (`studio-editor.page.ts`, `studio.routes.ts`) соблюдены — only this TZ in `tasks/_active/` throughout the session

## Build integrity

- [x] Baseline `nx build kppdf-web` перед кодом — see Gates (PASS before any code change)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` implicit conflict — только эта TZ в `_active`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

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
    (non-null assertions / unused var at lines 1223/1224/2022/2022/2105 — all
    pre-existing, outside this TZ's diff, same count as documented in S35)

cd frontend-nx && pnpm exec nx test kppdf-web (full suite)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31–S35
    (350 passed / 7 skipped / 359 total, unchanged before/after this TZ's diff)

pnpm architecture:check (repo root)
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."
```

## Executor report

**Добавлено:**
- `studio-editor.page.ts`:
  - `pendingBlockPatches` signal(number) — tracks in-flight immediate block-patch network calls (`patchBlockStyle`, `applyBlockContent`, `patchBlockTitle`), incremented before `blocksService.update()`, decremented in `.finally()`
  - `isStudioDirty(): boolean` — `layoutsDirty || saving() || pendingBlockPatches() > 0`
  - `confirmLeave(): Promise<boolean>` — clean → resolves `true` immediately; dirty → opens `StudioUnsavedChangesDialogComponent` (ESC/backdrop dismiss disabled so the promise always settles); `'leave'` → `true`; `'save-and-leave'` → awaits `saveDocument()` result; `'stay'` (or dialog never resolved otherwise) → `false`
  - `canDeactivate(): Promise<boolean>` — thin wrapper calling `confirmLeave()`, consumed by the new route guard
  - `saveDocument()` signature changed `Promise<void>` → `Promise<boolean>` (reports overall success: layouts flush + optional KP quotation sync); existing ribbon Save button binding unaffected since the return value is ignored by the template event binding
  - `openDocumentList()` now awaits `confirmLeave()` before calling `router.navigate`
  - `window.beforeunload` listener (added `ngAfterViewInit`, removed `ngOnDestroy`) — calls `event.preventDefault()` / sets `event.returnValue` when `isStudioDirty()`, standard browser-native "leave site?" prompt for F5/tab-close
- New file `studio-unsaved-changes-dialog.component.ts` — `StudioUnsavedChangesDialogComponent`, 3-button `alert`-variant dialog built directly on `PiDialogComponent` + `@kppdf/ui/button` (title "Уйти без сохранения?", fixed text "Несохранённые изменения документа будут потеряны."), closes with explicit `'stay' | 'leave' | 'save-and-leave'` string literals (never `undefined`, since the shared `PiDialogService`'s `closed()` signal collapses "not yet closed" and "closed with `undefined`" to the same value)
- New file `studio-dirty.guard.ts` — `studioDirtyGuard: CanDeactivateFn<StudioEditorPage>` calling `component.canDeactivate()`
- `studio.routes.ts` — wired `canDeactivate: [studioDirtyGuard]` on the `:id` route (covers "К списку", browser back, any other in-app navigation away from the editor route, not just the ribbon button)
- `docs/pages/document-studio.page.md` §1.2 — documented the new confirm-on-leave behavior in the ribbon table

**Почему не переиспользован `dirty-dialog.guard.ts` / `AlertDialogComponent` напрямую (TZ п.5 "reuse... адаптировать"):** оба поддерживают только 2 исхода (confirm/cancel через `DialogRef<boolean>`), а TZ требует 3 явных исхода (Остаться / Уйти / Сохранить и уйти). Расширение `AlertDialogComponent` третьей кнопкой было бы shared-surface изменением, затрагивающим все остальные вызовы (включая conflict-dialog, который TZ явно запрещает трогать) — решено собрать отдельный компонент на том же `PiDialogComponent`-шелле вместо этого; текстовый паттерн (заголовок/описание/подпись кнопок) адаптирован под "документ".

**Known limits:** live-browser QA (запуск dev-сервера и клик по кнопкам) не выполнялся в этой сессии — только статическая проверка (typecheck/build/lint/tests) + построчный ревью diff. Поведение прослежено по коду: `layoutsDirty` уже проверялся при S30 (drag → `schedule()` → `layoutsDirty = true`), новый код лишь читает этот флаг и оборачивает существующий `saveDocument()`/`flushLayouts()` путь.

## Review handoff

- [x] Self-reviewed diff; no wave inbox review required by TZ

## Closeout

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-03
