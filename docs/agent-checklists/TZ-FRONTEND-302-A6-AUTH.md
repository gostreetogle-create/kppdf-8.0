# A6 AUTHORIZED — scoped edit only

Status: **GO**  
Owner: Lane A executor on `feature/TZ-FRONTEND-302-A`  
Do **not** touch A4 / `proposal-create.page.ts`.

## File to edit (only)

`frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts`

## Goal

Replace continuous `syncInitialState` effect (copies every `initial*` into local signals on every parent rebind) with **dirty-aware sync**:

- if local field still equals last synced initial → accept new parent value;
- if user edited locally → keep local value (characterization: `draft-edit` survives `server-2`).

Also add `untracked` to `@angular/core` import.

## Contract (already in worktree)

`proposal-create-inspector.component.spec.ts` — A6 characterization:

1. after local edit to `draft-edit`, parent rebind `server-2` → stay `draft-edit`;
2. without local edit, parent `server-1` → `server-2` → become `server-2`.

## How to edit

Any scoped tool OK (ApplyPatch / StrReplace / one-shot Python).  
Rules: exact hunk only; assert one match; **no** full-file rewrite; **no** other files except optional checklist/evidence.

## Gates then

Characterization PASS → focused inspector specs → tsc → eslint changed → architecture:check → diff-check → commit/push → umbrella.

Deploy: **НЕ**.
