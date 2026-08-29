/**
 * @jest-environment node
 */

/* global describe, expect, it, require */
/* eslint-disable @typescript-eslint/no-require-imports */

'use strict';

const { Linter } = require('eslint');
const parser = require('@typescript-eslint/parser');
const rule = require('./no-raw-ui-values.cjs');

const linter = new Linter();
const config = {
  files: ['**/*.ts'],
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  },
  plugins: { 'kppdf-frontend-architecture': { rules: { 'no-raw-ui-values': rule } } },
  rules: { 'kppdf-frontend-architecture/no-raw-ui-values': 'error' },
};

const PAGE_FILE = 'src/app/pages/foo/foo.page.ts';
const SERVICE_FILE = 'src/app/services/foo.service.ts';

describe('no-raw-ui-values', () => {
  it('reports raw spacing and hex color in inline component styles', () => {
    const code = `
@Component({
  selector: 'app-foo',
  styles: \`.panel { padding: 16px; color: #fff; margin-top: 4px; }\`,
})
export class FooPage {}
`;
    const messages = linter.verify(code, config, PAGE_FILE);
    expect(messages.map((message) => message.messageId)).toEqual([
      'rawSpacing',
      'rawSpacing',
      'rawColor',
    ]);
  });

  it('reports raw values in static segments of an interpolated template', () => {
    const code = `
@Component({
  selector: 'app-foo',
  styles: \`.panel { padding: 16px; color: \${themeColor}; } .row { margin: 8px; }\`,
})
export class FooPage {}
`;
    const messages = linter.verify(code, config, PAGE_FILE);
    expect(messages.map((message) => message.messageId)).toEqual(['rawSpacing', 'rawSpacing']);
  });

  it('allows tokenized inline styles', () => {
    const code = `
@Component({
  selector: 'app-foo',
  styles: \`.panel { padding: var(--space-4); color: var(--color-ink); }\`,
})
export class FooPage {}
`;
    expect(linter.verify(code, config, PAGE_FILE)).toEqual([]);
  });

  it('ignores non-component files', () => {
    const code = `const value = 'padding: 16px; color: #fff';`;
    expect(linter.verify(code, config, SERVICE_FILE)).toEqual([]);
  });
});
