# TZ-DOC-332 — Builder Inspector IA + visual canon

<!-- ARCHIVE_MARKER -->

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: local-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (pnpm exec tsc -p tsconfig.app.json --noEmit)
  - jest builder-inspector: PASS (11 tests)
  - git diff --check: PASS (CRLF warnings only)
```

## Outcome

**DONE.** Right-pane inspector uses one section chrome (tool-pane parity) and modes A–D IA order. Snap/pageNumbering use `app-pi-switch`; Inter/hex/props-section dialects removed; Edit separated from Delete.

## Scope

- `builder-inspector.component.ts` — chrome + IA rewrite (logic outputs unchanged).
- `builder-inspector.component.spec.ts` — section-header order specs + pi-switch contract.
- `docs/pages/builder-inspector.page.md` — live A–D docs.
- `docs/pages/PAGE-TZ-INDEX.md` — DOC-332 done.
- `docs/agent-checklists/TZ-DOC-332.md` — executor checklist.

## Verification

- Frontend tsc: PASS.
- Jest `--testPathPattern=builder-inspector --no-coverage`: PASS, 11 tests.
- Manual browser smoke: recorded as PO checklist items (not automated in this session).

## Known limitations

- Shared pane CSS extraction → successor.
- Full `ng build` not run in this closeout (tsc + targeted jest per PO prompt gates).

## Related

- DOC-331 (group drag) / DOC-333 (photo persist) — disjoint; not mixed into this commit.
