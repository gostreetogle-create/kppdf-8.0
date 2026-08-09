# TZ-OPS-303 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-OPS-303.md` (удалён при archive)
> Source: `tasks/_backlog/ops/TZ-OPS-303-docs-integrity-closeout.md`
> Depends: TZ-OPS-302 DONE (committed `db9684f1`, pushed)

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id: buffy-ops-303
- claimed_at: 2026-08-09T13:10:00Z
- workspace: D:\kppdf-8.0 (executed in Freebuff worktree, HEAD == origin/main + 302 commit, tree clean)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight

- [x] Workspace проверен; 302 archived/DONE (commit `db9684f1` pushed)
- [x] Нет чужого CLAIM на `_TEMPLATE` / FIC / DOCS-INTEGRITY (active: только DOC-TABLES-305, FE keys)
- [x] Claim slot заполнен; `_active` marker на месте

## Acceptance

- [x] `docs/DOCS-INTEGRITY.md` 60 строк ≤100; матрица триггер→файлы + анти-дрейф (код/schema побеждают)
- [x] `_TEMPLATE.md` содержит секцию **Integrity slot** с чекбоксами (после Acceptance, до Gates)
- [x] FIC §F: пункт «Integrity slot в checklist заполнен»
- [x] PROJECT-MEMORY: заглушка OPS-303 → реальная ссылка DOCS-INTEGRITY (без «появится позже»); Integrity slot в «Не потерять»
- [x] GEMINI.md: Integrity slot обязателен до READY/archive (Definition of Done)
- [x] Нет product code diff

## Integrity slot (docs-only)

- [x] Тип: docs-only (мета-процесс: протокол + шаблон + FIC)
- [x] FIC: N/A — сам FIC §F обновлён этой TZ, других page/permission/module/MCP нет
- [x] page.md: N/A (нет UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите (stage поимённо)

## Gates

- [x] `rg -n "Integrity slot|DOCS-INTEGRITY" _TEMPLATE.md FIC PROJECT-MEMORY DOCS-INTEGRITY GEMINI GUIDE` → 14 hits PASS
- [x] `(Get-Content docs/DOCS-INTEGRITY.md).Count` = 60 ≤ 100 PASS
- [x] `git status --short` → только docs/GEMINI/checklist/active; product code не тронут PASS

## Executor report (auto)

- Создан `docs/DOCS-INTEGRITY.md` (60 строк): правило «код+docs = один PR/TZ», матрица триггер→файлы, Integrity slot, анти-дрейф, ссылки.
- `_TEMPLATE.md`: секция **Integrity slot** после Acceptance (6 чекбоксов из TZ дословно).
- FIC §F + пункт про Integrity slot; PROJECT-MEMORY: живая ссылка DOCS-INTEGRITY + Integrity slot в «Не потерять».
- GEMINI.md DoD: Integrity slot до READY/archive (одна строка, не эссе).
- DOMAIN-MAP не создавался (OPS-304); массовый backfill старых checklist’ов не делался (known_limitation).
- Conflict scan: `_active/` только DOC-TABLES-305 (FE); ключи 303 свободны. Docs-only self-archive OK.
- **Landed on canonical main:** `173d1406` (cherry-pick of `bb30b30b`), pushed to `origin/main` 2026-08-09.

## Closeout

- [x] archive + progress + `_active-map` + Status DONE
- closed_at: 2026-08-09T13:20:00Z
