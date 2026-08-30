# TZ-NX-REGISTRIES-TOOLBAR-FINALIZE — DONE

## Outcome

**PASS** — единый toolbar-канон всех 6 реестров: pagination всегда видима при `total > 0` (включая одну страницу); нейтральный placeholder слева при отсутствии фильтров; server/client/fixture modes, URL state и page reset сохранены.

## Deltas (2026-08-29)

1. **Pagination visibility:** `RegistryToolbarPaginationComponent.showPager` и `RegistryDetailPanelComponent.showToolbarPagination` — показывать при `total > 0`, не только когда `total > pageSize`.
2. **Neutral filter area:** `registry-toolbar-filters-empty` («Без фильтров») когда `definition.filters` пуст — для `modules` и любых реестров без API-фильтров.
3. **Unchanged:** filters left / create+pagination right layout; table footer pager off (`total=0`); URL query state; page reset on filter; pagination modes server/client/fixture; actions/dialogs/composition.
4. **Tests:** `registry-toolbar-pagination.component.spec.ts` (NEW); toolbar finalize cases в `registry-detail-panel.component.spec.ts`, `registry-filters-pagination.spec.ts`, `registries-a11y.spec.ts`.
5. **Docs:** `docs/pages/registries.page.md` — toolbar finalize notes.

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/registries/
  registry-detail-panel.component.ts
  registry-detail-panel.component.spec.ts
  registry-toolbar-pagination.component.ts
  registry-toolbar-pagination.component.spec.ts (NEW)
  data/registry-filters-pagination.spec.ts
  registries-a11y.spec.ts

docs/pages/registries.page.md
tasks/_active/TZ-NX-REGISTRIES-TOOLBAR-FINALIZE.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` source, shell/rails, `/constructor`.

## Gates

- `pnpm exec nx build kppdf-web --skip-nx-cache`: **PASS**
- `pnpm exec nx test kppdf-web --skip-nx-cache`: **PASS** (238 tests)
- `pnpm exec nx run-many -t lint --all --skip-nx-cache`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (249 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
