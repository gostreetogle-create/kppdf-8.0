# TZ-NX-DOCSTUDIO-S4-TYPOGRAPHY — DONE (2026-08-30)

## Outcome
Minimal typography controls on selected text block in properties panel; persisted via `PiStudioBlocksService.update`.

## Changes
- `studio-block.types.ts` — `StudioBlockStyle` (fontSizePt, color, align)
- `studio-properties-panel.component.ts` — size/color/align inputs, `styleChange` output
- `studio-editor.page.ts` — `patchBlockStyle` → blocks PATCH
- `studio-blocks-canvas.component.ts` — inline style preview on text span

## Gates
- `nx build kppdf-web` green
