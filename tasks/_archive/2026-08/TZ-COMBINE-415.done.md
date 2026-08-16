# TZ-COMBINE-415.done — Комбайн: читаемые номера заказа + text-ink

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:32:00+03:00
closed_by: composer-executor-415 (kppdf-executor-loop)
TZ: TZ-COMBINE-415
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-413/414 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` — 28/28)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (forbidden)

## Outcome

- Order №: dropped `pi-tech-label`; `font-mono text-xs font-medium text-ink` + `bg-paper-2`; hover underline kept.
- Product name: explicit `text-ink`.
- Sticky stage titles: explicit `text-ink` (helpers remain muted).
- CDK placeholder opacity 0 scoped to `:host [data-testid=combine-mini-kanban]` only (DnD intact).

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-COMBINE-415-combine-readable-order-labels.lock`

## Known limitations

- Visual light/dark smoke: class-level AC covered by jest; live browser smoke optional.
