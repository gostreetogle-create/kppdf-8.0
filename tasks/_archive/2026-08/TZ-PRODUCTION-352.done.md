# TZ-PRODUCTION-352.done — Gantt workers tint hash fallback

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:45:00+03:00
closed_by: composer-executor (kppdf-executor-loop)
TZ: TZ-PRODUCTION-352
DEP: TZ-PRODUCTION-351 DONE

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec" --no-coverage` — 102/102)
  - checklist: DONE
  - deploy: NOT RUN

## Outcome

- `resolveWorkTypeHue(workTypeId, accentHue)` — shared hash/snap path for leaf bars and worker summary.
- `dominantWorkTypeAccentHue` returns resolved hue for dominant WT (not raw catalog null).
- Assigned worker summary gets tint even when catalog `accentHue` is null; «Не назначен» keeps `accentHue` null (353 chrome).
- 351 max-days / tie-break tests updated for snapped hues.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-352-gantt-workers-tint-fallback.lock`

---

# Original TZ

See git history / `tasks/_active/TZ-PRODUCTION-352.md` snapshot.
