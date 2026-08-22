/**
 * Скан папки моделей на любые `.gguf` (TZD-63) — не только файлы из
 * `model-catalog.ts`. PO копирует модель с флешки под своим именем; раньше
 * приложение видело только `LOCAL_MODELS[].fileName`.
 *
 * Отсев мусора/ярлыков: размер 200 МБ…20 ГБ и магическая строка `GGUF` в
 * первых 4 байтах файла (формат `gguf`, см. ggml-org/ggml spec).
 */

export interface ScannedGgufModel {
  fileName: string;
  path: string;
  sizeBytes: number;
}

export interface RejectedGgufFile {
  fileName: string;
  reason: string;
}

export interface GgufScanResult {
  models: ScannedGgufModel[];
  rejected: RejectedGgufFile[];
}

export const GGUF_MIN_SIZE_BYTES = 200 * 1024 * 1024;
export const GGUF_MAX_SIZE_BYTES = 20 * 1024 * 1024 * 1024;
const GGUF_MAGIC = [0x47, 0x47, 0x55, 0x46]; // "GGUF"

export function isGgufMagic(head: Uint8Array): boolean {
  if (head.length < GGUF_MAGIC.length) return false;
  return GGUF_MAGIC.every((byte, i) => head[i] === byte);
}

/** FS-адаптер: в runtime — Tauri (readDir/join/stat/open), в тестах — mock. */
export interface GgufScanIo {
  /** Имена файлов (не каталогов) в `dir`, без рекурсии. */
  listFileNames: (dir: string) => Promise<string[]>;
  join: (...parts: string[]) => Promise<string>;
  statSize: (path: string) => Promise<number>;
  /** Первые `byteLength` байт файла (может вернуть меньше на коротких файлах). */
  readHead: (path: string, byteLength: number) => Promise<Uint8Array>;
}

/**
 * Сканирует `dir` на `.gguf`-файлы (расширение — быстрый отсев до I/O),
 * дальше проверяет размер и magic-байты. Не бросает на отдельном плохом
 * файле — переносит его в `rejected` с RU-причиной и продолжает список.
 */
export async function scanGgufModels(dir: string, io: GgufScanIo): Promise<GgufScanResult> {
  const fileNames = (await io.listFileNames(dir)).filter((name) => name.toLowerCase().endsWith('.gguf'));
  const models: ScannedGgufModel[] = [];
  const rejected: RejectedGgufFile[] = [];

  for (const fileName of fileNames) {
    const path = await io.join(dir, fileName);
    let size: number;
    try {
      size = await io.statSize(path);
    } catch {
      rejected.push({ fileName, reason: 'Не удалось прочитать файл.' });
      continue;
    }
    if (size < GGUF_MIN_SIZE_BYTES) {
      rejected.push({ fileName, reason: 'Файл меньше 200 МБ — не похож на модель.' });
      continue;
    }
    if (size > GGUF_MAX_SIZE_BYTES) {
      rejected.push({ fileName, reason: 'Файл больше 20 ГБ — не похож на модель.' });
      continue;
    }
    let head: Uint8Array;
    try {
      head = await io.readHead(path, GGUF_MAGIC.length);
    } catch {
      rejected.push({ fileName, reason: 'Не удалось прочитать файл.' });
      continue;
    }
    if (!isGgufMagic(head)) {
      rejected.push({ fileName, reason: 'Нет сигнатуры GGUF в начале файла.' });
      continue;
    }
    models.push({ fileName, path, sizeBytes: size });
  }

  models.sort((a, b) => a.fileName.localeCompare(b.fileName, 'ru'));
  return { models, rejected };
}

async function tauriListFileNames(dir: string): Promise<string[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs');
  const entries = await readDir(dir);
  return entries.filter((entry) => entry.isFile).map((entry) => entry.name);
}

async function tauriStatSize(path: string): Promise<number> {
  const { stat } = await import('@tauri-apps/plugin-fs');
  const info = await stat(path);
  return info.size;
}

async function tauriReadHead(path: string, byteLength: number): Promise<Uint8Array> {
  const { open } = await import('@tauri-apps/plugin-fs');
  const file = await open(path, { read: true });
  try {
    const buf = new Uint8Array(byteLength);
    const n = await file.read(buf);
    return buf.subarray(0, n ?? 0);
  } finally {
    await file.close();
  }
}

const tauriIo: GgufScanIo = {
  listFileNames: tauriListFileNames,
  join: async (...parts) => {
    const { join } = await import('@tauri-apps/api/path');
    return join(...parts);
  },
  statSize: tauriStatSize,
  readHead: tauriReadHead,
};

/** Скан `dir` через реальный Tauri FS — для использования из `App.svelte`. */
export async function scanGgufModelsInDir(dir: string): Promise<GgufScanResult> {
  return scanGgufModels(dir, tauriIo);
}
