import { Node, mergeAttributes } from '@tiptap/core';

/** Atomic inline token — TZ-DOC-525 / BIND-513 companion */
export const SubstitutionToken = Node.create({
  name: 'substitutionToken',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      token: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-token') ?? '',
        renderHTML: (attrs) => ({ 'data-token': attrs['token'] }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-substitution-token]' },
      {
        tag: 'span.substitution-token',
        getAttrs: (el) => ({
          token: (el as HTMLElement).textContent?.trim() ?? '',
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-substitution-token': '',
        class: 'substitution-token',
        contenteditable: 'false',
      }),
      node.attrs['token'] ?? '',
    ];
  },

  renderText({ node }) {
    return node.attrs['token'] ?? '';
  },
});

const TOKEN_RE = /\{\{[\w.]+\}\}/g;

/** Wrap plain-text tokens in editor HTML with atomic nodes (best-effort on load). */
export function migratePlainTokensToNodes(html: string): string {
  if (!html || !html.includes('{{')) return html;
  return html.replace(TOKEN_RE, (match) => {
    if (html.includes(`data-token="${match}"`)) return match;
    return `<span data-substitution-token="" data-token="${match}" class="substitution-token" contenteditable="false">${match}</span>`;
  });
}
