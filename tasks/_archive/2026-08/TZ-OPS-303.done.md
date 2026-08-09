═══════════════════════════════════════════════════════════════
TZ-OPS-303: Docs Integrity Closeout — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-ops-303 (docs-only self-archive, AC зелёные)
acceptance_status: PASS
verification:
  - docs/DOCS-INTEGRITY.md exists, 60 lines ≤ 100, matrix + anti-drift: PASS
  - _TEMPLATE.md has Integrity slot section with checkboxes: PASS
  - FIC §F item about Integrity slot: PASS
  - PROJECT-MEMORY links DOCS-INTEGRITY without «появится позже»: PASS
  - GUIDE or GEMINI mentions Integrity slot before DONE: PASS (GEMINI DoD)
  - No product code diff: PASS
  - Archive + Executor report (auto) + progress: PASS
checklist: docs/agent-checklists/TZ-OPS-303.md
lock: none (docs-only, no product code)
source: tasks/_backlog/ops/TZ-OPS-303-docs-integrity-closeout.md

---

## Summary

- `docs/DOCS-INTEGRITY.md` — new protocol «код + docs = один PR/TZ»: rule, trigger→files
  matrix (route/permission/module/readiness/MCP/SoT/refactor), Integrity slot, anti-drift
  (код + живая schema побеждают), links to FIC / PROJECT-MEMORY / DOMAIN-MAP (304).
- `docs/agent-checklists/_TEMPLATE.md` — `## Integrity slot` section after Acceptance,
  6 checkboxes verbatim from TZ.
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` §F — new item «Integrity slot в checklist заполнен».
- `docs/PROJECT-MEMORY.md` — stub OPS-303 replaced with live DOCS-INTEGRITY link;
  «Не потерять» now lists Integrity slot before READY/archive.
- `GEMINI.md` Definition of Done — one line: Integrity slot mandatory before READY/archive.

## Protects

Closeout no longer allows «код готов, списки устарели»; every agent checklist now has an
explicit Integrity slot gate before READY/archive.
