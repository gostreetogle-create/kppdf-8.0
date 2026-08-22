# TZ-UI-409: 10px → 11px на списках сделок и фирм

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T23:30:00+03:00
closed_by: freebuff-2

## Changes

Replaced `text-[10px]` → `text-[11px]` in:
- `contracts.page.ts` (1 occurrence)
- `orders.page.ts` (1 occurrence)
- `organizations.page.ts` (2 occurrences)
- `proposals.page.ts` (6 occurrences)

## Verification

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
rg "text-\[10px\]" 4 files                                  → 0 matches
```
