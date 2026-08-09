# TZ-DOC-344 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-DOC-344.md` removed after closeout
> Commit/push: builder implementation and star-fill closeout pushed

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T03:26:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unknown task registry) — checklist slot + closeout message

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] peers DOC-342 (BE) · SALES-317 (proposals) — no overlap
- [x] TZ-DOC-344 and thin star-fill follow-up TZ-DOC-345 read
- [x] Claim slot filled before builder changes
- [x] `tasks/_active/TZ-DOC-344.md` existed before closeout
- [x] Foreign DOC-343 backend/docs WIP and `document-template.service.ts` were excluded

## Acceptance

- [x] Canvas shows exactly one background when 2+ uploaded (default only; -1 → 0)
- [x] First upload / load heal → `defaultBackgroundIndex` 0 in UI + star
- [x] Active/default star is visibly yellow-filled; inactive stars remain outline
- [x] FE tsc + focused Jest PASS (43/43)
- [x] builder.page.md note already landed with the original DOC-344 implementation
- [x] Builder self-check confirms active star exposes the gold-fill marker and CSS pierces the Lucide child SVG

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts src/app/pages/doc-constructor/builder/builder.page.spec.ts` → **43/43 PASS**
- `git diff --check` → PASS
- DOC-342 BE / SALES-317 untouched
- Foreign DOC-343 dirty backend/docs WIP untouched

## Executor report

- Root cause: the prior selector could not reliably style Lucide's nested SVG across the child component boundary, so PO saw an outline.
- Fix: active/default star now carries `data-star-fill="gold"`; `:host ::ng-deep` targets the nested SVG/path with yellow fill and gold-deep stroke; inactive stars remain outline-only.
- Existing DOC-344 canvas/upload healing remains unchanged and still shows one effective background.
- Known limit: BE print/HTML still stacks all backgrounds when index=-1 (separate successor if PO requests it).

## Visual / closeout

- [x] PO visual: one background on canvas accepted
- [x] Star-fill fix self-checked in Builder contract and focused DOM test
- [x] READY FOR REVIEW → DONE
- [x] Archive + lock + progress + remove `_active`
- closed_at: 2026-08-09T15:55:30Z
