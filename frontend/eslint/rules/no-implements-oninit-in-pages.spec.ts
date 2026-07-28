/**
 * Spec for TZ-232.I custom ESLint rule: `no-implements-oninit-in-pages`.
 *
 * Run standalone via:
 *   pnpm exec tsx frontend/eslint/rules/no-implements-oninit-in-pages.spec.ts
 */
// TZ-232.I — Use PUBLIC API path (`@typescript-eslint/utils` root barrel).
// The deep-path import `'@typescript-eslint/utils/dist/eslint-utils/RuleTester'`
// is no longer exported in typescript-eslint@8.x under Node v24 (`exports` field
// in package.json blocks it). Use the standard root import instead.
import { RuleTester } from '@typescript-eslint/utils';
import rule from './no-implements-oninit-in-pages';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-implements-oninit-in-pages', rule, {
  valid: [
    // ── *.spec.ts — completely ignored ──
    {
      code: `
        describe('Test', () => {
          it('works', () => {
            // OnInit in spec fixture
            @Component({ template: '', selector: 'app-test' })
            class TestComp implements OnInit {
              ngOnInit() {}
            }
          });
        });
      `,
      filename: 'frontend/src/app/pages/foo/foo.page.spec.ts',
    },
    // ── Shared primitives — exempted (TZ-104.4.2 intentional OnInit) ──
    {
      code: `
        import { OnInit } from '@angular/core';
        @Component({ selector: 'app-pi-table', template: '' })
        export class TableComponent<T> implements OnInit {
          ngOnInit(): void { /* one-shot seed sync (TZ-104.4.2) */ }
        }
      `,
      // NOT a *.page.ts → rule skipped.
      filename: 'frontend/src/app/shared/ui/pi-table.component.ts',
    },
    // ── *.page.ts without OnInit — allowed ──
    {
      code: `
        @Component({ selector: 'app-foo', template: '' })
        export class FooPage {
          // Native Angular 20 component using signals + effect()
          private readonly data = signal<X[]>([]);
          constructor() {
            effect(() => { this.data.set(/* ... */); });
          }
        }
      `,
      filename: 'frontend/src/app/pages/foo/foo.page.ts',
    },
    // ── *.page.ts implements OnInit but no ngOnInit method — allowed ──
    // (decorative implements clause without real hook — common for
    //  structural typing demos / intent documents.)
    {
      code: `
        import { OnInit } from '@angular/core';
        @Component({ selector: 'app-foo', template: '' })
        export class FooPage implements OnInit {
          // No ngOnInit method — just structural conformance.
        }
      `,
      filename: 'frontend/src/app/pages/foo/foo.page.ts',
    },
  ],

  invalid: [
    // ── *.page.ts — `class X implements OnInit` with ngOnInit() ──
    {
      code: `
        import { OnInit } from '@angular/core';
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage implements OnInit {
          someSig = signal(0);
          ngOnInit(): void {
            // legacy init logic — should migrate to effect()
            this.someSig.set(42);
          }
        }
      `,
      filename: 'frontend/src/app/pages/bad/bad.page.ts',
      errors: [{ messageId: 'onInitImplementation' }],
    },
    // ── *.page.ts — multiple implemented interfaces including OnInit ──
    {
      code: `
        import { OnInit, OnDestroy } from '@angular/core';
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage implements OnInit, OnDestroy {
          ngOnInit(): void { /* legacy */ }
          ngOnDestroy(): void { /* cleanup */ }
        }
      `,
      filename: 'frontend/src/app/pages/bad/bad.page.ts',
      errors: [{ messageId: 'onInitImplementation' }],
    },
    // ── *.page.ts — qualified `core.OnInit` (legacy deep import) ──
    {
      code: `
        import * as core from '@angular/core';
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage implements core.OnInit {
          ngOnInit(): void { /* legacy */ }
        }
      `,
      filename: 'frontend/src/app/pages/bad/bad.page.ts',
      errors: [{ messageId: 'onInitImplementation' }],
    },
  ],
});

console.log(
  '✅ no-implements-oninit-in-pages: all 7 cases passed (4 valid + 3 invalid).',
);
