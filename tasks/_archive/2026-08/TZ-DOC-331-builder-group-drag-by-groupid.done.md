# TZ-DOC-331 — Builder group drag by `groupId`

<!-- ARCHIVE_MARKER -->

## Outcome

**DONE.** Group drag now resolves peers from persisted `TemplateBlock.groupId`, synchronizes the full selection on drag start, and persists layouts without clearing membership. A backend persistence hotfix was included after verification exposed that create/update were not writing `groupId`.

## Scope

- `builder-group-drag.ts`: peer resolution from `allBlocks` by `groupId`.
- `block-renderer` / `builder-canvas`: full block list and selection synchronization.
- `builder.page.ts`: group selection and layout refresh preservation.
- `template-block.service.ts` + DTO/schema: persist `groupId` on create/update (hotfix required by the observed reload failure).
- Regression specs and builder documentation/checklist.

## Verification

- Frontend tsc `tsconfig.app.json --noEmit`: PASS.
- Targeted Jest (`builder-group-drag`, `builder.page`, `builder-canvas`): PASS, 42 tests.
- Angular development build: PASS, exit 0.
- `git diff --check` on DOC-331 files: PASS; only CRLF conversion warnings.
- Manual Builder smoke: not executed in this session; `MANUAL_BROWSER_CHECK_REQUIRED` remains disclosed.

## Executor report

See `docs/agent-checklists/TZ-DOC-331.md`; it records the groupId peer fix, backend persistence hotfix, gates, and residual manual smoke requirement.

## Known limitations

Nested groups, group rename, member locks, and magnetic snap improvements remain out of scope. This closeout is local and uncommitted because the PO did not request commit/push; the mixed worktree must be split by scope before committing.

## Related

- `TZ-DOC-333` shares builder/template-block files in the same dirty session and is archived separately.
- `TZ-DOC-332` remains active/unstarted.
