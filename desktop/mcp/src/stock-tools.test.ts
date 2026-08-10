/**
 * TZD-34 — stock movement MCP.
 *
 * До POST проверяются: ровно один из materialId | productId; transfer требует
 * toWarehouseId. Body строится из whitelist-полей (склад через stock-movements,
 * не storage-items POST).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildStockMovementBody,
  STOCK_TOOL_NAMES,
  validateStockMovement,
} from './stock-tools.js';

describe('stock tools (TZD-34)', () => {
  it('registers two tool names', () => {
    assert.deepEqual([...STOCK_TOOL_NAMES], [
      'kppdf_list_stock_movements',
      'kppdf_stock_movement_create',
    ]);
  });

  it('requires exactly one of materialId | productId', () => {
    assert.match(
      validateStockMovement({ type: 'in', warehouseId: 'w-1', qty: 1 }) ?? '',
      /exactly one of materialId \| productId/,
    );
    assert.match(
      validateStockMovement({
        type: 'in',
        warehouseId: 'w-1',
        qty: 1,
        materialId: 'm-1',
        productId: 'p-1',
      }) ?? '',
      /exactly one of materialId \| productId/,
    );
    assert.equal(
      validateStockMovement({
        type: 'in',
        warehouseId: 'w-1',
        qty: 1,
        materialId: 'm-1',
      }),
      null,
    );
  });

  it('transfer requires toWarehouseId', () => {
    assert.match(
      validateStockMovement({
        type: 'transfer',
        warehouseId: 'w-1',
        qty: 2,
        materialId: 'm-1',
      }) ?? '',
      /transfer requires toWarehouseId/,
    );
    assert.equal(
      validateStockMovement({
        type: 'transfer',
        warehouseId: 'w-1',
        qty: 2,
        materialId: 'm-1',
        toWarehouseId: 'w-2',
      }),
      null,
    );
  });

  it('builds whitelist body for in-movement (no productId/storage-items)', () => {
    const body = buildStockMovementBody({
      type: 'in',
      warehouseId: 'w-1',
      qty: 10,
      materialId: 'm-1',
      cost: 420,
      documentRef: 'Н-0001',
    });
    assert.deepEqual(body, {
      type: 'in',
      warehouseId: 'w-1',
      qty: 10,
      materialId: 'm-1',
      cost: 420,
      documentRef: 'Н-0001',
    });
    assert.ok(!('productId' in body));
  });

  it('builds transfer body with toWarehouseId and productId', () => {
    const body = buildStockMovementBody({
      type: 'transfer',
      warehouseId: 'w-1',
      toWarehouseId: 'w-2',
      qty: 3,
      productId: 'p-9',
      zoneName: 'A1',
      toZoneName: 'B2',
    });
    assert.equal(body.type, 'transfer');
    assert.equal(body.toWarehouseId, 'w-2');
    assert.equal(body.productId, 'p-9');
    assert.equal(body.zoneName, 'A1');
    assert.equal(body.toZoneName, 'B2');
  });
});
