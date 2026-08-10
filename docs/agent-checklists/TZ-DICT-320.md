# TZ-DICT-320 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DICT-320.md` (removed at closeout)
> Commit/push: **YES** per continuous wave prompt

## Claim slot

- agent_id: `Buffy/freebuff-259639d6-2fe2-49fd-bb50-6b4af549f3c3`
- claimed_at: `2026-08-10T17:38:36.3297297Z`
- workspace: `D:\kppdf-8.0` (host-managed isolated worktree)
- team_room_claim: unavailable (`Unknown task: TZ-DICT-320; sync tasks first`)

## Acceptance

- [x] `/dictionaries/kind-labels` is reachable from Справочники and exposes product/material tabs, editable labels, active toggle, and PATCH save.
- [x] Product and QuickCreate kind options load active productKind labels through the shared service/cache, preserve stable keys, and use the shared seed fallback with one RU warning on API failure.
- [x] Material FullEditor, materials filter, detail, BOM legend/inspector, and composition picker use the same cached materialKind service; duplicate UI label maps were removed.
- [x] Existing create/update payload keys remain `good`/`service`/`work`; material keys remain `raw`/`part`/`fastener`/`purchased`/`other`.
- [x] FE tsc, focused form/page/service Jest, lint, build, and diff-check pass.

## Integrity slot

- [x] Type: page/navigation/service.
- [x] FIC §A–E: dictionary page route/chips/docs updated; no new page index required by current docs canon.
- [x] SECTION-READINESS: N/A; no readiness registry exists for this dictionary leaf.
- [x] Foreign WIP excluded; backend TZ-319 code was not modified.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (fact)

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] Focused Jest: 6 suites / 103 tests PASS (service, page, product/material forms, QuickCreate, composition picker)
- [x] Changed-file ESLint: PASS
- [x] New-file Prettier: PASS; legacy edited files retain repository CRLF baseline warnings
- [x] `pnpm run build:dev`: PASS
- [x] `git diff --check`: PASS (line-ending warnings only)

## Executor report (auto)

- status: DONE
- changed: shared API/cache/fallback service and tests; kind-label management page/tests; route/nav/chips; product/material/QuickCreate forms; catalog/detail/BOM/picker rails; page docs.
- conflict disclosure: no competing `_active` keys at claim time; Team Room does not know this task until sync.
- known limits: user role can consume active labels but management page/API remains admin/manager; fallback is intentionally seed-only and retryable.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T17:51:30.8247358Z`
