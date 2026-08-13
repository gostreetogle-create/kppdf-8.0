# Checklist TZ-SALES-371 — Реальное фото изделия в КП

## Status

READY · dependency: TZ-SALES-370 DONE

## Preflight

- [ ] Claim/Team Room/_active-map, conflict keys free.
- [ ] Проверен landed diff TZ-SALES-370; его photoUrl mapping не реализуется повторно.
- [ ] Проверены Product photoIds/storageUrl на реальном fixture.
- [ ] Не подменять data gap MIG-303 кодовой заглушкой.

## Acceptance

- [ ] Product description + real photo reach ProposalDraftLine.
- [ ] Default layout содержит видимое `Фото`.
- [ ] FE/BE synthetic aliases поддерживают photo.
- [ ] Saved Quotation output не теряет photoUrl.
- [ ] Saved Quotation output не теряет sheetLayout photo options.
- [ ] Server PDF разрешает собственный upload URL и ждёт image load.
- [ ] Missing/blocked image рендерится без broken icon.
- [ ] Light/dark/A4/downloaded PDF evidence.

## Gates

- [ ] FE tsc + proposal-create focused Jest PASS.
- [ ] BE tsc + quotation-output/table-template/document-template focused Jest PASS.
- [ ] architecture:check + diff-check PASS.
- [ ] Cursor/PO visual PASS.

## Closeout

- [ ] Page docs/progress/architecture updated.
- [ ] Executor report auto added.
- [ ] Archive + lock + commit/push; no deploy.
