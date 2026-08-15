═══════════════════════════════════════════════════════════════
TZ-CATALOG-340 — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: Buffy

summary:
- Added RU «Создать» beside «Что добавить» in the composition picker.
- Product/module tabs open dynamic QuickCreate for the active entity.
- Material/detail tab opens the existing material create form; no new API or BOM write path.
- Created result updates matching options, selects the new `_id`, and preserves quantity.
- Dynamic imports avoid the QuickCreate ↔ ProductBomPanel ↔ picker cycle.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend` app tsc, exit 0)
  - tests: PASS (picker + BOM panel + QuickCreate, 3 suites / 38 tests)
  - lint: PASS (18 pre-existing architecture warnings, 0 errors)
  - prettier: PASS (owned picker TS/spec)
  - diff-check: PASS (owned changes)
  - checklist: ADDED and integrity slot filled
  - progress.md: UPDATED
  - status synchronization: PASS

files:
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.ts`
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-CATALOG-340.md`
- `docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`
- `docs/agent-checklists/_NOW.md`
- `docs/pages/PAGE-TZ-INDEX.md`

known_limits:
- The existing QuickCreate contract is product/module-only; material uses the current material create form.
- No browser server smoke was available/required for this component-level TZ.

conflict_disclosure:
- `data/paspots/`, `data/products/`, `docs/PO-DIARY.md`, and unrelated untracked WIP were not staged.
