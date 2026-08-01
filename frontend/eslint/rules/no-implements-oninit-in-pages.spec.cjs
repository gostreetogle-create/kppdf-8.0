'use strict';

/**
 * @jest-environment node
 *
 * Tests for `no-implements-oninit-in-pages` rule.
 *
 * Uses ESLint `Linter` directly (no `@typescript-eslint/rule-tester` dependency).
 */

const { Linter } = require('eslint');
const parser = require('@typescript-eslint/parser');

const rule = require('./no-implements-oninit-in-pages.cjs');

const linter = new Linter();

const baseConfig = {
  files: ['**/*'],
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  plugins: {
    'kppdf-frontend-architecture': {
      rules: { 'no-implements-oninit-in-pages': rule },
    },
  },
  rules: {
    'kppdf-frontend-architecture/no-implements-oninit-in-pages': 'error',
  },
};

const PAGE_FILE = '/repo/frontend/src/app/pages/foo/foo.page.ts';
const DIALOG_FILE = '/repo/frontend/src/app/pages/foo/foo-dialog.component.ts';
const SHARED_FILE =
  '/repo/frontend/src/app/shared/ui/pi-table/pi-table.component.ts';

describe('no-implements-oninit-in-pages', () => {
  it('passes when page has no lifecycle interface', () => {
    const code = `
import { Component } from '@angular/core';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage {}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    expect(messages).toEqual([]);
  });

  it('passes when dialog component implements OnInit (out of scope, infrastructure layer)', () => {
    const code = `
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-foo-dialog', template: '' })
export class FooDialog implements OnInit {
  ngOnInit() {}
}
`;
    const messages = linter.verify(code, baseConfig, DIALOG_FILE);
    expect(messages).toEqual([]);
  });

  it('passes when shared primitive component implements OnInit (out of scope)', () => {
    const code = `
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-pi-table', template: '' })
export class PiTableComponent implements OnInit {
  ngOnInit() {}
}
`;
    const messages = linter.verify(code, baseConfig, SHARED_FILE);
    expect(messages).toEqual([]);
  });

  it('reports OnInit implements on *.page.ts class', () => {
    const code = `
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage implements OnInit {
  ngOnInit() {}
}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    expect(messages).toHaveLength(1);
    expect(messages[0] && messages[0].messageId).toBe('noLifecycleInPage');
    expect(messages[0].message).toContain('`OnInit`');
  });

  it('reports OnDestroy implements on *.page.ts class', () => {
    const code = `
import { Component, OnDestroy } from '@angular/core';

@Component({ selector: 'app-foo-page', template: '' })
export class FooPage implements OnDestroy {
  ngOnDestroy() {}
}
`;
    const messages = linter.verify(code, baseConfig, PAGE_FILE);
    expect(messages).toHaveLength(1);
    expect(messages[0] && messages[0].messageId).toBe('noLifecycleInPage');
    expect(messages[0].message).toContain('`OnDestroy`');
  });
});
