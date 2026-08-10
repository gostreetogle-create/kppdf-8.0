# TZ-SALES-343 DONE

- Scope: Create КП recipient overlay with Counterparty, assigned Person contact, Site object/address, and in-studio quick-create.
- Persistence: Quotation stores/populates `contactPersonId` and `siteId`; autosave and F5 hydration preserve both references, including explicit clearing with null.
- Rendering: build receives buyer/contact/site ids and exposes `counterparty.contactName`, `counterparty.contactPosition`, `counterparty.siteName`, and `counterparty.siteAddress` without changing existing bindings.
- Parameters: one recipient summary with «Изменить» returning to the same left overlay.
- Gates: backend tsc PASS; quotation focused tests 35/35 PASS; frontend tsc PASS; proposal-create 28/28 PASS; development build PASS; changed-file Prettier/ESLint/diff-check PASS.
- Self-verify: DOM/test evidence confirms recipient ids reach build and quotation autosave; authenticated browser data smoke unavailable because the backend data stack is not running.
- Deploy: NO. Desktop ZIP publish: NO.
