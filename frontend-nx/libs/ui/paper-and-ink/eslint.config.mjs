import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: '',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: '',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.html'],
    rules: {
      '@angular-eslint/no-output-native': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@angular-eslint/template/alt-text': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/eqeqeq': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/prefer-inject': 'off',
    },
  },
  {
    // PiThemeEditor consumes public secondary entries (@kppdf/ui/*) by design — TZ-NX-B0-1.
    files: ['**/theme/pi-theme-editor.component.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
