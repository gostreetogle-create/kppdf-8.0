# TZ-KP-WS-405 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** freebuff-1 (executor, KP wave session 3)
**Depends on:** TZ-KP-WS-404 DONE

## Proof of adoption

| Пункт | Артефакт |
|-------|----------|
| Consumer | `/proposals/workspace` — table panel «Редактировать пресет» (PiDialog, без route); terms panel «Создать текстовый блок» + `libraryRefresh`; template panel mini-actions (rename/дубликат/фон) |
| Тесты | draft.service.spec +3 (dialog open без navigate; error без пресета; save → layout sync + autosave); page.spec +2 (кнопка create-block; open + refresh bump on save) |
| Docs | `docs/pages/kp-workspace.page.md` (Wave 405 DONE, Dialogs: table preset / text block / template mini) |
| Migration note | Не патчить TableTemplate из КП напрямую — только через `TableTemplateFormDialogComponent` (write-path SoT); inline overlay = PiDialog, не hand-rolled modal |
| Leftover | блок-level template editing остаётся в builder route (known_limitation); ribbon print/PDF дубли до 409 |

## Что сделано

1. **Table preset inline:** `openTableTemplatePreset` → `PiDialogService.open(TableTemplateFormDialogComponent)` с текущим `TableTemplate`; save → `kpTableLayout` sync (`ensureEssentialColumns`) + `rebuildPreview$` + autosave. Route change убран (Router больше не нужен в draft-сервисе).
2. **Text block inline:** workspace page — кнопка «Создать текстовый блок» над terms-панелью → PiDialog с `ProposalWorkspaceTextBlockDialogComponent` (host `TextBlockEditorComponent`, close со saved `TextBlock`); save → `textBlocksVersion` bump → аддитивный input `libraryRefresh` на `ProposalCreateTermsComponent` перезагружает библиотеку (обратно-совместимо с create page).
3. **Template mini:** `ProposalWorkspaceTemplateActionsComponent` — rename (inline, не overlay), duplicate shell (`DocumentTemplatesService.duplicate`), upload background (file input → `uploadBackground`).
4. Full builder остаётся доступен через picker (`/doc-constructor/builder/:id?returnUrl=`) — AC 4.

## Про race с параллельной сессией

Параллельная сессия (TZ-KP-WS-407, тот же checkout) закоммитила в `96aa42b8` часть 405-правок draft-service/page (открытые рабочие изменения). Этот коммит завершает 405: terms `libraryRefresh`, оба новых компонента, спеки, docs. Remote был сломан (`96aa42b8` ссылался на отсутствующие компоненты) — push `443d06a9` восстановил сборку.

## Gates

- FE tsc: 0 errors
- jest workspace + terms: 58/58 (в т.ч. draft 16, page 19)
- jest proposals сет: 168/168
- eslint proposals/: 0 errors (2 pre-existing warnings в чужих page)
- ng build (dev): 0 errors
- diff --check: PASS · pre-commit lint-staged PASS (со 2-й попытки) · pre-push hook OK

## Коммиты

- SHA кода: `443d06a9` (push PASS; вместе с параллельными b14dd93f/8e22513f/cede5cb6/fd9bc8c9)
- (SHA-фикс архива — после)
