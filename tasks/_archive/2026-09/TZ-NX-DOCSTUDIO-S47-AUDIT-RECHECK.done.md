# TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK: повторный аудит привязок (без кода)

**РОЛЬ:** Executor / peer auditor — claude
**LAYER:** 4 (docs only) · **SIZE:** S
**PAGES:** `/studio/:id`
**PAGE_DOCS:** `docs/pages/document-studio.page.md`
**CONFLICT KEYS:** `docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md` (создан); `docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` (status row 0)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T19:28:08Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight Check Output

- **Context read:** `docs/audits/2026-09-08-docstudio-table-field-binding-audit.md`; live sources: `backend/src/modules/studio-document/studio-data-resolver.ts` (full), `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` (full), `studio-blocks-canvas.component.ts` (canvas render + `tableColumns`/`tableRows`), `studio-editor.page.ts` (`patchTableSettingsForBlock`, `applyLiveRowsFromDataSet`, `refreshLiveDataSetsOnLoad`, `ensureLiveRowsAfterLayoutSave`), `studio-table-properties.component.ts` (`onTemplateSelect`, `emitColumnStructure`), reference `frontend/src/app/pages/commercial/proposals/proposal-table-layout.util.ts`, legacy `backend/src/modules/table-template/table-template.service.ts` (photo `formatCell`); `git log --oneline -5` on studio paths to confirm no commit since the audit invalidates it.
- **Key Constraints:** ZERO product code — docs-only recheck.
- **Planned Deliverable:** `docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md` with CONFIRM/REJECT/AMEND per BUG-1..5 + path:line + overall verdict.
- **Validation Path:** recheck file exists with explicit verdict; WAVE row 0 updated; `git status --short` shows only docs paths from this task.

## Что сделано

Открыл (не по памяти) все пять путей, которые называет Cursor-аудит, плюс эталон
`proposal-table-layout.util.ts` и legacy `table-template.service.ts` (для BUG-4).
Подтвердил все пять багов **CONFIRM** (без REJECT/AMEND) с точными `path:line`
на текущем HEAD (`00d06c64`):

- **BUG-1** (positional stale rows) — `onTemplateSelect` → `settingsChange` →
  `patchTableSettingsForBlock` не трогает `liveRows` и не вызывает `putDataSet`;
  canvas (`tableRows()`) предпочитает старый `liveRows` новым колонкам.
- **BUG-2** (alias map) — `COLUMN_ALIASES` в NX-резолвере не знает `photo`/`description`/`article`.
- **BUG-3** (thin catalog LineItem) — catalog-ветка `fetchLiveRows` не прокидывает description/фото.
- **BUG-4** (photo = plain text) — оба NX render-пути (canvas + backend PDF) только текст;
  рабочий thumbnail-пайплайн уже есть в legacy `table-template.service.ts`, не подключён.
- **BUG-5** (liveRows игнорирует hide-column) — `tableRows()` возвращает сырой `liveRows`
  мимо `studioVisibleTableRows()`, который единственный фильтрует по hidden columns.

**Verdict: PASS — proceed S47.** Дельт к TZ S47/S48 не потребовалось; добавлена
одна implementation-заметка для S47 (не AC-изменение): очищать/re-fetch `liveRows`
при смене колонок, не только `tableTemplateSampleRows`.

Файл: `docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md`.
WAVE row 0 обновлён на DONE — PASS.

## Gates

- Docs-only task — typecheck/tests/lint N/A по TZ.
- `git status --short` перед коммитом — только docs/tasks пути этой задачи (проверено).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
verification:
  - acceptance criteria: PASS (recheck file написан с явным verdict по BUG-1..5 + path:line; overall PASS; продукт-код не тронут)
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK.md`)
  - progress.md: REDIRECT (не ведётся; статус — `_NOW.md` / WAVE file)
  - status synchronization: PASS (`docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md` row 0 → DONE)
