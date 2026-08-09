# TZ-OPS-302 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-302.md` (удалён при archive)
> Source: `tasks/_backlog/ops/TZ-OPS-302-project-memory-pack.md`
> Commit/push: после DONE — scoped; чужой WIP не трогать

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id: buffy-ops-302
- claimed_at: 2026-08-09T12:55:00Z
- workspace: D:\kppdf-8.0 (executed in Freebuff worktree, HEAD == origin/main f529f7a5, tree clean)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight

- [x] Workspace проверен: HEAD == `origin/main` (`f529f7a5`), tree clean (Freebuff worktree)
- [x] `_active-map` + `tasks/_active/` — нет чужого CLAIM на keys 302 (active: только DOC-TABLES-305, FE keys)
- [x] Прочитал WAVE + audit + TZ-OPS-302 + GEMINI/GUIDE/how-to-connect/PO-DIARY
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-302.md` на месте

## Acceptance

- [x] `docs/PROJECT-MEMORY.md` 67 строк ≤140, все 6 секций (Зачем/Ритуал/Где правда/Не потерять/Не ломать/Куда идти)
- [x] GUIDE §1.2: `1a. docs/PROJECT-MEMORY.md` до ARCHITECTURE (старые 1a–1c → 1b–1d)
- [x] GEMINI.md: PROJECT-MEMORY в обязательном чтении после PO-DIARY
- [x] how-to-connect-ai: пункт 6 после CLAIM → PROJECT-MEMORY
- [x] Нет product code diff (только docs/GEMINI/checklist/active/progress/archive)

## Integrity slot (docs-only)

- [x] Тип: docs-only
- [x] FIC §A–E: N/A (нет page/permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите (stage только свои 8 файлов поимённо)

## Gates

- [x] `rg -n "PROJECT-MEMORY" docs/AI-AGENT-GUIDE.md GEMINI.md docs/how-to-connect-ai.md` → 3 hits PASS
- [x] `(Get-Content docs/PROJECT-MEMORY.md).Count` = 67 ≤ 140 PASS
- [x] `git status --short` → только docs/GEMINI/checklist/active; product code не тронут PASS

## Executor report (auto)

- Создан `docs/PROJECT-MEMORY.md` (67 строк, 6 секций) — тонкий склад истины для агентов.
- Проводка: GUIDE §1.2 (шаг 1a до ARCHITECTURE), GEMINI.md (после PO-DIARY), how-to-connect-ai (п.6).
- Заглушки DOCS-INTEGRITY (OPS-303) и DOMAIN-MAP (OPS-304) в таблице «Где правда» — не создавались.
- Ноль product code: frontend/backend/desktop не тронуты; активный DOC-TABLES-305 (FE) не пересекается.
- Conflict scan: `_active/` только TZ-DOC-TABLES-305; ключи 302 свободны.
- Docs-only self-archive OK по TZ (AC зелёные).
- **Landed on canonical main:** `ad886ed9` (cherry-pick of `db9684f1`), pushed to `origin/main` 2026-08-09.

## Closeout

- [x] archive + progress + удалить `_active` + Checkpoint `_active-map`
- [x] Status = DONE
- closed_at: 2026-08-09T13:05:00Z
