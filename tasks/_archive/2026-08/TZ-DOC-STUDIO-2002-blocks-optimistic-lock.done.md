# TZ-DOC-STUDIO-2002 — Block optimistic lock DONE

> Archived: 2026-08-29

## Delivered

- `expectedRevision` on POST/PATCH/POST reorder blocks endpoints
- `StudioDocumentService` revision gate + bump on block mutations
- FE `studio-blocks-state` syncs revision, conflict dialog on 409

## Gates

- backend tsc PASS · frontend tsc PASS · studio tests 39 PASS

## Executor

[Fix 2002 block revision lock](21d87503-3451-485a-9d6d-1be52c2701d4)
