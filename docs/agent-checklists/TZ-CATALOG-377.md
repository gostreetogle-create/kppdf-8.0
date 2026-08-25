# TZ-CATALOG-377 checklist

> Status: **DONE**
> Marker: _(removed — archived)_
> Conflict keys: `backend/src/modules/category/category.service.ts`; `backend/src/common/seed/categories.seed.ts`; `frontend/src/app/pages/dictionaries/categories.page.ts`; `frontend/src/app/pages/dictionaries/category-form-dialog.component.ts`; `frontend/src/app/pages/supply/supply-quick-order.component.ts`; material/product category form dialogs; `docs/pages/categories.page.md`; `docs/CONTEXT.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-task-resume
- claimed_at: 2026-08-25T21:17:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не предоставлен)
- note: resumed after fixture stall (keep freebuff WIP; no second active marker)

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0`
- [x] branch = `main`; `_active/` до claim содержал только `.gitkeep`
- [x] TZ прочитан целиком; 440 conflict keys отсутствуют
- [x] Claim slot заполнен до первой product-правки
- [x] Active marker `tasks/_active/TZ-CATALOG-377-category-reference-canon.md` создан

### Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PO-CANON.md`, `docs/ui-rules.md`, `docs/CONTEXT.md`, `docs/PROJECT-MEMORY.md`, `docs/DOCS-INTEGRITY.md`, `tasks/QUEUE-LIVE.md`, `docs/agent-checklists/_NOW.md`, `docs/agent-checklists/_TEMPLATE.md`, `tasks/TZ-CATALOG-377-category-reference-canon.md`
- **Key Constraints:** claim before code; Category is one collection filtered by `type`; fullPath is display name-path; picker sources stay type-filtered; no order-hub-tray/shipping; no deploy/wipe; foreign dirty WIP excluded from stage.
- **Planned Deliverable:** audit category schema/service/seed; implement name-based path create/rename migration; unify live typed pickers and write-through create; repair `/categories` breadcrumb/filter/actions/empty state; update page/domain docs and focused tests.
- **Validation Path:** FIC §A/C as applicable; BE category tsc/tests; FE tsc/focused tests/lint; architecture check; Integrity slot and diff review.

## Acceptance

- [x] Supply category labels are RU name paths: «Металлы», «Пластик», «Комплектующие».
- [x] Category created from material/supply form is persisted by POST and visible in `/categories?type=material`.
- [x] Category rename preserves FKs and updates fullPath descendants/picker labels after refresh.
- [x] `/categories` clearly shows `Справочники → Классификация → Категории`, defaults to material for `?type=material`, exposes edit/delete/copy-slug behavior and RU empty hint.
- [x] Existing category schema/type boundaries remain intact; no material/product flat picker merge.

## Integrity slot (до READY / archive)

- [x] Тип изменения: module + page (existing category API and `/categories` UX; no new route).
- [x] FIC §A N/A (no new route); §C existing category module — docs + page.md updated.
- [x] `docs/pages/categories.page.md` and `PAGE-TZ-INDEX` entry updated.
- [x] `SECTION-READINESS` N/A: existing routed section only.
- [x] Foreign WIP is excluded; conflict keys are staged by name only.
- [x] Coupling map N/A: no shared status/field contract change.
- [x] `docs/DOCS-INTEGRITY.md` read.

## Gates (fact)

- BE tsc PASS; `category.service.spec.ts` 3/3 PASS
- FE tsc PASS; `supply-quick-order.mock.spec.ts` 3/3 PASS
- focused ESLint PASS; `architecture:check` PASS

## Executor report (auto)

- outcome: DONE
- archive: `tasks/_archive/2026-08/TZ-CATALOG-377.done.md`
- lock: `.mimocode/locks/TZ-CATALOG-377-category-reference-canon.lock` (gitignored locally)
- commit: `49f5231a1e27f15e710d8662e0375967b795af6f` (pushed `main`)
- gates: BE tsc + category.service.spec 3/3; FE tsc + supply-quick-order.mock 3/3; ESLint; architecture:check; pre-commit supply-smoke 23 PASS
- deploy: NOT run

## Review handoff

- [x] READY FOR REVIEW
- [ ] Cursor/PO PASS if required by TZ

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-25T21:35:00+03:00
