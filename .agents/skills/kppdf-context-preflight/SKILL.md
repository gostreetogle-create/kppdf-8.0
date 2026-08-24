---
name: kppdf-context-preflight
description: >-
  Mandatory thin preflight before TZ or product code on kppdf-8.0. Concrete
  file paths, role split (Cursor vs executor), FIC validation. No chat-confirm
  gate. No tech grilling of PO. Use on every task start.
---

# kppdf-context-preflight

> Life-coder: PO drives (live site). AI is the conveyor. Canons autocorrect sketchy intent.  
> Audit: `docs/audits/2026-08-24-agent-skills-ai-folder-audit.md`.  
> **Not** a second SoT — pointer into `docs/`.

## When

Любая задача на разработку, TZ, баг-диагноз или правку поведения — **до** кода / до финализации TZ.

## Role split

| Role | After preflight | Never |
|------|-----------------|-------|
| **Cursor (Mode A)** | Thin TZ / plan / review text | Product code (`frontend/**`, `backend/**/*.ts` app logic). No «unless instructed» escape. |
| **Executor** (Freebuff / Claude CLI / Gemini) | Claim → code by canons → FIC → gates | Wait for «ок» / «продолжай» mid-wave; tech-grill PO |

## Steps

1. **Context** — open only needed files (not whole repo): `docs/how-to-connect-ai.md` (if new session), `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md` / `docs/CONTEXT.md` as needed, relevant `docs/pages/<name>.page.md`, and for code/UI: `docs/DEVELOPMENT-PATTERNS.md`, `docs/UX-FORM-CANON.md`, `docs/paper-and-ink.md` / `docs/DIALOG-COOKBOOK.md` by zone.
2. **Emit artifact** (format below) — into checklist or one short agent note. **Not** a long essay for PO chat (`PO-CANON` п.0).
3. **Do** — Cursor: write/refine TZ. Executor: implement; map vague UI asks to existing Pi-* + UX-FORM without asking «how to layout?».
4. **Validate** — `docs/FEATURE-INTEGRATION-CHECKLIST.md` by change type; Integrity slot when closing.

## Mandatory artifact (no wait for PO)

```markdown
### Preflight Check Output
- **Context read:** `path/one`, `path/two` (only paths actually opened)
- **Key Constraints:** Mode A | Claim + conflict keys | UX-FORM / Paper & Ink if UI
- **Planned Deliverable:** 3–5 steps (TZ path **or** code zone)
- **Validation Path:** FIC §… + gates / Integrity
```

### Anti-ceremony

- **Context read** = concrete paths only. Ban: «прочитал документацию», «изучил канон».
- If you did not open a path with a tool — do not list it.
- Artifact ≠ gate on «ок» from PO.

## Life-coder rules

1. Do **not** grill PO on tech (which Pi-*, CSS, Nest module). Use canons.
2. Ask PO **only** for non-standard business / wipe / deploy / conflict with accepted layout — Yes/No (`PO-CANON`).
3. Autocorrect sketchy wording to repo names (`Counterparty` ≠ `Organization`, etc. via `CONTEXT.md`).
4. Do not invent features for sport.

## Related

- Router: `kppdf-project`
- Cursor: `cursor-usage` + `.cursor/rules/context-preflight.mdc`
- Executor loop: `kppdf-executor-loop` (no mid-wave confirm)
- TZ authoring: `tz-authoring` + `docs/TZ-AUTHORING.md`
