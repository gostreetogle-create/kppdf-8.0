# TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-03T20:39:29Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S27
- team_room_claim: unavailable (Cursor prefilled `tasks/_active/` claim slot)

## Preflight

- [x] Get-Location / worktree → `.worktrees/TZ-NX-DOCSTUDIO-S27` on branch `claude/docstudio-s27` (explicit isolated worktree, per `docs/how-to-connect-ai.md`)
- [x] `_NOW.md` + `tasks/_active/` read — slot was free, no other CLAIM on same conflict keys
- [x] TZ read: `tasks/_ready/TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE.md`; page doc `docs/pages/document-studio.page.md` §3.3
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE.md` on place (prefilled by Cursor orch)

## Acceptance (из TZ)

- [x] Данные → видны карточки категорий; выбор ставит chip «N изделий»
- [x] Нет отдельного rail «Витрина» (orphan `pi-studio-showcase-panel` removed)
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0
- [x] Focused `studio-data` tests PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (document-studio)
- [x] page.md `docs/pages/document-studio.page.md` §3.3 — сверено с реализацией (уже описывает объединённую витрину, расхождений нет)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-data-panel.component.ts`, `.spec.ts`, `studio-showcase-panel.component.ts`, `studio-editor.page.ts`)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — S28 worktree is separate task/branch, not touched here
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx build kppdf-web` → exit 0 (production, only pre-existing budget warnings)
- `jest --config apps/kppdf-web/jest.config.ts studio-data-panel studio-data-vitrina` → 1 suite / 4 tests PASS

## Executor report

Витрина каталога (Изделия/Модули/Детали/Материалы, поиск, сетка `app-pi-showcase-card`) встроена как child `pi-studio-data-vitrina` сверху панели «Данные». Toggle идёт через существующий `catalogChange` → `onCatalogSelectionChange` в editor, без нового write-path. Orphan `studio-showcase-panel.component.ts` удалён. Фото products/modules — реальные `photoIds` (добавлено поле на `ProductModule`).

## Review handoff

- [x] READY FOR REVIEW

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-04T21:06:19Z
