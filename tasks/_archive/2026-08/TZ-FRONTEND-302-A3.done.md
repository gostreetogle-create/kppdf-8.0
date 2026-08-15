# TZ-FRONTEND-302-A3 DONE

- Lane: A
- Parent: TZ-FRONTEND-302
- Canonical amendment: `483ebd0ba6ac82615645cd4077d7e7b69fe17772`
- Exact keys: `import-todos.page.ts`, page-local `import-todos.service.ts`, and `import-todos.service.spec.ts`.

## Evidence

- Existing GET remains `httpResource` at `/import-todos`.
- Existing PATCH `/import-todos/:id` with `{ status: 'done' }` moved into the page-local service.
- Focused Jest: 2/2 PASS.
- Frontend tsc: PASS.
- Changed-file ESLint: PASS.
- Architecture check: PASS, 937 files, baseline 6.
- `git diff --check`: PASS.
- Browser: authenticated route unavailable in headless worktree; service contract covers mark-done and page resource behavior was unchanged.

No shared service, endpoint, RBAC, or UI behavior changed. Deploy: НЕ.
