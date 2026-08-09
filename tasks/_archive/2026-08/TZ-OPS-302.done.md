═══════════════════════════════════════════════════════════════
TZ-OPS-302: Project Memory Pack — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: buffy-ops-302 (docs-only self-archive, AC зелёные)
acceptance_status: PASS
verification:
  - docs/PROJECT-MEMORY.md exists, 67 lines ≤ 140, all 6 sections: PASS
  - GUIDE §1.2 explicit link to PROJECT-MEMORY before ARCHITECTURE (step 1a): PASS
  - GEMINI.md PROJECT-MEMORY in mandatory reading after PO-DIARY: PASS
  - how-to-connect-ai references PROJECT-MEMORY (п.6 после CLAIM): PASS
  - No product *.ts / *.html / *.css edits: PASS
  - Checklist + Executor report (auto) + archive + progress + _active removed: PASS
  - git diff scoped to CONFLICT KEYS only: PASS
checklist: docs/agent-checklists/TZ-OPS-302.md
lock: none (docs-only, no product code — lock не требуется)
source: tasks/_backlog/ops/TZ-OPS-302-project-memory-pack.md

---

## Summary

- `docs/PROJECT-MEMORY.md` — thin knowledge pack (Зачем / Ритуал 60 сек / Где правда /
  Не потерять при DONE / Не ломать / Куда идти по задаче); stub refs to
  DOCS-INTEGRITY (OPS-303) and DOMAIN-MAP (OPS-304) marked «появится в OPS-303/304».
- `docs/AI-AGENT-GUIDE.md` §1.2 — new step `1a. docs/PROJECT-MEMORY.md` before ARCHITECTURE
  (subsequent 1a–1c renumbered to 1b–1d).
- `GEMINI.md` — PROJECT-MEMORY added to mandatory reading right after PO-DIARY.
- `docs/how-to-connect-ai.md` — item 6 after CLAIM ritual links PROJECT-MEMORY.

## Protects

Agent starts every TZ from a thin truth pack instead of full-repo scan; claim → memory → TZ.
