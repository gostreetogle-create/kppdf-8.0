# NOW - Оперативная доска агента (тонкий срез)

> Справка для resume. Лимит: 120 строк.

updated_at: 2026-08-27T21:50:00+03:00

## ACTIVE / LIVE

**QA-445F** CLAIMED (freebuff-1) — `tasks/_active/TZ-QA-445F.md`

**DEPLOY-READY** @ `631f96e0` — не трогать без PO

## PARK

- DESK-441 · PRICE-HIST · QA-445G–H

## DONE (не трогать)

… · **UX-444A–D** · **QA-445A** · **QA-445B** · **QA-445C** · **QA-445D** · **QA-445E**

## Checkpoint — TZ-QA-445C DONE
- DONE: PDF live rebuild + doc `<base>` + builder flush/srcdoc uploads + photo `[img]`→empty; gates 25+31 PASS. Deploy: NO.

## Checkpoint — TZ-QA-445B DONE
- DONE: receipt modal `+` → MaterialFormDialog + unit on qty; commit `9c35104e`; Jest 28/28. Deploy: NO.

## Checkpoint — TZ-QA-445D DONE
- DONE: 401 on template-blocks/document-templates build = pre-refresh attempt of the
  existing generic auth-interceptor retry; same root-cause class as QA-445A (stale
  token → visible 401 in console → transparent refresh+retry succeeds). No code
  change, no new ticket needed. Archive local. Deploy: NO.

## Checkpoint 2026-08-27T21:45:00+03:00 — TZ-QA-445B DONE
- DONE: receipt modal `pi-select-add-row` + MaterialFormDialog; materialId/unit autofill; Jest 3/3. Deploy: NO.

## Checkpoint 2026-08-27T21:28:41+03:00 — TZ-UX-444D DONE
- DONE: `.pi-thumb-empty` + product-detail empty; commit `d6303f4f`; 11 tests PASS. Deploy: NO.

## Checkpoint — TZ-QA-445A DONE
- DONE: no product bug; regression create→reload; Jest 6/6. Archive local. Deploy: NO.
