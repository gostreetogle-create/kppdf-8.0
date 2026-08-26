# NOW — оперативная доска агента (короткий срез)

> Правда для resume. Лимит: 120 строк.

updated_at: 2026-08-26T20:00:00+03:00

## ACTIVE / LIVE

**UX-444 A+B** — `tasks/PROMPT-FREEBUFF-UX-444-AB.md`  
- TZ-UX-444A — PiStatusBanner + order-detail  
- TZ-UX-444B — where-used product/module **DONE** (13/13 · tsc PASS · pushed)  

**NEXT:** 444C → 444D (`PROMPT-FREEBUFF-UX-444-CD.md`)

**DEPLOY-READY** @ `631f96e0` — по фразе PO

## PARK

- DESK-441 (`canMarkShipped` → only `ready`) — Да/Нет PO  
- **PRICE-HIST** — гибко (supply ∪ manual ∪ import later) → `tasks/_backlog/ux-hygiene/TZ-PRICE-HIST-park.md`

## DONE (не трогать)

TEST-422 · SUPPLY-443 · UX-443 · UX-441 · UX-442 · 440 wave · UX-440R · CATALOG-377 · DICT-441 · **KP-443** · **DOC-443** · **UX-444B**

## Checkpoint 2026-08-26T19:37:10+03:00 · TZ-DOC-443 DONE
- DONE: setup и builder inspector показывают scoped system + current-organization categories; `+` открывает shared category form inline и сразу выбирает результат; duplicate mode без category сохранён.
- Gates: FE tsc PASS; focused Jest 4 suites / 63 tests PASS; targeted ESLint + Prettier PASS; diff-check PASS.
- Residual baseline: full FE lint 208 pre-existing errors + 17 warnings; token checker 35 pre-existing CSS violations; architecture 2 pre-existing materials/products violations.
- Archive: `tasks/_archive/2026-08/TZ-DOC-443.done.md`; lock `.mimocode/locks/TZ-DOC-443-template-setup-category-plus.lock`; active marker removed; shared prompt moved to `prompts-spent`. Deploy: NO.

deploy_docs: `deploy/synology/README.md`
