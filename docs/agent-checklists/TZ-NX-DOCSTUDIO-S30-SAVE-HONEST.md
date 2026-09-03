# TZ-NX-DOCSTUDIO-S30-SAVE-HONEST checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S30-SAVE-HONEST.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-04T00:00:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S30
- team_room_claim: unavailable (orchestrator ORCH-PROMPT.txt prefilled task, verified against tasks/_active before code)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `.worktrees/TZ-NX-DOCSTUDIO-S30`, branch `claude/docstudio-s30`, baseline e0cb0183 (merge S29)
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S30-SAVE-HONEST.md` уже на месте (orchestrator prefilled); нет чужого CLAIM на `studio-editor.page.ts` в других active worktrees
- [x] TZ / `studio-editor.page.ts` (`saveDocument`, `flushLayouts`, `saveLayouts`, `syncKpQuotationItems`, `conflict`) прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS

## Acceptance

- [x] `saveDocument` теперь `async`: `await this.flushLayouts()` → если `!layoutsOk` (revision conflict на layouts PATCH) выходит без success-toast (conflict-диалог уже показан внутри `saveLayouts`/`conflict()`)
- [x] Если `isKpDoc() && quotationId()` → `await this.syncKpQuotationItems()` (переиспользован существующий приватный метод, теперь возвращает `Promise<boolean>`); при ошибке — `toast.error` внутри метода, `saveDocument` выходит без success
- [x] `toast.success('Сохранено')` вызывается только если оба шага прошли (layouts ok И, если КП, sync ok)
- [x] `saving` signal (`readonly saving = signal(false)`) — `true` на время `saveDocument`, кнопка `data-test="studio-save"` получила `[disabled]="saving()"` (тот же паттерн, что `templateSaving()` на `studio-save-as`)
- [x] `openSaveAsTemplateDialog` / save-as-template flow не тронут — нет дублирования
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (последний gate)

## Integrity slot (до READY / archive)

- [x] Тип изменения: FE page behavior fix (honest save), no schema/route/permission change
- [x] FIC §A–E: N/A — no new page/permission/module/MCP
- [x] page.md: document-studio.page.md §1.2 описывает save-контракт, поведение приводится в соответствие
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; правки только в CONFLICT KEY TZ (`studio-editor.page.ts`)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — учтён

## Gates (факт)

- `cd frontend-nx && pnpm exec nx build kppdf-web` — exit 0, PASS (studio-editor-page chunk built, no TS errors)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` — pre-existing failures (a11y click/keyup rules на нетронутых строках: `studio-blocks-canvas.component.ts`, `studio-layers-panel.component.ts`, `studio-properties-panel.component.ts`, `studio-table-properties.component.ts`, `studio-text-properties.component.ts`, `studio-workspace-shell.component.html`, и `studio-editor.page.ts:206` — та же `<div (click)="$event.stopPropagation()">`, что была до этого TZ) + non-null-assertion/unused-vars warnings вне тронутых строк; ни одна ошибка не указывает на добавленные/изменённые строки (~174, 466-467, 713-726, 1577-1587, 1736, 1929-1979) — baseline noise, не правил
- Нет harness спеки под `studio-editor.page.ts` (как в S29 — компонент без юнит-теста, слишком тяжёлый DI surface); AC проверены чтением кода (глазом) — допустимо по TZ п.4 «иначе AC глазом»

## Executor report

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`:
  - `saveDocument()`: было синхронный fake-success (`this.toast.success('Сохранено')` без записи). Теперь `async`: `saving.set(true)` → `await flushLayouts()` → если `false` (layout revision conflict, диалог уже открыт `conflict()`) — выход без toast → если `isKpDoc() && quotationId()` → `await syncKpQuotationItems()` → если `false` (ошибка sync, toast.error уже показан внутри) — выход без success-toast → иначе `toast.success('Сохранено')` → `finally` сбрасывает `saving`.
  - `saving` signal добавлен (аналог `templateSaving`), привязан к `[disabled]` на `data-test="studio-save"`.
  - `flushLayouts()` / `saveLayouts()`: тип возврата сменён с `Promise<void>` на `Promise<boolean>` (`true` = успех/нечего сохранять, `false` = revision conflict, где `saveLayouts` уже вызывал `this.conflict()`). До этого TZ вызывающий код (`onDownloadPdf`, `onFinalize`, `enterPreviewMode`, `onLayoutCommit`) не мог отличить успех от неудачи — ошибка молча проглатывалась (resolved promise даже при конфликте). Теперь `saveDocument` — первый вызывающий код, который реально использует признак успеха; остальные вызывающие места (`.then()/await`, где возврат игнорируется) продолжают компилироваться без изменений в их логике (не в скоупе TZ — трогать их поведение не просили).
  - `syncKpQuotationItems()`: тип возврата сменён с `void` на `Promise<boolean>`; добавлена ветка `else { toast.error(extractErrorMessage(result.error)); return false; }` (раньше ошибка синка КП молча игнорировалась). Единственный другой вызывающий код (`patchDocumentContext`, fire-and-forget после context PATCH) обёрнут в `void` для совместимости с новым `Promise`-возвратом.
- Conflict disclosure: правил только `studio-editor.page.ts` (единственный CONFLICT KEY TZ).
- Known limits: revision conflict на layouts во время `saveDocument` открывает модальный `AlertDialogComponent` (существующий UX `conflict()`), а не toast — так уже было для layout conflicts до этого TZ (см. `onDownloadPdf`/`onFinalize`/`togglePageNumbering` и т.д., все используют тот же `conflict()`-диалог для revision mismatch); TZ формулировка «conflict/error toast» трактована как «conflict-UI (диалог) для revision conflict, error-toast для прочих ошибок (sync КП)» — согласуется с существующим паттерном приложения, не вводит новый UX-примитив.

## Review handoff

- [x] Одиночный FE TZ — self-gates по acceptance criteria TZ пройдены выше

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-04T00:15:00Z
