# TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK — DONE

- **Status:** DONE
- **Agent:** freebuff
- **Closed:** 2026-09-15

## Delivered

- Removed the literal `<body>` marker from the SWEEP-06 studio table CSS comment, so the comment cannot be mistaken for document markup.
- Hardened `renderHtmlPages` body extraction to split after `</head>` before matching the real `<body>`, preventing CSS comments from leaking into multipage page bodies.
- Added regression coverage for the sanitized head comment and multipage output with `pageNumbering: true` and two pages.
- Preserved the existing studio table CSS contract: `9px`, `2px 4px`, `nowrap`, and ellipsis behavior.

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS, exit 0.
- `cd backend && pnpm test -- --testPathPattern=document-render --runInBand` → PASS, 5 suites / 29 tests.
- `cd backend && pnpm exec eslint src/modules/document-render/document-render.service.ts src/modules/document-render/document-render.studio-canvas.spec.ts` → PASS, exit 0.
- `git diff --check` → PASS, exit 0.
- Frontend build → N/A: backend-only TZ.

## Scope disclosure

Only the two backend document-render files were changed for product behavior. Existing frontend drag-coord WIP and all unrelated dirty/untracked files were left untouched and excluded from closeout. The remainder hotfix chain was not started.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (29/29 focused document-render tests)
  - lint: PASS (focused ESLint)
  - checklist: ADDED and completed
  - progress.md: N/A (redirect-only; live state in _NOW and wave tracker)
  - status synchronization: PASS
