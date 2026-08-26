# NOW — оперативная доска агента (короткий срез)

> Правда для resume. Лимит: 120 строк.

updated_at: 2026-08-26T15:40:00Z (Buffy TZ-KP-443 checkpoint)

## ACTIVE / LIVE

**DEPLOY-READY** @ `631f96e0` — `docs/agent-checklists/DEPLOY-READY.md`  
PO → любому ИИ: **«сделай деплой по документации»**

## LIVE (Freebuff ×2 — осталась 1)

- TZ-DOC-443 — template setup category + (параллель, disjoint)  
- Промпт: `tasks/PROMPT-FREEBUFF-DOC-KP-443.md`  
- Cursor: после DOC-443 DONE → «что дальше»

## Checkpoint 2026-08-26T15:40:00Z · TZ-KP-443 DONE
- DONE: ориентация КП = из шаблона (store `orientation` = computed из `draft.selectedTemplate()?.orientation ?? 'portrait'`, `setOrientation` удалён); toggle portrait/landscape убран с КП-ribbon (shell/demo/page); builder-inspector chips получили Lucide `RectangleVertical`/`RectangleHorizontal` (PATCH-путь не менялся); docs law #6 + kp-workspace.page.md.
- Gates: FE tsc PASS; jest shell+store+draft+inspector 72/72 PASS; eslint 0 новых; prettier/diff-check PASS.
- Pre-existing: page.spec 3 фейла (`kp-ws-text-block-create`) — падает и на HEAD, не регрессия.
- Archive: `tasks/_archive/2026-08/TZ-KP-443.done.md`; lock `.mimocode/locks/TZ-KP-443-orientation-from-template.lock`; checklist DONE; `_active/TZ-KP-443.md` удалён.
- NEXT: DOC-443 (Freebuff-1). Deploy: NO.

## DONE (не трогать)

TEST-422 · SUPPLY-443 · UX-443 · UX-441 · UX-442 · 440 wave · UX-440R · CATALOG-377 · DICT-441 · **KP-443**

## PARK

DESK-441 (`canMarkShipped` → only `ready`) — Да/Нет PO

deploy_docs: `deploy/synology/README.md`

