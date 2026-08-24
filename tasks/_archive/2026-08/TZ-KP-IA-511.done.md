# TZ-KP-IA-511: КП right rail — Money / Deadlines / без Output

> Исходная TZ: `tasks/TZ-KP-IA-511-rail-money-deadlines-panels.md`
> Архив: `tasks/_archive/2026-08/TZ-KP-IA-511.done.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-24
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - focused tests: PASS (97/97)
  - lint: PASS (scoped FE paths)
  - architecture: PRE-EXISTING FAIL (2 violations outside scope)
  - checklist: ADDED
  - progress.md: UPDATED (shared dirty WIP; not staged)
  - status synchronization: PASS

## Результат

- Right rail production registration: `params` → `money` → `deadlines` → `table` → `terms`.
- `CircleDollarSign` и `Clock` добавлены в SECTION_DEFS и chrome tools.
- `output` удалён из `WsRightSection`, SECTION_DEFS, shell right-panel classification и panel UI.
- Печать/PDF/«Ещё» сохранены в ribbon с прежним `requestOutput` write-path.
- `ProposalCreateInspectorComponent` получил mode `params | money | deadlines`:
  - params: документ, наша фирма, вид листа;
  - money: наценка, НДС, скидка, оценка;
  - deadlines: предоплата, производство, поставка.
- Recipient summary и CTA не рендерятся в inspector; они остаются в left `proposal-create-recipient`.
- Все inspector modes передают state в существующий `draft.onInspectorState` / autosave; API и поля Quotation не менялись.

## Изменённые файлы TZ-511

- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.store.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-shell.component.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.store.spec.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.spec.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.spec.ts`

## Checks

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS.
- `cd frontend && pnpm exec jest --testPathPattern="proposal-workspace|proposal-create-inspector|proposal-create-recipient" --no-coverage` → PASS, 6 suites / 97 tests.
- Scoped eslint → PASS.
- `pnpm architecture:check` → FAIL only on pre-existing violations:
  `materials/material-form-dialog.component.ts` imports organizations page;
  `supply/supply-quick-order.component.ts` imports materials page.
- `git diff --check` → pre-existing CRLF/trailing-whitespace in shared dirty `progress.md`; no TZ-owned code whitespace errors.
- Prohibited files untouched: registry, data-field-picker, `document-template.service.ts`, draft service, geometry.

## known_limitation

- Demo `/proposals/demo-workspace` stale ids remain outside scope.
- UI density remains in TZ-UI-DEN-*.
- Architecture baseline needs separate cleanup TZ for the two pre-existing violations.
