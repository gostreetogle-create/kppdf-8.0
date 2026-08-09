# TZ-OPS-304 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-OPS-304.md`
> Source: `tasks/_backlog/ops/TZ-OPS-304-domain-canon-map.md`
> Depends: TZ-OPS-302 DONE (`db9684f1`) + TZ-OPS-303 DONE (`bb30b30b`)

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id: buffy-ops-304
- claimed_at: 2026-08-09T13:25:00Z
- workspace: D:\kppdf-8.0 (executed in Freebuff worktree, HEAD == origin/main + 302/303 commits, tree clean)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight

- [x] Workspace проверен; 302+303 DONE (commits pushed)
- [x] Нет чужого CLAIM на DOMAIN-MAP / PROJECT-MEMORY keys (active: только DOC-TABLES-305, FE)
- [x] Claim slot заполнен; `_active` marker на месте
- [x] Routes/modules только READ; write = docs only

## Acceptance

- [x] `DOMAIN-MAP.md` 84 строки ≤180; 12 доменных строк (≥11); «Не путать» с 4 канонами (Counterparty≠Organization, StorageItem SoT, КП≠Order, composition≠stock)
- [x] Gap inventory 36 routes; 6 × NO без создания page.md (только таблица + successor hint)
- [x] PROJECT-MEMORY (таблица + «Куда идти») и DOCS-INTEGRITY ссылаются на DOMAIN-MAP
- [x] ARCHITECTURE: pointer 1 строка (≤5) сразу после шапки
- [x] `git diff --name-only` — только docs/ARCHITECTURE/checklist; `frontend/**`/`backend/**` отсутствуют

## Integrity slot (docs-only)

- [x] Тип: docs-only
- [x] FIC: N/A (нет page/permission/module/MCP; gap-таблица — не создание фич)
- [x] page.md новых: N/A (только gaps; 6 NO зафиксированы для successor’ов)
- [x] SECTION-READINESS: N/A (не трогался)
- [x] Чужой WIP не в коммите (stage поимённо)

## Gates

- [x] `rg -n "DOMAIN-MAP" docs/PROJECT-MEMORY.md docs/DOCS-INTEGRITY.md ARCHITECTURE.md` → 5 hits PASS
- [x] `(Get-Content docs/DOMAIN-MAP.md).Count` = 84 ≤ 180 PASS
- [x] `git diff --name-only` → нет frontend/ backend/ product paths PASS
- [x] `git status --short` → docs/ARCHITECTURE/checklist только PASS

## Executor report (auto)

- Создан `docs/DOMAIN-MAP.md` (84 строки): шапка + 12 доменов (факты из `backend/src/modules/` и `app.routes.ts`, read-only) + gap inventory.
- «Не путать»: Counterparty=клиент сделки vs Organization=наша фирма; остаток SoT=`StorageItem`; КП≠Order; composition≠склад. — 4 канона из TZ.
- Gap: 36 бизнес-routes → 6 без page.md: `/design`, `/shipping`, `/doc-template-categories`, `/dictionaries/text-block-categories`, `/admin/users`, `/admin/roles`; page.md не создавались.
- Проводка: PROJECT-MEMORY (таблица + if/then «сначала DOMAIN-MAP»), DOCS-INTEGRITY (строка матрицы + ссылка), ARCHITECTURE pointer (1 строка), pages/README (1 строка).
- Отмечен P2-дрейф README (индекс не перечисляет warehouses/supply/people/import-todos; `/inventory` vs `/dashboard`) — hygiene-fix successor, не эта TZ.
- Ноль product code; DOC-TABLES-305 (FE) не пересекается. Docs-only self-archive OK.

## Closeout

- [x] archive + progress + `_active-map` + Status DONE
- closed_at: 2026-08-09T13:40:00Z
