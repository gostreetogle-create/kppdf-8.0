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
