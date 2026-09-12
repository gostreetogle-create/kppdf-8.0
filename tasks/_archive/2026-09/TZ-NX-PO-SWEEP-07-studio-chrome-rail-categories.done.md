# TZ-NX-PO-SWEEP-07: studio chrome-rail — lifecycle в одну категорию-меню

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build AOT)
  - tests: PASS (frontend 836/843, 7 skipped)
  - lint: N/A (не запускал отдельно, build clean)
  - checklist: ADDED
  - progress.md: N/A (ops/UX sweep wave)
  - status synchronization: PASS

## Root cause

The right chrome-rail held 10 flat `ShellToolRailItem`s with immediate
`onClick`: 5 lifecycle actions (mode-editor, mode-preview, save, pdf,
archive) stacked as separate one-icon-one-action buttons, plus 5 panel
categories (elements/layers/pages/properties/template) that already worked
as categories opening a flyout. `ShellToolRailItem` had no concept of a
category with children — only immediate click.

## Fix

`shell-tool-rail.service.ts`: new `ShellToolRailMenuItem` type + optional
`ShellToolRailItem.items` (non-empty = category/menu slot); `onClick` made
optional (only required for a plain action slot without `items`).
`invoke()` uses `tool.onClick?.()`.

`app-shell.component.ts`: new `openMenuFor` signal; `onShellToolClick`
toggles a popover for a category (`items.length > 0`) instead of invoking
directly; new `onMenuItemClick` invokes the item then closes the menu;
`@HostListener('document:click')` / `('document:keydown.escape')` dismiss
it. Only the right-rail template block changed (wrapped each button in a
`.shell-rail-item` positioning context + conditional `.shell-rail-menu`
popover) — left rail markup is untouched.

`studio-editor.page.ts`: the 5 flat lifecycle ids collapsed into one
`document` category (icon: lucide `File`) with those 5 as menu `items`,
same per-item `active`/`disabled`/`onClick` logic, just nested one level.

## Gates

| Gate | Result |
|------|--------|
| `nx test kppdf-web` (full) | PASS 836/843 (7 skipped) |
| `nx build kppdf-web` | PASS (bundle budget +0.16kB, negligible) |
| Live Chrome CDP smoke (wave-wide, post-#07) | PASS 13/13 after one follow-up fix — see below |

## Post-merge fix (found by live browser smoke, same stage)

Unit/DOM tests pass regardless of CSS visual clipping — `document.querySelector`
finds an element whether or not it's actually visible. A wave-wide live
Chrome CDP smoke (`scripts/po-sweep-2026-09-12-smoke.mjs`, run after #07 was
already pushed) caught a real visual bug the specs couldn't: the popover
used `position: absolute` nested inside `.shell-rail`, which has
`overflow-x: hidden` (keeps long badges from forcing a horizontal scrollbar
on the ~32px-wide rail) — the popover was silently clipped to invisible the
moment it extended past the rail's own width. Screenshot evidence confirmed
the menu was genuinely never visible on screen, only present in the DOM.

Fix: `position: fixed` + coordinates computed from the trigger button's own
`getBoundingClientRect()` at open time (`onShellToolClick` now takes the
click `MouseEvent`, optional so the untouched left rail's call site — which
never opens a menu — doesn't need updating). Re-ran the same live smoke
after the fix: popover renders correctly positioned just left of the
«Документ» button, 5 items visible, screenshot-confirmed.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/layout/shell-tool-rail.service.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-chrome-ia.spec.ts`
- `docs/pages/document-studio.page.md`
- `docs/agent-checklists/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.md` (new)
- `docs/audits/2026-09-12-studio-chrome-rail-categories.md` (closeout)
