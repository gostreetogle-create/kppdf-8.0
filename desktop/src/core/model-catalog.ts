/**
 * Каталог локальных моделей (GGUF, llama.cpp) для встроенного движка.
 * Ссылки — официальные репозитории GGUF (bartowski) на Hugging Face.
 * Рекомендация подбирается по объёму ОЗУ ПК (видеопамять не учитываем —
 * движок работает на CPU; на мощных GPU можно выбрать модель вручную).
 */

export interface LocalModelEntry {
  id: string;
  /** Русское имя для UI. */
  name: string;
  /** Имя GGUF-файла в репозитории. */
  fileName: string;
  /** Прямая ссылка на скачивание (Hugging Face resolve). */
  url: string;
  /** Ожидаемый размер, байт (приблизительно; реальный берём из Content-Length). */
  sizeBytes: number;
  /** Минимальный объём ОЗУ для комфортной работы, ГБ. */
  minRamGb: number;
}

export const LOCAL_MODELS: readonly LocalModelEntry[] = [
  {
    id: 'qwen2.5-3b',
    name: 'Qwen 3B (рекомендуется для среднего ПК)',
    fileName: 'Qwen2.5-3B-Instruct-Q4_K_M.gguf',
    url: 'https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf',
    sizeBytes: 1_990_000_000,
    minRamGb: 8,
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen 1.5B (слабый ПК)',
    fileName: 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
    url: 'https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
    sizeBytes: 1_000_000_000,
    minRamGb: 4,
  },
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 0.5B (очень слабый ПК)',
    fileName: 'Qwen2.5-0.5B-Instruct-Q4_K_M.gguf',
    url: 'https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf',
    sizeBytes: 450_000_000,
    minRamGb: 2,
  },
];

export function modelById(id: string): LocalModelEntry | undefined {
  return LOCAL_MODELS.find((model) => model.id === id);
}

/** Модель под объём ОЗУ: самая тяжёлая, что влезает; по умолчанию — 0.5B. */
export function recommendModel(totalRamGb: number): LocalModelEntry {
  const sorted = [...LOCAL_MODELS].sort((a, b) => b.sizeBytes - a.sizeBytes);
  return sorted.find((model) => totalRamGb >= model.minRamGb) ?? LOCAL_MODELS[LOCAL_MODELS.length - 1];
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} ГБ`;
  if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} МБ`;
  return `${Math.round(bytes / 1000)} КБ`;
}

export function formatRamGb(totalRamGb: number): string {
  return `${totalRamGb < 1 ? Math.round(totalRamGb * 1024) + ' МБ' : Math.round(totalRamGb) + ' ГБ'}`;
}
