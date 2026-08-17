/**
 * MCP photo upload (TZD-47).
 *
 * HITL like module create: propose inspects a local file (0 backend writes);
 * confirm with userOk:true uploads one file through existing REST
 * `POST /api/photos/upload` (field `file`) and optionally binds
 * `Product.photoIds` via `POST /api/products/:id/photos`.
 * Counterparty bind has no attach REST — Photo is still created, bind skipped.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendPostJson,
  backendPostMultipart,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';

export const PHOTO_TOOL_NAMES = [
  'kppdf_propose_photo_upload',
  'kppdf_confirm_photo_upload',
] as const;

/** Same cap as `IMAGE_UPLOAD_MAX_BYTES` in backend image-upload.options. */
export const PHOTO_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

const MONGO_ID = /^[a-f0-9]{24}$/i;

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

export const photoProposeInput = z.object({
  filePath: z.string().min(1).describe('Path to one local image file'),
  productId: z
    .string()
    .regex(MONGO_ID)
    .optional()
    .describe('Optional Product _id — bind via POST /api/products/:id/photos'),
  counterpartyId: z
    .string()
    .regex(MONGO_ID)
    .optional()
    .describe('Optional Counterparty _id — no attach REST yet; bind skipped'),
});

export const photoConfirmInput = photoProposeInput.extend({
  userOk: z.boolean().describe('Must be true — upload writes Photo SoT'),
});

export interface PhotoInspect {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  productId?: string;
  counterpartyId?: string;
}

function optionalMongoId(value: string | undefined, label: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!MONGO_ID.test(trimmed)) {
    throw new Error(`Некорректный id ${label}`);
  }
  return trimmed;
}

function sniffMime(head: Buffer): string | undefined {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    head.length >= 8 &&
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47
  ) {
    return 'image/png';
  }
  if (head.length >= 6) {
    const gif = head.subarray(0, 6).toString('ascii');
    if (gif === 'GIF87a' || gif === 'GIF89a') return 'image/gif';
  }
  if (
    head.length >= 12 &&
    head.subarray(0, 4).toString('ascii') === 'RIFF' &&
    head.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (head.length >= 12 && head.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = head.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
  }
  const text = head.toString('utf8').trimStart().toLowerCase();
  if (text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'))) {
    return 'image/svg+xml';
  }
  return undefined;
}

export async function inspectPhotoFile(
  filePath: string,
  opts?: { productId?: string; counterpartyId?: string },
): Promise<PhotoInspect> {
  const trimmed = filePath.trim();
  if (!trimmed) throw new Error('Укажите путь к файлу');
  const abs = path.resolve(trimmed);
  let st: Awaited<ReturnType<typeof fs.stat>>;
  try {
    st = await fs.stat(abs);
  } catch {
    throw new Error(`Файл не найден: ${abs}`);
  }
  if (!st.isFile()) throw new Error(`Это не файл: ${abs}`);
  if (st.size <= 0) throw new Error('Файл пустой');
  if (st.size > PHOTO_UPLOAD_MAX_BYTES) {
    throw new Error('Файл больше 10 МБ');
  }

  const headLen = Math.min(64, st.size);
  const fh = await fs.open(abs, 'r');
  const head = Buffer.alloc(headLen);
  try {
    await fh.read(head, 0, headLen, 0);
  } finally {
    await fh.close();
  }

  const ext = path.extname(abs).toLowerCase();
  const fromExt = EXT_MIME[ext];
  const fromBytes = sniffMime(head);
  if (!fromExt && !fromBytes) {
    throw new Error('Это не картинка. Нужен jpeg, png, webp, gif, avif или svg');
  }
  if (fromExt && fromBytes && fromExt !== fromBytes) {
    throw new Error(`Тип файла не совпадает с расширением (${ext})`);
  }
  const mimeType = fromExt ?? fromBytes;
  if (!mimeType) {
    throw new Error('Это не картинка. Нужен jpeg, png, webp, gif, avif или svg');
  }

  const productId = optionalMongoId(opts?.productId, 'изделия');
  const counterpartyId = optionalMongoId(opts?.counterpartyId, 'контрагента');
  return {
    filePath: abs,
    fileName: path.basename(abs),
    sizeBytes: st.size,
    mimeType,
    ...(productId ? { productId } : {}),
    ...(counterpartyId ? { counterpartyId } : {}),
  };
}

export async function proposePhotoUpload(
  args: z.infer<typeof photoProposeInput>,
) {
  try {
    const inspect = await inspectPhotoFile(args.filePath, {
      productId: args.productId,
      counterpartyId: args.counterpartyId,
    });
    return toolOk({
      ok: true,
      proposalId: `draft:photo.upload:${inspect.fileName}:${inspect.sizeBytes}`,
      proposal: {
        kind: 'photo.upload',
        inspect,
      },
      note:
        'Черновик — файл не загружен. После согласия человека вызовите kppdf_confirm_photo_upload с userOk:true.',
    });
  } catch (err) {
    return toolFail('kppdf_propose_photo_upload', err);
  }
}

function recordId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const rec = value as Record<string, unknown>;
  if (typeof rec._id === 'string' && rec._id) return rec._id;
  if (typeof rec.id === 'string' && rec.id) return rec.id;
  return undefined;
}

function photoIdsFromProduct(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const rec = value as Record<string, unknown>;
  const raw = rec.photoIds;
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => String(item));
}

export async function confirmPhotoUpload(
  cfg: McpRuntimeConfig,
  args: z.infer<typeof photoConfirmInput>,
) {
  if (args.userOk !== true) {
    return toolFail(
      'kppdf_confirm_photo_upload',
      new Error('userOk:true обязателен — загрузка пишет в каталог фото'),
    );
  }

  let inspect: PhotoInspect;
  try {
    inspect = await inspectPhotoFile(args.filePath, {
      productId: args.productId,
      counterpartyId: args.counterpartyId,
    });
  } catch (err) {
    return toolFail('kppdf_confirm_photo_upload', err);
  }

  try {
    const bytes = await fs.readFile(inspect.filePath);
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(bytes)], { type: inspect.mimeType }),
      inspect.fileName,
    );
    const uploaded = await backendPostMultipart(
      cfg.apiBaseUrl,
      cfg.apiKey,
      '/api/photos/upload',
      form,
    );
    const photoId = recordId(uploaded);
    if (!photoId) {
      throw new Error('Сервер не вернул id фото');
    }

    let product: unknown;
    let boundProduct = false;
    if (inspect.productId) {
      try {
        product = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/products/${encodeURIComponent(inspect.productId)}/photos`,
          { photoId },
        );
        boundProduct = true;
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        throw new Error(
          `Фото загружено (id=${photoId}), но привязка к изделию не удалась: ${detail}`,
        );
      }
    }

    const notes: string[] = [];
    if (inspect.counterpartyId) {
      notes.push(
        `Привязка к контрагенту пока не поддерживается API — фото загружено (id=${photoId}). Привяжите в карточке контрагента.`,
      );
    }

    return toolOk({
      ok: true,
      result: uploaded,
      id: photoId,
      photo: uploaded,
      productId: inspect.productId,
      boundProduct,
      productPhotoIds: boundProduct ? photoIdsFromProduct(product) : undefined,
      counterpartyId: inspect.counterpartyId,
      note: notes.length ? notes.join(' ') : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith('Фото загружено')) {
      return toolFail('kppdf_confirm_photo_upload', err);
    }
    return toolFail(
      'kppdf_confirm_photo_upload',
      new Error(`Не удалось загрузить фото: ${message}`),
    );
  }
}

export function registerPhotoTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_propose_photo_upload',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Propose photo upload',
      description:
        'TZD-47: inspect one local image (jpeg/png/webp/gif/avif/svg, ≤10 MB). Zero backend writes. Confirm with kppdf_confirm_photo_upload + userOk:true.',
      inputSchema: photoProposeInput,
    },
    async (args) => proposePhotoUpload(args),
  );

  server.registerTool(
    'kppdf_confirm_photo_upload',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Confirm photo upload',
      description:
        'TZD-47: POST /api/photos/upload (field file) then optional POST /api/products/:id/photos { photoId }. Requires userOk:true. One file per call, not bulk.',
      inputSchema: photoConfirmInput,
    },
    async (args) => confirmPhotoUpload(cfg, args),
  );
}
