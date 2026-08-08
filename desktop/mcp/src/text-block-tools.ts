/**
 * Text-block MCP tools (TZD-30).
 *
 * The agent supplies finished source text; this module stores it as an inactive
 * draft in an explicit TextBlockCategory. It never publishes, invents legal or
 * commercial claims, assembles a quotation, or falls back to «Общее».
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BackendError, backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { withQuery } from './query.js';
import { toolFail, toolOk } from './tool-result.js';

const TEXT_BLOCK_DRAFT_PREFIX = 'Черновик ИИ — ';
const AI_DRAFT_TAG = 'ai-draft';
const TEXT_BLOCK_DRAFT_HREF = '/doc-constructor/texts?editId=';

export const TEXT_BLOCK_TOOL_NAMES = [
  'kppdf_text_block_categories_list',
  'kppdf_text_blocks_list',
  'kppdf_text_block_category_create',
  'kppdf_text_block_create_draft',
] as const;

export interface TextBlockColumnInput {
  id: string;
  content?: string;
  width?: number;
  fontSize?: number;
}

export interface CreateTextBlockDraftInput {
  name: string;
  categoryId: string;
  content?: string;
  columns?: TextBlockColumnInput[];
  tags?: string[];
}

export interface TextBlockDraftResult {
  textBlockId: string;
  todoId?: string;
  todoError?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function responseItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  return record && Array.isArray(record.items) ? record.items : [];
}

function responseId(value: unknown): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  for (const key of ['id', '_id', 'textBlockId', 'todoId']) {
    const id = record[key];
    if (typeof id === 'string' && id.length > 0) return id;
  }
  return responseId(record.result);
}

function normalizeDraftName(name: string): string {
  const trimmed = name.trim();
  return trimmed.startsWith(TEXT_BLOCK_DRAFT_PREFIX)
    ? trimmed
    : `${TEXT_BLOCK_DRAFT_PREFIX}${trimmed}`;
}

function hasName(value: unknown, names: Set<string>): boolean {
  const record = asRecord(value);
  return typeof record?.name === 'string' && names.has(record.name.trim());
}

function conflictMessage(subject: string, err: unknown): Error {
  const detail = err instanceof Error ? err.message : String(err);
  return new Error(
    `${subject} не создан: сервер вернул конфликт (409). Проверьте существующую запись; overwrite не выполняется. ${detail}`,
  );
}

export async function listTextBlockCategories(
  cfg: McpRuntimeConfig,
  activeOnly = true,
): Promise<unknown> {
  return backendGetJson(
    cfg.apiBaseUrl,
    cfg.apiKey,
    withQuery('/api/text-block-categories', { activeOnly }),
  );
}

export async function listTextBlocks(
  cfg: McpRuntimeConfig,
  categoryId: string,
  isActive?: boolean,
): Promise<unknown> {
  return backendGetJson(
    cfg.apiBaseUrl,
    cfg.apiKey,
    withQuery('/api/text-blocks', { categoryId, isActive }),
  );
}

export async function createTextBlockCategory(
  cfg: McpRuntimeConfig,
  input: { name: string; slug: string },
): Promise<unknown> {
  try {
    return await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, '/api/text-block-categories', {
      name: input.name,
      slug: input.slug,
    });
  } catch (err) {
    if (err instanceof BackendError && err.status === 409) {
      throw conflictMessage(`Категория «${input.name}»`, err);
    }
    throw err;
  }
}

export async function createTextBlockDraft(
  cfg: McpRuntimeConfig,
  input: CreateTextBlockDraftInput,
): Promise<TextBlockDraftResult> {
  if (!input.name.trim()) throw new Error('name обязателен для текстового черновика.');
  if (!input.categoryId.trim()) throw new Error('categoryId обязателен; fallback в «Общее» запрещён.');
  if (input.content === undefined && (!input.columns || input.columns.length === 0)) {
    throw new Error('Нужен content или непустой columns; пустой черновик не создаётся.');
  }

  const draftName = normalizeDraftName(input.name);
  const existing = await listTextBlocks(cfg, input.categoryId);
  const duplicateNames = new Set([input.name.trim(), draftName]);
  if (responseItems(existing).some((item) => hasName(item, duplicateNames))) {
    throw new Error(
      `Черновик «${draftName}» уже существует в категории ${input.categoryId}; новый блок не создан и overwrite не выполняется.`,
    );
  }

  const payload: Record<string, unknown> = {
    name: draftName,
    categoryId: input.categoryId,
    isActive: false,
    tags: Array.from(new Set([...(input.tags ?? []), AI_DRAFT_TAG])),
  };
  if (input.content !== undefined) payload.content = input.content;
  if (input.columns !== undefined) payload.columns = input.columns;

  let created: unknown;
  try {
    created = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, '/api/text-blocks', payload);
  } catch (err) {
    if (err instanceof BackendError && err.status === 409) {
      throw conflictMessage(`Черновик «${draftName}»`, err);
    }
    throw err;
  }

  const textBlockId = responseId(created);
  if (!textBlockId) {
    throw new Error('Черновик создан, но API не вернул textBlockId; todo не создан автоматически.');
  }

  try {
    const todo = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, '/api/import-todos', {
      title: `Проверить текстовый черновик: ${draftName}`,
      body: 'Проверить готовый текст из источника агента и включить «Активен» в библиотеке текстов.',
      href: `${TEXT_BLOCK_DRAFT_HREF}${encodeURIComponent(textBlockId)}`,
    });
    const todoId = responseId(todo);
    if (!todoId) {
      return {
        textBlockId,
        todoError: 'Todo API ответил без todoId; откройте черновик вручную по ссылке.',
      };
    }
    return { textBlockId, todoId };
  } catch (err) {
    return {
      textBlockId,
      todoError: err instanceof Error ? err.message : String(err),
    };
  }
}

export function registerTextBlockTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_text_block_categories_list',
    {
      title: 'List text-block categories',
      description:
        'TZD-30: lists active TextBlockCategory «shelves» from the backend. ' +
        'Read-only; use the returned categoryId instead of falling back to «Общее».',
      inputSchema: {
        activeOnly: z.boolean().optional().default(true).describe('Only active categories'),
      },
    },
    async ({ activeOnly }) => {
      try {
        const result = await listTextBlockCategories(cfg, activeOnly);
        return toolOk({ ok: true, path: withQuery('/api/text-block-categories', { activeOnly }), result });
      } catch (err) {
        return toolFail('kppdf_text_block_categories_list', err);
      }
    },
  );

  server.registerTool(
    'kppdf_text_blocks_list',
    {
      title: 'List text blocks in a category',
      description:
        'TZD-30: lists text blocks in the required TextBlockCategory. ' +
        'Use this before creating a draft to avoid duplicates.',
      inputSchema: {
        categoryId: z.string().min(1).describe('TextBlockCategory id'),
        isActive: z.boolean().optional().describe('Optional active-state filter'),
      },
    },
    async ({ categoryId, isActive }) => {
      try {
        const path = withQuery('/api/text-blocks', { categoryId, isActive });
        return toolOk({ ok: true, path, result: await listTextBlocks(cfg, categoryId, isActive) });
      } catch (err) {
        return toolFail('kppdf_text_blocks_list', err);
      }
    },
  );

  server.registerTool(
    'kppdf_text_block_category_create',
    {
      title: 'Create a text-block category shelf',
      description:
        'TZD-30: creates an explicit TextBlockCategory for text drafts when the requested shelf is missing. ' +
        'Does not invent commercial content or silently place drafts in «Общее».',
      inputSchema: {
        name: z.string().min(1).max(128).describe('Requested shelf name'),
        slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(64).describe('Stable lowercase shelf slug'),
      },
    },
    async ({ name, slug }) => {
      try {
        const result = await createTextBlockCategory(cfg, { name, slug });
        return toolOk({ ok: true, category: result });
      } catch (err) {
        return toolFail('kppdf_text_block_category_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_text_block_create_draft',
    {
      title: 'Create inactive AI text-block draft',
      description:
        'TZD-30: stores finished text supplied by the agent in the requested category as an inactive AI draft. ' +
        'The tool does not invent legal wording, prices, guarantees, or assemble a quotation; a manager reviews ' +
        'the source text, enables «Активен», and places the block on a template canvas manually. ' +
        'categoryId and content (or columns) are required. No notes field is sent.',
      inputSchema: {
        name: z.string().min(1).max(200).describe('Draft subject/name'),
        categoryId: z.string().min(1).describe('Existing TextBlockCategory id; never omitted'),
        content: z.string().max(50000).optional().describe('Finished source text/HTML'),
        columns: z
          .array(
            z.object({
              id: z.string().min(1),
              content: z.string().max(50000).optional(),
              width: z.number().optional(),
              fontSize: z.number().optional(),
            }),
          )
          .optional()
          .describe('Finished multi-column source text'),
        tags: z.array(z.string()).optional().describe('Additional tags; ai-draft is always added'),
      },
    },
    async ({ name, categoryId, content, columns, tags }) => {
      try {
        if (content === undefined && (!columns || columns.length === 0)) {
          throw new Error('Нужен content или непустой columns; пустой черновик не создаётся.');
        }
        const result = await createTextBlockDraft(cfg, {
          name,
          categoryId,
          content,
          columns,
          tags,
        });
        return toolOk({ ok: true, draft: true, ...result });
      } catch (err) {
        return toolFail('kppdf_text_block_create_draft', err);
      }
    },
  );
}
