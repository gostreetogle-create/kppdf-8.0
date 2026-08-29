'use strict';

/* global module */

/**
 * Enforce Paper & Ink tokens in inline Angular component/page styles.
 * External component/page stylesheets are checked by check-ui-tokens.mjs.
 */

const RAW_SPACING_RE =
  /\b(?:padding|padding-block|padding-inline|padding-top|padding-right|padding-bottom|padding-left|margin|margin-block|margin-inline|margin-top|margin-right|margin-bottom|margin-left)\s*:\s*[^;{}]*?\b(?:-?\d+(?:\.\d+)?|-?\.\d+)px\b/gi;
const RAW_COLOR_RE =
  /\b(?:color|background|background-color|border(?:-(?:top|right|bottom|left))?-color|outline-color|fill|stroke)\b\s*:\s*[^;{}]*?#[0-9a-f]{3,8}\b/gi;

function getLiteralTexts(node) {
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.raw ?? '');
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.flatMap(getLiteralTexts);
  }
  return [];
}

function withoutComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require spacing and colors in Angular component styles to use Paper & Ink tokens.',
      recommended: 'error',
    },
    schema: [],
    messages: {
      rawSpacing:
        'Raw pixel spacing in component styles is forbidden. Use a spacing token or canonical utility from frontend/src/styles.css.',
      rawColor:
        'Raw hex color in component styles is forbidden. Use an OKLCH token or CSS variable from frontend/src/styles.css.',
    },
  },

  create(context) {
    const filename = context.filename || '';
    if (!filename.endsWith('.component.ts') && !filename.endsWith('.page.ts')) return {};

    function reportMatches(node, text) {
      const css = withoutComments(text);
      for (const match of css.matchAll(RAW_SPACING_RE)) {
        context.report({ node, messageId: 'rawSpacing', data: { value: match[0] } });
      }
      for (const match of css.matchAll(RAW_COLOR_RE)) {
        context.report({ node, messageId: 'rawColor', data: { value: match[0] } });
      }
    }

    return {
      Property(node) {
        if (node.key.type !== 'Identifier' || node.key.name !== 'styles') return;
        for (const text of getLiteralTexts(node.value)) reportMatches(node, text);
      },
    };
  },
};
