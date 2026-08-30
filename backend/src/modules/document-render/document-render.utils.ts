import { readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

/** Strip TipTap tags inside `{{…}}` tokens (legacy templates). TZ-KP-BIND-513 */
export function normalizeSubstitutionHtml(html: string): string {
  if (!html) return '';
  return html.replace(/\{\{[\s\S]*?\}\}/g, (token) =>
    token.replace(/<[^>]+>/g, ''),
  );
}

export function escapeHtmlValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Public origin for document `<base href>` (uploads in PDF / srcdoc). */
export function documentPublicOrigin(): string {
  const configured =
    process.env.KPPDF_PUBLIC_ORIGIN ??
    process.env.PUBLIC_BASE_URL ??
    'http://127.0.0.1:3000';
  try {
    return new URL(configured).origin;
  } catch {
    return 'http://127.0.0.1:3000';
  }
}

const SAFE_UPLOAD_URL_RE = /^\/uploads\/[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;

const UPLOAD_EXT_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Collect `/uploads/...` paths from img src and CSS url() for PDF inlining. */
export function collectLocalUploadUrls(html: string): string[] {
  const urls = new Set<string>();
  const srcRe = /src\s*=\s*["'](\/uploads\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = srcRe.exec(html)) !== null) {
    urls.add(match[1]);
  }
  const urlRe = /url\(\s*["']?(\/uploads\/[^"')]+)["']?\s*\)/gi;
  while ((match = urlRe.exec(html)) !== null) {
    urls.add(match[1]);
  }
  return [...urls];
}

/**
 * Inline local `/uploads/*` files as data URLs so Puppeteer PDF render does not
 * depend on HTTP reachability of KPPDF_PUBLIC_ORIGIN.
 */
export async function inlineLocalUploadsForPdf(html: string): Promise<string> {
  const urls = collectLocalUploadUrls(html);
  if (urls.length === 0) return html;

  const uploadsRoot = resolve(join(process.cwd(), 'uploads'));
  const replacements = new Map<string, string>();

  await Promise.all(
    urls.map(async (url) => {
      if (!SAFE_UPLOAD_URL_RE.test(url) || url.includes('..')) return;
      const ext = url.split('.').pop()?.toLowerCase() ?? '';
      const mime = UPLOAD_EXT_MIME[ext];
      if (!mime) return;

      const rel = url.slice('/uploads/'.length);
      const filePath = resolve(uploadsRoot, rel);
      const relCheck = relative(uploadsRoot, filePath);
      if (relCheck.startsWith('..')) return;

      try {
        const buffer = await readFile(filePath);
        replacements.set(url, `data:${mime};base64,${buffer.toString('base64')}`);
      } catch {
        // Keep the original URL when the file is missing.
      }
    }),
  );

  if (replacements.size === 0) return html;

  let result = html;
  for (const [url, dataUrl] of replacements) {
    result = result.split(url).join(dataUrl);
  }
  return result;
}
