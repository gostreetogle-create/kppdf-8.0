# TZ-NX-HOME-BREADCRUMB-EDIT-CTA

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff

## Result

- Home eyebrow now uses the canonical nav label «Главная».
- Expanded `OrderHubTray` shows `order-hub-edit-cta` immediately, before composition disclosure, linking to `/orders/:id`.
- Composition, readiness, and Home row links use the unified «Редактировать заказ» label; Home row aria-label is updated.
- Home page documentation records the breadcrumb and CTA contract.
- No order-detail expansion, backend/API/write-path change, or foreign WIP was included.

## Verification

- acceptance criteria: PASS
- typecheck: PASS
- focused Home tests: PASS (7/7)
- focused OrderHub tray tests: PASS (32/32)
- lint: BASELINE FAIL (existing lazy-boundary/accessibility errors; no new owned-file errors)
- final `pnpm exec nx build kppdf-web`: PASS, exit 0
- checklist: `docs/agent-checklists/TZ-NX-HOME-BREADCRUMB-EDIT-CTA.md`
- `_NOW.md`: updated
- status synchronization: PASS

## Commit

Recorded after staging only owned files.
