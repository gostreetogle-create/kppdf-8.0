import assert from 'node:assert/strict';
import test from 'node:test';
import { LOCAL_MODELS, formatBytes, modelById, recommendModel } from './model-catalog';

test('catalog has three models with unique ids and valid URLs', () => {
  assert.equal(LOCAL_MODELS.length, 3);
  const ids = new Set(LOCAL_MODELS.map((m) => m.id));
  assert.equal(ids.size, 3);
  for (const model of LOCAL_MODELS) {
    assert.ok(model.url.startsWith('https://huggingface.co/'), `${model.id} url`);
    assert.ok(model.fileName.endsWith('.gguf'), `${model.id} gguf`);
    assert.ok(model.sizeBytes > 0, `${model.id} size`);
    assert.ok(model.minRamGb > 0, `${model.id} ram`);
  }
  assert.ok(modelById('qwen2.5-3b'));
  assert.equal(modelById('nope'), undefined);
});

test('recommendation picks the heaviest model that fits RAM', () => {
  assert.equal(recommendModel(32).id, 'qwen2.5-3b');
  assert.equal(recommendModel(10).id, 'qwen2.5-3b'); // средний ПК — 3B (как у PO)
  assert.equal(recommendModel(5).id, 'qwen2.5-1.5b');
  assert.equal(recommendModel(1).id, 'qwen2.5-0.5b');
});

test('formatBytes renders GB and MB', () => {
  assert.equal(formatBytes(1_990_000_000), '1.99 ГБ');
  assert.equal(formatBytes(450_000_000), '450 МБ');
});
