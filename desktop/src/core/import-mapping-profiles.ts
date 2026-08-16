import { apiDelete, apiGet, apiPatch, apiPost, type ApiClientOptions } from './api';
import { isImportTargetKey, type ImportTargetKey } from './import-targets';

export interface ProfileTable {
  /** Может прийти неизвестная сущность (например legacy `bom`) — не роняем. */
  targetEntity: ImportTargetKey | (string & {});
  columnMap: Record<string, string | null>;
}

export interface ImportMappingProfile {
  id: string;
  name: string;
  /** Легаси: одиночная таблица. */
  columnMap: Record<string, string | null>;
  targetEntity: ImportTargetKey | (string & {});
  /** Мульти-табличный профиль «метод приложения». */
  tables?: ProfileTable[];
  isDefault: boolean;
}

interface ApiProfile {
  _id?: string;
  id?: string;
  name: string;
  columnMap?: Record<string, string | null>;
  targetEntity?: ImportTargetKey | (string & {});
  tables?: ProfileTable[];
  isDefault?: boolean;
}

function normalizeProfile(profile: ApiProfile): ImportMappingProfile {
  return {
    id: profile.id ?? profile._id ?? '',
    name: profile.name,
    columnMap: profile.columnMap ?? {},
    targetEntity: profile.targetEntity ?? 'material',
    tables: profile.tables,
    isDefault: profile.isDefault === true,
  };
}

export async function listImportMappingProfiles(
  api: ApiClientOptions,
): Promise<ImportMappingProfile[]> {
  const response = await apiGet<ApiProfile[]>(api, '/api/import-mapping-profiles');
  return response.map(normalizeProfile);
}

export interface ImportMappingProfileInput {
  name: string;
  tables?: ProfileTable[];
  columnMap?: Record<string, string | null>;
  targetEntity?: ImportTargetKey;
  isDefault?: boolean;
}

export async function createImportMappingProfile(
  api: ApiClientOptions,
  profile: ImportMappingProfileInput,
): Promise<ImportMappingProfile> {
  const response = await apiPost<ApiProfile>(api, '/api/import-mapping-profiles', profile);
  return normalizeProfile(response);
}

export async function updateImportMappingProfile(
  api: ApiClientOptions,
  id: string,
  patch: Partial<ImportMappingProfileInput>,
): Promise<ImportMappingProfile> {
  const response = await apiPatch<ApiProfile>(
    api,
    `/api/import-mapping-profiles/${encodeURIComponent(id)}`,
    patch,
  );
  return normalizeProfile(response);
}

export async function deleteImportMappingProfile(api: ApiClientOptions, id: string): Promise<void> {
  await apiDelete(api, `/api/import-mapping-profiles/${encodeURIComponent(id)}`);
}

/** Call the existing MCP classify tool; returned mapping still needs human confirmation. */
export async function suggestMappingThroughMcp(
  port: number,
  apiKey: string,
  headers: string[],
  sampleRows: Record<string, unknown>[],
): Promise<Record<string, string | null>> {
  const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `mapping-${Date.now()}`,
      method: 'tools/call',
      params: {
        name: 'kppdf_inbox_classify_columns',
        arguments: { headers, sample: sampleRows, sampleLimit: 5 },
      },
    }),
  });
  if (!response.ok) throw new Error(`MCP ответил ${response.status}`);
  const envelope = (await response.json()) as {
    result?: { content?: Array<{ type?: string; text?: string }> };
    error?: { message?: string };
  };
  if (envelope.error) throw new Error(envelope.error.message ?? 'MCP не предложил сопоставление');
  const text = envelope.result?.content?.find((item) => item.type === 'text')?.text;
  if (!text) throw new Error('MCP вернул пустое сопоставление');
  const payload = JSON.parse(text) as { mapping?: Record<string, string | null> };
  if (!payload.mapping) throw new Error('MCP не вернул карту колонок');
  return payload.mapping;
}
