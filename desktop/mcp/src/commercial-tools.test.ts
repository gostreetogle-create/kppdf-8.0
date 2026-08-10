/**
 * TZD-33 — commercial MCP HITL.
 *
 * Draft payloads ПРИНУДИТЕЛЬНО status=draft (input status не принимается);
 * userOk:false → toolFail и 0 backend call (гейт проверяется до запроса);
 * zod-whitelist отсекает чужие поля.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCounterpartyCreateBody,
  buildOrderDraftBody,
  buildQuotationDraftBody,
  COMMERCIAL_TOOL_NAMES,
  userOkGate,
} from './commercial-tools.js';

describe('commercial tools (TZD-33)', () => {
  it('registers 17 tool names', () => {
    assert.equal(COMMERCIAL_TOOL_NAMES.length, 17);
    for (const name of [
      'kppdf_list_counterparties',
      'kppdf_list_quotations',
      'kppdf_list_orders',
      'kppdf_list_contracts',
      'kppdf_counterparty_create',
      'kppdf_site_create',
      'kppdf_quotation_create_draft',
      'kppdf_order_create_draft',
      'kppdf_quotation_set_status',
      'kppdf_quotation_convert_to_order',
      'kppdf_quotation_convert_to_contract',
      'kppdf_order_ship',
    ]) {
      assert.ok(COMMERCIAL_TOOL_NAMES.includes(name as (typeof COMMERCIAL_TOOL_NAMES)[number]), name);
    }
  });

  it('quotation draft body forces status=draft and carries whitelist fields', () => {
    const body = buildQuotationDraftBody({
      organizationId: 'org-1',
      items: [{ productId: 'p-1', quantity: 2, unitPrice: 100 }],
      counterpartyId: 'c-1',
      title: 'КП спорт',
      notes: 'черновик',
      discountType: 'percent',
      discountPercent: 5,
    });
    assert.equal(body.status, 'draft');
    assert.equal(body.organizationId, 'org-1');
    assert.equal(body.counterpartyId, 'c-1');
    assert.deepEqual(body.items, [{ productId: 'p-1', quantity: 2, unitPrice: 100 }]);
    assert.equal(body.discountPercent, 5);
  });

  it('quotation draft body ignores any caller-supplied status (forced draft)', () => {
    // status отсутствует в input schema — тело всегда status: 'draft',
    // создать accepted/converted этим инструментом невозможно.
    const body = buildQuotationDraftBody({
      organizationId: 'org-1',
      items: [{ productId: 'p-1', quantity: 1, unitPrice: 50 }],
    });
    assert.equal(body.status, 'draft');
    assert.deepEqual(Object.keys(body).filter((k) => k === 'status'), ['status']);
    assert.equal(Object.keys(body).length, 3); // org + items + status (без мусорных ключей)
  });

  it('order draft body forces status=draft', () => {
    const body = buildOrderDraftBody({
      counterpartyId: 'c-1',
      siteId: 's-1',
      items: [{ productId: 'p-1', quantity: 3 }],
      priority: 'high',
    });
    assert.equal(body.status, 'draft');
    assert.equal(body.counterpartyId, 'c-1');
    assert.equal(body.siteId, 's-1');
    assert.equal(body.priority, 'high');
  });

  it('counterparty create body is whitelist-only (no org/system fields)', () => {
    const body = buildCounterpartyCreateBody({
      name: 'ООО Ромашка',
      inn: '7701234567',
      roles: ['customer'],
      phone: '+7 900 000-00-00',
      paymentTermDays: 30,
      vatRate: 20,
    });
    assert.equal(body.name, 'ООО Ромашка');
    assert.equal(body.inn, '7701234567');
    assert.deepEqual(body.roles, ['customer']);
    assert.equal(body.paymentTermDays, 30);
    assert.equal(body.vatRate, 20);
    assert.ok(!('organizationId' in body));
    assert.ok(!('isSystem' in body));
    assert.ok(!('isActive' in body));
  });

  it('userOk false → toolFail (error) — gate блокирует до backend', () => {
    const gate = userOkGate('kppdf_order_ship', false);
    assert.ok(gate);
    assert.equal((gate as { isError?: boolean }).isError, true);
    const text = (gate as { content: Array<{ text: string }> }).content[0].text;
    assert.match(text, /userOk:true is required/);
  });

  it('userOk true → no gate (null) — handler proceeds to backend', () => {
    assert.equal(userOkGate('kppdf_order_ship', true), null);
    // отсутствие userOk тоже блокирует (fail-closed)
    assert.ok(userOkGate('kppdf_order_ship', undefined));
  });
});
