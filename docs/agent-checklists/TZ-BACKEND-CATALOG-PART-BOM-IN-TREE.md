# Checklist — TZ-BACKEND-CATALOG-PART-BOM-IN-TREE

> Status: **DONE**
> Marker: `tasks/_active/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.md`
> Spec: `tasks/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.md`
> Wave: `docs/agent-checklists/WAVE-BACKEND-POST-RBAC.md`

## Claim slot

- agent_id: `buffy-gpt-5.6-luna`
- claimed_at: `2026-08-31T21:17:06+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — no team-room CLI in this environment

## Preflight

- [x] `TZ-BACKEND-VALIDATION-NESTED-I18N` archived and pushed as `61e21823`
- [x] Не трогать `getChildren` / `maxDescendantDepth` semantics для cycle
- [x] Не трогать `frontend-nx`
- [x] Active marker создан до кода

## Acceptance

- [x] Product tree показывает BOM Детали одним уровнем
- [x] `getTree('material', …)` A4 behavior не сломан
- [x] Cycle/depth specs green
- [x] tsc + catalog-graph + full Jest PASS

## Integrity slot

- [x] Тип: module — catalog-graph read path
- [x] FIC: N/A — no new endpoint/permission
- [x] page.md / PAGE-TZ-INDEX: N/A — backend tree contract only
- [x] SECTION-READINESS: N/A — no user-visible route code changed
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — no shared field/status change
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- [x] tsc: exit 0 — `pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] focused test: exit 0 — `pnpm test -- --runInBand catalog-graph.service.spec.ts` (14 tests)
- [x] full Jest: exit 0 — `pnpm test -- --runInBand` (119 suites / 1115 tests)
- [x] target lint: exit 0 — catalog graph service and spec (0 errors)
- [x] full lint baseline recorded — read-only eslint exit 1: 45 unrelated errors / 200 warnings

## Executor report (auto)

```text
outcome: DONE; part-material BOM is exposed one display level in Product trees
commit: pending catalog closeout commit
gates: tsc PASS; focused PASS (14); full Jest PASS (119 suites / 1115 tests); target eslint PASS; full eslint baseline FAIL (45 errors / 200 warnings outside scope)
archive: tasks/_archive/2026-08/TZ-BACKEND-CATALOG-PART-BOM-IN-TREE.done.md
```
