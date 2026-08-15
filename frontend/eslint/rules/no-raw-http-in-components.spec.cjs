/**
 * @jest-environment node
 *
 * Tests for `no-raw-http-in-components` rule.
 *
 * Uses ESLint `Linter` directly (no `@typescript-eslint/rule-tester` dependency
 * — keeps the dev-dep surface minimal per project constraint "Не добавляй
 * необязательные зависимости").
 */

'use strict';

const { Linter } = require('eslint');
const parser = require('@typescript-eslint/parser');

const rule = require('./no-raw-http-in-components.cjs');

const linter = new Linter();

const baseConfig = {
  files: ['**/*.ts'],
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  plugins: {
    'kppdf-frontend-architecture': {
      rules: { 'no-raw-http-in-components': rule },
    },
  },
  rules: {
    'kppdf-frontend-architecture/no-raw-http-in-components': 'error',
  },
};

// Fixture filenames are relative to the frontend cwd (ESLint flat-config
// `files` patterns are matched against paths relative to the config base
// path; absolute /repo/... paths fall outside it and never match).
const PAGE_FILE = 'src/app/pages/foo/foo.page.ts';
const COMPONENT_FILE = 'src/app/shared/ui/foo/foo.component.ts';
const SERVICE_FILE = 'src/app/services/foo.service.ts';

describe('no-raw-http-in-components', () => {
  it('passes when no HttpClient import or usage in *.page.ts', () => {
    const code = `
import { Component } from '@angular/core';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage {}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    expect(messages).toEqual([]);
  });

  it('passes when HttpClient is imported + used in *.service.ts (out of scope)', () => {
    const code = `
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FooService {
  constructor(http) {}
  fetch() { return this.http.get('/api/foo'); }
}
`;
    const messages = linter.verify(code, baseConfig, SERVICE_FILE);
    expect(messages).toEqual([]);
  });

  it('passes when HttpErrorResponse is imported in *.page.ts (HttpErrorResponse is only a type)', () => {
    const code = `
import { HttpErrorResponse } from '@angular/common/http';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage {}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    // HttpErrorResponse is ALLOWED (just a type for error handling, not fetching).
    expect(messages).toEqual([]);
  });

  it('reports HttpClient import in *.page.ts', () => {
    const code = `
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage {
  constructor(http) {}
}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    expect(messages).toHaveLength(1);
    expect(messages[0] && messages[0].messageId).toBe('noRawHttpImport');
  });

  it('reports HttpClient import + this.http.get call in *.component.ts (both messages)', () => {
    const code = `
import { HttpClient } from '@angular/common/http';

@Component({ selector: 'app-foo', template: '' })
export class FooComponent {
  constructor(http) {}
  fetchData() { return this.http.get('/api/foo'); }
}
`;
    const messages = linter.verify(code, baseConfig, COMPONENT_FILE);
    expect(messages).toHaveLength(2);
    const ids = messages.map((m) => m.messageId).sort();
    expect(ids).toEqual(['noRawHttpCall', 'noRawHttpImport']);
  });
});
