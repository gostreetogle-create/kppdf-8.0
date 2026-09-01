# TZ-NX-DOCSTUDIO-S11-SELECT-LABELS — DONE

Implemented selected-label fallback in the Paper & Ink select primitive.

- Listbox remains in the DOM and uses `[hidden]` for closed state.
- Options are registered via `contentChildren`, allowing selected labels to resolve while closed.
- Option text is cached from the option host and rendered in the trigger; placeholder remains the fallback.
- Added regression coverage for selected labels, placeholder, and hidden listbox behavior.

Validation:
- `pnpm exec nx test paper-and-ink --testPathPattern=select --runInBand` — PASS, 32 suites / 341 tests.
- `pnpm exec nx build kppdf-web` — PASS.
- Known non-blocking JSDOM overlay CSS warnings remain.
