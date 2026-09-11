/**
 * TZD-AI-IMPORT-GENERAL-BASELINE — eval harness.
 *
 * Runs every fixture in `normalize-eval.fixtures.ts` through the real
 * `parseNormalizeResponse` (no network/model — see the fixtures file header
 * for what this does and does not measure) and reports/asserts the three
 * baseline metrics from the WAVE checklist:
 *   - parse_ok%            — % of fixtures whose response parsed as expected
 *   - required_field_fill% — % of required-field slots filled (non-null/'')
 *                             across successfully-parsed rows
 *   - invented_field_rate  — % of fixtures where the (synthetic) model
 *                             response contained a field outside the schema
 *
 * Soup-reopen gate (median of cannon 002, WAVE-DESKTOP-AI-IMPORT-BASELINE):
 * parse_ok >= 75% on >= 50 fixtures. This harness enforces that gate here;
 * the actual printed numbers are also copied into the WAVE checklist/audit
 * so they don't only live in CI output.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { IMPORT_TARGETS } from '../import-targets';
import { parseNormalizeResponse } from './normalize';
import { NORMALIZE_EVAL_FIXTURES } from './normalize-eval.fixtures';

test('normalize eval: parse_ok% / required_field_fill% / invented_field_rate on synthetic fixtures', () => {
  assert.ok(
    NORMALIZE_EVAL_FIXTURES.length >= 50,
    `eval harness needs >= 50 fixtures per WAVE gate, has ${NORMALIZE_EVAL_FIXTURES.length}`,
  );

  let okCount = 0;
  let totalRequiredSlots = 0;
  let filledRequiredSlots = 0;
  let fixturesWithInventedFields = 0;
  const mismatches: string[] = [];

  for (const fixture of NORMALIZE_EVAL_FIXTURES) {
    const result = parseNormalizeResponse(fixture.modelResponseText, fixture.schemaId);

    if (result.ok !== fixture.expectOk) {
      mismatches.push(`${fixture.id}: expected ok=${fixture.expectOk}, got ok=${result.ok}`);
      continue;
    }
    if (result.ok) okCount += 1;
    if (!fixture.expectOk) continue;

    if (fixture.expectRows && JSON.stringify(result.rows) !== JSON.stringify(fixture.expectRows)) {
      mismatches.push(`${fixture.id}: rows mismatch — got ${JSON.stringify(result.rows)}`);
    }
    const expectedInvented = [...(fixture.expectInventedFields ?? [])].sort();
    const actualInvented = [...result.inventedFields].sort();
    if (JSON.stringify(expectedInvented) !== JSON.stringify(actualInvented)) {
      mismatches.push(`${fixture.id}: inventedFields mismatch — expected ${expectedInvented}, got ${actualInvented}`);
    }
    if (result.inventedFields.length > 0) fixturesWithInventedFields += 1;

    const requiredFields = IMPORT_TARGETS[fixture.schemaId].requiredFields;
    for (const row of result.rows) {
      for (const requiredKey of requiredFields) {
        totalRequiredSlots += 1;
        const value = row[requiredKey];
        if (value !== null && value !== undefined && value !== '') filledRequiredSlots += 1;
      }
    }
  }

  assert.deepEqual(mismatches, [], `fixture mismatches:\n${mismatches.join('\n')}`);

  const parseOkPct = (okCount / NORMALIZE_EVAL_FIXTURES.length) * 100;
  const requiredFillPct = totalRequiredSlots > 0 ? (filledRequiredSlots / totalRequiredSlots) * 100 : 100;
  const inventedFieldRatePct = (fixturesWithInventedFields / NORMALIZE_EVAL_FIXTURES.length) * 100;

  // eslint-disable-next-line no-console
  console.log(
    `\n[TZD-AI-IMPORT-GENERAL-BASELINE eval] fixtures=${NORMALIZE_EVAL_FIXTURES.length} ` +
      `parse_ok=${parseOkPct.toFixed(1)}% required_field_fill=${requiredFillPct.toFixed(1)}% ` +
      `invented_field_rate=${inventedFieldRatePct.toFixed(1)}% ` +
      `(okCount=${okCount}, requiredSlots=${filledRequiredSlots}/${totalRequiredSlots}, ` +
      `fixturesWithInvented=${fixturesWithInventedFields})\n`,
  );

  assert.ok(parseOkPct >= 75, `parse_ok ${parseOkPct.toFixed(1)}% is below the 75% WAVE gate`);
});
