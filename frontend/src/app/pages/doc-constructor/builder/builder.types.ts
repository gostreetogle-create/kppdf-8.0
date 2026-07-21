import type { BlockType } from '../../../shared/template-block/template-block.types';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';

/**
 * D.2.2 nit (code-reviewer): the cdkDropList id is now exported so the tool
 * pane can import it (instead of duplicating the string in two places).
 * The tool pane uses it in `[cdkDropListConnectedTo]`.
 */
export const CANVAS_DROPLIST_ID = 'canvas-droplist';

/**
 * Discriminated union of the 4 ways a user can add a block from the tool pane.
 * BuilderPage handles the union and creates the appropriate TemplateBlock.
 * Phase D.2.2: this is also the `cdkDragData` carried by palette items.
 */
export type AddBlockPayload =
  | { source: 'block-type'; type: BlockType }
  | { source: 'text-block'; textBlock: TextBlock }
  | { source: 'table-template'; tableTemplate: TableTemplate }
  | {
      source: 'data-binding';
      dataSource: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type';
      field: { key: string; label: string; type: string };
    };
