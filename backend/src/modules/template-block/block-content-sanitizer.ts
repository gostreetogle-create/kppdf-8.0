import { sanitizeHtml } from '../../common/sanitize-html';

/** Remove competing inline typography declarations; block.style owns typography. */
export function sanitizeBlockHtml(raw: string): string {
  const sanitized = sanitizeHtml(raw ?? '');
  return sanitized
    .replace(/\sstyle=(['"])(.*?)\1/gi, (_match, quote: string, value: string) => {
      const kept = value
        .split(';')
        .map((declaration) => declaration.trim())
        .filter((declaration) => !/^(font-family|font-size|color)\s*:/i.test(declaration))
        .join(';');
      return kept ? ` style=${quote}${kept}${quote}` : '';
    })
    .replace(/<span(?:\s[^>]*)?>\s*<\/span>/gi, '')
    .replace(/<span>\s*<\/span>/gi, '');
}
