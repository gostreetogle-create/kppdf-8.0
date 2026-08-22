# TZ-UI-411: Справочник цветов — 10px на превью hex

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T23:40:00+03:00
closed_by: freebuff-2

## Changes

Replaced `text-[10px]` → `text-[11px]` on hex preview `#` (1 occurrence, line 192).

## Verification

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
rg "text-\[10px\]" color-reference-form-dialog.component.ts  → 0 matches
rg "text-\[9px\]" color-reference-form-dialog.component.ts   → 0 matches
```
