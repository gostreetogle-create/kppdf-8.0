# TZ-UX-DIALOG-306 — DONE

- Status: DONE
- Agent: Buffy/freebuff-259639d6
- Claimed at: 2026-08-10T17:53:15.8644271Z
- Closed at: 2026-08-10T17:54:56.7912096Z
- Workspace: `D:\\kppdf-8.0`

## Delivered

- Composition picker now accepts quantity with default `1` and minimum `0.001`.
- Picker result and “Добавлено сейчас” session entries carry/display quantity.
- BOM add POST uses the requested quantity rather than hardcoded `1`.
- Successful Add & continue resets selection, quantity, and product price override for the next line.
- Added focused picker/BOM acceptance tests and updated `docs/pages/ui-add-and-continue.md`.

## Gates

- FE TypeScript: PASS.
- Focused Jest: PASS, 2 suites / 22 tests.
- ESLint: PASS.
- Prettier: PASS.
- `git diff --check`: PASS; CRLF normalization warnings only.

## Scope / limits

- No backend contract, unit-price override, multi-select, deploy, `desktop/**`, or `mcp-runtime/**` changes.
- Existing dictionary-label legend expectation was updated in its focused BOM spec to match the already-landed DICT-320 labels.

Deploy: NO.
