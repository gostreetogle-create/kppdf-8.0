# TZ-SALES-351 DONE

```
ARCHIVE_MARKER
task: TZ-SALES-351
outcome: DONE
date: 2026-08-11
agent: buffy-sales351
workspace: D:\kppdf-8.0
```

- Scope: Create КП product rail edge polish only; frozen shell, PiShowcaseCard contract, backend schema, and catalog FullEditor untouched.
- Empty states: module/material/catalog empty views and search-empty explain in Russian what to change (chip/search) or create.
- Quantity: card and draft-line inputs have minimum 1; invalid/zero values emit 1; valid fractional quantities remain available for material units; chip switch preserves search.
- Badge: «В КП: N» remains derived from the real `draftLines` input and disappears/updates when the parent supplies the changed composition.
- Tests: rail Jest 12/12 PASS; FE TypeScript PASS; changed-file Prettier/ESLint PASS; `git diff --check` PASS.
- DOM self-verify: Angular fixture covered empty kind/search copy, active chip/search retention, quantity clamp, fractional quantity, and badge removal from updated `draftLines`.
- Constraints: no new feature, no backend, no shell 317 rewrite, no deploy/wipe.
- Known limitation: live authenticated browser/data smoke unavailable without backend data stack; component/DOM self-check is the available UI evidence.
