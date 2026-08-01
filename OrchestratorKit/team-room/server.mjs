import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { TeamRoomStore } from './store.mjs';

const dashboardPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dashboard.html');

function fileURLToPath(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  return process.platform === 'win32' ? pathname.replace(/^\/(\w:)/, '$1') : pathname;
}

function json(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}

function html(res, body) {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    const invalidJson = new Error('Request body must be valid JSON');
    invalidJson.code = 'invalid-json';
    invalidJson.cause = error;
    throw invalidJson;
  }
}

function routePath(req) {
  return new URL(req.url, 'http://127.0.0.1').pathname;
}

function isLoopback(req) {
  const address = req.socket.remoteAddress;
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function sendError(res, error) {
  const status = error.code === 'invalid-json' || error.message.includes('Unknown') || error.message.includes('required') || error.message.includes('Evidence') ? 400 : 409;
  json(res, status, { error: error.message });
}

function processIsAlive(pid) {
  if (!pid) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
}

const WRITER_LOCK_MAX_AGE_MS = 30_000;

async function acquireWriterLock(stateDir, repoId) {
  const lockPath = path.join(stateDir, 'server.lock');
  const ownerPath = path.join(lockPath, 'owner.json');
  fs.mkdirSync(stateDir, { recursive: true });
  const deadline = Date.now() + WRITER_LOCK_MAX_AGE_MS;
  while (true) {
    try {
      if (fs.existsSync(lockPath) && !fs.statSync(lockPath).isDirectory()) {
        let legacy = null;
        try { legacy = JSON.parse(fs.readFileSync(lockPath, 'utf8')); } catch { /* malformed legacy lock is stale */ }
        if (legacy?.repoId && legacy.repoId !== repoId) {
          const mismatch = new Error(`Team Room lock belongs to repository ${legacy.repoId}`);
          mismatch.code = 'writer-lock-repo-mismatch';
          throw mismatch;
        }
        if (legacy?.pid && processIsAlive(legacy.pid)) {
          const active = new Error(`Team Room state is already owned by server process ${legacy.pid}`);
          active.code = 'writer-lock-held';
          throw active;
        }
        fs.rmSync(lockPath, { force: true });
      }
      fs.mkdirSync(lockPath);
      const ownerTempPath = path.join(lockPath, `owner.${process.pid}.tmp`);
      fs.writeFileSync(ownerTempPath, `${JSON.stringify({ pid: process.pid, repoId, startedAt: new Date().toISOString() })}\n`, 'utf8');
      fs.renameSync(ownerTempPath, ownerPath);
      return { lockPath };
    } catch (error) {
      if (error?.code === 'writer-lock-repo-mismatch' || error?.code === 'writer-lock-held') throw error;
      let existing = null;
      try {
        existing = JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
        if (existing.repoId !== repoId) {
          const mismatch = new Error(`Team Room lock belongs to repository ${existing.repoId ?? 'unknown'}`);
          mismatch.code = 'writer-lock-repo-mismatch';
          throw mismatch;
        }
        if (processIsAlive(existing.pid)) {
          const active = new Error(`Team Room state is already owned by server process ${existing.pid}`);
          active.code = 'writer-lock-held';
          throw active;
        }
        fs.rmSync(lockPath, { recursive: true, force: true });
      } catch (lockError) {
        if (lockError.code === 'writer-lock-repo-mismatch' || lockError.code === 'writer-lock-held') throw lockError;
        if (Date.now() >= deadline) {
          fs.rmSync(lockPath, { recursive: true, force: true });
        } else {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    }
  }
}

function releaseWriterLock(lock) {
  if (!lock) return;
  fs.rmSync(lock.lockPath, { recursive: true, force: true });
}

export function createTeamRoomServer({ store, host = '127.0.0.1', port = 0 } = {}) {
  if (!store) throw new Error('store is required');
  const server = http.createServer(async (req, res) => {
    if (!isLoopback(req)) return json(res, 403, { error: 'Team Room accepts loopback connections only' });
    const pathname = routePath(req);

    try {
      if (req.method === 'GET' && pathname === '/') {
        return html(res, fs.readFileSync(dashboardPath, 'utf8'));
      }
      if (req.method === 'GET' && pathname === '/health') {
        return json(res, 200, { ok: true, service: 'team-room', repoId: store.repoId, pid: process.pid, at: new Date().toISOString() });
      }
      if (req.method === 'GET' && pathname === '/api/state') return json(res, 200, store.snapshot());
      if (req.method === 'GET' && pathname === '/api/messages') {
        const query = new URL(req.url, 'http://127.0.0.1').searchParams;
        return json(res, 200, store.inbox(query.get('agent') ?? '', query.get('task') ?? null));
      }
      if (req.method === 'GET' && pathname === '/api/activity') return json(res, 200, store.snapshot().activity);

      if (req.method !== 'POST') return json(res, 404, { error: 'Not found' });
      const body = await readBody(req);

      if (pathname === '/api/agents/register') return json(res, 200, { agent: store.registerAgent(body) });
      if (pathname === '/api/agents/heartbeat') return json(res, 200, { agent: store.heartbeatAgent(body.id) });
      if (pathname === '/api/tasks/sync') return json(res, 200, { tasks: store.syncTasks(body.tasks ?? []) });
      if (pathname === '/api/tasks/claim') return json(res, 200, { task: store.claimTask(body.taskId, body.agentId) });
      if (pathname === '/api/tasks/heartbeat') return json(res, 200, { task: store.heartbeatTask(body.taskId, body.agentId) });
      if (pathname === '/api/tasks/status') return json(res, 200, { task: store.updateTask(body.taskId, body.agentId, body.status, body.evidence) });
      if (pathname === '/api/messages') return json(res, 201, { message: store.sendMessage(body) });
      return json(res, 404, { error: 'Not found' });
    } catch (error) {
      return sendError(res, error);
    }
  });

  let writerLock = null;
  let listening = false;
  return {
    server,
    async listen() {
      writerLock = await acquireWriterLock(store.stateDir, store.repoId);
      try {
        return await new Promise((resolve, reject) => {
          const onError = (error) => {
            server.removeListener('error', onError);
            reject(error);
          };
          server.once('error', onError);
          server.listen(port, host, () => {
            server.removeListener('error', onError);
            listening = true;
            resolve(server.address());
          });
        });
      } catch (error) {
        releaseWriterLock(writerLock);
        writerLock = null;
        throw error;
      }
    },
    close() {
      return new Promise((resolve, reject) => {
        if (!listening) {
          releaseWriterLock(writerLock);
          writerLock = null;
          resolve();
          return;
        }
        server.close((error) => {
          listening = false;
          releaseWriterLock(writerLock);
          writerLock = null;
          if (error) reject(error); else resolve();
        });
      });
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const stateDir = process.env.TEAM_ROOM_STATE_DIR;
  const repoId = process.env.TEAM_ROOM_REPO_ID ?? 'local';
  const port = Number(process.env.TEAM_ROOM_PORT ?? 4317);
  if (!stateDir) {
    console.error('TEAM_ROOM_STATE_DIR is required when starting the server directly');
    process.exit(2);
  }
  const room = createTeamRoomServer({ store: new TeamRoomStore({ stateDir, repoId, projectRoot: process.env.TEAM_ROOM_PROJECT_ROOT ?? process.cwd() }), port });
  let shuttingDown = false;
  const shutdown = async (code = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    try { await room.close(); } catch { /* server may already be closed */ }
    process.exit(code);
  };
  process.once('SIGINT', () => shutdown(0));
  process.once('SIGTERM', () => shutdown(0));
  room.listen().then((address) => {
    console.log(`Team Room listening at http://${address.address}:${address.port}`);
  }).catch((error) => {
    console.error(error.message);
    shutdown(1);
  });
}
