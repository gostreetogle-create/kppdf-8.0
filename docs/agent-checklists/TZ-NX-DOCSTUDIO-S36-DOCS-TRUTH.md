# TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH.md` (archived after this run)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-04T00:00:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S36
- team_room_claim: unavailable (ORCH autonomous run, no Team Room CLI in this session)

## Preflight

- [x] git status / branch / worktree list проверены (worktree `.worktrees/TZ-NX-DOCSTUDIO-S36`, branch `claude/docstudio-s36`)
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только этот TZ на conflict keys
- [x] TZ / роадмап / WAVE checklist / honesty audit прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH.md` на месте

## Acceptance (из TZ)

- [x] §1.2–1.3, §2.1, §3.3 приведены в соответствие с кодом FINISH-волны (витрина в Данные — S27, Save реальный — S30, Preview HTML iframe — S31, live rows — S28/S29)
- [x] Убрано «NX: UI отсутствует» в §2.1 (строки таблицы из ERP) и в §5 (`from-template`, `duplicate`, `data-sets/:key`) — все три давно имеют UI (S27–S29)
- [x] Roadmap: FINISH S27–S35, S38–S40 помечены DONE; S15 помечен fixed-by S27/S28/S29
- [x] WAVE checklist `WAVE-DOCSTUDIO-FINISH-S27.md` — 13/14 `[x]` (S37 smoke ещё не запущен, честно оставлен `[ ]`)
- [x] Docs совпадают с `:4201` — сверено по коду (`studio-editor.page.ts`, `studio-data-panel.component.ts`, `pi-studio-documents.service.ts`), dev-server отвечает 200 на `/`
- [x] Нет «S15–S26 all DONE» без упоминания FINISH-волны (page.md §0 переписан)

## Integrity slot

- [x] Тип изменения: **docs-only**
- [x] FIC §A–E: N/A (docs-only, нет UI/permission/module diff)
- [x] page.md обновлён (сам объект TZ)
- [x] SECTION-READINESS: N/A
- [x] Conflict keys соблюдены: только 4 файла из TZ + этот checklist + archive
- [x] Coupling map: N/A (не трогал общее поле/статус)

## Build integrity

- [x] docs-only — код FE/BE не менялся; тем не менее прогнан `nx build kppdf-web` как финальный гейт по требованию ORCH-промпта

## Gates (факт)

См. раздел «Реализация» в archived файле.

## Executor report

Приведены в соответствие с кодом: `docs/pages/document-studio.page.md` (§0 статус волны,
§1.2 ribbon Save/rename, §2.1 таблица механизмов, §5 API-таблица), `docs/architecture/nx-doc-studio-roadmap-v2.md`
(шапка, S15 fixed-by, секция FINISH), `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md` (чекбоксы 01–13).
Каждое изменение проверено чтением реального кода (`studio-editor.page.ts`, `studio-data-panel.component.ts`,
`pi-studio-documents.service.ts`), не только по архивным TZ. S37 (smoke) сознательно оставлен незакрытым — не выполнялся в этой сессии.

## Review handoff

- [x] Review не требуется отдельным TZ (docs-only, PO-уровень TZ)

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-04
