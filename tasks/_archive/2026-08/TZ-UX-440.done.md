# TZ-UX-440: RU-лейблы Email/org + KP dirty fields

> Исходная TZ: `tasks/TZ-UX-440-ru-labels-kp-dirty.md`
> Checklist: `docs/agent-checklists/TZ-UX-440.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T20:27:06+03:00
closed_by: Buffy / Freebuff

## Outcome

- User-visible email labels are Russian: «Почта организации», «Почта», «Почта (необязательно)».
- Desktop pairing placeholder is «Офисный ПК».
- КП catalog review no longer renders raw `catalogDirtyFields` keys; the existing RU `catalogDiffText` remains the only diff summary.
- API field names, DTOs, catalogDiffText logic, and write paths were not changed.

## Changed surface

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/people/people.page.ts`
- `frontend/src/app/pages/people/people-form-dialog.component.ts`
- `frontend/src/app/pages/admin/users-admin.page.ts`
- `frontend/src/app/pages/admin/user-form-dialog.component.ts`
- `frontend/src/app/pages/desktop/pairing-dialog.component.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.ts`

## Verification

- commit: `69186b2c` (`fix(ux): localize hygiene wave labels and proposal dirty fields`)

- acceptance criteria: PASS
- residual grep in all conflict keys: PASS (`Email org`, user-visible `Email`, and `Office PC` absent)
- KP dirty-field DOM contract: PASS (raw `productName`/`productSku` dirty keys are not rendered)
- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- focused tests: PASS — proposal workspace 28/31 with 3 pre-existing TZ-405 terms/library failures; people 9/9; users-admin 14/14; pairing-dialog 14/14; supply-quick-order 46/46
- lint: PASS (0 errors; 17 pre-existing warnings outside owned files)
- checklist: UPDATED; Integrity slot completed
- progress.md: UPDATED
- status synchronization: PASS

## Known limits

`TZ-UX-441` form-field error slot, dictionary English slug placeholders, and Product form status/active coupling remain backlog items. No shared i18n framework was introduced. The three proposal-workspace failures are pre-existing and unrelated to this label-only change, as recorded in the checklist.
