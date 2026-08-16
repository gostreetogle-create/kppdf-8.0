/**
 * Разрешение URL для скачивания моделей (TZD-48): только HTTPS на Hugging Face.
 * Вынесено в чистый модуль для юнит-тестирования без запуска HTTP-сервера.
 */

/** Разрешаем только HTTPS-ссылки на Hugging Face (каталог моделей). */
export function isAllowedModelUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return url.hostname === 'huggingface.co' || url.hostname.endsWith('.huggingface.co');
}
