═══════════════════════════════════════════════════════════════
TZ-OPS-304: Domain Canon Map + gap inventory — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-ops-304 (docs-only self-archive, AC зелёные)
acceptance_status: PASS
verification:
  - docs/DOMAIN-MAP.md exists, 84 lines ≤ 180, 12 domain rows (≥11): PASS
  - «Не путать» column has 4 canon pairs (Counterparty≠Organization, StorageItem SoT, КП≠Order, composition≠stock): PASS
  - Gap inventory table present; each NO has NO page.md created in this commit: PASS
  - PROJECT-MEMORY + DOCS-INTEGRITY link DOMAIN-MAP: PASS
  - ARCHITECTURE has short pointer (1 line ≤ 5): PASS
  - git diff contains no frontend/** or backend/** paths: PASS
  - Archive + Executor report (auto): PASS
checklist: docs/agent-checklists/TZ-OPS-304.md
lock: none (docs-only, no product code)
source: tasks/_backlog/ops/TZ-OPS-304-domain-canon-map.md

---

## Summary

- `docs/DOMAIN-MAP.md` — header (rule: живая schema/route побеждают; карта обновляется в той же
  TZ), 12-row domain table (Auth, Party, Catalog, Warehouse, Sales, Documents, Production,
  Supply, Desktop/Import, Admin, Cost, Dictionaries) from repo facts (read-only
  `backend/src/modules/`, `frontend/src/app/app.routes.ts`).
- Gap inventory: 36 business routes → 6 without page.md:
  `/design`, `/shipping`, `/doc-template-categories`, `/dictionaries/text-block-categories`,
  `/admin/users`, `/admin/roles`. Successor hint: TZ-OPS-305+ or targeted DOC/PAGE TZ
  (P1: admin/roles + doc-template-categories; P2: stubs).
- Wiring: PROJECT-MEMORY (table + «сначала DOMAIN-MAP»), DOCS-INTEGRITY (matrix row + link),
  ARCHITECTURE pointer (1 line), pages/README pointer (1 line).
- Found P2 drift: pages/README index misses warehouses/supply/people/import-todos and writes
  `/dashboard` for the actual `/inventory` route — hygiene-fix successor, not this TZ.

## Protects

Agent finds domain→module→route→page→SoT in ≤2 minutes without full-repo scan; gaps are
tracked as successors instead of mass page.md creation.
