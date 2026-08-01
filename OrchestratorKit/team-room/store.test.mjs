import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { TeamRoomStore, LEASE_MS } from './store.mjs';

function makeStore() {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-store-'));
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-project-'));
  fs.mkdirSync(path.join(projectRoot, 'tasks', '_archive', '2026-08'), { recursive: true });
  return { store: new TeamRoomStore({ stateDir, repoId: 'test-repo', projectRoot }), stateDir, projectRoot };
}

function seed(store) {
  store.registerAgent({ id: 'agent-a', role: 'backend', worktree: 'C:/repo/a', branch: 'a' });
  store.registerAgent({ id: 'agent-b', role: 'frontend', worktree: 'C:/repo/b', branch: 'b' });
  store.syncTasks([
    { id: 'TZ-A', title: 'A', sourcePath: 'tasks/TZ-A.md', conflictKeys: ['backend/src/main.ts'] },
    { id: 'TZ-B', title: 'B', sourcePath: 'tasks/TZ-B.md', conflictKeys: ['backend/src/main.ts'] },
    { id: 'TZ-C', title: 'C', sourcePath: 'tasks/TZ-C.md', conflictKeys: ['frontend/src/app.ts'] },
  ]);
}

test('claims reject duplicate owners and overlapping conflict keys', () => {
  const { store } = makeStore();
  seed(store);
  assert.equal(store.claimTask('TZ-A', 'agent-a').owner, 'agent-a');
  assert.throws(() => store.claimTask('TZ-A', 'agent-b'), /owned by agent-a/);
  assert.throws(() => store.claimTask('TZ-B', 'agent-b'), /Conflict with TZ-A/);
  assert.equal(store.claimTask('TZ-C', 'agent-b').owner, 'agent-b');
});

test('messages persist and are available to the addressed agent', () => {
  const { store, stateDir } = makeStore();
  seed(store);
  const message = store.sendMessage({ from: 'agent-a', to: 'agent-b', taskId: 'TZ-A', body: 'Please review the API boundary.' });
  assert.equal(store.inbox('agent-b')[0].id, message.id);
  const reloaded = new TeamRoomStore({ stateDir, repoId: 'test-repo' });
  assert.equal(reloaded.inbox('agent-b')[0].body, 'Please review the API boundary.');
});

test('expired task lease returns to ready and records recovery', () => {
  const { store } = makeStore();
  seed(store);
  store.claimTask('TZ-A', 'agent-a');
  store.state.tasks['TZ-A'].leaseUntil = new Date(Date.now() - LEASE_MS - 1).toISOString();
  const state = store.snapshot();
  assert.equal(state.tasks['TZ-A'].status, 'ready');
  assert.equal(state.tasks['TZ-A'].owner, null);
  assert.equal(state.activity[0].type, 'task-released-stale');
});

test('task sync removes ready tasks that disappeared from the active folder', () => {
  const { store } = makeStore();
  seed(store);
  assert.equal(Object.keys(store.snapshot().tasks).length, 3);
  store.syncTasks([{ id: 'TZ-A', title: 'A', sourcePath: 'tasks/TZ-A.md', conflictKeys: ['backend/src/main.ts'] }]);
  assert.deepEqual(Object.keys(store.snapshot().tasks), ['TZ-A']);
});

test('completion requires durable evidence', () => {
  const { store, projectRoot } = makeStore();
  seed(store);
  store.claimTask('TZ-A', 'agent-a');
  assert.throws(() => store.updateTask('TZ-A', 'agent-a', 'done'), /requires evidence/);
  const evidencePath = path.join(projectRoot, 'tasks', '_archive', '2026-08', 'TZ-A.done.md');
  fs.writeFileSync(evidencePath, 'ARCHIVE_MARKER\noutcome: DONE\n', 'utf8');
  assert.throws(() => store.updateTask('TZ-A', 'agent-a', 'done', path.join(projectRoot, 'TZ-A.done.md')), /inside tasks\/_archive/);
  assert.throws(() => store.updateTask('TZ-A', 'agent-a', 'done', path.join(projectRoot, 'tasks', '_archive', '2026-08', 'TZ-B.done.md')), /archive record for TZ-A/);
  const completed = store.updateTask('TZ-A', 'agent-a', 'done', evidencePath);
  assert.equal(completed.evidence, evidencePath);
  assert.equal(completed.status, 'done');
});
