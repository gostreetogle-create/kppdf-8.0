# WAVE — QA follow-up closeout (2026-09-17)

Pack: `tasks/_ready/2026-09-17-qa-followup/`
Prompt: `tasks/_ready/PROMPT-FREEBUFF-QA-FOLLOWUP.md`

**Status: CLOSED**

| # | SIZE | ID | Layer | Commit |
|---|------|-----|-------|--------|
| 0 | S | TZ-DOCS-QA-CHECKLIST-CLOSE-AUTH | docs | `558fb833` |
| 1 | S | TZ-DOCS-QA-REGISTRIES-FIXTURE-CANON | docs | `9d0ee9dc` |
| 2 | S | TZ-DOCS-QA-PROPOSALS-RECLASS | docs | `3288a340` |
| 3 | S | TZ-NX-SHELL-QUICKNAV-COUNT-PIN | frontend-nx test-only | `c5fc5dfb` |

## Closeout

- Auth findings closed in QA checklists with product SHAs.
- Registries explicitly canonized as fixture-only; no RBAC invented.
- Proposals list/convert/Studio bridge Verified; only generated-document/PDF output remains B.
- Shell quicknav counts pinned to live filtered categories: 9 all-role / 8 gated-role.
- Focused shell spec: 29/29 PASS.
- `nx build kppdf-web`: PASS.
- Deploy: not run.
