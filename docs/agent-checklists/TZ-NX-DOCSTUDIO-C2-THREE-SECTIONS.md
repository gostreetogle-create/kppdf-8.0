# TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS.md`
> Wave: `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T17:08:00+03:00
- workspace: D:\\kppdf-8.0 (continuous main checkout)
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] Continuous workspace is `D:\kppdf-8.0`, branch `main`; origin/main aligned (`0 0`)
- [x] `tasks/_active/` empty before claim — no other TZ holds kppdf-web/src/** conflict keys
- [x] C2 TZ, WAVE checklist, Chrome IA audit, continuous prompt read
- [x] C1 DONE `42b4df0f` pushed (SHA metadata `6e78494a`); C1 files not reopened
- [x] Constraints: no backend schemas, no desktop, no legacy frontend, no S45/S46, no foreign WIP, no deploy/wipe
- [x] Baseline `nx build kppdf-web` before product edits (pre-claim, 17:08+03:00) — PASS, exit 0

### Preflight Check Output

- **Context:** GEMINI.md, how-to-connect-ai, executor-loop, C2 TZ, WAVE-DOCSTUDIO-CHROME-IA, audit 2026-09-06-docstudio-chrome-ia
- **Acceptance:** 3 live sections (`/studio`, `/studio/templates`, `/studio/:id`); `templates` route not shadowed by `:id`; nav docs category only live NX paths; list chrome crumbs
- **Geometry risk:** list pages only — no editor geometry change; `pi-page-chrome` consume-only

## Acceptance

- [x] `/studio` — documents list with chrome crumbs «Документы» + creation CTAs + ghost link «Шаблоны» → `/studio/templates`
- [x] `/studio/templates` — templates journal (name · orientation · pageSize · inactive mark); «Создать документ» calls `createFromTemplate` and opens `/studio/:id`; «Удалить» behind destructive confirm (same pattern as template-picker)
- [x] Nav «Докум.» subitems only live NX paths: `/studio` + `/studio/templates`; zero `/doc-constructor/*` / `/import-todos` links (pageKeys `doc-studio`/`doc-templates` reused, both already in backend RBAC seed — no new permission keys)
- [x] Route `/studio/templates` registered before `:id`; route-order spec guards regression; editor never receives id=`templates`
- [x] Gates PASS (tsc → 39 focused tests → changed-file ESLint → nx build last)

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio.routes.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` + `.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-templates-list.page.ts` (new) + `.spec.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` + `.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts`
- `frontend-nx/libs/ui/paper-and-ink/src/page/pi-page-chrome.component.ts` — consume only

## Gates

- [x] Baseline build (pre-claim): PASS, exit 0
- [x] `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS, exit 0 (after implementation)
- [x] Focused jest — **39 passed** across studio-templates-list (8), studio-list (5), nav-categories, route-paths (+2 new), app-shell-constructor-nav (2), warehouse/registries-nav (3), app-shell (21)
- [x] `pnpm lint` — full run FAIL on pre-existing unrelated production/older Studio files (disclosed baseline limitation); changed files: **0 errors**, 16 pre-existing non-null warnings only
- [x] `nx build kppdf-web` — PASS, exit 0, run LAST
- [x] `git diff --check` on changed files — PASS

## Executor report

- **Outcome:** C2 DONE — three live sections: `/studio` (Документы), `/studio/templates` (Шаблоны), `/studio/:id` (Студия, ribbon still C3).
- **Implementation commit:** `85f1dc8e41d546c1b380ad8ad463310d8024c2a4` (pushed to origin/main; pre-push typecheck OK)
- **No backend/desktop/legacy frontend/Data IA/warehouse/S45/S46 changes; `pi-page-chrome` consumed only, API untouched.**
