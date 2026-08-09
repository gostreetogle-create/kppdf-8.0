# TZ-SALES-332 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-SALES-332.done.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-332-kp-flyout-table-rail-polish.md`
> Closeout: Cursor visual PASS; archive + lock recorded; active marker removed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T15:37:36Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`; canonical `main` at `26b762b6`.
- [x] TZ-SALES-331 archived/DONE before claim; `_active/TZ-SALES-331.md` removed.
- [x] `_active-map` and `tasks/_active/` scanned; no competing 332 claim.
- [x] Audit, TZ, prompt, canon §0 and 330/331 behavior read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-332.md` created.

## Acceptance

- [x] Layout sync uses columns from the selected template's actual line-items table; DEFAULT is fallback only.
- [x] `Видна`/`Скрыта` and `←`/`→` update the request-only A4 payload; the last visible column cannot be hidden.
- [x] Right rail has mutually exclusive Параметры and Таблица tools.
- [x] CTA is PiButton «Открыть шаблон таблицы» with `editId` when the live table is known.
- [x] Products showcase is not clipped when the right tool is opened; flyouts have air, content height and light transparency.
- [x] A4 center remains frozen and unsqueezed; 331 footer/VAT remains intact.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] Page doc and studio spec §0 updated.
- [x] Foreign DOC-343 WIP and untracked foreign files excluded.
- [x] Canon: `docs/DOCS-INTEGRITY.md` and `docs/audits/2026-08-09-kp-create-flyout-polish-audit.md`.

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-create.page.spec.ts` — PASS, 15/15 (hotfix)
- [x] Frontend Prettier + ESLint on changed files — PASS
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `cd backend && pnpm test:e2e test/e2e/document-templates-build.e2e-spec.ts` — PASS, 10/10
- [x] `git diff --check` — PASS

## Executor report (auto)

- Feature: `f5e0f401`; hotfix: `272550ab946600045970e31f110d3d72bd121ccd`; both pushed to `origin/main`.
- Selected templates now load every live TableTemplate target; explicit `kpLineItems`/`line-items` wins by default, otherwise the Table rail exposes the live-table list instead of falling into DEFAULT_KP.
- Hotfix root cause: the FE previously loaded only one implicit target and sent DEFAULT_KP keys; the BE could not identify the user-selected table. `tableTargetId` now selects the chosen live table and its real columns for request-only A4 rendering.
- `kpTableLayout` carries the real keys/labels; DEFAULT_KP is only a safe fallback when no target table is discoverable.
- Table controls use horizontal `←`/`→` and `Видна`/`Скрыта`; the last visible column is protected; changes rebuild request-only `tableLayout` and never PATCH the shared template.
- Right rail is split into mutually exclusive Параметры and Таблица tools; CTA is PiButton «Открыть шаблон таблицы».
- Products opening closes the right overlay; flyouts use inward padding, content-height/max-height, light transparency, and an internal product-grid scroll.
- 317 frozen A4 rails/center, 330 layout instance, 331 markup/VAT footer, Save/Counterparty, 320/322 and deploy remain out of scope.
- Cursor visual PASS received on hotfix: multi-table target selection, panel/A4 column parity, hide/show, reorder, right tools, CTA, flyout pride and unclipped md cards accepted.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO visual PASS on hotfix 272550ab.

## Closeout (after PASS)

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T16:08:44Z`
