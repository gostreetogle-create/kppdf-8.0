# TZ-FRONTEND-302-A1 checklist

- [x] Canonical audit PASS verified at `405cb71d51f56b21e694a0781ca3f82d30c6702d`.
- [x] Umbrella claimed through Team Room.
- [x] Child exact keys claimed through Team Room.
- [x] Baseline focused tests recorded: users + roles specs, 27 tests PASS.
- [x] Existing service API verified: both services expose `list()` only; shared mutation surface is absent.
- [ ] Scope decision: add shared mutation methods under a serial owner, or revise A1 constraint.
- [ ] Minimal raw-HTTP removal implemented — blocked because the approved batch forbids the required shared-service API change.
- [ ] Characterization/contract coverage recorded.
- [ ] Frontend tsc PASS.
- [ ] Focused Jest PASS after changes.
- [ ] Changed-file ESLint PASS.
- [ ] architecture:check PASS.
- [ ] git diff --check PASS.
- [ ] Browser smoke: admin create/reset-password, light/dark, dialog keyboard.
- [ ] Commit and pushed SHA recorded.

## Blocker

The two page files import and inject `HttpClient` for create/update/reset/toggle/delete operations. The approved A1 exact keys do not include `pi-users.service.ts` or `pi-roles.service.ts`, and the canonical audit explicitly says not to invent shared API surface. Existing services only implement `list()`. Continuing would violate the canonical conflict/serial-hot-file rules, so A1 is STOPPED before product edits.
