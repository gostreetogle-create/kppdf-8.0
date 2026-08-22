# TZ-UI-407: Фильтры каталога — Escape и честный overlay

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

## Outcome

На `/products`, `/modules`, `/materials`:
- Escape закрывает открытый filter flyout через page-owned `HostListener`;
- filter panel semantics изменены с `role="dialog"` на `role="region"`;
- filter labels `text-[10px]` подняты до `text-[11px]`;
- PAGE-TZ-INDEX обновлён.

## Verification

- acceptance criteria: PASS
- FE typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- FE lint: PASS, exit 0; 18 pre-existing architecture warnings, 0 errors
- manual/static AC: PASS (3 handlers, 3 regions, no dialog role in touched panels, labels 11px)
- browser live: N/A (no server/session available)
- checklist: ADDED
- PAGE-TZ-INDEX: UPDATED
- status synchronization: PENDING SHA closeout
- review diff: PASS
- deploy: NOT RUN

## Executor report

Чужие Desktop TZD-61/62 изменения в `PAGE-TZ-INDEX.md` не включались. Product backend, `.github/` и deploy не трогались.
