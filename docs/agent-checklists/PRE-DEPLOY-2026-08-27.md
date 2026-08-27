# PRE-DEPLOY — 2026-08-27 (READY)

**deploy_sha_target:** `fd416e40ff02b8fb3b37ebf44bb2734986c546a8`  
**prepared_at:** 2026-08-27T22:10:00+03:00  
**prepared_by:** cursor-architect  
**PO smoke:** skipped (prep only — PO deploys with «сделай деплой по документации»)  
**desktop_zip:** accept-stale (no installer zip in `frontend/downloads/`; web warm only)

### Preflight Check Output
- **Context read:** `deploy/synology/README.md`, `tasks/PROMPT-DEPLOY-READY.md`, `docs/agent-checklists/DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-08-26.md`
- **Key Constraints:** warm only (`WIPE=false`); secrets local from `_001`; Mode A stamp only
- **Planned Deliverable:** READY stamp on tip after UX-444 + QA-445 + UX-445I
- **Validation Path:** full tsc/jest/arch + `preflight.ps1`

## Gates on HEAD `fd416e40`

| Gate | Result |
|------|--------|
| `main` tip | `fd416e40` (TZ-UX-445I nested collapse) |
| FE tsc | **PASS** |
| BE tsc | **PASS** |
| FE full jest | **6 fail / 2086 pass** (baseline debt only — see §Debt) |
| BE full jest | **2 fail / 982 pass** (baseline catalog-314 + users-admin) |
| architecture:check | **3** fe-page-cross-component (2 prior + inventory→material from QA-445B) |
| `_active` XOR archive | PASS (only `.gitkeep`; 445I archived) |
| preflight.ps1 | **PASS** (config.env + CREDENTIALS + SSH key + tools) |
| Secrets on this machine | Restored from `D:\kppdf-8.0_001` (gitignored) — **critical**: fresh clone had none |

## §Debt (baseline — do not fix in deploy)

```text
Проверено на: fd416e40  date: 2026-08-27T22:10:00+03:00
BE: catalog-314.archive.spec.ts:79 ; users-admin.controller.spec.ts:114
FE suites: proposal-create-terms; material-form-dialog; proposal-workspace
  (orders/order-detail cleared vs prior 8-fail baseline)
architecture:
  - materials → organization-full-editor-dialog (prior)
  - products → category-form-dialog (prior)
  - inventory stock-movement → material-form-dialog (QA-445B reuse; document, not silent fix)
```

## Wave since prior READY `631f96e0` / last deployed tip

UX-444 C+D, QA-445 A–H (A/D/H diagnosis-only), UX-445I nested composition collapsed-by-default,
inventory inline material create, desk pencil-only edit, doc PDF photos, Form Studio «Снабжение».

## Why last «prep» failed at work

Fresh GitHub clone **does not** contain `deploy/synology/config.env` or `CREDENTIALS.md`.
Without them `deploy.ps1` cannot SSH. This prep restored them locally and verified preflight OK.

## Agent deploy instructions (for next chat)

1. Stamp READY below → `git pull --ff-only` on `main`
2. VPN **off**, LAN to `192.168.1.103:22`
3. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
4. Smoke per `deploy/synology/README.md`
5. Set stamp INVALID + commit

§F not run (no wipe).
