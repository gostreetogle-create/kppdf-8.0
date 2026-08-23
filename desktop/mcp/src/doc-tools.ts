/**
 * Doc-constructor MCP tools (TZD-28).
 *
 * Печатные формы живут в вебе (/doc-constructor). Агент при импорте может:
 *  - посмотреть доступные doc-types / categories / templates;
 *  - создать ЧЕРНОВИК шаблона (isActive=false, isDefault=false,
 *    notes «[AI-DRAFT] …») — менеджер доводит его в вебе.
 * ЗАПРЕТ: set-default, publish, silent overwrite production default.
 * Read/draft only — никогда не пишет в production-шаблоны.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';

export const DOC_TOOL_NAMES = [
  'kppdf_list_doc_types',
  'kppdf_doc_types_list',
  'kppdf_list_doc_template_categories',
  'kppdf_doc_template_categories_list',
  'kppdf_list_doc_templates',
  'kppdf_doc_templates_list',
  'kppdf_doc_template_create_draft',
] as const;

export function registerDocTools(server: McpServer, cfg: McpRuntimeConfig): void {
  const docTypesOptions = {
    outputSchema: TOOL_OUTPUT_SCHEMA,
    title: 'List document types',
    description:
      'TZD-28: GET /api/doc-types — document types for templates. ' +
      'Read-only. Use to discover whether the needed form type exists.',
  };
  const listDocTypes = async () => {
    try {
      const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, '/api/doc-types');
      return toolOk({ ok: true, path: '/api/doc-types', result });
    } catch (err) {
      return toolFail('kppdf_list_doc_types', err);
    }
  };
  server.registerTool('kppdf_list_doc_types', docTypesOptions, listDocTypes);
  server.registerTool('kppdf_doc_types_list', docTypesOptions, listDocTypes);

  const categoryOptions = {
    outputSchema: TOOL_OUTPUT_SCHEMA,
    title: 'List document-template categories',
    description:
      'TZD-28: GET /api/document-template-categories — template categories. Read-only.',
  };
  const listCategories = async () => {
    try {
      const result = await backendGetJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        '/api/document-template-categories',
      );
      return toolOk({
        ok: true,
        path: '/api/document-template-categories',
        result,
      });
    } catch (err) {
      return toolFail('kppdf_list_doc_template_categories', err);
    }
  };
  server.registerTool('kppdf_list_doc_template_categories', categoryOptions, listCategories);
  server.registerTool('kppdf_doc_template_categories_list', categoryOptions, listCategories);

  const templatesOptions = {
    outputSchema: TOOL_OUTPUT_SCHEMA,
    title: 'List document templates',
    description:
      'TZD-28: GET /api/document-templates — existing templates. ' +
      'Read-only. Check before creating a draft to avoid duplicates.',
  };
  const listTemplates = async () => {
    try {
      const result = await backendGetJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        '/api/document-templates',
      );
      return toolOk({ ok: true, path: '/api/document-templates', result });
    } catch (err) {
      return toolFail('kppdf_list_doc_templates', err);
    }
  };
  server.registerTool('kppdf_list_doc_templates', templatesOptions, listTemplates);
  server.registerTool('kppdf_doc_templates_list', templatesOptions, listTemplates);

  server.registerTool(
    'kppdf_doc_template_create_draft',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Create document template draft (AI-DRAFT)',
      description:
        'TZD-28 / TZ-KP-WS-406: creates a DRAFT template (isActive=false, ' +
        'isDefault=false, notes «[AI-DRAFT] …», draftSource=mcp) via ' +
        'POST /api/document-templates. NEVER sets default and never publishes. ' +
        'When sourceFileRef is given, an import todo is auto-created (TZD-29) ' +
        'with href to /proposals/workspace?templateDraft=<id> so the manager ' +
        'finishes the draft in the workspace template panel.',
      inputSchema: {
        name: z.string().min(1).describe('Template name'),
        docTypeId: z.string().min(1).describe('Doc type id (see kppdf_list_doc_types)'),
        organizationId: z.string().min(1).describe('Organization id'),
        categoryId: z.string().optional().describe('Template category id'),
        note: z
          .string()
          .optional()
          .describe('Extra human note appended to «[AI-DRAFT]» marker'),
        sourceFileRef: z
          .string()
          .optional()
          .describe('Optional source file reference (path/URL token) that produced this draft'),
      },
    },
    async ({ name, docTypeId, organizationId, categoryId, note, sourceFileRef }) => {
      try {
        const marker = `[AI-DRAFT] ${note?.trim() ?? 'создан агентом при импорте — доделать в /doc-constructor'}`;
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/document-templates',
          {
            name,
            docTypeId,
            organizationId,
            ...(categoryId ? { categoryId } : {}),
            isActive: false,
            isDefault: false,
            notes: marker,
            ...(sourceFileRef ? { sourceFileRef, draftSource: 'mcp' } : {}),
          },
        );
        const draftResult = result as { _id?: string };
        const draftId = draftResult?._id;
        let todo: unknown;
        if (sourceFileRef && draftId) {
          // TZ-KP-WS-406: HITL link points at the workspace template panel
          // (not /doc-constructor) so the manager opens the draft inline.
          todo = await backendPostJson(
            cfg.apiBaseUrl,
            cfg.apiKey,
            '/api/import-todos',
            {
              title: `Доделать шаблон «${name}» из файла`,
              body: `Черновик создан из файла ${sourceFileRef}. Откройте его в workspace и доведите в конструкторе.`,
              href: `/proposals/workspace?templateDraft=${encodeURIComponent(draftId)}`,
              templateId: draftId,
            },
          );
        }
        return toolOk({
          ok: true,
          draft: true,
          note: marker,
          sourceFileRef: sourceFileRef ?? null,
          todoCreated: !!todo,
          todo,
          result,
        });
      } catch (err) {
        return toolFail('kppdf_doc_template_create_draft', err);
      }
    },
  );
}
