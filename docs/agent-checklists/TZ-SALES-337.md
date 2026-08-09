# TZ-SALES-337 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZ-SALES-337.done.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-337-kp-params-no-table-dup.md`
> Closeout: gates and quick DOM visual PASS; archive + lock recorded

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T16:17:52Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`; canonical `main` current at `5694d64d`.
- [x] Read `_active-map.md` + `tasks/_active/`; no competing 337 keys.
- [x] Read TZ, WAVE-KP-USABLE, prompt, and usable-gap audit.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-337.md` created.

## Acceptance

- [x] Parameters pane has no `kp-insp-table` section.
- [x] Table pane retains columns and «Открыть шаблон таблицы» CTA.
- [x] Organization/markup/VAT/estimate/client controls remain in Parameters.
- [x] No changes to table sync/layout, backend, Save, shell 317, or deploy.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] FIC/page-doc readiness: scoped page doc line updated; no unrelated docs.
- [x] Foreign DOC-343 WIP excluded.
- [x] Canon: `docs/DOCS-INTEGRITY.md` and `docs/audits/2026-08-09-kp-usable-gap-map.md`.

## Gates (fact)

- [x] frontend tsc — PASS
- [x] proposal-create Jest — PASS 15/15
- [x] Frontend Prettier — PASS
- [x] Frontend ESLint — PASS
- [x] diff-check — PASS

## Executor report (auto)

- Implementation: `0d3ea7faa34752e9765bddc378d01107e72eca9e`; Parameters no longer renders the duplicate Table section, while the Таблица rail retains its controls and CTA.

## Review handoff

- [x] READY / quick DOM visual PASS: Parameters has no Table section; Table rail retains controls and CTA.
- [x] Archive after gates and quick visual acceptance.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T16:19:16Z`
