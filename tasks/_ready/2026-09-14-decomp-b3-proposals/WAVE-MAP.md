# WAVE — Block 3: Proposals list

> Pack: `tasks/_ready/2026-09-14-decomp-b3-proposals/`  
> Цель: стабилизация `/proposals` list (family / studio bridge / convert) — **не** port legacy KP workspace God.

## Goal

`proposals-list.page.ts` (~422 LOC, ~9 inject) → `ProposalsListFacade` + dumb row/family UI → `@kppdf/features/proposals`.

## Chain

| # | SIZE | TZ id | Depends |
|---|------|-------|---------|
| P1 | L | `TZ-NX-PROPOSALS-LIST-FACADE` | B2 DONE (or empty _active + PO) |
| P2 | S | `TZ-NX-PROPOSALS-TO-FEATURES` | P1 |

## Target

```
apps/.../pages/proposals/proposals-list.page.ts   # thin
libs/features/src/lib/proposals/
  proposals-list.facade.ts
  ui/proposal-row...
  ui/proposal-attach-orgs.dialog.ts
```

Path: `@kppdf/features/proposals`

## Hard rules

- Do not invent NX KP workspace / table-editor.
- Studio create/open + convert-to-order + family attach — behavior unchanged.
- Specs: proposals-list + attach-orgs dialog.
- nx build last.

## Prompt

[PROMPT-CLAUDE-B3-CONTINUOUS.md](./PROMPT-CLAUDE-B3-CONTINUOUS.md)

## Status

| TZ | Status |
|----|--------|
| P1–P2 | **DONE** — see `docs/agent-checklists/WAVE-DECOMP-B3-PROPOSALS.md` for commits |
