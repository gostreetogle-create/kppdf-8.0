# TZ-NX-SHELL-rail-layout-fix — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor-executor-shell-rails

## Problem

NX `AppShellComponent` incorrectly used a 240px collapsible **sidebar** with grouped route links. Legacy canon (screenshot + `app-layout.component.ts`) is a **workspace grid**: full-width header + narrow **left/right tool rails** + central `router-outlet`.

## Solution

Replaced sidebar shell with legacy-aligned chrome:

1. **Header** (full width): brand `KPPDF · 8.0` | compact category chips (existing routes only) | notifications (placeholder) + theme + user + logout. Back/forward **removed** from header.
2. **Left rail**: back button + demo tool icons (disabled placeholders).
3. **Right rail**: forward button + demo tool icons.
4. **Center**: `router-outlet` in `.shell-main` between rails via CSS **grid** (`4rem | 1fr | 4rem`), not `position:absolute`.
5. **Mobile**: rails stay visible (narrower); demo tools hidden below 768px — back/forward remain.

## Screenshot alignment

| Legacy element | NX implementation |
|----------------|-------------------|
| Top header with category chips | `nav` grid center in header |
| Left chrome rail + back | `shell-rail-left` + `shell-nav-back` |
| Right chrome rail + forward | `shell-rail-right` + `shell-nav-forward` |
| Workspace between rails | `shell-workspace` grid + `shell-main` |
| No route sidebar | sidebar removed entirely |
| Kit isolated | `/kit/*` still top-level `KitLayoutComponent` |

## Files changed (shell scope)

- `layout/app-shell.component.ts` — rail grid layout, header, rails
- `layout/app-shell.component.spec.ts` — rail/back/forward/header tests
- `layout/tool-rail-definitions.ts` — typed left/right demo tools
- `layout/tool-rail-definitions.spec.ts`
- `layout/route-paths.spec.ts` — kit vs shell isolation assertion

## Gate unblock (out of shell scope)

Parallel untracked WIP `pages/registries/**` blocked `nx build` (2 TS errors). Minimal fixes applied so gates could run — not part of shell deliverable.

## Gates

| Gate | Result |
|------|--------|
| `nx build kppdf-web` | PASS |
| `nx test kppdf-web` | PASS (33 tests) |
| `nx run-many -t lint --all` | PASS (0 errors) |
| `architecture:check:nx` | PASS |
| `ui:tokens:nx` | PASS |

## Executor report

Operational shell now matches legacy dual-rail workspace pattern. Sidebar navigation removed. All shell acceptance tests green.
