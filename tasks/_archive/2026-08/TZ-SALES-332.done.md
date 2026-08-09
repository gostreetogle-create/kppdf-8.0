# TZ-SALES-332 — Create КП flyout/table rail polish

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T16:08:44Z

## Implementation

- Feature commit: `f5e0f401`
- Hotfix commit: `272550ab946600045970e31f110d3d72bd121ccd`
- Multi-table templates now expose the selected live table in the Table rail; actual TableTemplate columns drive the request-only A4 layout.
- `tableTargetId` carries the selected live table through build; BE applies visibility/order only to that target.
- Right rail, CTA, flyout air/transparency/content sizing, products clipping protection, and frozen A4 rails|center remain intact.

## Gates

- Frontend tsc: PASS
- Backend tsc: PASS
- proposal-create Jest: PASS 15/15
- document-templates-build e2e: PASS 10/10
- Prettier/ESLint: PASS
- diff-check: PASS

## Visual

- Cursor visual PASS received on hotfix `272550ab`: multi-table target selection, panel/A4 column parity, hide/show, and reorder accepted.

## Scope

- Foreign DOC-343 / dirty `document-template.service.ts` WIP excluded.
- No TableTemplate PATCH, Save/Counterparty work, 317 shell rewrite, 331 regression, 320/322, or deploy.
