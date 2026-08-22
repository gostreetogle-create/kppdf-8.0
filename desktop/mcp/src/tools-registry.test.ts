/**
 * TZD-31 — registry / healthz smoke.
 *
 * Гарантирует, что /healthz toolCount отражает реестр имён (единый источник)
 * и что ключевые tools волны TZD-17…30 видны в toolsSample, а сам сервер
 * создаётся без ошибок. Реестр собирается из *_TOOL_NAMES экспортов каждого
 * register-файла — здесь только проверки, без ручного дублирования списка.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import {
  buildHealthzPayload,
  createKppdfMcpServer,
  listRegisteredToolNames,
  toolsSample,
} from './tools.js';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://127.0.0.1:3000',
  apiKey: 'test-pairing-key',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

describe('MCP tool registry (TZD-31)', () => {
  it('registry count matches all current tools (98 incl. aliases and kppdf_ping)', () => {
    const names = listRegisteredToolNames();
    assert.equal(names.length, 98);
    for (const name of [
      'kppdf_list_doc_types',
      'kppdf_doc_types_list',
      'kppdf_list_import_tasks',
      'kppdf_import_task_list',
      'kppdf_list_text_block_categories',
      'kppdf_text_block_categories_list',
      'kppdf_find_duplicates',
      'kppdf_cleanup_test_data',
      'kppdf_propose_photo_upload',
      'kppdf_confirm_photo_upload',
    ]) {
      assert.ok(names.includes(name), `${name} missing`);
    }
  });

  it('registry includes TZD-17..30 key tools', () => {
    const names = new Set(listRegisteredToolNames());
    assert.ok(names.has('kppdf_list_categories'), 'kppdf_list_categories missing');
    assert.ok(
      names.has('kppdf_propose_product_create'),
      'kppdf_propose_product_create missing',
    );
    // ещё пара сигнатурных имён волны
    assert.ok(names.has('kppdf_import_task_apply_plan'), 'apply_plan missing');
    assert.ok(names.has('kppdf_doc_template_create_draft'), 'doc draft missing');
  });

  it('createKppdfMcpServer constructs without throwing', () => {
    assert.doesNotThrow(() => createKppdfMcpServer(cfg));
  });

  it('toolsSample puts must-include first, no duplicates, respects limit', () => {
    const names = listRegisteredToolNames();
    const sample = toolsSample(names, 10, [
      'kppdf_list_categories',
      'kppdf_propose_product_create',
    ]);
    assert.ok(sample.length <= 10);
    assert.equal(sample[0], 'kppdf_list_categories');
    assert.equal(sample[1], 'kppdf_propose_product_create');
    assert.equal(new Set(sample).size, sample.length, 'duplicates in sample');
    // несуществующее имя не попадает в sample
    const filtered = toolsSample(names, 10, ['kppdf_not_a_real_tool']);
    assert.ok(!filtered.includes('kppdf_not_a_real_tool'));
  });
});

describe('MCP healthz payload (TZD-31)', () => {
  it('payload has ok/port/toolCount/packageVersion/hostDir/toolsSample', () => {
    const payload = buildHealthzPayload({
      port: 9743,
      packageVersion: '0.1.0',
      hostDir: 'D:\\kppdf-8.0\\desktop\\mcp',
    });
    assert.equal(payload.ok, true);
    assert.equal(payload.service, 'kppdf-desktop-mcp');
    assert.equal(payload.port, 9743);
    assert.equal(payload.toolCount, listRegisteredToolNames().length);
    assert.equal(payload.packageVersion, '0.1.0');
    assert.equal(payload.hostDir, 'D:\\kppdf-8.0\\desktop\\mcp');
    assert.ok(
      payload.toolsSample.includes('kppdf_list_categories'),
      'toolsSample lacks kppdf_list_categories',
    );
    assert.ok(
      payload.toolsSample.includes('kppdf_propose_product_create'),
      'toolsSample lacks kppdf_propose_product_create',
    );
  });
});
