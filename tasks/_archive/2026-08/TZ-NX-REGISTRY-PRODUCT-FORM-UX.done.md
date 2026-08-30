# TZ-NX-REGISTRY-PRODUCT-FORM-UX — DONE

- Status: DONE
- Archived: 2026-08-30
- Implemented by: Gemini (2026-08-30T14:22:00+03:00)
- Independently live-verified + closed out by: Claude (2026-08-30T14:55:20Z) — see
  `docs/agent-checklists/TZ-NX-REGISTRY-PRODUCT-FORM-UX.md` for full evidence.
- Build: `pnpm exec nx build kppdf-web` exit 0
- Tests: `pnpm exec nx test kppdf-web --testPathPattern=product-form` exit 0 (46/46 suites, 252 passed)
- Lint: `eslint .../product-form-dialog.component.ts` — 0 problems
- Live verification: Playwright against running `:4201`/`:3000` (admin session) —
  create-product dialog has no passport preview, correct «Изделие» heading, derived
  «Комплекс» hint present, description/notes side-by-side. Screenshot evidence kept
  in session scratchpad (not repo).
- Changes:
  - Section «Паспорт изделия» → «Изделие» (`headingId=product-main`)
  - Removed `pi-product-passport-preview` from product form dialog
  - Description + Notes in `md:grid-cols-2`, rows=2
  - Create hint: composition save + derived «Комплекс» explanation
  - `docs/pages/registries.page.md` — `product-passports` row description updated to
    match (no more "computed preview in product dialog")

ARCHIVE_MARKER: TZ-NX-REGISTRY-PRODUCT-FORM-UX
