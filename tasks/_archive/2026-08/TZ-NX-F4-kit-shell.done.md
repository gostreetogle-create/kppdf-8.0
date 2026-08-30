# TZ-NX-F4-kit-shell — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: freebuff-nx-f4

## Result

- Kit shell copied into `frontend-nx/apps/kppdf-web/src/app/layout/`.
- Theme toggle imports `ThemeService` from `@kppdf/ui/theme`.
- Four kit pages copied and wired through `@kppdf/ui/*` secondary entries.
- Routes are lazy: `/kit/overview`, `/kit/foundations`, `/kit/forms`, `/kit/overlays`.
- Sidebar contains exactly four links.
- Dialog and table secondary entries were added in the existing UI library wiring.
- No legacy `frontend/**` files were modified by this task.

## Verification

- `nx build kppdf-web`: PASS
- `nx run-many -t lint --all`: PASS, 0 errors; existing migration warnings remain
- `nx test kppdf-web --passWithNoTests`: PASS
- `shared/` imports in app kit pages/layout: clean except a documentation comment
- Required kit route literals: present
- Smoke server command attempted on port 4201; process exceeded the short command timeout, so interactive browser smoke was not completed.

## Known warnings

- Existing component style budget warnings.
- Existing 36 lint warnings in copied UI sources; no lint errors.
- Full browser smoke remains a follow-up because this executor session cannot retain a background serve process.
