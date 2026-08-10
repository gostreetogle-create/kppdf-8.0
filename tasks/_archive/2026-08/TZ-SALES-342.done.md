# TZ-SALES-342 DONE

- Scope: Create КП custom quotation lines and line-level commerce fields.
- Delivered: «Своя строка» without a catalog Product; catalog/custom line discriminator; description, unit, line discount %, optional flag; persistence and F5 hydration; discounted line totals; optional lines excluded from document total and shown with a separate additional amount.
- Rendering: live build and saved PDF payloads carry custom-line fields; the line name cell renders description and «не входит в стоимость»; footer renders «Итого» and «Дополнительно (не входит в стоимость)».
- Compatibility: legacy items default to catalog lines and retain their existing Product FK/snapshot behavior; no migration or catalog placeholder records.
- Gates: backend tsc PASS; backend quotation/generated-document focused tests 48/48 PASS; frontend proposal-create/terms tests 33/33 PASS; frontend tsc and Angular development build PASS; changed-file Prettier/ESLint/diff-check PASS.
- Visual evidence: Angular/DOM component self-check confirms the composition overlay, «Своя строка», custom preview payload and persistence payload. Authenticated data browser smoke was unavailable without the backend data stack.
- BAN respected: no deploy, wipe, desktop ZIP publish, shell rewrite, multipage, status/version, or vitrine work.
