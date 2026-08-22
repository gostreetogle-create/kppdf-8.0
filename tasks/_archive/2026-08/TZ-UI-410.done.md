# TZ-UI-410: Бейдж колокольчика 9px → 11px

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T23:35:00+03:00
closed_by: freebuff-2

## Changes

Replaced `text-[9px]` → `text-[11px]` on notification bell badge (1 occurrence, line 46).

## Verification

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
rg "text-\[9px\]" pi-notification-bell.component.ts         → 0 matches
```
