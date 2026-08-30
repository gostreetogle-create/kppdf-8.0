# TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY — DONE

## Outcome

**PASS** — единый toolbar всех реестров: фильтры слева, pagination + «Создать» справа; пагинация убрана из footer таблицы; `paginationMode` на всех 6 definitions; URL query state; тесты + gates.

## Deltas (2026-08-29)

1. **Contract:** `RegistryPaginationMode = 'server' | 'client' | 'fixture'` на `RegistryDefinition`.
2. **Toolbar:** `registry-detail-panel` — `registry-toolbar-filters` (слева) + `registry-toolbar-trailing` (create + pager справа); видимые подписи фильтров + `aria-labelledby`.
3. **Pagination:** `RegistryToolbarPaginationComponent` — локальное зеркало `app-pi-pagination` (без cross-boundary import из `libs/ui`); `pi-table` footer pager отключён (`total=0`).
4. **Filters verified:** units (search+status), materials (search+categoryId, raw в data source), details (search+categoryId+materialKind), products (search+status), modules (none), departments (demo search+status).
5. **Pagination modes:** server (units/materials/details/products), client (modules — без page/limit в API), fixture (departments).
6. **Tests:** `registry-filters-pagination.spec.ts`, toolbar layout + page reset в `registry-detail-panel.component.spec.ts`; a11y smoke обновлён под `aria-labelledby`.
7. **Docs:** `docs/pages/registries.page.md` — таблица registry → filters → pagination mode.

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/registries/
  registry-detail-panel.component.ts (+ toolbar layout, table pager off)
  registry-detail-panel.component.spec.ts
  registry-toolbar-pagination.component.ts (NEW)
  model/registry.types.ts (paginationMode)
  data/units.registry.ts
  data/materials.registry.ts
  data/details.registry.ts
  data/modules.registry.ts
  data/products.registry.ts
  data/departments.registry.ts
  data/registry-filters-pagination.spec.ts (NEW)
  registries-a11y.spec.ts (aria-labelledby)

docs/pages/registries.page.md
docs/agent-checklists/TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` source, shell/rails, `/constructor`.

## Gates

- `pnpm exec nx build kppdf-web --skip-nx-cache`: **PASS**
- `pnpm exec nx test kppdf-web --skip-nx-cache`: **PASS** (222 tests)
- `pnpm exec nx test data-access --skip-nx-cache`: **PASS** (30 tests)
- `pnpm exec nx run-many -t lint --all --skip-nx-cache`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (249 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
