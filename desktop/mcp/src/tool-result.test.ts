/**
 * TZD-41 — response envelope canon.
 *
 * Гарантирует, что propose-ответы всегда отдают top-level `proposalId`,
 * SoT-create — top-level `id` (нормализация `_id` → `id`), а старые формы
 * (nested proposal.proposalId / result._id) тоже извлекаются корректно.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEnvelope,
  extractEntityId,
  extractProposalId,
  mutationEnvelope,
  proposeEnvelope,
  toolOkStructured,
} from './tool-result.js';

describe('extractProposalId (TZD-41)', () => {
  it('reads top-level proposalId', () => {
    assert.equal(extractProposalId({ proposalId: 'p-1' }), 'p-1');
  });

  it('reads nested proposal.proposalId (аудит-баг: «Шест»/products)', () => {
    assert.equal(extractProposalId({ proposal: { proposalId: 'p-2' } }), 'p-2');
  });

  it('reads result._id / result.proposalId fallbacks', () => {
    assert.equal(extractProposalId({ result: { _id: 'p-3' } }), 'p-3');
    assert.equal(extractProposalId({ result: { id: 'p-4' } }), 'p-4');
  });

  it('returns undefined for batch envelope without single proposalId', () => {
    assert.equal(extractProposalId({ proposalIds: ['a', 'b'], errors: [] }), undefined);
    assert.equal(extractProposalId({ ok: true, result: null }), undefined);
  });
});

describe('extractEntityId (TZD-41)', () => {
  it('normalizes _id → id at top level', () => {
    assert.equal(extractEntityId({ _id: '507f1f77bcf86cd799439601', name: 'X' }), '507f1f77bcf86cd799439601');
  });

  it('prefers _id over id', () => {
    assert.equal(extractEntityId({ _id: 'm1', id: 'also' }), 'm1');
  });

  it('reads through entity wrappers (result/task/todo/module/category)', () => {
    assert.equal(extractEntityId({ result: { _id: 'c-1' } }), 'c-1');
    assert.equal(extractEntityId({ task: { _id: 't-1' } }), 't-1');
    assert.equal(extractEntityId({ todo: { _id: 'td-1' } }), 'td-1');
    assert.equal(extractEntityId({ module: { id: 'm-1' } }), 'm-1');
    assert.equal(extractEntityId({ category: { _id: 'cat-1' } }), 'cat-1');
  });

  it('returns undefined when no id present', () => {
    assert.equal(extractEntityId({ name: 'X' }), undefined);
    assert.equal(extractEntityId(null), undefined);
    assert.equal(extractEntityId(undefined), undefined);
  });
});

describe('envelope builders (TZD-41)', () => {
  it('proposeEnvelope exposes top-level proposalId + full journal result', () => {
    const journal = { proposalId: 'p-1', kind: 'material.create', create: { name: 'X' } };
    const env = proposeEnvelope(journal);
    assert.equal(env.ok, true);
    assert.equal(env.proposalId, 'p-1');
    assert.equal(env.result, journal);
    assert.equal(env.proposal, journal); // backward-compat dup (one release)
  });

  it('proposeEnvelope works with nested proposal.proposalId (audit shape)', () => {
    const env = proposeEnvelope({ proposal: { proposalId: 'p-2' } });
    assert.equal(env.proposalId, 'p-2');
  });

  it('createEnvelope exposes top-level id from _id', () => {
    const env = createEnvelope({ _id: 'cp-1', name: 'ООО X' });
    assert.equal(env.ok, true);
    assert.equal(env.id, 'cp-1');
  });

  it('createEnvelope without id omits the key (no undefined JSON key)', () => {
    const env = createEnvelope({ name: 'X' });
    assert.ok(!('id' in env));
  });

  it('mutationEnvelope exposes id and proposalId when present', () => {
    const env = mutationEnvelope({ _id: 'm-1', proposalId: 'p-1' });
    assert.equal(env.id, 'm-1');
    assert.equal(env.proposalId, 'p-1');
  });

  it('toolOkStructured returns content text + structuredContent', () => {
    const out = toolOkStructured({ ok: true, result: 1 });
    assert.equal(out.structuredContent?.ok, true);
    assert.match(out.content[0].text, /"ok": true/);
  });
});
