# TZ-FRONTEND-302-A3 checklist

- [x] Current canonical amendment verified at `483ebd0ba6ac82615645cd4077d7e7b69fe17772`.
- [x] A1 and A2 pushed before A3.
- [x] Expanded exact keys claimed through Team Room.
- [x] Page-local `ImportTodosService` created for the existing markDone PATCH.
- [x] Service characterization spec added: URL, PATCH payload, and silent error contract.
- [x] Page GET remains `httpResource` at `/import-todos`.
- [x] Load/error/empty/mark-done behavior preserved; page still reloads and toasts on success.
- [x] Frontend tsc PASS: `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- [x] Focused Jest PASS: service 2/2.
- [x] Changed-file ESLint PASS: 3 exact files, 0 errors/warnings.
- [x] architecture:check PASS: 937 files, baseline 6.
- [x] git diff --check PASS.
- [ ] Browser smoke: authenticated import-todos route unavailable in this headless worktree; service contract covers mark-done and existing resource signals preserve loading/error/empty behavior.
- [x] Implementation commit: `dfd5e26b`.
- [x] Pushed branch SHA: `dfd5e26bb7cd6f651cd34f9e925a90d6ba82d5d9`.

## Implementation evidence

`ImportTodosService` is page-local and owns only the existing PATCH URL/payload. `ImportTodosPage` retains `httpResource` GET and all filter, toast, reload, and UI behavior. No `shared/services/**` file, endpoint, RBAC, or UX behavior changed.
