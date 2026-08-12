import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeToolSuccess,
  TOOL_OUTPUT_SCHEMA,
  toolOk,
} from './tool-result.js';

describe('TZD-41 tool result envelope', () => {
  it('normalizes a proposal _id to top-level proposalId and result.id', () => {
    const envelope = normalizeToolSuccess({
      ok: true,
      proposal: { _id: 'proposal-1', kind: 'material.create' },
    });

    assert.equal(envelope.ok, true);
    assert.equal(envelope.proposalId, 'proposal-1');
    assert.equal((envelope.result as { id: string }).id, 'proposal-1');
    assert.equal((envelope.result as { _id: string })._id, 'proposal-1');
  });

  it('takes the first id from a batch proposal response', () => {
    const envelope = normalizeToolSuccess({
      ok: true,
      proposalIds: ['proposal-1', 'proposal-2'],
    });

    assert.equal(envelope.proposalId, 'proposal-1');
  });

  it('normalizes a SoT create _id to top-level id', () => {
    const envelope = normalizeToolSuccess({
      ok: true,
      result: { _id: 'entity-1', name: 'Материал' },
    });

    assert.equal(envelope.id, 'entity-1');
    assert.equal((envelope.result as { id: string }).id, 'entity-1');
  });

  it('normalizes textBlockId from a draft result to top-level id', () => {
    const envelope = normalizeToolSuccess({
      ok: true,
      draft: true,
      textBlockId: 'text-block-1',
      todoId: 'todo-1',
    });

    assert.equal(envelope.id, 'text-block-1');
    assert.equal((envelope.result as { textBlockId: string }).textBlockId, 'text-block-1');
  });

  it('returns structuredContent and the same canonical JSON text', () => {
    const response = toolOk({ ok: true, result: { id: 'entity-1' } });
    const parsed = JSON.parse(response.content[0].text) as Record<string, unknown>;

    assert.deepEqual(response.structuredContent, parsed);
    assert.ok(TOOL_OUTPUT_SCHEMA.result);
  });
});
