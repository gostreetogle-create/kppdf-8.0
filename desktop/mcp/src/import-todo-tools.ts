/**
 * Import-todo MCP tools (TZD-29).
 *
 * Менеджеру: «что доделать после импорта». Агент создаёт todo через MCP,
 * менеджер видит/закрывает их в вебе (/import-todos). Не email/push.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  createEnvelope,
  readEnvelopeSchema,
  toolFail,
  toolOkStructured,
} from './tool-result.js';

export const IMPORT_TODO_TOOL_NAMES = [
  'kppdf_import_todo_create',
  'kppdf_list_import_todos',
  'kppdf_import_todo_list',
  'kppdf_import_todo_set_status',
] as const;

export function registerImportTodoTools(
  server: McpServer,
  cfg: McpRuntimeConfig,
): void {
  server.registerTool(
    'kppdf_import_todo_create',
    {
      title: 'Create import todo for manager',
      description:
        'TZD-29: creates a manager todo (POST /api/import-todos). ' +
        'Use after apply_plan when doubts>0 («Проверить сомнительные строки») ' +
        'or after kppdf_doc_template_create_draft («Доделать шаблон {name}» + href).',
      inputSchema: {
        title: z.string().min(1).max(256).describe('Short title, RU'),
        body: z.string().max(2000).optional().describe('Details'),
        href: z.string().max(1024).optional().describe('Link for the manager (e.g. /doc-constructor/...)'),
        importTaskId: z.string().optional().describe('Related ImportTask id'),
        templateId: z.string().optional().describe('Related template draft id (TZD-28)'),
      },
    },
    async ({ title, body, href, importTaskId, templateId }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/import-todos',
          {
            title,
            ...(body ? { body } : {}),
            ...(href ? { href } : {}),
            ...(importTaskId ? { importTaskId } : {}),
            ...(templateId ? { templateId } : {}),
          },
        );
        return toolOkStructured({ ...createEnvelope(result), todo: result });
      } catch (err) {
        return toolFail('kppdf_import_todo_create', err);
      }
    },
  );

  async function listImportTodos(args: { status?: 'open' | 'done' }) {
    try {
      const path = args.status
        ? `/api/import-todos?status=${args.status}`
        : '/api/import-todos';
      const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
      return toolOkStructured({ ok: true, path, result });
    } catch (err) {
      return toolFail('kppdf_list_import_todos', err);
    }
  }

  const importTodoListConfig = {
    title: 'List import todos',
    description:
      'TZD-29: GET /api/import-todos?status= — open/done manager todos. Read-only.',
    inputSchema: {
      status: z
        .enum(['open', 'done'])
        .optional()
        .describe('Filter by status (default: all)'),
    },
    outputSchema: readEnvelopeSchema,
  };
  server.registerTool('kppdf_list_import_todos', importTodoListConfig, listImportTodos);
  server.registerTool(
    'kppdf_import_todo_list',
    {
      ...importTodoListConfig,
      title: 'List import todos (deprecated alias — use kppdf_list_import_todos)',
      description:
        'TZD-41: deprecated alias of kppdf_list_import_todos (removed after one wave).',
    },
    listImportTodos,
  );

  server.registerTool(
    'kppdf_import_todo_set_status',
    {
      title: 'Set import todo status',
      description:
        'TZD-29: PATCH /api/import-todos/:id { status } — mark done/open. ' +
        'Manager closes todos manually in the web — agent may mark done only when asked.',
      inputSchema: {
        id: z.string().min(1),
        status: z.enum(['open', 'done']),
      },
    },
    async ({ id, status }) => {
      try {
        const result = await backendPatchJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/import-todos/${encodeURIComponent(id)}`,
          { status },
        );
        return toolOkStructured({ ...createEnvelope(result), todo: result });
      } catch (err) {
        return toolFail('kppdf_import_todo_set_status', err);
      }
    },
  );
}
