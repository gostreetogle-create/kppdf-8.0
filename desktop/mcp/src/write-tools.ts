/**
 * Write protocol MCP tools — propose / confirm / undo (TZD-13).
 *
 * TZD-41: все success-ответы идут через канонический envelope
 *   propose → top-level `proposalId` (result = полный journal response)
 *   confirm/cancel/undo → top-level `id` / `proposalId`
 *   batch → top-level `proposalIds` / `applied` / `cancelled` + `result`
 * Все тулы с outputSchema возвращают structuredContent (SDK валидирует).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  batchEnvelopeSchema,
  createEnvelopeSchema,
  draftEnvelopeSchema,
  mutationEnvelopeSchema,
  plainOkSchema,
  proposeEnvelopeSchema,
  toolFail,
  toolOkStructured,
  createEnvelope,
  mutationEnvelope,
  proposeEnvelope,
} from './tool-result.js';

export const WRITE_TOOL_NAMES = [
  'kppdf_propose_material_create',
  'kppdf_propose_material_update',
  'kppdf_confirm_proposal',
  'kppdf_cancel_proposal',
  'kppdf_undo_mutation',
  'kppdf_list_mutations',
  'kppdf_propose_material_batch',
  'kppdf_confirm_batch',
  'kppdf_cancel_batch',
  'kppdf_propose_product_create',
  'kppdf_propose_product_update',
  'kppdf_propose_module_create',
  'kppdf_confirm_module_create',
  'kppdf_propose_composition_line',
  'kppdf_confirm_composition_line',
] as const;

const PRODUCT_KINDS_ENUM = z.enum(['good', 'service', 'work']);
const COMPOSITION_PARENT_ENUM = z.enum(['product', 'module']);
const COMPOSITION_LINE_ENUM = z.enum(['material', 'module', 'product']);
export const compositionLineInput = {
  parentType: COMPOSITION_PARENT_ENUM.describe('Parent catalog entity'),
  parentId: z.string().min(1).describe('Product or module id'),
  lineType: COMPOSITION_LINE_ENUM.describe('Child catalog entity type'),
  refId: z.string().min(1).describe('Child entity id'),
  quantity: z.number().positive().describe('Quantity (> 0)'),
  unit: z.string().optional(),
};

export type CompositionLineDraft = {
  parentType: 'product' | 'module';
  parentId: string;
  lineType: 'material' | 'module' | 'product';
  refId: string;
  quantity: number;
  unit?: string;
};

export function buildCompositionLineProposal(args: CompositionLineDraft) {
  if (args.parentType === 'module' && args.lineType === 'product') {
    throw new Error('Product lines are not allowed on module composition');
  }
  return { kind: 'composition.add' as const, ...args };
}

/** TZD-32: зеркало ProposeMaterialCreateDto whitelist (backend). */
const MATERIAL_KINDS_ENUM = z.enum(['raw', 'part', 'fastener', 'purchased', 'other']);

const DIMENSION_TYPES = ['length', 'width', 'height', 'thickness', 'diameter', 'depth'] as const;

const dimensionSchema = z.object({
  type: z.enum(DIMENSION_TYPES).describe('Dimension type'),
  value: z.number().min(0).describe('Dimension value'),
  isImmutable: z.boolean().optional().describe('Fixed dimension (not resizable)'),
});

/** Поля material.create (общие для single propose и batch item). */
export const materialCreateFields = {
  name: z.string().min(1).describe('Material name'),
  unit: z.string().optional().describe('Unit (default шт — pieces)'),
  article: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  pricePerUnit: z
    .number()
    .min(0)
    .optional()
    .describe('Price per unit (RUB), optional — propose only'),
  materialKind: MATERIAL_KINDS_ENUM.optional().describe(
    'Catalog kind: raw | part | fastener | purchased | other',
  ),
  description: z.string().max(2000).optional().describe('Material description'),
  dimensions: z.array(dimensionSchema).optional().describe('Material dimensions'),
};

export const materialCreateInput = z.object(materialCreateFields);

export const batchItemSchema = z.object(materialCreateFields);

/**
 * TZD-32: тело propose material.create (payload зеркалит DTO; новые поля
 * опциональны — без них поведение как раньше).
 */
export function buildMaterialCreateProposal(args: z.infer<typeof materialCreateInput>): {
  kind: 'material.create';
  toolName: string;
  create: Record<string, unknown>;
} {
  return {
    kind: 'material.create',
    toolName: 'kppdf_propose_material_create',
    create: {
      name: args.name,
      unit: args.unit?.trim() || 'шт',
      article: args.article,
      sku: args.sku,
      categoryId: args.categoryId,
      ...(args.pricePerUnit !== undefined ? { pricePerUnit: args.pricePerUnit } : {}),
      ...(args.materialKind ? { materialKind: args.materialKind } : {}),
      ...(args.description ? { description: args.description } : {}),
      ...(args.dimensions ? { dimensions: args.dimensions } : {}),
    },
  };
}

/** Общий контур propose→journal: top-level proposalId (TZD-41). */
async function proposeJournal(
  cfg: McpRuntimeConfig,
  toolName: string,
  payload: Record<string, unknown>,
) {
  const result = await backendPostJson(
    cfg.apiBaseUrl,
    cfg.apiKey,
    '/api/mutation-journal/proposals',
    payload,
  );
  return toolOkStructured(proposeEnvelope(result));
}

export function registerWriteTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_propose_material_create',
    {
      title: 'Propose material create',
      description:
        'Creates a proposal only (no SoT write). Confirm with kppdf_confirm_proposal. ' +
        'Response envelope (TZD-41): top-level proposalId + full journal result.',
      inputSchema: materialCreateInput,
      outputSchema: proposeEnvelopeSchema,
    },
    async (args) => {
      try {
        return await proposeJournal(cfg, 'kppdf_propose_material_create', buildMaterialCreateProposal(args));
      } catch (err) {
        return toolFail('kppdf_propose_material_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_material_update',
    {
      title: 'Propose material update',
      description:
        'Proposes a PATCH; stores before snapshot. Confirm with kppdf_confirm_proposal. ' +
        'Response envelope (TZD-41): top-level proposalId.',
      inputSchema: {
        id: z.string().min(1).describe('Material id'),
        patch: z.record(z.string(), z.unknown()).describe('Partial material fields'),
      },
      outputSchema: proposeEnvelopeSchema,
    },
    async ({ id, patch }) => {
      try {
        return await proposeJournal(cfg, 'kppdf_propose_material_update', {
          kind: 'material.update',
          toolName: 'kppdf_propose_material_update',
          update: { id, patch },
        });
      } catch (err) {
        return toolFail('kppdf_propose_material_update', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_material_batch',
    {
      title: 'Propose material create (batch)',
      description:
        'TZD-18: creates material.create PROPOSALS for many rows in one backend call ' +
        '(all-or-nothing best-effort — on error created proposals are rolled back). ' +
        'No SoT write until kppdf_confirm_batch. Optional idempotencyKey for safe retries. ' +
        'Top-level proposalIds (TZD-41).',
      inputSchema: {
        items: z.array(batchItemSchema).min(1).max(500),
        idempotencyKey: z.string().optional(),
      },
      outputSchema: batchEnvelopeSchema,
    },
    async ({ items, idempotencyKey }) => {
      try {
        const result = (await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/propose-batch',
          {
            items: items.map((item) => ({
              kind: 'material.create',
              toolName: 'kppdf_propose_material_batch',
              create: buildMaterialCreateProposal(item).create,
            })),
            ...(idempotencyKey ? { idempotencyKey } : {}),
          },
        )) as Record<string, unknown> | null;
        const rest = result && typeof result === 'object' ? result : {};
        return toolOkStructured({ ok: true, result, ...rest });
      } catch (err) {
        return toolFail('kppdf_propose_material_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_confirm_batch',
    {
      title: 'Confirm proposals (batch)',
      description:
        'TZD-18: applies many proposals via the journal (POST confirm-batch). ' +
        'This is the SoT write step — only call after the user approved the plan.',
      inputSchema: {
        ids: z.array(z.string().min(1)).min(1).max(500),
      },
      outputSchema: batchEnvelopeSchema,
    },
    async ({ ids }) => {
      try {
        const result = (await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/confirm-batch',
          { ids },
        )) as Record<string, unknown> | null;
        const rest = result && typeof result === 'object' ? result : {};
        return toolOkStructured({ ok: true, result, ...rest });
      } catch (err) {
        return toolFail('kppdf_confirm_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_cancel_batch',
    {
      title: 'Cancel proposals (batch)',
      description:
        'TZD-18: cancels many pending proposals in one backend call. No SoT change.',
      inputSchema: {
        ids: z.array(z.string().min(1)).min(1).max(500),
      },
      outputSchema: batchEnvelopeSchema,
    },
    async ({ ids }) => {
      try {
        const result = (await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/cancel-batch',
          { ids },
        )) as Record<string, unknown> | null;
        const rest = result && typeof result === 'object' ? result : {};
        return toolOkStructured({ ok: true, result, ...rest });
      } catch (err) {
        return toolFail('kppdf_cancel_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_product_create',
    {
      title: 'Propose product create',
      description:
        'TZD-27: creates a product.create PROPOSAL (name + kind required, unit ' +
        'defaults to шт). No SoT write — confirm with kppdf_confirm_proposal. ' +
        'Response envelope (TZD-41): top-level proposalId. ' +
        'Check kppdf_get_product_where_used / composition before mass updates.',
      inputSchema: {
        name: z.string().min(1).describe('Product name'),
        kind: PRODUCT_KINDS_ENUM.describe('good | service | work'),
        unit: z.string().optional().describe('Unit (default шт)'),
        sku: z.string().optional(),
        notes: z.string().optional(),
      },
      outputSchema: proposeEnvelopeSchema,
    },
    async (args) => {
      try {
        return await proposeJournal(cfg, 'kppdf_propose_product_create', {
          kind: 'product.create',
          toolName: 'kppdf_propose_product_create',
          productCreate: {
            name: args.name,
            kind: args.kind,
            unit: args.unit?.trim() || 'шт',
            sku: args.sku,
            notes: args.notes,
          },
        });
      } catch (err) {
        return toolFail('kppdf_propose_product_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_product_update',
    {
      title: 'Propose product update',
      description:
        'TZD-27: proposes a PATCH on a product passport; stores before snapshot. ' +
        'Confirm with kppdf_confirm_proposal. Response envelope (TZD-41): top-level proposalId. ' +
        'Run kppdf_get_product_composition / ' +
        'kppdf_get_product_where_used first to avoid breaking BOM parents.',
      inputSchema: {
        id: z.string().min(1).describe('Product id'),
        patch: z.record(z.string(), z.unknown()).describe('Partial product passport fields'),
      },
      outputSchema: proposeEnvelopeSchema,
    },
    async ({ id, patch }) => {
      try {
        return await proposeJournal(cfg, 'kppdf_propose_product_update', {
          kind: 'product.update',
          toolName: 'kppdf_propose_product_update',
          productUpdate: { id, patch },
        });
      } catch (err) {
        return toolFail('kppdf_propose_product_update', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_module_create',
    {
      title: 'Propose module create',
      description:
        'Creates a human-reviewable module draft. No request is sent and no SoT write occurs until the confirm tool receives userOk=true.',
      inputSchema: {
        name: z.string().min(1),
        article: z.string().min(1),
      },
      outputSchema: draftEnvelopeSchema,
    },
    async ({ name, article }) =>
      toolOkStructured({
        ok: true,
        proposal: { kind: 'module.create', create: { name: name.trim(), article: article.trim() } },
        note: 'Draft only — ask the user to confirm before calling kppdf_confirm_module_create.',
      }),
  );

  server.registerTool(
    'kppdf_confirm_module_create',
    {
      title: 'Confirm module create',
      description: 'Creates a module only after explicit userOk=true. Response envelope (TZD-41): top-level id.',
      inputSchema: {
        name: z.string().min(1),
        article: z.string().min(1),
        userOk: z.boolean().describe('Human approval — must be true'),
      },
      outputSchema: createEnvelopeSchema,
    },
    async ({ name, article, userOk }) => {
      if (userOk !== true) return toolFail('kppdf_confirm_module_create', new Error('userOk=true is required; no request sent'));
      try {
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, '/api/modules', {
          name: name.trim(),
          article: article.trim(),
        });
        return toolOkStructured({ ...createEnvelope(result), module: result });
      } catch (err) {
        return toolFail('kppdf_confirm_module_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_composition_line',
    {
      title: 'Propose composition line',
      description:
        'Builds a composition-line draft for HITL review. It does not call the backend or write SoT.',
      inputSchema: compositionLineInput,
      outputSchema: draftEnvelopeSchema,
    },
    async (args) =>
      toolOkStructured({
        ok: true,
        proposal: buildCompositionLineProposal(args),
        note: 'Draft only — call kppdf_confirm_composition_line after the user approves this exact line.',
      }),
  );

  server.registerTool(
    'kppdf_confirm_composition_line',
    {
      title: 'Confirm composition line',
      description: 'Writes one approved line through the existing Product/Module composition REST endpoint. Response envelope (TZD-41): top-level id.',
      inputSchema: { ...compositionLineInput, userOk: z.boolean().describe('Human approval — must be true') },
      outputSchema: createEnvelopeSchema,
    },
    async ({ parentType, parentId, lineType, refId, quantity, unit, userOk }) => {
      if (userOk !== true) return toolFail('kppdf_confirm_composition_line', new Error('userOk=true is required; no request sent'));
      try {
        buildCompositionLineProposal({ parentType, parentId, lineType, refId, quantity, unit });
      } catch (err) {
        return toolFail('kppdf_confirm_composition_line', err);
      }
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/${parentType === 'module' ? 'modules' : 'products'}/${encodeURIComponent(parentId)}/composition`,
          { lineType, refId, quantity, ...(unit ? { unit } : {}), sourceCode: refId },
        );
        return toolOkStructured({ ...createEnvelope(result), composition: result });
      } catch (err) {
        return toolFail('kppdf_confirm_composition_line', err);
      }
    },
  );

  server.registerTool(
    'kppdf_confirm_proposal',
    {
      title: 'Confirm proposal',
      description:
        'Applies proposal via Material API and records journal entry. Response envelope ' +
        '(TZD-41): top-level id/proposalId. Use the proposalId returned by the propose tool ' +
        'verbatim — on failure the message echoes the received proposalId (TZD-42).',
      inputSchema: {
        proposalId: z.string().min(1),
      },
      outputSchema: mutationEnvelopeSchema,
    },
    async ({ proposalId }) => {
      try {
        const path = `/api/mutation-journal/proposals/${encodeURIComponent(proposalId)}/confirm`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOkStructured({ ...mutationEnvelope(result), mutation: result });
      } catch (err) {
        // TZD-42: fail текст обязан эхо-тить полученный proposalId — агент должен
        // видеть, что confirm звал именно тот id, что вернул propose.
        const detail = err instanceof Error ? err.message : String(err);
        return toolFail(
          'kppdf_confirm_proposal',
          new Error(`proposalId=${proposalId} → ${detail} (копируйте proposalId из propose-ответа)`),
        );
      }
    },
  );

  server.registerTool(
    'kppdf_cancel_proposal',
    {
      title: 'Cancel proposal',
      description: 'Cancels a pending proposal without mutating SoT. Response envelope (TZD-41): top-level proposalId.',
      inputSchema: {
        proposalId: z.string().min(1),
      },
      outputSchema: proposeEnvelopeSchema,
    },
    async ({ proposalId }) => {
      try {
        const path = `/api/mutation-journal/proposals/${encodeURIComponent(proposalId)}/cancel`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOkStructured(proposeEnvelope(result));
      } catch (err) {
        // TZD-42: эхо полученного proposalId для диагностики (см. confirm_proposal)
        const detail = err instanceof Error ? err.message : String(err);
        return toolFail(
          'kppdf_cancel_proposal',
          new Error(`proposalId=${proposalId} → ${detail}`),
        );
      }
    },
  );

  server.registerTool(
    'kppdf_undo_mutation',
    {
      title: 'Undo mutation',
      description:
        'Reverts an applied journal entry (or last applied if mutationId omitted). Ring buffer limited. ' +
        'Response envelope (TZD-41): top-level id.',
      inputSchema: {
        mutationId: z
          .string()
          .optional()
          .describe('Mutation id; omit to undo last applied'),
      },
      outputSchema: mutationEnvelopeSchema,
    },
    async ({ mutationId }) => {
      try {
        const path = mutationId
          ? `/api/mutation-journal/${encodeURIComponent(mutationId)}/undo`
          : '/api/mutation-journal/undo-last';
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOkStructured({ ...mutationEnvelope(result), mutation: result });
      } catch (err) {
        return toolFail('kppdf_undo_mutation', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_mutations',
    {
      title: 'List mutations',
      description: 'Recent applied/undone journal entries (ring).',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
      },
      outputSchema: plainOkSchema,
    },
    async ({ limit }) => {
      try {
        const q = limit ? `?limit=${limit}` : '';
        const result = await backendGetJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/mutation-journal${q}`,
        );
        return toolOkStructured({ ok: true, result });
      } catch (err) {
        return toolFail('kppdf_list_mutations', err);
      }
    },
  );
}
