# TZ-FRONTEND-302-A3 checklist

- [x] Canonical amendment verified.
- [x] A1 and A2 pushed before A3.
- [x] Exact A3 key claimed through Team Room.
- [x] Baseline recorded: page ESLint has 1 expected raw-HttpClient warning; focused spec path is absent.
- [x] Existing import API inspected: GET uses `httpResource`; no existing shared mutation service/API exists.
- [ ] Cursor amendment: add the required shared service/file to exact keys, or approve another Angular 20 mutation transport.
- [ ] Raw HttpClient removed without behavior change — blocked before product edits.
- [ ] Load/error/empty behavior covered.
- [ ] Frontend tsc PASS after amendment.
- [ ] Focused Jest PASS after amendment.
- [ ] Changed-file ESLint PASS after amendment.
- [ ] architecture:check PASS after amendment.
- [ ] git diff --check PASS.
- [ ] Browser smoke: loading/error/empty.
- [ ] Commit and pushed SHA recorded.

## Stop reason

The approved A3 key contains only `import-todos.page.ts`. The page's read path is already `httpResource`, while `markDone()` uses `silentPatch` and therefore needs an HTTP client owned by a service. No suitable existing service was found. Expanding scope without a Cursor amendment would violate the exact-key and no-shared-API-expansion contract.
