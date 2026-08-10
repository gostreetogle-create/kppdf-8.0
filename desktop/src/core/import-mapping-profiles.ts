import { apiDelete, apiGet, apiPatch, apiPost, type ApiClientOptions } from './api';
import type { CanonicalColumn } from './import-mapping';

export interface ImportMappingProfile {
  id: string;
  name: string;
  columnMap: Record<string, CanonicalColumn | null>;
  targetEntity: 'material' | 'product' | 'bom';
  isDefault: boolean;
}

interface ApiProfile {
  _id?: string;
  id?: string;
  name: string;
  columnMap: Record<string, CanonicalColumn | null>;
  targetEntity?: ImportMappingProfile['targetEntity'];
  isDefault?: boolean;
}

function normalizeProfile(profile: ApiProfile): ImportMappingProfile {
  return {
    id: profile.id ?? profile._id ?? '',
    name: profile.name,
    columnMap: profile.columnMap,
    targetEntity: profile.targetEntity ?? 'material',
    isDefault: profile.isDefault === true,
  };
}

export async function listImportMappingProfiles(
  api: ApiClientOptions,
): Promise<ImportMappingProfile[]> {
  const response = await apiGet<ApiProfile[]>(api, '/api/import-mapping-profiles');
  return response.map(normalizeProfile);
}

export async function createImportMappingProfile(
  api: ApiClientOptions,
  profile: Pick<ImportMappingProfile, 'name' | 'columnMap' | 'targetEntity' | 'isDefault'>,
): Promise<ImportMappingProfile> {
  const response = await apiPost<ApiProfile>(api, '/api/import-mapping-profiles', profile);
  return normalizeProfile(response);
}

export async function updateImportMappingProfile(
  api: ApiClientOptions,
  id: string,
  patch: Partial<Pick<ImportMappingProfile, 'name' | 'columnMap' | 'targetEntity' | 'isDefault'>>,
): Promise<ImportMappingProfile> {
  const response = await apiPatch<ApiProfile>(api, `/api/import-mapping-profiles/${encodeURIComponent(id)}`, patch);
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
): Promise<Record<string, CanonicalColumn | null>> {
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
  const payload = JSON.parse(text) as { mapping?: Record<string, CanonicalColumn | null> };
  if (!payload.mapping) throw new Error('MCP не вернул карту колонок');
  return payload.mapping;
}
