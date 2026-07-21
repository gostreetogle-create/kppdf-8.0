// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/template-parser');

module.exports = tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.mjs', '!eslint.config.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular,
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
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplate,
    },
    plugins: {
      '@angular-eslint': angular,
    },
    rules: {},
  },
);
