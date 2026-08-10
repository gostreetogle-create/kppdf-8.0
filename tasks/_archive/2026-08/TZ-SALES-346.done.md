# TZ-SALES-346 DONE

- Исполнитель: Buffy / agent-d2515d7a53
- Дата: 2026-08-11
- Scope: multipage A4 КП, row breaks, repeated headers/background, last-page totals/terms, photo scale/crop, persisted `Quotation.sheetLayout`, vertical preview stack.
- Gates: backend tsc PASS; backend document-template/table-template/quotation tests 102/102 PASS; frontend tsc PASS; proposal-create tests 33/33 PASS; Angular development build PASS; changed-file ESLint PASS (3 existing explicit-any warnings, 0 errors); Prettier PASS; diff-check PASS.
- Self-verify: Angular DOM/component tests PASS; live authenticated browser/data smoke unavailable because backend data stack was not running. Preview server build completed on `127.0.0.1:4203`; preview registration was unavailable in this client build.
- Constraints respected: frozen shell 317, one-sheet no-inner-scroll behavior, shared TableTemplate copy-on-write, no deploy, no ZIP publish, no foreign WIP.
- NEXT: TZ-SALES-347.
