#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.join(HERE, 'server.mjs');
const PROJECT_ROOT = path.resolve(HERE, '..', '..');
const DEFAULT_PORT_BASE = 4317;
const STARTUP_TIMEOUT_MS = 10_000;
const STARTUP_LOCK_MAX_AGE_MS = 30_000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 60_000;

function git(args) {
  try {
    return execFileSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function repositoryIdentity() {
  const common = git(['rev-parse', '--git-common-dir']) || PROJECT_ROOT;
  const absolute = path.resolve(PROJECT_ROOT, common);
  return { commonDir: absolute, repoId: crypto.createHash('sha256').update(absolute.toLowerCase()).digest('hex').slice(0, 16) };
}

function stateRoot(repoId) {
  const base = process.env.LOCALAPPDATA || process.env.APPDATA || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'kppdf-team-room', repoId);
}

function portFor(repoId) {
  const value = Number.parseInt(repoId.slice(0, 8), 16);
  return DEFAULT_PORT_BASE + (value % 400);
}

function parseArgs(argv) {
  const [command = 'join', ...rest] = argv;
  const options = {};
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (!value.startsWith('--')) {
      positional.push(value);
      continue;
    }
    const key = value.slice(2).replaceAll('-', '_');
    const next = rest[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return { command, positional, options };
}

function agentIdentity(options) {
  const worktree = options.worktree || git(['rev-parse', '--show-toplevel']) || PROJECT_ROOT;
  const branch = options.branch || git(['branch', '--show-current']) || 'detached';
  const stableId = `agent-${crypto.createHash('sha256').update(`${worktree.toLowerCase()}\n${branch}`).digest('hex').slice(0, 10)}`;
  return {
    id: String(options.agent || process.env.TEAM_ROOM_AGENT_ID || stableId),
    role: String(options.role || process.env.TEAM_ROOM_ROLE || 'coding agent'),
    worktree,
    branch,
  };
}

const PATH_TOKEN = '(?:backend|frontend|docs|OrchestratorKit|scripts|tasks|reports|\\.github)(?:/[^\\s,;:)]+)?|package\\.json|ARCHITECTURE\\.md|README\\.md|docker-compose(?:\\.prod)?\\.yml';
const PATH_PATTERN = new RegExp('`([^`]+)`|(?:^|[\\s,])(' + PATH_TOKEN + ')', 'g');

function pathCandidates(text) {
  return text.split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*]|\d+[.)])\s+/.test(line))
    .flatMap((line) => [...line.matchAll(PATH_PATTERN)])
    .map((match) => match[1] || match[2] || '')
    .map((candidate) => candidate.replace(/[.,;:]$/, '').trim())
    .filter((candidate) => new RegExp('^(?:' + PATH_TOKEN + ')/?$').test(candidate));
}

function sectionBody(content, headingPattern) {
  const heading = content.match(headingPattern);
  if (!heading) return '';
  const start = heading.index + heading[0].length;
  const remainder = content.slice(start);
  return remainder.split(/^##\s+/m, 1)[0];
}

function extractConflictKeys(content) {
  const explicit = content.match(/(?:^|\n)\s*\*{0,2}\s*CONFLICT KEYS\s*:\s*\*{0,2}\s*([\s\S]*?)(?=\n##?\s|\n\s*\*\*?[A-ZА-Я][^\n:]{0,80}:|$)/i)?.[1] || '';
  const filesSection = sectionBody(content, /^##\s+\d+\.\s+Файлы для изменения[^\r\n]*$/im);
  const changedFiles = filesSection.match(/\*\*ИЗМЕНЯТЬ:\*\*([\s\S]*?)(?=\n\s*\*\*НЕ ИЗМЕНЯТЬ:|$)/i)?.[1] || '';
  const inlineFiles = [...content.matchAll(/(?:^|\n)\s*\*{0,2}\s*(?:Файлы|FILES)\s*:\s*\*{0,2}\s*([\s\S]*?)(?=\n\s*\*{0,2}[A-ZА-Я][^\n:]{0,80}:|\n##\s|$)/gi)]
    .flatMap((match) => pathCandidates(match[1] || ''));
  return [...new Set([...pathCandidates(explicit), ...pathCandidates(changedFiles), ...inlineFiles])];
}

function taskFiles(tasksDir = path.join(PROJECT_ROOT, 'tasks'), sourcePrefix = 'tasks') {
  if (!fs.existsSync(tasksDir)) return [];
  return fs.readdirSync(tasksDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const sourcePath = path.join(sourcePrefix, entry.name).replaceAll('\\', '/');
      const content = fs.readFileSync(path.join(tasksDir, entry.name), 'utf8');
      const heading = content.match(/^#\s+([^\r\n]+)/m)?.[1] || entry.name;
      const id = entry.name.replace(/\.md$/, '');
      return { id, title: heading.replace(/^TZ-[^:]+:\s*/, ''), sourcePath, conflictKeys: extractConflictKeys(content) };
    });
}

async function request(baseUrl, method, endpoint, body) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Team Room request failed (${response.status})`);
  return payload;
}

async function waitForRoom(baseUrl, timeoutMs = STARTUP_TIMEOUT_MS) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Team Room did not become ready at ${baseUrl}`);
}

function readServerInfo(dir) {
  const file = path.join(dir, 'server.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function writeServerInfo(dir, info) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'server.json'), `${JSON.stringify(info, null, 2)}\n`, 'utf8');
}

function removeServerInfo(dir) {
  fs.rmSync(path.join(dir, 'server.json'), { force: true });
}

function watcherPath(dir, taskId, agentId) {
  const safe = crypto.createHash('sha256').update(`${taskId}:${agentId}`).digest('hex').slice(0, 16);
  return path.join(dir, `watch-${safe}.json`);
}

function processIsAlive(pid) {
  if (!pid) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
}

function terminateProcessTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* process may already be gone */ }
    return;
  }
  try { process.kill(Number(pid), 'SIGTERM'); } catch { /* process may already be gone */ }
}

function stopTaskWatcher(dir, taskId, agentId) {
  const marker = watcherPath(dir, taskId, agentId);
  if (!fs.existsSync(marker)) return;
  try {
    const watcher = JSON.parse(fs.readFileSync(marker, 'utf8'));
    if (watcher.pid) terminateProcessTree(watcher.pid);
  } catch { /* watcher may already be gone */ }
  fs.rmSync(marker, { force: true });
}

function startTaskWatcher({ dir, taskId, agentId, interval }) {
  const marker = watcherPath(dir, taskId, agentId);
  if (fs.existsSync(marker)) {
    try {
      const existing = JSON.parse(fs.readFileSync(marker, 'utf8'));
      if (existing.pid && processIsAlive(existing.pid)) return;
    } catch {
      // Replace an invalid or stale marker.
    }
    fs.rmSync(marker, { force: true });
  }
  const startedAt = new Date().toISOString();
  fs.writeFileSync(marker, JSON.stringify({ pid: null, taskId, agentId, startedAt, status: 'starting' }), 'utf8');
  let child;
  try {
    child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'watch', taskId, '--agent', agentId, '--interval', String(interval)], {
      cwd: PROJECT_ROOT,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, TEAM_ROOM_WATCHER_MARKER: marker },
    });
    child.once('error', () => fs.rmSync(marker, { force: true }));
    child.once('exit', () => fs.rmSync(marker, { force: true }));
    child.unref();
  } catch (error) {
    fs.rmSync(marker, { force: true });
    throw error;
  }
}

async function ensureRoom(repoId, dir) {
  const known = readServerInfo(dir);
  if (known?.port) {
    const knownUrl = `http://127.0.0.1:${known.port}`;
    try {
      const health = await waitForRoom(knownUrl, 350);
      if (health.repoId === repoId) return { ...known, url: knownUrl };
    } catch {
      // The old process is gone; start a replacement.
    }
  }

  const port = portFor(repoId);
  const url = `http://127.0.0.1:${port}`;
  const lockPath = path.join(dir, 'startup.lock');
  fs.mkdirSync(dir, { recursive: true });
  let lockHandle;
  try {
    lockHandle = fs.openSync(lockPath, 'wx');
    fs.writeFileSync(lockHandle, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }), 'utf8');
  } catch {
    try {
      const age = Date.now() - fs.statSync(lockPath).mtimeMs;
      if (age > STARTUP_LOCK_MAX_AGE_MS) {
        fs.rmSync(lockPath, { force: true });
        return ensureRoom(repoId, dir);
      }
    } catch {
      // A concurrent process may have completed the lock transition.
    }
    try { await waitForRoom(url); } catch { throw new Error('Another Team Room startup is in progress but did not become ready'); }
    return { port, url, repoId };
  }

  try {
    const existingHealth = await fetch(`${url}/health`).then((response) => response.ok ? response.json() : null).catch(() => null);
    if (existingHealth?.repoId === repoId) return { port, url, repoId };
    const child = spawn(process.execPath, [SERVER], {
      cwd: PROJECT_ROOT,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, TEAM_ROOM_STATE_DIR: dir, TEAM_ROOM_REPO_ID: repoId, TEAM_ROOM_PROJECT_ROOT: PROJECT_ROOT, TEAM_ROOM_PORT: String(port) },
    });
    child.unref();
    try {
      const health = await waitForRoom(url);
      if (health.repoId !== repoId) throw new Error(`Team Room identity mismatch at ${url}`);
      writeServerInfo(dir, { pid: child.pid, port, repoId, startedAt: new Date().toISOString() });
      return { pid: child.pid, port, url, repoId };
    } catch (error) {
      terminateProcessTree(child.pid);
      throw error;
    }
  } finally {
    fs.closeSync(lockHandle);
    fs.rmSync(lockPath, { force: true });
  }
}

async function join(options) {
  const { repoId } = repositoryIdentity();
  const dir = stateRoot(repoId);
  const room = await ensureRoom(repoId, dir);
  const agent = agentIdentity(options);
  await request(room.url, 'POST', '/api/agents/register', agent);
  await request(room.url, 'POST', '/api/tasks/sync', { tasks: taskFiles() });
  return { room, agent, stateDir: dir };
}

function openBrowser(url) {
  if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  else spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

function help() {
  console.log(`Team Room — local shared room for coding agents\n\nCommands:\n  join [--agent ID] [--role ROLE]     Start/reuse room and check in agent\n  open                                Start/reuse room and open dashboard\n  stop                                Stop this repository's local room\n  status                              Show room state\n  claim TASK [--agent ID]             Claim a task after conflict checks\n  heartbeat TASK                      Renew task lease once\n  watch TASK                          Renew a task lease automatically\n  send MESSAGE [--to ID] [--task ID] Send a durable message\n  inbox                               Read messages for this agent\n  release TASK [--status STATUS]      Set ready/needs_help/review\n  complete TASK --evidence PATH      Mark task done and record evidence\n\nThe first agent automatically starts the room. Later agents reuse it.`);
}

export async function main(argv = process.argv.slice(2)) {
  const { command, positional, options } = parseArgs(argv);
  if (command === 'help' || command === '--help') return help();
  const { repoId } = repositoryIdentity();
  const dir = stateRoot(repoId);
  if (command === 'stop') {
    const known = readServerInfo(dir);
    if (!known?.pid) {
      console.log('Team Room is not registered for this repository.');
      return;
    }
    terminateProcessTree(known.pid);
    for (const file of fs.readdirSync(dir).filter((entry) => entry.startsWith('watch-') && entry.endsWith('.json'))) {
      try {
        const watcher = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (watcher.pid) terminateProcessTree(watcher.pid);
      } catch { /* watcher may already be gone */ }
      fs.rmSync(path.join(dir, file), { force: true });
    }
    removeServerInfo(dir);
    console.log(`Team Room stopped for ${repoId}.`);
    return;
  }

  const watcherMarker = command === 'watch' ? process.env.TEAM_ROOM_WATCHER_MARKER : null;
  const cleanupWatcherMarker = () => { if (watcherMarker) fs.rmSync(watcherMarker, { force: true }); };
  if (watcherMarker) process.once('exit', cleanupWatcherMarker);

  const identity = agentIdentity(options);
  const joined = await join(options);
  const { room, agent } = joined;

  if (command === 'join') {
    console.log(`Team Room ready: ${room.url}`);
    console.log(`Connected as ${agent.id} (${agent.role})`);
    return;
  }
  if (command === 'open') {
    openBrowser(room.url);
    console.log(`Team Room opened: ${room.url}`);
    return;
  }
  if (command === 'status') {
    console.log(JSON.stringify(await request(room.url, 'GET', '/api/state'), null, 2));
    return;
  }
  if (command === 'claim') {
    const taskId = positional[0];
    if (!taskId) throw new Error('claim requires a task id');
    const result = await request(room.url, 'POST', '/api/tasks/claim', { taskId, agentId: identity.id });
    startTaskWatcher({ dir, taskId, agentId: identity.id, interval: DEFAULT_HEARTBEAT_INTERVAL_MS });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command === 'heartbeat') {
    const taskId = positional[0];
    if (!taskId) throw new Error('heartbeat requires a task id');
    console.log(JSON.stringify(await request(room.url, 'POST', '/api/tasks/heartbeat', { taskId, agentId: identity.id }), null, 2));
    return;
  }
  if (command === 'watch') {
    const taskId = positional[0];
    if (!taskId) throw new Error('watch requires a task id');
    const interval = Math.max(5_000, Number(options.interval || DEFAULT_HEARTBEAT_INTERVAL_MS));
    const marker = watcherMarker;
    const cleanup = cleanupWatcherMarker;
    if (marker) {
      if (!fs.existsSync(marker)) return;
      try {
        const current = JSON.parse(fs.readFileSync(marker, 'utf8'));
        fs.writeFileSync(marker, JSON.stringify({ ...current, pid: process.pid, status: 'running' }), 'utf8');
      } catch {
        cleanup();
        return;
      }
    }
    const beat = async () => request(room.url, 'POST', '/api/tasks/heartbeat', { taskId, agentId: identity.id });
    await beat();
    console.log(`Watching ${taskId}; heartbeat every ${interval}ms. Press Ctrl+C to stop.`);
    const timer = setInterval(() => beat().catch((error) => {
      clearInterval(timer);
      cleanup();
      if (!/not owned|Unknown task/i.test(error.message)) console.error(`Team Room heartbeat: ${error.message}`);
      process.exit(0);
    }), interval);
    return;
  }
  if (command === 'send') {
    const body = positional.join(' ');
    console.log(JSON.stringify(await request(room.url, 'POST', '/api/messages', { from: identity.id, to: options.to || null, taskId: options.task, body }), null, 2));
    return;
  }
  if (command === 'inbox') {
    console.log(JSON.stringify(await request(room.url, 'GET', `/api/messages?agent=${encodeURIComponent(identity.id)}${options.task ? `&task=${encodeURIComponent(options.task)}` : ''}`), null, 2));
    return;
  }
  if (command === 'release' || command === 'complete') {
    const taskId = positional[0];
    if (!taskId) throw new Error(`${command} requires a task id`);
    const status = command === 'complete' ? 'done' : (options.status || 'ready');
    const evidence = options.evidence || null;
    let result;
    try {
      result = await request(room.url, 'POST', '/api/tasks/status', { taskId, agentId: identity.id, status, evidence });
    } finally {
      stopTaskWatcher(dir, taskId, identity.id);
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => { console.error(`Team Room: ${error.message}`); process.exitCode = 1; });
}

export { agentIdentity, extractConflictKeys, parseArgs, pathCandidates, portFor, repositoryIdentity, stateRoot, taskFiles, ensureRoom };
