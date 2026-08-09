# TZ-SALES-319 checklist

> Status: **READY FOR REVIEW — Cursor visual FAIL** (см. TZ-SALES-321)
> Marker: `tasks/_active/TZ-SALES-319.md` (закрыть вместе с 321 после PASS)
> Аудит FAIL: `docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md`
> Commit/push: **NO** unless PO says so
> TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-319-create-kp-template-build-preview.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T09:52:45Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task registry) — checklist + `_active` marker

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `tasks/_active/` — **нет** TZ-SALES-317 (archived `11f02560`)
- [x] Peers: DOC-342 / DOC-344 / TABLES-305 — keys **не** пересекаются
- [x] Audit + studio spec §0 + TZ-SALES-319 прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-SALES-319.md` на месте

## Acceptance

- [x] Center без name / «упрощённое» / draftLines bullets
- [x] `DocumentTemplatesService.build` вызван при выборе шаблона
- [x] iframe/srcdoc (`data-test="kp-tpl-html-preview"`); mock HTML с `.doc-bg`
- [x] Смена шаблона / org → rebuild; empty → CTA
- [x] Shell 317 rails/overlay сохранён
- [x] Gates tsc + proposal-create jest 8/8
- [x] Docs: proposals-create.page.md + kp-create-studio-spec.md §6

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `cd frontend && pnpm test -- --testPathPattern=proposal-create` → **PASS 8/8**

## Executor report (auto)

- task: TZ-SALES-319
- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T09:52:45Z
- status: READY FOR REVIEW
- commit: _(working tree — not committed; await visual PASS)_
- what:
  - Removed stub chrome (name / «упрощённое» / draftLines) from A4 sheet
  - On template select → `DocumentTemplatesService.build(id, { organizationId? })`
  - Sandboxed iframe `srcdoc` + `<base href="{origin}/">` for `/uploads`
  - Rebuild on template change and inspector `stateChange.organizationId` (debounce 200ms)
  - Loading/error RU on sheet; empty CTA unchanged
- conflict_disclosure: DOC-342 / DOC-344 / TABLES-305 untouched; SALES-317 archived first (`11f02560`)
- known_limits:
  - draftLines not bound into table HTML (successor)
  - Counterparty fill later; print 320 PARK
  - editor-canvas ≠ bit-identical build HTML (SoT = build)
- gates: FE tsc PASS; proposal-create Jest 8/8 PASS
- archive: **blocked** until Cursor/PO visual PASS on template **with background**
- deploy: NO

## Review handoff

- [x] READY FOR REVIEW
- [ ] **Не** archive до Cursor/PO visual PASS — **FAIL 2026-08-09**: broken bg, scroll, layout lost (mongoose spread). Fix = **TZ-SALES-321**.
