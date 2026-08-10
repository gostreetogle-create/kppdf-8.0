/**
 * Commercial MCP tools — read + draft HITL (TZD-33).
 *
 * Контур «КП / заказ / клиент» пока без mutation-journal kinds (это отдельная
 * BE-волна): reads везде; writes — только draft (или create counterparty/site
 * с предупреждением); опасные действия (ship / convert / set_status) — только
 * с `userOk: true`, иначе toolFail и 0 запросов к backend.
 *
 * Термины (канон): «КП» = Quotation (`/api/quotations`), «Клиент» = Counterparty,
 * «Площадка» = Site, «Наша фирма» = Organization (read / organizationId only).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { withQuery } from './query.js';
import { toolFail, toolOk } from './tool-result.js';

export const COMMERCIAL_TOOL_NAMES = [
  'kppdf_list_counterparties',
  'kppdf_get_counterparty',
  'kppdf_list_persons',
  'kppdf_list_sites',
  'kppdf_list_quotations',
  'kppdf_get_quotation',
  'kppdf_list_orders',
  'kppdf_get_order',
  'kppdf_list_contracts',
  'kppdf_counterparty_create',
  'kppdf_site_create',
  'kppdf_quotation_create_draft',
  'kppdf_order_create_draft',
  'kppdf_quotation_set_status',
  'kppdf_quotation_convert_to_order',
  'kppdf_quotation_convert_to_contract',
  'kppdf_order_ship',
] as const;

// ── slim-ответы: id + выбранные поля, без HTML-snapshot КП ───────────────────

function docId(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return undefined;
  const d = raw as Record<string, unknown>;
  return d._id ?? d.id;
}

function slimPick(raw: unknown, keys: readonly string[]): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const d = raw as Record<string, unknown>;
  const out: Record<string, unknown> = { id: docId(d) };
  for (const k of keys) {
    if (d[k] !== undefined) out[k] = d[k];
  }
  return out;
}

function slimList(payload: unknown, keys: readonly string[]): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const env = payload as Record<string, unknown>;
  const items = Array.isArray(env.items)
    ? env.items
    : Array.isArray(payload)
      ? (payload as unknown[])
      : null;
  if (!items) return slimPick(payload, keys);
  const mapped = items.map((item) => slimPick(item, keys));
  if (Array.isArray(env.items)) return { ...env, items: mapped };
  return mapped;
}

const pageLimitSearch = {
  page: z.number().int().min(1).optional().describe('Page number (default backend)'),
  limit: z.number().int().min(1).max(100).optional().describe('Page size, max 100'),
  search: z.string().optional().describe('Search by name'),
};

const counterpartyKeys = [
  'name',
  'shortName',
  'inn',
  'roles',
  'isActive',
  'type',
  'legalType',
  'legalForm',
] as const;
const personKeys = [
  'firstName',
  'lastName',
  'middleName',
  'phone',
  'position',
  'email',
  'isActive',
] as const;
const siteKeys = ['name', 'address', 'counterpartyId'] as const;
const quotationKeys = [
  'number',
  'title',
  'status',
  'counterpartyId',
  'organizationId',
  'date',
  'validUntil',
  'discountType',
  'discountPercent',
  'discountAmount',
] as const;
const orderKeys = [
  'number',
  'status',
  'counterpartyId',
  'siteId',
  'date',
  'plannedDate',
  'deliveryAddress',
  'notes',
  'priority',
  'materialsSource',
] as const;
const contractKeys = [
  'number',
  'title',
  'status',
  'counterpartyId',
  'organizationId',
  'date',
] as const;

// ── zod входы (whitelist; draft-инструменты НЕ принимают status) ─────────────

const quotationItemSchema = z.object({
  productId: z.string().min(1).describe('Product id'),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  quantity: z.number().min(0).describe('Quantity'),
  unit: z.string().optional(),
  unitPrice: z.number().min(0).describe('Unit price (VAT-inclusive by canon)'),
  markupPercent: z.number().min(0).optional(),
  sortOrder: z.number().min(0).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1).describe('Product id'),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  quantity: z.number().min(0).describe('Quantity'),
  unit: z.string().optional(),
  unitPrice: z.number().min(0).optional().describe('Optional since TZ-ORDERS-301 (strip-commerce orders)'),
  plannedShipDate: z.string().optional().describe('ISO date'),
  readyForWork: z.boolean().optional(),
});

const quotationDraftInput = z.object({
  organizationId: z.string().min(1).describe('Our organization id («наша фирма»)'),
  items: z.array(quotationItemSchema).min(1).describe('Quotation line items'),
  counterpartyId: z.string().optional().describe('Client (Counterparty) id'),
  title: z.string().optional(),
  notes: z.string().optional(),
  discountType: z.enum(['none', 'percent', 'amount']).optional(),
  discountPercent: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
});

const orderDraftInput = z.object({
  counterpartyId: z.string().min(1).describe('Client (Counterparty) id'),
  siteId: z.string().min(1).describe('Site id'),
  items: z.array(orderItemSchema).min(1).describe('Order line items'),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  date: z.string().optional().describe('ISO date'),
  plannedDate: z.string().optional().describe('ISO date'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  materialsSource: z.enum(['own', 'customer']).optional(),
});

// ── payload builders (экспортированы для unit-тестов) ────────────────────────

const counterpartyCreateInput = z.object({
  name: z.string().min(1).describe('Counterparty name'),
  inn: z.string().min(1).describe('INN (10/12 digits)'),
  roles: z.array(z.string().min(1)).min(1).describe('Role codes (e.g. customer, supplier)'),
  shortName: z.string().optional(),
  legalForm: z.string().optional(),
  legalType: z.enum(['ooo', 'ip', 'pao', 'ao', 'other']).optional(),
  type: z.array(z.string()).optional(),
  partyTypes: z.array(z.string()).optional(),
  phone: z.string().max(32).optional(),
  paymentTermDays: z.number().int().min(0).max(365).optional(),
  vatRate: z.number().int().min(0).max(100).optional(),
});

/** POST /api/counterparties — whitelist; SoT write сразу (нет journal). */
export function buildCounterpartyCreateBody(args: z.infer<typeof counterpartyCreateInput>): Record<string, unknown> {
  return {
    name: args.name,
    inn: args.inn,
    roles: args.roles,
    ...(args.shortName ? { shortName: args.shortName } : {}),
    ...(args.legalForm ? { legalForm: args.legalForm } : {}),
    ...(args.legalType ? { legalType: args.legalType } : {}),
    ...(args.type ? { type: args.type } : {}),
    ...(args.partyTypes ? { partyTypes: args.partyTypes } : {}),
    ...(args.phone ? { phone: args.phone } : {}),
    ...(args.paymentTermDays !== undefined ? { paymentTermDays: args.paymentTermDays } : {}),
    ...(args.vatRate !== undefined ? { vatRate: args.vatRate } : {}),
  };
}

/** POST /api/quotations — status ПРИНУДИТЕЛЬНО 'draft'; input status не принимается. */
export function buildQuotationDraftBody(args: z.infer<typeof quotationDraftInput>): Record<string, unknown> {
  return {
    organizationId: args.organizationId,
    items: args.items,
    status: 'draft',
    ...(args.counterpartyId ? { counterpartyId: args.counterpartyId } : {}),
    ...(args.title ? { title: args.title } : {}),
    ...(args.notes ? { notes: args.notes } : {}),
    ...(args.discountType ? { discountType: args.discountType } : {}),
    ...(args.discountPercent !== undefined ? { discountPercent: args.discountPercent } : {}),
    ...(args.discountAmount !== undefined ? { discountAmount: args.discountAmount } : {}),
  };
}

/** POST /api/orders — status ПРИНУДИТЕЛЬНО 'draft'. */
export function buildOrderDraftBody(args: z.infer<typeof orderDraftInput>): Record<string, unknown> {
  return {
    counterpartyId: args.counterpartyId,
    siteId: args.siteId,
    items: args.items,
    status: 'draft',
    ...(args.notes ? { notes: args.notes } : {}),
    ...(args.deliveryAddress ? { deliveryAddress: args.deliveryAddress } : {}),
    ...(args.date ? { date: args.date } : {}),
    ...(args.plannedDate ? { plannedDate: args.plannedDate } : {}),
    ...(args.priority ? { priority: args.priority } : {}),
    ...(args.materialsSource ? { materialsSource: args.materialsSource } : {}),
  };
}

/**
 * userOk-гейт: без явного подтверждения человека — toolFail, и 0 backend call
 * (handler возвращается до запроса).
 */
export function userOkGate(
  toolName: string,
  userOk: boolean | undefined,
): ReturnType<typeof toolFail> | null {
  if (userOk === true) return null;
  return toolFail(
    toolName,
    new Error('userOk:true is required — this action writes SoT; confirm with the user first'),
  );
}

export function registerCommercialTools(server: McpServer, cfg: McpRuntimeConfig): void {
  // ── Read ───────────────────────────────────────────────────────────────────
  server.registerTool(
    'kppdf_list_counterparties',
    {
      title: 'List counterparties (clients)',
      description:
        'TZD-33: GET /api/counterparties — page/limit/search; slim fields ' +
        '(id, name, shortName, inn, roles). Read-only.',
      inputSchema: pageLimitSearch,
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/counterparties', { page, limit, search });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, counterpartyKeys) });
      } catch (err) {
        return toolFail('kppdf_list_counterparties', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_counterparty',
    {
      title: 'Get counterparty',
      description: 'TZD-33: GET /api/counterparties/:id — slim fields. Read-only.',
      inputSchema: { id: z.string().min(1).describe('Counterparty id') },
    },
    async ({ id }) => {
      try {
        const path = `/api/counterparties/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimPick(result, counterpartyKeys) });
      } catch (err) {
        return toolFail('kppdf_get_counterparty', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_persons',
    {
      title: 'List persons',
      description: 'TZD-33: GET /api/persons — page/limit/search; slim fields. Read-only.',
      inputSchema: pageLimitSearch,
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/persons', { page, limit, search });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, personKeys) });
      } catch (err) {
        return toolFail('kppdf_list_persons', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_sites',
    {
      title: 'List sites',
      description:
        'TZD-33: GET /api/sites?counterpartyId= — sites of a client ' +
        '(backend returns [] without counterpartyId). Read-only.',
      inputSchema: {
        counterpartyId: z.string().optional().describe('Filter by counterparty'),
      },
    },
    async ({ counterpartyId }) => {
      try {
        const path = withQuery('/api/sites', { counterpartyId });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, siteKeys) });
      } catch (err) {
        return toolFail('kppdf_list_sites', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_quotations',
    {
      title: 'List quotations (КП)',
      description:
        'TZD-33: GET /api/quotations — optional counterpartyId/status filters; ' +
        'slim fields, НЕ тянет HTML snapshot. Read-only.',
      inputSchema: {
        counterpartyId: z.string().optional(),
        status: z.string().optional().describe('draft|sent|accepted|rejected|converted|cancelled'),
      },
    },
    async ({ counterpartyId, status }) => {
      try {
        const path = withQuery('/api/quotations', { counterpartyId, status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, quotationKeys) });
      } catch (err) {
        return toolFail('kppdf_list_quotations', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_quotation',
    {
      title: 'Get quotation (КП)',
      description:
        'TZD-33: GET /api/quotations/:id — slim fields, БЕЗ HTML snapshot. Read-only.',
      inputSchema: { id: z.string().min(1).describe('Quotation id') },
    },
    async ({ id }) => {
      try {
        const path = `/api/quotations/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimPick(result, quotationKeys) });
      } catch (err) {
        return toolFail('kppdf_get_quotation', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_orders',
    {
      title: 'List orders',
      description:
        'TZD-33: GET /api/orders — optional counterpartyId/status filters; slim fields. Read-only.',
      inputSchema: {
        counterpartyId: z.string().optional(),
        status: z.string().optional().describe('draft|confirmed|in_production|ready|shipped|delivered|cancelled'),
      },
    },
    async ({ counterpartyId, status }) => {
      try {
        const path = withQuery('/api/orders', { counterpartyId, status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, orderKeys) });
      } catch (err) {
        return toolFail('kppdf_list_orders', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_order',
    {
      title: 'Get order',
      description: 'TZD-33: GET /api/orders/:id — slim fields. Read-only.',
      inputSchema: { id: z.string().min(1).describe('Order id') },
    },
    async ({ id }) => {
      try {
        const path = `/api/orders/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimPick(result, orderKeys) });
      } catch (err) {
        return toolFail('kppdf_get_order', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_contracts',
    {
      title: 'List contracts',
      description:
        'TZD-33: GET /api/contracts — optional counterpartyId/status filters; slim fields. Read-only.',
      inputSchema: {
        counterpartyId: z.string().optional(),
        status: z.string().optional(),
      },
    },
    async ({ counterpartyId, status }) => {
      try {
        const path = withQuery('/api/contracts', { counterpartyId, status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimList(result, contractKeys) });
      } catch (err) {
        return toolFail('kppdf_list_contracts', err);
      }
    },
  );

  // ── Draft writes (нет journal — прямое создание черновика/контрагента) ─────

  server.registerTool(
    'kppdf_counterparty_create',
    {
      title: 'Create counterparty (client)',
      description:
        'TZD-33: POST /api/counterparties — пишет SoT СРАЗУ (нет journal-undo). ' +
        'Whitelist: name*, inn*, roles*, shortName, legalForm, legalType, type, ' +
        'partyTypes, phone, paymentTermDays, vatRate.',
      inputSchema: counterpartyCreateInput,
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/counterparties',
          buildCounterpartyCreateBody(args),
        );
        return toolOk({
          ok: true,
          note: 'SoT write (no journal) — verify INN before POST',
          result,
        });
      } catch (err) {
        return toolFail('kppdf_counterparty_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_site_create',
    {
      title: 'Create site',
      description:
        'TZD-33: POST /api/sites { counterpartyId, name, address } — пишет SoT сразу. ' +
        'Площадка привязывается к клиенту (Counterparty).',
      inputSchema: {
        counterpartyId: z.string().min(1).describe('Counterparty id'),
        name: z.string().min(1).max(256).describe('Site name'),
        address: z.string().min(1).max(512).describe('Site address'),
      },
    },
    async (args) => {
      try {
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, '/api/sites', args);
        return toolOk({ ok: true, result });
      } catch (err) {
        return toolFail('kppdf_site_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_quotation_create_draft',
    {
      title: 'Create quotation draft (КП)',
      description:
        'TZD-33: POST /api/quotations с ПРИНУДИТЕЛЬНЫМ status=draft (нельзя создать ' +
        'accepted/converted этим tool). Менеджер доводит и публикует в вебе. ' +
        'Required: organizationId + items[]; optional counterpartyId/title/notes/discount*.',
      inputSchema: quotationDraftInput,
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/quotations',
          buildQuotationDraftBody(args),
        );
        return toolOk({ ok: true, draft: true, note: 'status forced to draft', result });
      } catch (err) {
        return toolFail('kppdf_quotation_create_draft', err);
      }
    },
  );

  server.registerTool(
    'kppdf_order_create_draft',
    {
      title: 'Create order draft',
      description:
        'TZD-33: POST /api/orders с ПРИНУДИТЕЛЬНЫМ status=draft. ' +
        'Required: counterpartyId, siteId, items[].',
      inputSchema: orderDraftInput,
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/orders',
          buildOrderDraftBody(args),
        );
        return toolOk({ ok: true, draft: true, note: 'status forced to draft', result });
      } catch (err) {
        return toolFail('kppdf_order_create_draft', err);
      }
    },
  );

  // ── Gated mutations (только с userOk: true) ────────────────────────────────

  server.registerTool(
    'kppdf_quotation_set_status',
    {
      title: 'Set quotation status (gated)',
      description:
        'TZD-33: PATCH /api/quotations/:id { status } — только whitelist ' +
        'draft|sent|accepted|rejected. ТРЕБУЕТ userOk:true (иначе error, 0 write).',
      inputSchema: {
        id: z.string().min(1).describe('Quotation id'),
        status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
        userOk: z.boolean().describe('Must be true — human approved'),
      },
    },
    async ({ id, status, userOk }) => {
      const gate = userOkGate('kppdf_quotation_set_status', userOk);
      if (gate) return gate;
      try {
        const path = `/api/quotations/${encodeURIComponent(id)}`;
        const result = await backendPatchJson(cfg.apiBaseUrl, cfg.apiKey, path, { status });
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_quotation_set_status', err);
      }
    },
  );

  server.registerTool(
    'kppdf_quotation_convert_to_order',
    {
      title: 'Convert quotation to order (gated)',
      description:
        'TZD-33: POST /api/quotations/:id/convert-to-order. ТРЕБУЕТ userOk:true.',
      inputSchema: {
        id: z.string().min(1).describe('Quotation id'),
        deliveryAddress: z.string().optional(),
        managerId: z.string().optional(),
        userOk: z.boolean().describe('Must be true — human approved'),
      },
    },
    async ({ id, deliveryAddress, managerId, userOk }) => {
      const gate = userOkGate('kppdf_quotation_convert_to_order', userOk);
      if (gate) return gate;
      try {
        const path = `/api/quotations/${encodeURIComponent(id)}/convert-to-order`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {
          ...(deliveryAddress ? { deliveryAddress } : {}),
          ...(managerId ? { managerId } : {}),
        });
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_quotation_convert_to_order', err);
      }
    },
  );

  server.registerTool(
    'kppdf_quotation_convert_to_contract',
    {
      title: 'Convert quotation to contract (gated)',
      description:
        'TZD-33: POST /api/quotations/:id/convert-to-contract. ТРЕБУЕТ userOk:true.',
      inputSchema: {
        id: z.string().min(1).describe('Quotation id'),
        title: z.string().optional(),
        userOk: z.boolean().describe('Must be true — human approved'),
      },
    },
    async ({ id, title, userOk }) => {
      const gate = userOkGate('kppdf_quotation_convert_to_contract', userOk);
      if (gate) return gate;
      try {
        const path = `/api/quotations/${encodeURIComponent(id)}/convert-to-contract`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {
          ...(title ? { title } : {}),
        });
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_quotation_convert_to_contract', err);
      }
    },
  );

  server.registerTool(
    'kppdf_order_ship',
    {
      title: 'Ship order (gated)',
      description:
        'TZD-33: POST /api/orders/:id/ship { recipient?, address?, warehouseId?, ' +
        'driverInfo? }. ТРЕБУЕТ userOk:true (отгрузка — необратимое действие).',
      inputSchema: {
        id: z.string().min(1).describe('Order id'),
        recipient: z.string().optional(),
        address: z.string().optional(),
        warehouseId: z.string().optional(),
        driverInfo: z.string().optional(),
        userOk: z.boolean().describe('Must be true — human approved'),
      },
    },
    async ({ id, recipient, address, warehouseId, driverInfo, userOk }) => {
      const gate = userOkGate('kppdf_order_ship', userOk);
      if (gate) return gate;
      try {
        const path = `/api/orders/${encodeURIComponent(id)}/ship`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {
          ...(recipient ? { recipient } : {}),
          ...(address ? { address } : {}),
          ...(warehouseId ? { warehouseId } : {}),
          ...(driverInfo ? { driverInfo } : {}),
        });
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_order_ship', err);
      }
    },
  );
}
