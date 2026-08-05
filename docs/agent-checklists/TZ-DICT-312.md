# TZ-DICT-312 checklist

> Status: **DONE**  
> Marker: archived — `tasks/_archive/2026-08/TZ-DICT-312.done.md`  
> Commit/push: **NO** unless PO says so  
> Evidence: PO screenshot 2026-08-05 — gap under nav + clipped CTA

## Claim slot

- agent_id: openai/gpt-5.6-luna (Buffy)
- claimed_at: 2026-08-05T15:35:05Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room in this session)

## Preflight

- [x] Workspace D:\kppdf-8.0
- [x] Read TZ-DICT-312 + SoT Group Chip §2.2
- [x] Claim + `_active`
- [x] No competing active claim on DICT-312 conflict keys

## Acceptance

- [x] No dead white gap header → chips on dictionary group pages: dictionary Group Chip routes now use dense main (`pt-0`), and the chrome starts directly under the app header.
- [x] CTA create fully visible (doc-template + text-block cats): tools are kept inside a width-constrained, `min-width: 0` adaptive sticky stack; existing CTA selectors remain intact.
- [x] Sticky tools offset not hard-broken on chip wrap: chips and tools are one sticky `top-0` stack inside the `main` scroll container; `6.25rem` was removed.
- [x] fe tsc + jest PASS
- [x] READY FOR REVIEW → Cursor PASS → archive

## Gates (fact)

- `cd D:\kppdf-8.0\frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **PASS** (exit 0; no output)
- `cd D:\kppdf-8.0\frontend && pnpm exec jest --testPathPattern "pi-group-workspace|dictionaries|app.routes" --no-coverage` — **PASS** (10 suites, 91 tests)
- `git -C D:\kppdf-8.0 diff --check` — **PASS** (warnings only about LF→CRLF normalization)

## Executor report

- Что сделано: Group Chip Workspace переведён на единый адаптивный sticky stack (chips + tools), без ручного offset; dictionary group routes получили dense main без `pt-page-y`/footer gap; добавлен focused DOM contract spec; CTA projection сохраняется внутри `min-width: 0` tools stack.
- Выбранный вариант gap fix: вариант **A**, `denseMain()` для canonical dictionary group routes. Sticky offset дополнительно исправлен на `top-0`, потому что `main` — отдельный scroll-контейнер, уже расположенный под app header.
- Conflict disclosure: изменены `frontend/src/app/shared/page/pi-group-workspace.component.ts`, новая `frontend/src/app/shared/page/pi-group-workspace.component.spec.ts`, `frontend/src/app/layout/app-layout.component.ts`, checklist, active marker, active map, review inbox, progress; backend, routes IA, pages-local data logic и table-kit Tree не затрагивались.
- Known limits: браузерный screenshot smoke не запускался в этой сессии; DOM spec подтверждает stack/CTA presence, а размеры viewport требуют Cursor/PO browser smoke. UI-TABLE-302/305 не входят в этот TZ.

## Review handoff

- [x] READY FOR REVIEW в `docs/agent-checklists/DICT-WAVE1-REVIEW.md`
- [x] Active marker переведён в READY FOR REVIEW
- [x] Active map переведён в READY FOR REVIEW
- [x] Archive — Cursor Verdict PASS 2026-08-05
- closed_at: 2026-08-05T16:45:00Z
