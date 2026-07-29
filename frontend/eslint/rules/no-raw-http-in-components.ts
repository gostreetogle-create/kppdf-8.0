/**
 * TZ-232.I — Custom ESLint rule: `no-raw-http-in-components`.
 *
 * **Scope:** All `*.component.ts` files under `frontend/src/` (recursive glob).
 *          (NOT services, NOT interceptors, NOT specs).
 *
 * **What it bans:**
 *   1. Direct `this.http.<get|post|put|patch|delete>(...)` member calls
 *      inside a @Component class — bypasses the DSL Repository layer.
 *   2. Direct imports of `HttpClient` from `@angular/common/http` in
 *      *.component.ts files — even importing the symbol shows intent to
 *      use raw HTTP later.
 *
 * **What it allows:**
 *   - `httpResource(...)` calls (Angular 20 signal-based HTTP — used by
 *     proper DSL primitives like `<pi-lookup-*>`/`<pi-data-grid>`).
 *   - `HttpParams`, `HttpErrorResponse` imports (used by lookup tables
 *     for URL building / error normalisation).
 *   - Any usage in `*.service.ts`, `*.interceptor.ts`, `*.spec.ts`.
 *
 * **Migration guidance (message):**
 *   - Use `defineEntity<T, P>({ endpoint, idKey })` from
 *     `frontend/src/app/shared/dsl/entity/` to build a typed CRUD
 *     service for a canonical entity.
 *   - For services with custom endpoints (upload, bulk reorder, custom
 *     routes), hand-write the service and consume it through
 *     `toEntityService<T, P>(svc)` adapter.
 *
 * **Severity:** `error`. Blocks `pnpm lint` exit code for any new
 *   violation. One pre-existing violation in
 *   `pages/doc-constructor/templates/templates.page.ts` (3 lines: raw
 *   `this.http.get/post` calls) is annotated with
 *   `// eslint-disable-next-line` and a TODO referencing TZ-232.F.
 *
 * @see tasks/TZ-232.I.md — full TZ spec.
 * @see docs/DEVELOPMENT-PATTERNS.md — DSL conventions.
 */
import { ESLintUtils, AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://docs.kppdf.dev/eslint-rules/${name} (TZ-232.I)`,
);

type MessageId = 'rawHttpCall' | 'rawHttpImport';

const HTTP_VERBS = new Set(['get', 'post', 'put', 'patch', 'delete']);

export default createRule({
  name: 'no-raw-http-in-components',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban `this.http.<verb>(...)` member calls and direct HttpClient imports inside *.component.ts (use DSL via defineEntity()).',
      recommended: 'error',
    },
    schema: [],
    messages: {
      rawHttpCall:
        '`this.http.{{method}}(...)` is banned in *.component.ts. Use `defineEntity()` from `shared/dsl/entity/` (or `toEntityService(svc)` adapter for hand-written services).',
      rawHttpImport:
        '`HttpClient` import is banned in *.component.ts. Use the DSL Repository layer (defineEntity/toEntityService) instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename();
    // Filename filter: only *.component.ts (excluding *.spec.ts).
    // We intentionally do NOT rely on the eslint.config.js `files` glob
    // because custom rules inline this check — keeps the rule portable
    // across any future config split (e.g. per-feature configs).
    if (!filename.endsWith('.component.ts')) return {};
    if (filename.endsWith('.spec.ts')) return {};

    /**
     * Returns true if a MemberExpression is `this.http` (literally,
     * not e.g. `this.something.http`).
     */
    function isThisHttp(node: TSESTree.MemberExpression): boolean {
      if (node.object.type !== AST_NODE_TYPES.ThisExpression) return false;
      if (node.property.type !== AST_NODE_TYPES.Identifier) return false;
      return node.property.name === 'http';
    }

    return {
      // Direct import of HttpClient from @angular/common/http
      // (block, but allow HttpParams/HttpErrorResponse).
      ImportDeclaration(node) {
        if (node.source.value !== '@angular/common/http') return;
        const importsHttpClient = node.specifiers.some(
          (s) => s.type === AST_NODE_TYPES.ImportSpecifier && s.imported.name === 'HttpClient',
        );
        if (!importsHttpClient) return;
        context.report({
          node: node.source,
          messageId: 'rawHttpImport',
        });
      },

      // `this.http.<verb>(...)` — only the chained `.method(...)` form.
      // Bare `this.http` references (e.g. `const ref = this.http;`) are
      // intentionally not flagged: rare and harder to detect, but also
      // isolated — if such a ref exists, the actual `.get/post` call
      // surface will be flagged when invoked.
      //
      // AST chain: this.http → this.http.<verb> → this.http.<verb>(...)
      // The inner MemberExpression (this.http) has a parent that is another
      // MemberExpression (this.http.<verb>), whose parent is the CallExpression.
      MemberExpression(node) {
        if (!isThisHttp(node)) return;

        // Step up: node is `this.http`, its parent should be `this.http.<verb>`
        const verbNode = node.parent;
        if (!verbNode || verbNode.type !== AST_NODE_TYPES.MemberExpression) return;

        // Step up again: verbNode's parent should be the CallExpression
        const callNode = verbNode.parent;
        if (!callNode || callNode.type !== AST_NODE_TYPES.CallExpression) return;
        if (callNode.callee !== verbNode) return;

        const calleeProperty = verbNode.property;
        if (calleeProperty.type !== AST_NODE_TYPES.Identifier) return;
        if (!HTTP_VERBS.has(calleeProperty.name)) return;

        context.report({
          node: callNode,
          messageId: 'rawHttpCall',
          data: { method: calleeProperty.name },
        });
      },
    };
  },
});
