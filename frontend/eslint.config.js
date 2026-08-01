// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/template-parser');
const noRawHttpInComponentsRule = require('./eslint/rules/no-raw-http-in-components.cjs');
const noImplementsOnInitInPagesRule = require('./eslint/rules/no-implements-oninit-in-pages.cjs');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.js',
      '*.mjs',
      '!eslint.config.js',
      // TZ-232.I custom rule sources — excluded from app lint pass because
      // they intentionally use `require('@typescript-eslint/parser')` for
      // Linter-based spec tests; linted separately via their own *.spec.ts.
      'eslint/rules/',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular,
      'kppdf-frontend-architecture': {
        meta: {
          name: 'eslint-plugin-kppdf-frontend-architecture',
          version: '0.1.0',
        },
        rules: {
          'no-raw-http-in-components': noRawHttpInComponentsRule,
          'no-implements-oninit-in-pages': noImplementsOnInitInPagesRule,
        },
      },
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: '', style: 'kebab-case' }],
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      'no-console': ['warn', { allow: ['error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // ── TZ-232.I enforcement rules (Wave F tooling) ──────────────────────
  {
    files: ['**/*.page.ts'],
    rules: {
      'kppdf-frontend-architecture/no-raw-http-in-components': 'warn',
      'kppdf-frontend-architecture/no-implements-oninit-in-pages': 'warn',
    },
  },
  {
    files: ['**/*.component.ts'],
    rules: {
      'kppdf-frontend-architecture/no-raw-http-in-components': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplate,
    },
    plugins: {
      '@angular-eslint': angular,
      'kppdf-frontend-architecture': {
        meta: {
          name: 'eslint-plugin-kppdf-frontend-architecture',
          version: '0.1.0',
        },
        rules: {
          'no-raw-http-in-components': noRawHttpInComponentsRule,
          'no-implements-oninit-in-pages': noImplementsOnInitInPagesRule,
        },
      },
    },
    rules: {},
  },
);
