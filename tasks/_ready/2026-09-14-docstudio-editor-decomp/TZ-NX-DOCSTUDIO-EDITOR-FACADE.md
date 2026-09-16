═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-EDITOR-FACADE: Phase 1 — Extract Facade in-place
═══════════════════════════════════════════════════════════════

> Pack: `WAVE-DOCSTUDIO-EDITOR-DECOMP` · [WAVE-MAP.md](./WAVE-MAP.md)
> Audit: `docs/audits/2026-09-14-docstudio-god-component-decomposition.md`

РОЛЬ АГЕНТА: Frontend Architect (mechanical extract — no behavior change)

ЗАВИСИМОСТИ: Нет (первая фаза волны)

**SIZE:** L  
**PACK:** WAVE-DOCSTUDIO-EDITOR-DECOMP  
LAYER: 3

PAGES: /studio/:id  
PAGE_DOCS: document-studio.page.md

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

## BUILD INTEGRITY

Baseline (до CLAIM): `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0

Gates (nx build — ПОСЛЕДНИЙ):
```bash
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor
cd frontend-nx && pnpm exec nx build kppdf-web
```

Параллель: STOP если в `tasks/_active/` другой TZ с `kppdf-web/src/**`

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

- God: `studio-editor.page.ts` (~3004 LOC) — signals + `catalogWriteChain` + domain + chrome.
- Specs: `studio-editor-*.spec.ts` cast `componentInstance` → `TestableEditor` (signals + methods on **page**).
- Dumb UI / routes / guard — не трогать.
- Shared registry dialogs: `apps/.../doc-studio/dialogs/table-template-form-dialog.component.ts`, `text-block-form-dialog.component.ts` (also used by registries).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: CREATE `studio-editor.facade.ts` **рядом с page** (in-place)

- `Injectable()` **без** `providedIn: 'root'`.
- Перенести **as-is** (без улучшения алгоритмов):
  - helpers над компонентом: `normalizeCatalogDataSourceKey`, `isRevisionConflict`, `isOrgScopeForbidden`, `STUDIO_LIVE_HYDRATABLE_*`, `STUDIO_CATALOG_KIND_LABELS`, `STUDIO_SELECTED_JUMP_MAP`, `STUDIO_PARTY_TEXT_PRESETS`
  - API injects + toast/dialog/injector/destroyRef/sanitizer as needed
  - все editor signals/computed
  - `catalogWriteChain` + layout dirty/save fields (имя очереди **не** переименовывать)
  - все domain methods (save, hydrate, catalog insert, table/block patches, preview/PDF/finalize, context/KP, …)

ШАГ 2: Page = glue

- `providers: [StudioEditorFacade]`
- `readonly facade = inject(StudioEditorFacade)`
- Re-export **тех же** signal object refs на page (`readonly document = this.facade.document`, …)
- One-line delegates для public/protected методов, которые зовут template/specs
- Оставить на page: template/styles, HostListeners, ResizeObserver, `ShellToolRailService`, `canDeactivate`, `viewChild` sheet

ШАГ 3: Shared vs local dialogs (Phase 1)

- Пока facade в app — допустимы текущие импорты `../../doc-studio/dialogs/*` и локальных studio-dialogs (как сегодня на page).
- Не переносить файлы UI. Не менять registries.

ШАГ 4: Gates + archive

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- `.../pages/studio/studio-editor.facade.ts` (CREATE)
- `.../pages/studio/studio-editor.page.ts`
- checklist `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md`
- specs — только если compile ломается (prefer zero)

НЕ ИЗМЕНЯТЬ:
- panels/canvas/vitrina/properties/dialogs (dumb)
- `studio.routes.ts`, `studio-dirty.guard.ts`, list/templates pages
- `libs/**`, backend/**
- алгоритмы queue/retry/liveRows/PDF
- Nx folder moves / path aliases (это Phase 2+)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Facade exists; page has no `catalogWriteChain` field.
2. Facade instance-scoped via page `providers` (not root).
3. Behavior unchanged (move only).
4. **Specs green** (обязательно полный набор `testPathPattern=studio-editor`, включая минимум):
   - `studio-editor-write-serial.spec.ts`
   - `studio-editor-catalog-insert.spec.ts`
   - `studio-editor-catalog-queue.spec.ts`
   - `studio-editor-live-rows.spec.ts`
   - `studio-editor-hydrate-serial.spec.ts`
   - `studio-editor-stale-liverows.spec.ts`
   - `studio-editor-column-rehydrate.spec.ts`
   - `studio-editor-finalize.spec.ts`
   - `studio-editor-outside-click.spec.ts`
   - `studio-editor-chrome-ia.spec.ts`
5. Dirty guard via page `canDeactivate` works.
6. `nx build kppdf-web` last exit 0.
7. Archive + Executor report (auto) with commit SHA.

Successor: Phase 2 `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE`.
