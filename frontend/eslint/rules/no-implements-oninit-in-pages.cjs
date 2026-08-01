'use strict';

/**
 * kppdf-frontend-architecture / no-implements-oninit-in-pages (CommonJS)
 *
 * Forbids `extends … implements OnInit` (or other lifecycle interfaces) on
 * page classes in `*.page.ts` files.
 *
 * Why:
 *   Per TZ-232 spec §1.4 "Other safety mechanisms built into DSL":
 *   - `OnInit` in page-components is legacy — pages should use signals +
 *     effect() or constructor-time initialization. Lifecycle hooks are
 *     reserved for infrastructure-layer services (interceptors, directives).
 *   - Complements `@angular-eslint/use-lifecycle-interface: 'error'` which
 *     *requires* `implements OnInit` when ngOnInit is used. Both rules
 *     coexist intentionally: the existing rule enforces contract
 *     correctness; this new rule enforces architectural cleanliness on
 *     pages (banning the page-level pattern entirely).
 *
 * Allowed:
 *   - `*.dialog.component.ts` / `*.modal.component.ts` — dialogs are
 *     infrastructure-layer; lifecycle hooks are acceptable.
 *   - `*.directive.ts` / `*.service.ts`
 *   - `*.component.ts` (shared primitives; e.g. `pi-table.component.ts`
 *     implements OnInit INTENTIONAL for one-shot seed sync). NOT page-level.
 *
 * Tests: ./no-implements-oninit-in-pages.spec.cjs (3 PASS + 2 FAIL fixtures)
 */

const LIFECYCLE_INTERFACES = new Set([
  'OnInit',
  'OnDestroy',
  'OnChanges',
  'AfterViewInit',
  'AfterContentInit',
  'AfterViewChecked',
  'AfterContentChecked',
  'DoCheck',
]);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbid `implements OnInit` (or other lifecycle interfaces) on page classes in `*.page.ts`. Use signals + effect() instead.',
      recommended: 'warn',
    },
    schema: [],
    messages: {
      noLifecycleInPage:
        'Lifecycle interface `{{name}}` on a `*.page.ts` class is forbidden. Use signals + effect() or constructor-time initialization; lifecycle hooks belong in infrastructure-layer services only.',
    },
  },

  create(context) {
    const filename = context.filename || '';

    // Scope: *.page.ts ONLY (not dialog components, not shared components).
    if (!filename.endsWith('.page.ts')) {
      return {};
    }

    return {
      TSClassDeclaration(node) {
        if (!node.implements || node.implements.length === 0) return;
        for (const impl of node.implements) {
          if (
            impl.expression.type === 'Identifier' &&
            LIFECYCLE_INTERFACES.has(impl.expression.name)
          ) {
            context.report({
              node: impl,
              messageId: 'noLifecycleInPage',
              data: { name: impl.expression.name },
            });
          }
        }
      },
    };
  },
};
