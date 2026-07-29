/**
 * Spec for TZ-232.I custom ESLint rule: `no-raw-http-in-components`.
 *
 * Run standalone via:
 *   pnpm exec tsx frontend/eslint/rules/no-raw-http-in-components.spec.ts
 *
 * RuleTester prints PASS/FAIL summary per case and exits non-zero on
 * any unexpected violation. Output format mirrors ESLint's standard
 * test runner so CI greppable fail messages work out-of-the-box.
 *
 * @see docs/DEVELOPMENT-PATTERNS.md — DSL conventions.
 */
// TZ-232.I — Use the 'ts-eslint' subpath from '@typescript-eslint/utils'.
// The root barrel re-exports RuleTester via TSESLint namespace (CJS runtime),
// which tsx/esbuild mis-resolves. The 'ts-eslint' subpath exports RuleTester
// directly and works with both tsx and Node.js CJS/ESM loaders.
// See package.json "exports" map: "./ts-eslint" → "./dist/ts-eslint/index.js".
import { RuleTester } from '@typescript-eslint/utils/ts-eslint';
import rule from './no-raw-http-in-components';

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

// Each test case sets `filename` to simulate ESLint's runtime context.
// `.component.ts` → rule applies. `.spec.ts`/`.service.ts`/etc → rule skipped.
ruleTester.run('no-raw-http-in-components', rule, {
  valid: [
    // ── *.service.ts — completely ignored (scope is *.component.ts) ──
    {
      code: `
        @Injectable({ providedIn: 'root' })
        export class MaterialsService {
          constructor(private http: HttpClient) {}
          list() { return this.http.get('/api/materials'); }
          create(body: any) { return this.http.post('/api/materials', body); }
        }
      `,
      filename: 'frontend/src/app/shared/services/materials.service.ts',
    },
    // ── *.spec.ts — completely ignored ──
    {
      code: `
        describe('MaterialsService', () => {
          it('lists', () => {
            const svc = new MaterialsService(httpMock);
            svc.list();  // this.http.get inside test
          });
        });
      `,
      filename: 'frontend/src/app/pages/materials/materials.page.spec.ts',
    },
    // ── *.component.ts — httpResource is allowed (signal-based HTTP) ──
    {
      code: `
        @Component({ selector: 'app-foo', template: '' })
        export class FooPage {
          private readonly data = httpResource<Material[]>(() => '/api/materials');
        }
      `,
      filename: 'frontend/src/app/shared/components/foo/foo.component.ts',
    },
    // ── *.component.ts — HttpParams / HttpErrorResponse imports are allowed ──
    {
      code: `
        import { HttpParams, HttpErrorResponse } from '@angular/common/http';
        @Component({ selector: 'app-foo', template: '' })
        export class FooPage {
          error: HttpErrorResponse | null = null;
          buildParams(): HttpParams { return new HttpParams().set('a', '1'); }
        }
      `,
      filename: 'frontend/src/app/shared/components/foo/foo.component.ts',
    },
    // ── *.component.ts — bare `this.http` reference w/o chained verb ──
    {
      code: `
        // Just exposing this.http to a child via a getter — no .get/post/etc.
        @Component({ selector: 'app-foo', template: '' })
        export class FooPage {
          get raw() { return this.http; }
        }
      `,
      filename: 'frontend/src/app/shared/components/foo/foo.component.ts',
    },
  ],

  invalid: [
    // ── *.component.ts — `this.http.get(...)` should fail ──
    {
      code: `
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage {
          constructor(private http: HttpClient, private baseUrl: string) {}
          list() {
            return this.http.get<Material[]>(this.baseUrl + '/materials');
          }
        }
      `,
      filename: 'frontend/src/app/shared/components/bad/bad.component.ts',
      errors: [{ messageId: 'rawHttpCall' }],
    },
    // ── *.component.ts — `this.http.post(...)` should fail ──
    {
      code: `
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage {
          constructor(private http: HttpClient) {}
          save(body: Material) {
            return this.http.post('/api/materials', body).subscribe();
          }
        }
      `,
      filename: 'frontend/src/app/shared/components/bad/bad.component.ts',
      errors: [{ messageId: 'rawHttpCall' }],
    },
    // ── *.component.ts — all 5 HTTP verbs fail ──
    {
      code: `
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage {
          constructor(private http: HttpClient) {}
          a() { return this.http.get('/api/x'); }
          b() { return this.http.post('/api/x', {}); }
          c() { return this.http.put('/api/x', {}); }
          d() { return this.http.patch('/api/x', {}); }
          e() { return this.http.delete('/api/x'); }
        }
      `,
      filename: 'frontend/src/app/shared/components/bad/bad.component.ts',
      errors: [
        { messageId: 'rawHttpCall' },
        { messageId: 'rawHttpCall' },
        { messageId: 'rawHttpCall' },
        { messageId: 'rawHttpCall' },
        { messageId: 'rawHttpCall' },
      ],
    },
    // ── *.component.ts — direct HttpClient import fails ──
    {
      code: `
        import { HttpClient } from '@angular/common/http';
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage {
          constructor(private http: HttpClient) { /* ... */ }
        }
      `,
      filename: 'frontend/src/app/shared/components/bad/bad.component.ts',
      errors: [{ messageId: 'rawHttpImport' }],
    },
    // ── *.component.ts — HttpClient + other http imports; only HttpClient fails ──
    {
      code: `
        import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
        @Component({ selector: 'app-bad', template: '' })
        export class BadPage {
          params: HttpParams = new HttpParams();
          constructor(private http: HttpClient, private base: string) {}
          load() { return this.http.get(this.base); }
        }
      `,
      filename: 'frontend/src/app/shared/components/bad/bad.component.ts',
      errors: [
        { messageId: 'rawHttpImport' },
        { messageId: 'rawHttpCall' },
      ],
    },
  ],
});

// Standalone-runner summary: when this file is invoked via tsx, the
// RuleTester above runs synchronously and prints a green/red summary.
// No explicit `process.exit` needed — RuleTester throws on any invalid
// case that unexpectedly passes (or vice versa), which bubbles up to
// the runner as a non-zero exit.
console.log('✅ no-raw-http-in-components: all 10 cases passed (5 valid + 5 invalid).');
