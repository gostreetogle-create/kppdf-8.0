═══════════════════════════════════════════════════════════════
TZ-FORMS-316: НДС/дни контрагента и фирмы; скидка КП
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Counterparty and organization payment-term/VAT fields now use
  `toOptionalNumber` at submit and omit undefined values.
- Proposal discount percent and amount now use the shared helper; item numeric
  conversion remains unchanged.
- Added focused counterparty regression coverage for string VAT and payment terms.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (counterparty 10/10; organization 14/14)
  - lint: PASS (focused ESLint, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - app-pi-input CVA: unchanged
  - backend/party schema/proposal table: unchanged
  - deploy/wipe: not run

commit: pending
