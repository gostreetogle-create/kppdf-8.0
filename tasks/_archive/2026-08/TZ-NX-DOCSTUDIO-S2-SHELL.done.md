═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-S2-SHELL — страница студии: список + оболочка (DONE)
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-30
closed_by: freebuff-docstudio-s2 (executor)
verification:
  - acceptance criteria: PASS (1–5)
  - typecheck (frontend-nx kppdf-web + data-access): PASS (exit 0)
  - tests: studio-geometry.spec PASS; data-access 47/47 PASS (pi-studio-documents.service.spec PASS)
  - lint (frontend-nx): PASS (0 errors)
  - architecture:check: 3 pre-existing legacy frontend/ violations → known_limitation (вне scope этой волны)
  - browser live walk (`node start.mjs --nx`, Playwright chrome): PASS — stage non-null, portrait 0.7071, landscape 1.4143, panel 480px absolute, open/collapsed reflow Δ=0/0/0, 0 console errors
  - ingest scope: frontend-nx only; registries/** and composition/** pre-existing failing tests are another agent's wave (not touched)
  - progress/_NOW: UPDATED

──────────────────────────────────────────────────────────────
Сделано
──────────────────────────────────────────────────────────────
Первый видимый срез студии документов в NX: `/studio` (список +
создание, end-to-end с реальным API) и `/studio/:id` (пустая A4-плоскость
с рельсами, overlay-панелью 480px и ribbon; без блоков — S3).

Файлы (frontend-nx):
- `apps/kppdf-web/src/app/pages/studio/studio.routes.ts`
- `apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`
- `apps/kppdf-web/src/app/pages/studio/studio-shell.page.ts`
- `apps/kppdf-web/src/app/pages/studio/studio-geometry.ts` + `studio-geometry.spec.ts`
- `apps/kppdf-web/src/app/app.routes.ts` (constructor → `studio`)
- `apps/kppdf-web/src/app/layout/nav-categories.ts` (Студия документов → `/studio`)
- `libs/data-access/src/lib/doc-studio/pi-studio-documents.service.ts` + `.spec.ts` + `studio-document.types.ts` + `index.ts`

Геометрия по закону `kp-workspace-geometry.md`:
- Лист считается по РЕАЛЬНОМУ размеру stage (`ResizeObserver` на `.studio-stage`),
  fit по «первой упирающейся стороне» — покрывает DOCPLAT-01 (landscape 1.414, не 1.726).
- Книжный 0.7071 / Альбомный 1.4143 (live-измерения).
- Панель 480px overlay (контент 272px), open/close не двигает лист (Δ 0/0/0).
- Клик по листу сворачивает панель.
- PATCH ориентации через документ с `expectedRevision` (бэкенд-гейт; исправлен PATCH 400).

Evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S2-SHELL/` (4 скриншота + `_geometry.json`).
Документация: `docs/pages/document-studio.page.md` (NX S2 shell), `docs/pages/kp-workspace-geometry.md`
(строки ориентации на странице студии), `docs/pages/PAGE-TZ-INDEX.md` (строка).

Known limitations / backlog:
- Блоки, autosave, типографика — S3/S4 (вне scope).
- 17 pre-existing failing tests в `registries/**` + `composition/**` (волна другого агента).
- 3 legacy architecture-violations в `frontend/` (другая волна агента), вне NX scope.