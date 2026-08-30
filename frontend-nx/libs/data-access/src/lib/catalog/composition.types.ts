import type { MaterialKind } from './material.types';

/** Mirrors legacy `CompositionTreeNode` / catalog-graph tree response. */
export interface CompositionTreeNode {
  _id: string;
  name: string;
  kind: 'product' | 'module' | 'material';
  lineType?: CompositionLineType;
  materialKind?: MaterialKind;
  quantity: number;
  unit?: string;
  photoUrl?: string;
  children: CompositionTreeNode[];
}

export type CompositionLineType = 'module' | 'material' | 'product';

export interface CompositionOverrideDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

interface CompositionLineBase {
  _id: string;
  refId: string;
  quantity: number;
  sortOrder: number;
  unit?: string;
  sourcePosition?: string;
  sourceCode?: string;
  notes?: string;
}

export interface ProductCompositionLine extends CompositionLineBase {
  lineType: 'product';
  unitPriceOverride?: number;
}

export interface ModuleOrMaterialCompositionLine extends CompositionLineBase {
  lineType: 'module' | 'material';
  overrideDimensions?: CompositionOverrideDimensions;
  isPurchased?: boolean;
}

export type CompositionLine = ProductCompositionLine | ModuleOrMaterialCompositionLine;

export type CompositionLineUpsertDto =
  | {
      lineType: 'product';
      refId: string;
      quantity: number;
      unitPriceOverride?: number;
      sortOrder?: number;
      unit?: string;
      notes?: string;
    }
  | {
      lineType: 'module' | 'material';
      refId: string;
      quantity: number;
      sortOrder?: number;
      unit?: string;
      overrideDimensions?: CompositionOverrideDimensions;
      isPurchased?: boolean;
      sourcePosition?: string;
      sourceCode?: string;
      notes?: string;
    };

export type CompositionLineUpdateDto =
  | {
      lineType?: 'product';
      refId?: string;
      unitPriceOverride?: number;
      quantity?: number;
      sortOrder?: number;
      unit?: string;
      notes?: string;
    }
  | {
      lineType?: 'module' | 'material';
      refId?: string;
      quantity?: number;
      sortOrder?: number;
      unit?: string;
      overrideDimensions?: CompositionOverrideDimensions;
      isPurchased?: boolean;
      sourcePosition?: string;
      sourceCode?: string;
      notes?: string;
    };

export type CompositionParentKind = 'module' | 'product' | 'material';
