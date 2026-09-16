# Audit: dark + Gantt smoke — 2026-09-16

**Task:** `TZ-VERIFY-2026-09-16-DARK-GANTT-SMOKE`
**Executor:** `freebuff`
**Workspace:** `D:\kppdf-8.0` / `main`
**Reference:** `docs/audits/2026-09-15-dark-theme-pro-zip.md`

## Environment

- `cd frontend-nx && pnpm exec nx build kppdf-web` — **PASS**, exit 0 (baseline; Nx cache used, Angular warnings only).
- NX dev server — **UP**, `http://127.0.0.1:4201`, PID 7412.
- Dark mode — **ON** in the live preview (`html.dark`).
- Login attempt — **HTTP 500** from `http://127.0.0.1:4201/api/auth/login`; backend was not listening on `:3000`, so authenticated routes could not be entered.

## Smoke table

| Step | Verdict | Note |
|---|---|---|
| Shell active «Цех» | **WARN** | Authenticated shell was not reachable because login API returned 500. Source contract still uses `text-on-gold` for active category (`frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts:90`) and the category label is «Цех». |
| Dark typography | **PASS** | With `.dark` enabled, computed body values resolved to `rgb(201, 209, 217)` (`#C9D1D9` vibe), `font-weight: 400`; canvas resolved to `rgb(12, 14, 20)`. No pure-white body text was observed. |
| `/production` — По заказам / sort | **WARN** | Route redirected to login. Focused existing Gantt tests passed: default order-number sorting, explicit `startDate` opt-in, and stable tie behavior are covered. |
| `/production` — По рабочим | **WARN** | Route redirected to login. Focused existing tests passed: «Не назначен» normalization/order, worker grouping, and unassigned empty hint. |
| DocStudio desk + light A4 | **WARN** | Authenticated studio route was not reachable. Static consumer remains `background: var(--studio-desk, var(--color-paper-2))` in `studio-editor.page.css`; dark token is `#1e222d`, while A4/light sheet rules were not changed by this verification. |
| Hairline | **PASS** | Canonical `hairline-top` / `hairline-bottom` utilities remain 1px and use `var(--color-rule)`; representative list consumers use `hairline-bottom`. |

## Focused verification

- `pnpm exec jest --config libs/features/jest.config.ts --runInBand --runTestsByPath libs/features/src/lib/production/ui/gantt-bars.component.spec.ts libs/features/src/lib/production/util/gantt-bar.model.spec.ts` — **PASS**, 2 suites / 62 tests.
- No in-scope visual failure was reproducible without the backend/auth session; no product code was changed.
- No palette redesign, WT `accentHue` change, deploy, or unrelated WIP staging.

## Verdict

**WARN — PO can inspect after local backend/auth is available.** The available live surface confirms the dark token ladder and the focused Gantt behavior tests are green, but the required authenticated `/production` and DocStudio eye checks remain blocked by the local API 500.
