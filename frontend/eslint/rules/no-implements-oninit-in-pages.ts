/**
 * TZ-232.I — Custom ESLint rule: `no-implements-oninit-in-pages`.
 *
 * **Scope:** All `*.page.ts` files under `frontend/src/app/pages/` (recursive glob).
 *          (NOT shared primitives — `<pi-table.component.ts>` and similar
 *          may legitimately use `OnInit` for one-shot seed sync, see TZ-104.4.2).
 *
 * **What it bans:**
 *   - A class declaration that `implements OnInit` AND has an
 *     `ngOnInit(): void` method. Both signals are required together —
 *     a class that imports OnInit without using it (e.g. for type-only
 *     purposes) is intentionally not flagged.
 *
 * **What it allows:**
 *   - `*.spec.ts` files (testing fixtures often use OnInit for fake
 *     components).
 *   - `*.component.ts` outside `pages/` (shared primitives like
 *     `<pi-table.component.ts>` need OnInit for TZ-104.4.2 one-shot
 *     seed sync; explicitly documented as INTENTIONAL).
 *   - `*.service.ts` files (legacy infrastructure services may use
 *     OnInit for one-time setup; out of TZ-232.I scope).
 *
 * **Migration guidance (message):**
 *   - Use `effect()` for reactive setup that depends on signals.
 *   - Use `inject(...)` in constructor for one-time DI lookups.
 *   - Use ngOnInit ONLY when the class is an infrastructure service
 *     (not a page).
 *
 * **Severity:** `error`. New violations should be fixed immediately.
 *   As of TZ-232.I close (2026-07-28) NO `*.page.ts` files implement
 *   OnInit — see tasks/_archive/2026-07/TZ-232.I.done.txt for the
 *   baseline grep result.
 *
 * @see tasks/TZ-232.I.md — full TZ spec.
 * @see TZ-232 master plan §2.1 — explicit OnInit migration scope
 *   (FIX H1 from review covers 7 list-pages + 1 shared primitive
 *   exemption for pi-table).
 */
import { ESLintUtils, AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.kppdf.dev/eslint-rules/${name} (TZ-232.I)`,
);

type MessageId = 'onInitImplementation';
const ONINIT_NAME = 'OnInit';

export default createRule({
  name: 'no-implements-oninit-in-pages',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ban `implements OnInit` in *.page.ts files. Migrate to effect() or inject() in constructor.',
      recommended: 'error',
    },
    schema: [],
    messages: {
      onInitImplementation:
        '`implements OnInit` is banned in *.page.ts. Migrate to `effect()` (signal-based) for reactive setup, or `inject(...)` in constructor for one-time DI. ngOnInit is reserved for infrastructure services per TZ-232 §1.4.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename();
    // Scope: only *.page.ts in any directory. Other Component files
    // (shared primitives, services) are not in scope for this rule.
    if (!filename.endsWith('.page.ts')) return {};
    if (filename.endsWith('.spec.ts')) return {};
    // Path guard: scope is pages/**/*.page.ts. (page.ts files outside
    // pages/ are not audience of this rule.) Commented as a string
    // comparison rather than a fs path check because ESLint's filename
    // is relative to project root.
    if (!/\/pages\//.test(filename)) return {};

    return {
      // Class declaration with `implements OnInit` (with or without
      // other implemented interfaces). Identifier.member expression
      // `OnInit` can be either bare `OnInit` or qualified `@angular/core.OnInit` —
      // both treated equally.
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        const implementsClause = node.implements;
        if (!implementsClause || implementsClause.length === 0) return;
        const hasOnInit = implementsClause.some((impl) => {
          // Expression form: `Identifier { name: 'OnInit' }` for bare
          // `OnInit`; `TSQualifiedName { left: Identifier, right: Identifier }`
          // for `Foo.OnInit`.
          if (impl.expression.type === AST_NODE_TYPES.Identifier) {
            return impl.expression.name === ONINIT_NAME;
          }
          if (impl.expression.type === AST_NODE_TYPES.TSQualifiedName) {
            return impl.expression.right.name === ONINIT_NAME;
          }
          return false;
        });
        if (!hasOnInit) return;

        // Additional confirmation: ngOnInit() method present? If not,
        // the implements clause is decorative noise, not a real lifecycle
        // hook — allow it (a class can `implements` an interface for
        // structural reasons without invoking ngOnInit).
        const hasNgOnInit = node.body.body.some(
          (m) =>
            m.type === AST_NODE_TYPES.MethodDefinition &&
            m.key.type === AST_NODE_TYPES.Identifier &&
            m.key.name === 'ngOnInit',
        );
        if (!hasNgOnInit) return;

        context.report({
          node: node.id ?? node,
          messageId: 'onInitImplementation',
        });
      },
    };
  },
});
