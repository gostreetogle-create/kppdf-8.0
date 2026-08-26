# PRE-DEPLOY — 2026-08-26 (READY)

**deploy_sha_target:** `631f96e0d0b53cdaeaf91cc28cb22421e3fd8d58`  
**prepared_at:** 2026-08-26T06:20:00+03:00  
**prepared_by:** cursor-architect (+ claude/task executor TZ-TEST-422)  
**PO smoke:** skipped (prep only)  
**desktop_zip:** accept-stale (zip absent in `frontend/downloads/`; web warm only)

### Preflight Check Output
- **Context read:** `deploy/synology/README.md`, `tasks/PROMPT-DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-08-26.md` (prior BLOCKED), `tasks/TZ-TEST-422-categories-spec-activated-route.md`
- **Key Constraints:** warm only; Mode A stamp; product fix via Claude/task executor
- **Planned Deliverable:** READY stamp on tip after TEST-422
- **Validation Path:** PROMPT-DEPLOY-READY; §F not run

## Gates on HEAD `631f96e0`

| Gate | Result |
|------|--------|
| `main` tip | `631f96e0` (TEST-422 closeout; product mock in `a01730fb`) |
| FE tsc | PASS |
| BE tsc | PASS |
| FE full jest | **8 fail / 2043 pass** (baseline debt only; categories 5/5 PASS) |
| BE full jest | **2 fail / 981 pass** (baseline) |
| architecture:check | 2 fe-page-cross-component (baseline) |
| categories.page.spec | **5/5 PASS** |
| SUPPLY-443 XOR | PASS (active gone; archive present) |
| preflight.ps1 | tools/secrets OK; SSH may WARN — VPN off + LAN before deploy |

## §Debt (baseline — do not fix in deploy)

```text
Проверено на: 631f96e0  date: 2026-08-26T06:20:00+03:00
BE: catalog-314.archive.spec.ts:79 ; users-admin.controller.spec.ts:114
FE: proposal-create-terms; orders.page; order-detail; material-form-dialog; proposal-workspace
architecture: material-form-dialog / product-form-dialog cross-page imports
```

## Wave since prod `565c630d`

supply-443, catalog-377, desk-440, shipping selects, UX hygiene, dict chips, form-field footer, TEST-422.

## §F deploy

Not run. PO → любому ИИ: «сделай деплой по документации» → `deploy/synology/README.md` only.
