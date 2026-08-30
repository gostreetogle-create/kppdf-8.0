# TZ-NX-DOCSTUDIO-S3-POLISH — DONE (2026-08-30)

## Outcome
Studio editor demo UX: drag/resize/snap, layers reorder, properties, centered text add.

## Changes
- `studio-layout.ts` + spec — snap/clamp 8px
- `studio-blocks-canvas.component.ts` — frame, pointer capture
- `studio-editor.page.ts` — panels, z-order, centered add
- `studio-layers-panel.component.ts` — ↑/↓ reorder
- `studio-properties-panel.component.ts` — X/Y/W/H

## Gates
- `nx build kppdf-web` green

## Remaining (B1/B2)
S4 typography, S5 multi-page/orientation UI
