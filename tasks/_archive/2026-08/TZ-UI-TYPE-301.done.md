# TZ-UI-TYPE-301 — Type scale canon (tokens + docs)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + continuous executor)  
**Source:** `tasks/TZ-UI-TYPE-301-type-scale-canon.md`

## Delivered

- `styles.css`: ERP type scale comment + `--text-micro` / `--text-title`; `.eyebrow` + `.pi-tech-label` both 11px via `--text-micro`
- `design-spec.md`: Hanken / Inter / JetBrains + 5-role table (removed Source Serif / Work Sans)
- `docs/pages/foundations.page.md` created; foundations page hints updated
- Audit §6 note: TYPE-301 DONE

## НЕ

- page template micro migration (TYPE-302)
- colors (COLOR-301)
- desktop/** · supply/** · PRODUCTS-307 · peer products/orders WIP
- deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:12:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: N/A (token/docs only; no component behavior change requiring jest)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: kit footer/overview may still mention Syne/Jakarta outside CONFLICT KEYS
