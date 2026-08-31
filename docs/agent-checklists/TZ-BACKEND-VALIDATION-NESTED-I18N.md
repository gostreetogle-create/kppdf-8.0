# Checklist — TZ-BACKEND-VALIDATION-NESTED-I18N

> Status: **DONE**
> Marker: `tasks/_active/TZ-BACKEND-VALIDATION-NESTED-I18N.md`
> Spec: `tasks/TZ-BACKEND-VALIDATION-NESTED-I18N.md`
> Wave: `docs/agent-checklists/WAVE-BACKEND-POST-RBAC.md`

## Claim slot

- agent_id: `buffy-gpt-5.6-luna`
- claimed_at: `2026-08-31T20:50:30+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — no team-room CLI in this environment

## Preflight

- [x] Нет чужого CLAIM на `main.ts` / `http-exception.filter`
- [x] Не трогать `frontend-nx` (DCI)
- [x] Прочитал TZ + A2 archive known gap
- [x] Active marker создан до кода

## Acceptance

- [x] Nested `overrideDimensions.unit` → message contains full path and Russian phrase
- [x] Flat composition errors остаются русскими
- [x] TZ-DOC-323 `category` whitelist branch сохранён без изменений
- [x] tsc + targeted + full Jest PASS

## Integrity slot

- [x] Тип: other — backend validation/error handling
- [x] FIC: N/A — no new permission/page/endpoint
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route
- [x] SECTION-READINESS: N/A — API error formatting only
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — no shared field/status change
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- [x] tsc: exit 0 — `pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] focused test: exit 0 — `pnpm test -- --runInBand http-exception.filter.spec.ts` (10 tests)
- [x] full Jest: exit 0 — `pnpm test -- --runInBand` (119 suites / 1114 tests)
- [x] target lint: exit 0 — `src/main.ts`, filter and spec (0 errors)
- [x] full lint baseline recorded — read-only eslint exit 1: 45 unrelated errors / 200 warnings

## Executor report (auto)

```text
outcome: DONE; nested validation errors flatten to full RU property paths
commit: pending validation closeout commit
 gates: tsc PASS; focused PASS (10); full Jest PASS (119 suites / 1114 tests); target eslint PASS; full eslint baseline FAIL (45 errors / 200 warnings outside scope)
archive: tasks/_archive/2026-08/TZ-BACKEND-VALIDATION-NESTED-I18N.done.md
```
