# TZ-KP-BIND-513: подстановка org/клиента/КП в build preview и PDF

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-24
closed_by: Cursor agent
wave: WAVE-PO-SMOKE-2026-08-24
verification:
  - BE tsc: PASS
  - BE jest document-template.substitution: 4/4 PASS
  - e2e extended: document-templates-build.e2e-spec.ts

Исходная TZ: `tasks/_archive/2026-08/specs-dup-root/TZ-KP-BIND-513-kp-build-substitution-bag.md`
Checklist: `docs/agent-checklists/TZ-KP-BIND-513.md`

## Суть

- `mergeDraftContextIntoBag()` — draft aliases client_name, kp_number, dates
- `normalizeSubstitutionHtml()` legacy fallback
- Single-column blocks use columns[0].content
- `update()` orientation (ORIENT-523 bundled)
