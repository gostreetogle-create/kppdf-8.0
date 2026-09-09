# TZ-NX-UX-08b-PI-BUTTON-SWEEP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-08b-PI-BUTTON-SWEEP.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T18:12:06Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст, только `.gitkeep`)
- [x] TZ / канон / deps прочитаны: warehouses cross-cutting finding, `button.component.ts` variants, `.pi-outline-btn` confirmed real/live (not touched)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-08b-PI-BUTTON-SWEEP.md` на месте (до archive)

### Preflight Check Output
- **Context read:** all 16 files with `class="pi-button` (full list in `docs/audits/2026-09-09-nx-ux-pi-button-sweep.md`), `button.component.ts` (variant/size classes), `global.css` (`.pi-outline-btn` definition, confirming it's untouched by this sweep)
- **Key Constraints:** механическая замена only; one continuous claim; no BE/logic changes; preserve `data-test`; do not touch `.pi-outline-btn`
- **Planned Deliverable:** 0 occurrences of fake `pi-button-primary|secondary|outline|ghost` on pages; audit inventory
- **Validation Path:** `rg` count=0; `nx test kppdf-web`; `nx build kppdf-web`

## Acceptance

- [x] `rg 'class="pi-button' frontend-nx/apps/kppdf-web/src/app/pages` → **0** hits.
- [x] #04–#07 pages + rest of inventory (16 files total) converted.
- [x] `nx test kppdf-web` + `nx build kppdf-web` PASS.
- [x] Audit inventory + SHA in WAVE.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend-nx UI, component/class swap across 16 files, no new route/permission, no behavior change except 2 harmless new `data-test` attrs)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, existing routes fixed in place
- [x] page.md / PAGE-TZ-INDEX: N/A — cross-cutting library-usage fix, not a single page's feature; no page.md section maps to this
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (все `pages/**/*.ts` с `class="pi-button` кроме уже починенного warehouses; соответствующие `*.spec.ts`; audit file; WAVE row 08b)
- [x] Coupling map: N/A (pure visual component swap, no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```
cd frontend-nx && pnpm exec nx build kppdf-web    → PASS (exit 0, 2 pre-existing unrelated warnings: studio-table-properties NG8102, gantt-bars budget)
cd frontend-nx && pnpm exec nx test kppdf-web     → PASS 103/103 suites, 687 passed / 7 pre-existing skipped / 694 total — identical to pre-sweep baseline, 0 regressions
rg 'class="pi-button' frontend-nx/apps/kppdf-web/src/app/pages --include=*.ts → 0 hits
```

## Executor report

- **16 files converted**, full inventory + mapping table in `docs/audits/2026-09-09-nx-ux-pi-button-sweep.md`. All `<button class="pi-button pi-button-X">` → `<app-pi-button variant="X">`.
- **4 `<a routerLink>` cases deliberately NOT converted to `<app-pi-button [routerLink]>`** — tried it first, `nx build` passed but `contracts-list.page.spec.ts`/`orders-list.page.spec.ts` caught a real regression (`ButtonComponent` doesn't forward `RouterLink`'s `href` host binding — silently drops hover-URL and right-click/middle-click "open in new tab"). Reverted all 4 to native `<a>` with the literal `BASE_CLASS`+`VARIANT_CLASS`+`SIZE_CLASS` strings copied verbatim from `button.component.ts` — visually identical, zero behavior change, full anchor semantics preserved. Documented with an inline comment at each site.
- **Found and fixed 6 test failures** on first full-suite run: 3 were the routerLink/href regression above (2 real, 1 latent — `order-create.page.ts`'s cancel link had no test but has the same fix); 3 were jsdom-only test-simulation artifacts (`.disabled` DOM property and native form-submit-via-submit-button both require the *real* inner `<button>`, not the `<app-pi-button>` wrapper `data-test` sits on) — confirmed these are test-only, not real browser bugs, since several *pre-existing, untouched* pages already use `<app-pi-button type="submit">` successfully (`login.page.ts`, `enroll.page.ts`, `forms.page.ts`, a registries dialog). Fixed by updating 3 spec files' queries to reach the real inner `<button>` (`'[data-test="x"] button'`), and adding 2 missing `data-test` attributes.
- **Extra finding, explicitly NOT fixed here (out of scope):** a second fake-class family, `pi-icon-button` (vs the real `.pi-icon-btn`), in 3 `studio/` files — doesn't match this TZ's `class="pi-button` inventory pattern, smaller blast radius, flagged for the PO/future wave rather than expanding this TZ's scope.
- `.pi-outline-btn` verified untouched (0 diff in `global.css`, still used correctly in the 5 files from prior waves).
- No BE, no new features, no `/production`, no logic changes — purely markup/class-level.
- Files: 16 page/dialog files + 3 spec files (19 total) + `docs/audits/2026-09-09-nx-ux-pi-button-sweep.md` (created) + `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 08b DONE) + `docs/agent-checklists/_NOW.md` (Claude IDLE) + this checklist + `tasks/_active/TZ-NX-UX-08b-PI-BUTTON-SWEEP.md` (created → archived).

## Review handoff

- [x] Review не требуется по TZ explicit gate; gates зелёные, diff review выполнен вручную (все 19 файлов) перед archive.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T18:35:00Z
