# TZ-SALES-303 — KP family schema + thin API (D21 layer 1)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous — schema-first, no FE review gate)

## Delivered

- Quotation schema: `familyRole` (solo|master|variant), `masterId`, `familyVersion` (default 1), `orgMarkupPercent`; unique sparse index `{ masterId, organizationId }`
- Defaults on create: `familyRole: solo`, `familyVersion: 1` (existing docs stay valid)
- API:
  - `POST /quotations/:id/family/attach-organizations` — solo→master; idempotent variants per org
  - `POST /quotations/:id/family/sync-from-master` — copy lines → variants; bump `familyVersion`
  - `GET /quotations/:id/family` — master + variants summary
- Convert variant → order/contract: **400** BadRequest
- Tests: quotation.service.spec 21/21 (attach 2 orgs, sync qty, convert variant 400, idempotent org)
- Stub `tasks/_backlog/TZ-SALES-304-kp-family-ui.md` left READY (UI layer)

## НЕ

- FE expand / markup dialog / variant editor (→ SALES-304)
- Manual edit lines on variant UI
- supply/**; deploy; dictionaries

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:15:00Z
closed_by: continuous-executor-composer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc -p tsconfig.build.json)
  - tests: PASS (jest quotation 21/21)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: continuous-executor-composer
known_limitation: no browser UI for family; layer 2 = TZ-SALES-304 after PO probes API/data
source: tasks/_backlog/TZ-SALES-303-multi-org-kp-clone.md
