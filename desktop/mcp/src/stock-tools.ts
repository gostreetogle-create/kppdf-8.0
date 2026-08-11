/**
 * Stock movement MCP tools (TZD-34).
 *
 * Склад наполняется через `stock-movements` (приход/расход/перевод/корректировка),
 * а НЕ через POST storage-items (на стенде 404). Пишет SoT сразу (нет journal)
 * — для demo/ops ок; не «тихо» обнуляет склад.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { withQuery } from './query.js';
import {
  createEnvelope,
  createEnvelopeSchema,
  readEnvelopeSchema,
  toolFail,
  toolOkStructured,
} from './tool-result.js';

export const STOCK_TOOL_NAMES = [
  'kppdf_list_stock_movements',
  'kppdf_stock_movement_create',
] as const;

const stockMovementInput = z.object({
  type: z.enum(['in', 'out', 'transfer', 'adjust']).describe('Movement type'),
  warehouseId: z.string().min(1).describe('Source warehouse id'),
  qty: z.number().min(0.0001).describe('Quantity (> 0)'),
  materialId: z.string().optional().describe('Exactly one of materialId | productId'),
  productId: z.string().optional().describe('Exactly one of materialId | productId'),
  toWarehouseId: z.string().optional().describe('Required for type=transfer'),
  zoneName: z.string().optional(),
  toZoneName: z.string().optional(),
  cost: z.number().min(0).optional().describe('Unit cost (RUB)'),
  documentRef: z.string().optional().describe('Document reference (e.g. invoice no)'),
  orderId: z.string().optional().describe('Related order id'),
});

/**
 * Валидация до POST (0 запросов при ошибке):
 * - ровно один из materialId | productId;
 * - type=transfer требует toWarehouseId.
 * Возвращает null при успехе или текст ошибки.
 */
export function validateStockMovement(
  args: z.infer<typeof stockMovementInput>,
): string | null {
  const hasMaterial = !!args.materialId;
  const hasProduct = !!args.productId;
  if (hasMaterial === hasProduct) {
    return 'required exactly one of materialId | productId (но не оба сразу)';
  }
  if (args.type === 'transfer' && !args.toWarehouseId) {
    return 'type=transfer requires toWarehouseId';
  }
  return null;
}

/** POST /api/stock-movements — тело из whitelist-полей. */
export function buildStockMovementBody(
  args: z.infer<typeof stockMovementInput>,
): Record<string, unknown> {
  return {
    type: args.type,
    warehouseId: args.warehouseId,
    qty: args.qty,
    ...(args.materialId ? { materialId: args.materialId } : {}),
    ...(args.productId ? { productId: args.productId } : {}),
    ...(args.toWarehouseId ? { toWarehouseId: args.toWarehouseId } : {}),
    ...(args.zoneName ? { zoneName: args.zoneName } : {}),
    ...(args.toZoneName ? { toZoneName: args.toZoneName } : {}),
    ...(args.cost !== undefined ? { cost: args.cost } : {}),
    ...(args.documentRef ? { documentRef: args.documentRef } : {}),
    ...(args.orderId ? { orderId: args.orderId } : {}),
  };
}

export function registerStockTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_list_stock_movements',
    {
      title: 'List stock movements',
      description:
        'TZD-34: GET /api/stock-movements — optional warehouseId/materialId/' +
        'productId/type filters; returns { items, total }. Read-only.',
      inputSchema: {
        warehouseId: z.string().optional(),
        materialId: z.string().optional(),
        productId: z.string().optional(),
        type: z.enum(['in', 'out', 'transfer', 'adjust']).optional(),
      },
      outputSchema: readEnvelopeSchema,
    },
    async ({ warehouseId, materialId, productId, type }) => {
      try {
        const path = withQuery('/api/stock-movements', {
          warehouseId,
          materialId,
          productId,
          type,
        });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOkStructured({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_stock_movements', err);
      }
    },
  );

  server.registerTool(
    'kppdf_stock_movement_create',
    {
      title: 'Create stock movement',
      description:
        'TZD-34: POST /api/stock-movements — приход/расход/перевод/корректировка. ' +
        'Пишет SoT СРАЗУ (нет journal). Требует ровно один из materialId | ' +
        'productId; type=transfer требует toWarehouseId. Склад пополняется этим ' +
        'инструментом, а НЕ POST storage-items.',
      inputSchema: stockMovementInput,
      outputSchema: createEnvelopeSchema,
    },
    async (args) => {
      const validationError = validateStockMovement(args);
      if (validationError) {
        return toolFail('kppdf_stock_movement_create', new Error(validationError));
      }
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/stock-movements',
          buildStockMovementBody(args),
        );
        return toolOkStructured({ ...createEnvelope(result), note: 'SoT write (no journal)' });
      } catch (err) {
        return toolFail('kppdf_stock_movement_create', err);
      }
    },
  );
}
