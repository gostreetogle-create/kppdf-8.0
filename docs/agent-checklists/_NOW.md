# NOW - Оперативная доска агента (тонкий срез)

> Справка для resume. Лимит: 120 строк.

updated_at: 2026-08-27T21:30:00+03:00

## ACTIVE / LIVE

**QA-445A** CLAIMED (claude) — `tasks/_active/TZ-QA-445A.md` (diagnose: no defect → regression test)

**DEPLOY-READY** @ `631f96e0` — не трогать без PO

## PARK

- DESK-441 (`canMarkShipped` → only `ready`) — да/нет PO
- **PRICE-HIST** — гибко → `tasks/_backlog/ux-hygiene/TZ-PRICE-HIST-park.md`
- QA-445B…H (без E) — `tasks/_backlog/qa-2026-08-27-live-bugs/`

## NEXT (после 444D)

QA backlog: 445B warehouse-receipt · 445C doc-template-pdf-photo · 445D proposal-pdf-401 · 445F desk-order-row · 445G desktop-import-category · 445H desktop-mcp-package

## DONE (не трогать)

TEST-422 · SUPPLY-443 · UX-443 · UX-441 · UX-442 · 440 wave · UX-440R · CATALOG-377 · DICT-441 · **KP-443** · **DOC-443** · **UX-444A** · **UX-444B** · **UX-444C** · **UX-444D** · **QA-445E**

## Checkpoint 2026-08-27 — TZ-UX-444D DONE
- DONE: `.pi-thumb-empty` hatch + product-detail hero/gallery empty; AI-UI-CONTRACT; 11 focused tests PASS.
- Archive: `tasks/_archive/2026-08/TZ-UX-444D.done.md`; lock local. Deploy: NO.

## Checkpoint 2026-08-27 — TZ-UX-444C DONE
- DONE: product lifecycle banner + catalog data-links text-info; 17 focused tests PASS; commit `2beebeed` (peer 445E files co-committed — disclosed).
- Archive: `tasks/_archive/2026-08/TZ-UX-444C.done.md`; lock local. Deploy: NO.

## Checkpoint 2026-08-27T21:30:00+03:00 · TZ-QA-445E DONE
- DONE: chrome «Сегодня» scroll + pulse на красном маркере (не silent no-op на коротком пустом диапазоне).
- Gates: FE tsc PASS; focused Jest 2 suites / 90 PASS; owned ESLint PASS (1 pre-existing OnInit warn).
- Archive: `tasks/_archive/2026-08/TZ-QA-445E.done.md`; lock `.mimocode/locks/TZ-QA-445E-gantt-calendar-button.lock`; active marker removed. Deploy: NO.

## Checkpoint 2026-08-26T19:37:10+03:00 · TZ-DOC-443 DONE
- DONE: setup и builder inspector показывают scoped system + current-organization categories; `+` открывает shared category form inline и сразу выбирает результат; duplicate mode без category сохранён.
- Gates: FE tsc PASS; focused Jest 4 suites / 63 tests PASS; targeted ESLint + Prettier PASS; diff-check PASS.
- Residual baseline: full FE lint 208 pre-existing errors + 17 warnings; token checker 35 pre-existing CSS violations; architecture 2 pre-existing materials/products violations.
- Archive: `tasks/_archive/2026-08/TZ-DOC-443.done.md`; lock `.mimocode/locks/TZ-DOC-443-template-setup-category-plus.lock`; active marker removed; shared prompt moved to `prompts-spent`. Deploy: NO.

## Checkpoint 2026-08-26T20:44:27+03:00 · TZ-UX-444A DONE
- DONE: shared `PiStatusBanner` with four tones, optional action, `role=status`; order-detail maps draft/cancelled/active lifecycle and hides shipped/delivered; kit overview has a live example.
- Gates: FE tsc PASS; focused Jest 2 suites / 23 tests PASS; owned ESLint + Prettier + diff-check PASS; `build:dev` PASS.
- Residual baseline: full FE lint FAIL (208 errors + 17 warnings outside owned files); UI token checker FAIL (35 existing proposal/block-renderer CSS violations); architecture FAIL (2 existing materials/products cross-page imports); full Jest FAIL (7 existing baseline failures, new zone green).
- Browser smoke: dev server `127.0.0.1:4204` served `/kit/overview`, auth guard redirected to `/login`; demo login returned backend HTTP 500 because local backend was unavailable. No product-detail/DOC-443 files touched.
- Archive: `tasks/_archive/2026-08/TZ-UX-444A.done.md`; lock `.mimocode/locks/TZ-UX-444A-status-banner.lock`; A+B prompt moved to `tasks/_archive/2026-08/prompts-spent/`; deploy: NO.

deploy_docs: `deploy/synology/README.md`
