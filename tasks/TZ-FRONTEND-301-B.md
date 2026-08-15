# TZ-FRONTEND-301-B: Angular integrity audit — platform lane

ROLE: Senior Angular 20 Architect / read-only auditor, Lane B
PARENT: TZ-FRONTEND-301-angular-component-integrity-audit.md

STATUS: CLAIMED / IN PROGRESS

CONFLICT KEYS:
- docs/audits/2026-08-15-angular-component-integrity-platform.md
- docs/agent-checklists/TZ-FRONTEND-301-B.md
- frontend/src/app/shared/**
- frontend/src/app/core/**
- frontend/src/app/layout/**
- frontend/src/app/app.ts
- frontend/src/app/app.routes.ts
- frontend/src/app/app.routes.spec.ts
- frontend/src/app/app.config.ts
- frontend/src/app/app.config.spec.ts
- frontend/src/app/styles.css
- frontend/eslint.config.js
- frontend/scripts/**
- scripts/architecture-check.mjs

SCOPE:
- Read-only audit of shared, core, layout, root app/routes/config/styles and frontend ESLint/tooling.
- Run and record frontend tsc, lint, focused custom-rule specs, and architecture-check baselines.
- Inventory the complete assigned scope; manually prove findings from source and tests.
- Classify findings P0 correctness, P1 architecture, P2 maintainability, or P3 modernization.
- Review container/presentational boundaries and propose only exact, non-overlapping remediation batches.

DO NOT:
- Edit frontend/src product code during Stage 1.
- Edit Lane A report/checklist or _NOW.md.
- Change dependencies, Angular version, business/API/RBAC/routes behavior, or architecture baseline.
- Start Stage 2 before canonical audit and Cursor/PO PASS.

OUTPUT:
- docs/audits/2026-08-15-angular-component-integrity-platform.md
- docs/agent-checklists/TZ-FRONTEND-301-B.md
