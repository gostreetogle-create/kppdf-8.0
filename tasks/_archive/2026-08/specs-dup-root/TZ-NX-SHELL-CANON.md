# TZ-NX-SHELL-CANON — operational shell placement

## Purpose

Зафиксировать проверенный в браузере визуальный и архитектурный канон NX-shell. Этот документ обязателен для задач, которые добавляют навигацию, инструменты или действия в рабочую область.

## Source of truth

- Legacy reference: `frontend/src/app/layout/**` (READ-ONLY reference)
- Accepted implementation: `frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.ts`
- Accepted delivery: `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md`
- Visual verification: PO browser smoke, 2026-08-29 — header, rails, resizing and history controls confirmed working.

## Layout contract

```text
┌──────────────────────────────────────────────────────────────┐
│ Full-width application header                                │
├──────┬───────────────────────────────────────────────┬───────┤
│ left │              central workspace                │ right │
│ rail │              router-outlet                   │ rail  │
└──────┴───────────────────────────────────────────────┴───────┘
```

### Header

- Full viewport width, above the workspace grid.
- Left: `KPPDF · 8.0` brand/home link.
- Center: compact primary application sections, only for existing routes and permitted capabilities.
- Right: notification placeholder, theme toggle, authenticated user and logout.
- Do not put browser back/forward controls in the header.

### Left rail

- Narrow vertical tool rail directly below the header.
- The first control is browser navigation **Back**.
- Context tools follow below a visual gap.
- New left-side tools must be represented in the typed `LEFT_TOOL_RAIL_ITEMS` definition.
- A tool belongs here only when it is a left-side workspace/context action, not a primary route.

### Right rail

- Narrow vertical tool rail directly below the header.
- The first control is browser navigation **Forward**.
- Context tools follow below a visual gap.
- New right-side tools must be represented in the typed `RIGHT_TOOL_RAIL_ITEMS` definition.
- A tool belongs here only when it is a right-side workspace/context action, not a primary route.

### Central workspace

- Must remain the middle grid column between the rails.
- Use explicit grid/flex layout; never overlay rails on content with absolute positioning.
- Preserve local vertical scrolling and prevent horizontal body overflow.
- Route content is rendered through the central `router-outlet`.
- `/kit/*` remains isolated in `KitLayoutComponent`; do not duplicate the operational shell there.

## Adding future controls

Before adding a control, classify it:

| Intent | Placement |
|---|---|
| Navigate to an application section | Header primary navigation |
| Change theme/account/session | Header right actions |
| Browser history back | Top of left rail only |
| Browser history forward | Top of right rail only |
| Current workspace context tool | Typed left/right rail definition |
| Page-specific action (print, export, create, filter) | The page toolbar/content, not global rails |
| Domain CRUD action | Domain page/table/dialog, not global shell |

Rules:

1. Do not create a second sidebar or a new global navigation column.
2. Do not move Back/Forward into the header or page content.
3. Do not add dead route links; filter navigation by existing routes and capabilities.
4. Every interactive control needs a stable `data-test`, Russian `aria-label`, tooltip/title, keyboard focus styling and disabled semantics where applicable.
5. Prefer an existing `@kppdf/ui/*` primitive; do not introduce new HTML/CSS primitives or raw service access into the UI library.
6. Keep tool definitions typed and declarative; keep business logic out of `AppShellComponent`.
7. A disabled placeholder is acceptable only when its future capability is explicitly documented; do not pretend it is functional.
8. Any new route or capability must be handled in its own TZ with guards/ACL evidence.

## Responsive contract

- Desktop: both rails visible and usable.
- Narrow screens: rails remain available in compact form; contextual tools may be hidden, but Back/Forward must remain accessible.
- The center must never be covered by rails and must not force a horizontal page scrollbar.

## Required verification for shell changes

- Browser smoke at minimum: `/kit/overview` and one operational app route.
- Verify header, both rails, Back/Forward placement, resize behavior and no duplicate Kit shell.
- Run the affected Nx build/test/lint gates.
- Record changed files, screenshots or observed results, limitations and gate output in the task archive/checklist.

## Forbidden

- Replacing the dual-rail workspace with a conventional left sidebar.
- Adding global business menus to the rails.
- Copying legacy domain services into the shell or UI library.
- Editing `frontend/**` as part of an NX shell task.
