# TZ-DESK-411 checklist

| Field | Value |
|-------|-------|
| Status | DONE |
| TZ | `tasks/TZ-DESK-411.md` |
| Depends | 402 DONE |

## Claim slot

- agent_id: buffy
- claimed_at: 2026-08-18T22:37:00+0300
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Workflow chips respect page ACL; disabled CTA with RU reason
- [x] focused tsc + specs PASS

## Executor report (auto)

- Workflow strip already page-ACL-filtered by `pi-group-workspace` (`user.pages`); added `dataTestPrefix="desk-workflow"` so chips render `data-test="desk-workflow-<id>"`.
- Rail tools ACL: supply only with `supply` page, gantt only with `production`, combine only with `orders`.
- Disabled desk primary CTA now shows RU why-disabled hint (siteId / status / freeze) via `primaryCtaDisabledReason()`.
- typecheck PASS · jest 37/37 · eslint 0 errors.
