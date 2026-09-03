# TZ-NX-KP-FAMILY-S48-OPERATOR-DOCS: closeout семьи КП

**РОЛЬ:** Executor (docs)  
**LAYER:** 1 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S40–S47 **archived DONE**  
**CONFLICT KEYS:** `docs/pages/proposals.page.md`; `docs/agent-checklists/WAVE-NX-KP-FAMILY.md`; `docs/CAPABILITY-LEDGER.md`; `tasks/QUEUE-LIVE.md`; `docs/agent-checklists/_NOW.md`

## Domain preflight

Docs-only. Product runtime **не** трогать.  
Проверить что S40–S47 реально в `_archive/2026-09/*.done.md` с SHA.

## ИСХОДНОЕ

Operator docs могут описывать legacy/частичную семью; WAVE таблица не все [x].

## ЧТО ДЕЛАТЬ

1. NX-секция «Семья» в `proposals.page.md`: expand / attach / sync / studio / convert guard.
2. PAGE-TZ-INDEX + SECTION-READINESS + CAPABILITY-LEDGER (capability family UI).
3. WAVE-NX-KP-FAMILY: все [x] + commit SHAs; roadmap status DONE.
4. QUEUE-LIVE / `_NOW`: снять KP Family slot; промпты → `tasks/_archive/2026-09/prompts-spent/`.
5. Не писать product code «заодно».

## ИЗМЕНЯТЬ

- docs + wave/queue/prompt archive only

## НЕ ИЗМЕНЯТЬ

- `frontend-nx/**`, `backend/**` product

## КРИТЕРИИ ПРИЁМКИ

- [ ] WAVE closeout complete; `_active/` без KP Family TZ
- [ ] docs-only — gates N/A (отметить в archive)

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S48-OPERATOR-DOCS.done.md`
