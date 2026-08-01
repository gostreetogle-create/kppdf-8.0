import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { TeamRoomStore } from './store.mjs';
import { createTeamRoomServer } from './server.mjs';

async function roomFixture() {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-server-'));
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'server-test' }) });
  const address = await room.listen();
  return { room, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function request(baseUrl, method, endpoint, body) {
  const response = await fetch(`${baseUrl}${endpoint}`, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json() };
}

test('serves health and protects task APIs with registration/claim rules', async (t) => {
  const { room, baseUrl } = await roomFixture();
  t.after(() => room.close());
  assert.equal((await request(baseUrl, 'GET', '/health')).body.ok, true);
  assert.equal((await request(baseUrl, 'POST', '/api/agents/register', { id: 'agent-a', role: 'qa' })).status, 200);
  await request(baseUrl, 'POST', '/api/tasks/sync', { tasks: [{ id: 'TZ-1', title: 'Test', conflictKeys: ['frontend/src/main.ts'] }] });
  const claim = await request(baseUrl, 'POST', '/api/tasks/claim', { taskId: 'TZ-1', agentId: 'agent-a' });
  assert.equal(claim.status, 200);
  assert.equal(claim.body.task.owner, 'agent-a');
});

test('returns a conflict response for overlapping task claims', async (t) => {
  const { room, baseUrl } = await roomFixture();
  t.after(() => room.close());
  await request(baseUrl, 'POST', '/api/agents/register', { id: 'agent-a' });
  await request(baseUrl, 'POST', '/api/agents/register', { id: 'agent-b' });
  await request(baseUrl, 'POST', '/api/tasks/sync', { tasks: [
    { id: 'TZ-1', title: 'One', conflictKeys: ['shared/file.ts'] },
    { id: 'TZ-2', title: 'Two', conflictKeys: ['shared/file.ts'] },
  ] });
  await request(baseUrl, 'POST', '/api/tasks/claim', { taskId: 'TZ-1', agentId: 'agent-a' });
  const response = await request(baseUrl, 'POST', '/api/tasks/claim', { taskId: 'TZ-2', agentId: 'agent-b' });
  assert.equal(response.status, 409);
  assert.match(response.body.error, /Conflict with TZ-1/);
});

test('rejects malformed JSON with a client error', async (t) => {
  const { room, baseUrl } = await roomFixture();
  t.after(() => room.close());
  const response = await fetch(`${baseUrl}/api/agents/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid JSON/);
});

test('delivers a durable task message', async (t) => {
  const { room, baseUrl } = await roomFixture();
  t.after(() => room.close());
  await request(baseUrl, 'POST', '/api/agents/register', { id: 'agent-a' });
  await request(baseUrl, 'POST', '/api/agents/register', { id: 'agent-b' });
  const sent = await request(baseUrl, 'POST', '/api/messages', { from: 'agent-a', to: 'agent-b', body: 'Ready for review.' });
  assert.equal(sent.status, 201);
  const inbox = await request(baseUrl, 'GET', '/api/messages?agent=agent-b');
  assert.equal(inbox.body[0].body, 'Ready for review.');
});

test('rejects a second writer for the same state directory', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-writer-'));
  const first = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'writer-test' }) });
  const second = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'writer-test' }) });
  await first.listen();
  t.after(() => first.close());
  await assert.rejects(() => second.listen(), /already owned by server process/);
});

test('recovers a stale writer lock before listening', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-stale-lock-'));
  fs.mkdirSync(path.join(stateDir, 'server.lock'));
  fs.writeFileSync(path.join(stateDir, 'server.lock', 'owner.json'), JSON.stringify({ pid: 999999, repoId: 'stale-test' }), 'utf8');
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'stale-test' }) });
  await room.listen();
  t.after(() => room.close());
  assert.ok(fs.existsSync(path.join(stateDir, 'server.lock')));
});

test('does not adopt a lock belonging to another repository', async () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-lock-mismatch-'));
  fs.mkdirSync(path.join(stateDir, 'server.lock'));
  fs.writeFileSync(path.join(stateDir, 'server.lock', 'owner.json'), JSON.stringify({ pid: process.pid, repoId: 'other-repo' }), 'utf8');
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'current-repo' }) });
  await assert.rejects(() => room.listen(), /lock belongs to repository other-repo/);
});

test('recovers a dead legacy file lock for the same repository', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-legacy-lock-'));
  fs.writeFileSync(path.join(stateDir, 'server.lock'), JSON.stringify({ pid: 999999, repoId: 'legacy-test' }), 'utf8');
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'legacy-test' }) });
  await room.listen();
  t.after(() => room.close());
  assert.ok(fs.statSync(path.join(stateDir, 'server.lock')).isDirectory());
});

test('rejects an active legacy file lock for the same repository', async () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-room-legacy-active-'));
  fs.writeFileSync(path.join(stateDir, 'server.lock'), JSON.stringify({ pid: process.pid, repoId: 'legacy-active' }), 'utf8');
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId: 'legacy-active' }) });
  await assert.rejects(() => room.listen(), /already owned by server process/);
});
