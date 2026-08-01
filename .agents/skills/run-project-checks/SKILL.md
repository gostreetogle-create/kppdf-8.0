---
name: run-project-checks
description: Запуск проверок kppdf-8.0 (tsc, jest, lint) перед коммитом.
disable-model-invocation: true
---

# run-project-checks

1. cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
2. cd frontend && pnpm exec jest --no-coverage
3. cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
4. cd backend && pnpm exec jest --no-coverage
5. git diff --check
