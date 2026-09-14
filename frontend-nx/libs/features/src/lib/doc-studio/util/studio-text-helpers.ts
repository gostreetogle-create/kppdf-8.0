/** Latin slug for text-block registry (backend requires slug). */
export function studioTextBlockSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0400-\u04ff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `text-${Date.now()}`;
}

/** Strip HTML tags for plain canvas fallback / double-click edit. */
export function studioPlainTextFromHtml(html: string): string {
  if (!html.trim()) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
