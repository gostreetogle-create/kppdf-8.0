import assert from 'node:assert/strict';
import test from 'node:test';
import { agentIdentity, extractConflictKeys, parseArgs, pathCandidates, portFor, taskFiles } from './cli.mjs';
import { conflictKeysOverlap } from './store.mjs';

test('parses agent options without requiring a separate config file', () => {
  const parsed = parseArgs(['join', '--agent', 'agent-3', '--role', 'UX QA']);
  assert.equal(parsed.command, 'join');
  assert.deepEqual(parsed.options, { agent: 'agent-3', role: 'UX QA' });
  assert.deepEqual(parsed.positional, []);
  assert.deepEqual(agentIdentity({ ...parsed.options, worktree: 'C:/repo/worktree', branch: 'feature/qa' }), { id: 'agent-3', role: 'UX QA', worktree: 'C:/repo/worktree', branch: 'feature/qa' });
});

test('uses a stable fallback agent identity for a worktree and branch', () => {
  const first = agentIdentity({ worktree: 'C:/repo/worktree', branch: 'feature/qa' });
  const second = agentIdentity({ worktree: 'C:/repo/worktree', branch: 'feature/qa' });
  assert.equal(first.id, second.id);
  assert.match(first.id, /^agent-[a-f0-9]{10}$/);
});

test('maps a repository identity to a stable local port', () => {
  assert.equal(portFor('00000000'), 4317);
  assert.equal(portFor('ffffffff'), 4412);
});

test('extracts conflict keys from explicit metadata and changed-file sections', () => {
  const content = `# TZ-238 — Foundation\n\n## 4. Файлы для изменения\n\n**ИЗМЕНЯТЬ:**\n- backend/src/modules/user/user.schema.ts\n- \`frontend/src/app/core/auth.service.ts\`\n- backend/src/modules/* (mirror)\n\n**НЕ ИЗМЕНЯТЬ:**\n- backend/src/main.ts\n`;
  assert.deepEqual(extractConflictKeys(content), [
    'backend/src/modules/user/user.schema.ts',
    'frontend/src/app/core/auth.service.ts',
    'backend/src/modules/*',
  ]);
});

test('parses repeated inline Файлы metadata used by master tasks', () => {
  const content = `#### Уровень 1\n\n**Файлы:**\n- \`frontend/src/app/shared/dsl/submit-guard.ts\` — state\n- frontend/src/app/core/idempotency.interceptor.ts — HTTP\n\n**КРИТИЧНО:** preserve one shared map.\n\n**Файлы:**\n- frontend/src/app/core/idempotency-cache.ts — cache`;
  assert.deepEqual(extractConflictKeys(content), [
    'frontend/src/app/shared/dsl/submit-guard.ts',
    'frontend/src/app/core/idempotency.interceptor.ts',
    'frontend/src/app/core/idempotency-cache.ts',
  ]);
});

test('parses bold CONFLICT KEYS metadata when no changed-file section exists', () => {
  const content = `# TZ-249 — Auth\n\n**CONFLICT KEYS:**\n- backend/src/main.ts\n- backend/src/modules/auth/auth.controller.ts\n\n## 0. Цель\n\nThe rest of the task follows.`;
  assert.deepEqual(extractConflictKeys(content), [
    'backend/src/main.ts',
    'backend/src/modules/auth/auth.controller.ts',
  ]);
});

test('reads the repository\'s current active tasks without importing protected files', () => {
  const tasks = taskFiles();
  assert.ok(tasks.length > 0, 'at least one active task should be visible');
  assert.ok(tasks.every((task) => task.sourcePath.startsWith('tasks/')));

  const cleanup = tasks.find((task) => task.id === 'TZ-CLEANUP-R2');
  assert.ok(cleanup, 'TZ-CLEANUP-R2 should be present in the active task folder');
  assert.equal(cleanup.sourcePath, 'tasks/TZ-CLEANUP-R2.md');
});

test('pathCandidates reads list items, ignores prose, and strips punctuation', () => {
  assert.deepEqual(pathCandidates('see `backend/src/ignored.ts`\n- `backend/src/main.ts`,\n* backend/src/app.module.ts (NEW)'), [
    'backend/src/main.ts',
    'backend/src/app.module.ts',
  ]);
  assert.deepEqual(pathCandidates('- package.json\n- ARCHITECTURE.md\n- docker-compose.yml\n- README.md'), [
    'package.json',
    'ARCHITECTURE.md',
    'docker-compose.yml',
    'README.md',
  ]);
});

test('conflict matching covers braces, middle wildcards, and subtrees conservatively', () => {
  assert.equal(conflictKeysOverlap(['frontend/src/app/core/{a,b}.ts'], ['frontend/src/app/core/a.ts']), true);
  assert.equal(conflictKeysOverlap(['backend/src/modules/*/auth.controller.ts'], ['backend/src/modules/auth/auth.controller.ts']), true);
  assert.equal(conflictKeysOverlap(['backend/src/modules/*'], ['backend/src/modules/auth/auth.controller.ts']), true);
  assert.equal(conflictKeysOverlap(['frontend/src/app/a.ts'], ['backend/src/app/a.ts']), false);
});
