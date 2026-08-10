# TZ-SALES-344 DONE

- Scope: right-rail «Условия» panel for the Create КП studio.
- Delivered: per-quotation `terms` persistence, add/reorder/remove multiline rows, active TextBlockCategory/TextBlock library picker, cursor-position variable insertion, F5 hydration, and server-side HTML/PDF term rendering.
- Safety: known variables are resolved from request/quotation data; unknown tokens stay literal; term text is escaped before rendering.
- Gates: frontend/backend TypeScript PASS; frontend proposal-create + terms tests 32/32 PASS; backend document-template + quotation tests 96/96 PASS; Angular development build PASS; Prettier/ESLint/diff-check PASS.
- Visual evidence: DOM/component self-check confirms the right overlay opens without changing the frozen A4 center and the library/order/variable interactions work. Authenticated backend-data browser smoke was unavailable in the headless workspace.
- BAN respected: no deploy, wipe, desktop ZIP publish, shell rewrite, custom lines, multipage, status/version, or vitrine work.
