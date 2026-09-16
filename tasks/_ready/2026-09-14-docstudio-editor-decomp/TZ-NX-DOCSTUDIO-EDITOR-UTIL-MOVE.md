═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE: Phase 2 — pure utils → features
═══════════════════════════════════════════════════════════════

> Pack: [WAVE-MAP.md](./WAVE-MAP.md)

РОЛЬ АГЕНТА: Frontend Architect (file move + import fix — no logic change)

ЗАВИСИМОСТИ: `TZ-NX-DOCSTUDIO-EDITOR-FACADE` **archived** + `nx build kppdf-web` green on main

**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-EDITOR-DECOMP  
LAYER: 3

PAGES: /studio/:id  
PAGE_DOCS: document-studio.page.md

CONFLICT KEYS: frontend-nx/libs/features/src/lib/doc-studio/** ; frontend-nx/tsconfig.base.json ; frontend-nx/libs/features/src/index.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-layout.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-block-helpers.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-geometry.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-helpers.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-session.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-kp-doc-type.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

## BUILD INTEGRITY

Baseline: `nx build kppdf-web` exit 0  
Gates last: tsc + util unit specs + `nx test kppdf-web --testPathPattern=studio-` + `nx build kppdf-web`

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

После Phase 1 facade уже существует in-place. Pure helpers всё ещё в `pages/studio/`:

| Source (app) | Target |
|--------------|--------|
| `studio-table-defaults.ts` (+ `.spec.ts`) | `libs/features/src/lib/doc-studio/util/` |
| `studio-layout.ts` (+ `.spec.ts`) | same |
| `studio-block-helpers.ts` (+ `.spec.ts`) | same |
| `studio-geometry.ts` (+ `.spec.ts`) | same |
| `studio-text-helpers.ts` | same |
| `studio-session.ts` (+ `.spec.ts`) | same |
| `studio-kp-doc-type.ts` | same |
| `studio-workspace-chrome.ts` (+ `.spec.ts`) | same |

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Scaffold `libs/features/src/lib/doc-studio/`

- `util/` — перенести файлы выше **без правки логики**
- `index.ts` — re-export util public symbols needed by app
- Add tsconfig path:
  ```json
  "@kppdf/features/doc-studio": ["libs/features/src/lib/doc-studio/index.ts"]
  ```
- Optionally also `export *` from root `@kppdf/features` **or** only secondary path (prefer **secondary path only** to keep root barrel small)

ШАГ 2: Update imports

- facade, page, canvas, table-properties, list (session), any other consumers → `@kppdf/features/doc-studio`
- Delete old files under `pages/studio/` (no re-export stubs left behind unless needed for one commit — prefer clean delete)

ШАГ 3: Move util specs with files; ensure jest picks them up from `libs/features` (follow existing features jest config; if features tests don't run util specs yet, wire or keep co-located tests under features with `nx test features` + app studio tests)

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Facade algorithms / signals location (still in `pages/studio/studio-editor.facade.ts`)
- Dumb UI components (Phase 3)
- Routes, guard, ShellToolRail wiring
- `app/doc-studio/dialogs/**` (shared registries)
- backend

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. No util sources left under `pages/studio/` for the listed files.
2. Imports resolve via `@kppdf/features/doc-studio`.
3. **Specs green:**
   - moved: `studio-table-defaults.spec`, `studio-layout.spec`, `studio-block-helpers.spec`, `studio-geometry.spec`, `studio-session.spec`, `studio-workspace-chrome.spec`
   - regression: `nx test kppdf-web --testPathPattern=studio-editor` (full editor suite)
   - `studio-list.page.spec.ts` if it uses session helpers
4. `nx build kppdf-web` last exit 0.
5. Archive + report SHA.

Successor: Phase 3 `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE`.
