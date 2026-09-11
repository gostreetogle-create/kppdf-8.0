# NOW

updated_at: 2026-09-11T05:15:00Z

## ACTIVE / LIVE

- **Freebuff:** PARK
- **Claude:** IDLE — studio console hygiene 01–04 ALL DONE, `_active` пуст.
- **Deploy stamp:** READY

## NEXT

Свободный слот.

## DONE

- Studio console hygiene 04/4 (`TZ-NX-NO-NATIVE-CONFIRM`): `studio-editor.page.ts` `onFinalize()` → Pi `AlertDialogComponent` + `onDialogCloseOnce` (same pattern as delete-layer), `window.confirm` removed; `no-alert: 'error'` added to `frontend-nx/eslint.config.mjs` workspace-wide; `rg 'window\.(confirm|alert|prompt)' frontend-nx` → 0 hits; new specs `on-dialog-close-once.spec.ts` + `studio-editor-finalize.spec.ts`
- Studio console hygiene wave 01–03 (`PROMPT-CLAUDE-STUDIO-CONSOLE-HYGIENE`, 2026-09-11):
  - 03/3 sync-quotation orphan: `studio-quotation-lifecycle.service.ts` `syncQuotationItems` soft-heals dead/foreign `linkedQuotationId` (clear FK + context.quotationId, `ensureLinkedQuotation` re-create for KP, sync onto fresh draft; non-KP → null, no 404); FE `syncKpQuotationItems` refreshes `document` from response; 3 new unit tests
  - 02/3 template-picker ×: `studio-template-picker-dialog.component.ts` `pi-icon-button` → `pi-icon-btn pi-icon-btn-danger`; `rg pi-icon-button frontend-nx` → 0 hits — `62d31f2c`
  - 01/3 Lucide NX pick: `LucideAngularModule.pick({ Check, Minus, ArrowUpRight })` in `app.config.ts` — crash `"check" icon has not been provided` fixed; regression test `checkbox.component.spec.ts` — `96757c61`
- HUB table parity 01–05 COMPLETE (earlier)
- SHELL-01 idle rails: убраны disabled «скоро»-заглушки, history ←→ в header, rails только при реальных tools — `6e2a5efa`
- HUB-06 expand cards: `/supply` + `/warehouses` expand переписаны под gold card-язык `counterparty-hub-tray`; `/orders` verified (уже gold) — `2296a326`

## PARK

- Deploy · G12 · desk · wipe · `/production` SKIP · Documents later
