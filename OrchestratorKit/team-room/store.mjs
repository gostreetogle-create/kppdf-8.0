import fs from 'node:fs';
import path from 'node:path';

const ACTIVE_TASK_STATES = new Set(['claimed', 'in_progress', 'needs_help', 'review']);
const LEASE_MS = 15 * 60 * 1000;
const AGENT_LEASE_MS = 5 * 60 * 1000;

const nowIso = () => new Date().toISOString();

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .replace(/\/+/g, '/');
}

function expandBraces(value) {
  const match = value.match(/\{([^{}]+)\}/);
  if (!match) return [value];
  const alternatives = match[1].split(',').map((part) => part.trim()).filter(Boolean);
  if (!alternatives.length) return [value];
  return alternatives.flatMap((alternative) => expandBraces(value.replace(match[0], alternative)));
}

function globRegex(pattern) {
  const effectivePattern = pattern.endsWith('/*') ? `${pattern.slice(0, -2)}/**` : pattern;
  let source = '^';
  for (let index = 0; index < effectivePattern.length; index += 1) {
    const char = effectivePattern[index];
    if (char === '*' && effectivePattern[index + 1] === '*') {
      source += '.*';
      index += 1;
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`${source}$`);
}

function hasGlob(value) {
  return /[*?]/.test(value);
}

function matchesPattern(pattern, value) {
  return hasGlob(pattern) ? globRegex(pattern).test(value) : pattern === value;
}

function patternsMayOverlap(left, right) {
  const leftPrefix = left.split(/[*?]/, 1)[0];
  const rightPrefix = right.split(/[*?]/, 1)[0];
  return leftPrefix.startsWith(rightPrefix) || rightPrefix.startsWith(leftPrefix);
}

function keyOverlaps(left, right) {
  const leftKeys = expandBraces(normalizeKey(left));
  const rightKeys = expandBraces(normalizeKey(right));
  return leftKeys.some((a) => rightKeys.some((b) => {
    if (!a || !b) return false;
    if (a === b) return true;
    if (matchesPattern(a, b) || matchesPattern(b, a)) return true;
    return hasGlob(a) && hasGlob(b) && patternsMayOverlap(a, b);
  }));
}

export function conflictKeysOverlap(leftKeys = [], rightKeys = []) {
  return leftKeys.some((left) => rightKeys.some((right) => keyOverlaps(left, right)));
}

function initialState(repoId) {
  const timestamp = nowIso();
  return {
    version: 1,
    meta: { repoId, createdAt: timestamp, updatedAt: timestamp },
    agents: {},
    tasks: {},
    messages: [],
    activity: [],
  };
}

export class TeamRoomStore {
  constructor({ stateDir, repoId = 'local', projectRoot = process.cwd() }) {
    this.stateDir = stateDir;
    this.projectRoot = projectRoot;
    this.filePath = path.join(stateDir, 'state.json');
    this.repoId = repoId;
    fs.mkdirSync(stateDir, { recursive: true });
    this.state = this.read();
  }

  read() {
    if (!fs.existsSync(this.filePath)) return initialState(this.repoId);
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (!parsed || parsed.version !== 1) throw new Error('Unsupported Team Room state version');
      return parsed;
    } catch (error) {
      throw new Error(`Cannot read Team Room state: ${error.message}`);
    }
  }

  save() {
    this.state.meta.updatedAt = nowIso();
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, this.filePath);
  }

  event(type, details = {}) {
    this.state.activity.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, ...details, at: nowIso() });
    this.state.activity = this.state.activity.slice(0, 500);
  }

  cleanupExpired(now = Date.now()) {
    let changed = false;
    for (const agent of Object.values(this.state.agents)) {
      if (agent.status === 'online' && now - Date.parse(agent.lastSeenAt) > AGENT_LEASE_MS) {
        agent.status = 'away';
        changed = true;
        this.event('agent-away', { agentId: agent.id });
      }
    }

    for (const task of Object.values(this.state.tasks)) {
      if (ACTIVE_TASK_STATES.has(task.status) && task.leaseUntil && Date.parse(task.leaseUntil) <= now) {
        const previousOwner = task.owner;
        task.status = 'ready';
        task.owner = null;
        task.worktree = null;
        task.branch = null;
        task.leaseUntil = null;
        changed = true;
        this.event('task-released-stale', { taskId: task.id, previousOwner });
      }
    }
    if (changed) this.save();
  }

  snapshot() {
    this.cleanupExpired();
    return JSON.parse(JSON.stringify(this.state));
  }

  registerAgent(input) {
    const id = String(input.id ?? '').trim();
    if (!id) throw new Error('agent id is required');
    const existing = this.state.agents[id];
    const agent = {
      id,
      role: String(input.role ?? existing?.role ?? 'coding agent').trim(),
      worktree: String(input.worktree ?? existing?.worktree ?? '').trim(),
      branch: String(input.branch ?? existing?.branch ?? '').trim(),
      status: 'online',
      lastSeenAt: nowIso(),
      joinedAt: existing?.joinedAt ?? nowIso(),
    };
    this.state.agents[id] = agent;
    this.event(existing ? 'agent-reconnected' : 'agent-joined', { agentId: id, role: agent.role });
    this.save();
    return agent;
  }

  heartbeatAgent(id) {
    const agent = this.state.agents[id];
    if (!agent) throw new Error(`Unknown agent: ${id}`);
    agent.status = 'online';
    agent.lastSeenAt = nowIso();
    this.save();
    return agent;
  }

  syncTasks(tasks = []) {
    const incomingIds = new Set(tasks.map((input) => String(input.id ?? '').trim()).filter(Boolean));
    for (const [id, existing] of Object.entries(this.state.tasks)) {
      if (!incomingIds.has(id) && existing.status === 'ready') delete this.state.tasks[id];
    }
    for (const input of tasks) {
      const id = String(input.id ?? '').trim();
      if (!id) continue;
      const existing = this.state.tasks[id];
      this.state.tasks[id] = {
        id,
        title: String(input.title ?? existing?.title ?? id).trim(),
        sourcePath: String(input.sourcePath ?? existing?.sourcePath ?? '').trim(),
        conflictKeys: [...new Set((input.conflictKeys ?? existing?.conflictKeys ?? []).map(normalizeKey).filter(Boolean))],
        status: existing?.status ?? 'ready',
        owner: existing?.owner ?? null,
        worktree: existing?.worktree ?? null,
        branch: existing?.branch ?? null,
        claimedAt: existing?.claimedAt ?? null,
        leaseUntil: existing?.leaseUntil ?? null,
        updatedAt: nowIso(),
      };
    }
    this.event('tasks-synced', { count: tasks.length });
    this.save();
    return Object.values(this.state.tasks);
  }

  requireAgent(agentId) {
    this.cleanupExpired();
    const agent = this.state.agents[agentId];
    if (!agent) throw new Error(`Unknown agent: ${agentId}; run join first`);
    agent.lastSeenAt = nowIso();
    agent.status = 'online';
    return agent;
  }

  claimTask(taskId, agentId) {
    const task = this.state.tasks[taskId];
    if (!task) throw new Error(`Unknown task: ${taskId}; sync tasks first`);
    const agent = this.requireAgent(agentId);
    if (task.status === 'done') throw new Error(`Task ${taskId} is already done`);
    if (task.owner && task.owner !== agentId && ACTIVE_TASK_STATES.has(task.status)) {
      throw new Error(`Task ${taskId} is owned by ${task.owner}`);
    }

    for (const other of Object.values(this.state.tasks)) {
      if (other.id !== taskId && ACTIVE_TASK_STATES.has(other.status) && other.owner && other.owner !== agentId && conflictKeysOverlap(task.conflictKeys, other.conflictKeys)) {
        throw new Error(`Conflict with ${other.id}, owned by ${other.owner}`);
      }
    }

    const timestamp = nowIso();
    task.status = 'in_progress';
    task.owner = agentId;
    task.worktree = agent.worktree;
    task.branch = agent.branch;
    task.claimedAt = task.claimedAt ?? timestamp;
    task.leaseUntil = new Date(Date.now() + LEASE_MS).toISOString();
    task.updatedAt = timestamp;
    this.event('task-claimed', { taskId, agentId });
    this.save();
    return task;
  }

  heartbeatTask(taskId, agentId) {
    const task = this.state.tasks[taskId];
    if (!task) throw new Error(`Unknown task: ${taskId}`);
    if (task.owner !== agentId) throw new Error(`Task ${taskId} is not owned by ${agentId}`);
    this.requireAgent(agentId);
    task.leaseUntil = new Date(Date.now() + LEASE_MS).toISOString();
    task.updatedAt = nowIso();
    this.save();
    return task;
  }

  updateTask(taskId, agentId, status, evidence = null) {
    const allowed = new Set(['in_progress', 'needs_help', 'review', 'ready', 'done']);
    if (!allowed.has(status)) throw new Error(`Unsupported task status: ${status}`);
    const task = this.state.tasks[taskId];
    if (!task) throw new Error(`Unknown task: ${taskId}`);
    if (task.owner !== agentId) throw new Error(`Task ${taskId} is not owned by ${agentId}`);
    this.requireAgent(agentId);
    if (status === 'done') {
      const evidencePath = String(evidence ?? '').trim();
      if (!evidencePath) throw new Error(`Task ${taskId} requires evidence before completion`);
      const absoluteEvidencePath = path.isAbsolute(evidencePath) ? path.resolve(evidencePath) : path.resolve(this.projectRoot, evidencePath);
      const relativeEvidencePath = path.relative(this.projectRoot, absoluteEvidencePath).replaceAll('\\', '/');
      if (relativeEvidencePath.startsWith('../') || path.isAbsolute(relativeEvidencePath) || !relativeEvidencePath.startsWith('tasks/_archive/')) {
        throw new Error(`Evidence must be inside tasks/_archive/: ${evidencePath}`);
      }
      if (!path.basename(relativeEvidencePath).startsWith(`${taskId}.done.`)) {
        throw new Error(`Evidence must be the archive record for ${taskId}`);
      }
      if (!fs.existsSync(absoluteEvidencePath)) throw new Error(`Evidence file does not exist: ${evidencePath}`);
      const evidenceText = fs.readFileSync(absoluteEvidencePath, 'utf8');
      if (!evidenceText.includes('ARCHIVE_MARKER')) throw new Error(`Evidence file must contain ARCHIVE_MARKER: ${evidencePath}`);
      task.evidence = evidencePath;
    }
    task.status = status;
    task.updatedAt = nowIso();
    if (status === 'ready' || status === 'done') {
      task.owner = null;
      task.worktree = null;
      task.branch = null;
      task.leaseUntil = null;
    } else {
      task.leaseUntil = new Date(Date.now() + LEASE_MS).toISOString();
    }
    this.event(`task-${status}`, { taskId, agentId });
    this.save();
    return task;
  }

  sendMessage({ from, to = null, taskId = null, body }) {
    this.requireAgent(from);
    const text = String(body ?? '').trim();
    if (!text) throw new Error('message body is required');
    const message = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, from, to: to ? String(to) : null, taskId: taskId ? String(taskId) : null, body: text, createdAt: nowIso(), readBy: [] };
    this.state.messages.push(message);
    this.state.messages = this.state.messages.slice(-1000);
    this.event('message-sent', { messageId: message.id, from, to: message.to, taskId: message.taskId });
    this.save();
    return message;
  }

  inbox(agentId, taskId = null) {
    this.requireAgent(agentId);
    return this.state.messages.filter((message) => (message.to === null || message.to === agentId) && (!taskId || message.taskId === taskId));
  }
}

export { AGENT_LEASE_MS, LEASE_MS, expandBraces, normalizeKey, keyOverlaps };
