# TZ-SALES-337 — Create КП params without duplicate table section

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T16:19:16Z

## Implementation

- Commit: `0d3ea7faa34752e9765bddc378d01107e72eca9e`
- Parameters now contains only organization, markup, VAT, estimate, and client controls.
- Table columns, visibility/order controls, and «Открыть шаблон таблицы» remain only in the Таблица rail.
- Table sync/layout, backend, FROZEN 317 shell, Save, and deploy were not changed.

## Gates

- Frontend tsc: PASS
- proposal-create Jest: PASS 15/15
- Frontend Prettier: PASS
- Frontend ESLint: PASS
- diff-check: PASS

## Visual / DOM review

- Quick DOM visual PASS: Parameters has no `kp-insp-table`; Таблица retains columns and CTA.

## Scope

- Foreign DOC-343 dirty/untracked files excluded.
- No BE, sync/layout, Save, 317 shell, or deploy changes.
