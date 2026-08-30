/**
 * Pure helpers for start.mjs fast-path (TZ-OPS-NX-start-fast-path).
 * Imported by start.mjs and unit-tested via node:test.
 */

/** @typedef {{ running: boolean, healthStatus: string }} MongoContainerState */

/**
 * Parse `docker inspect -f '{{.State.Running}}|{{.State.Health.Status}}'` output.
 * @param {string|null|undefined} stdout
 * @returns {MongoContainerState|null}
 */
export function parseMongoInspect(stdout) {
  if (!stdout || !String(stdout).trim()) return null;
  const [runningRaw, healthRaw = ''] = String(stdout).trim().split('|');
  return {
    running: runningRaw === 'true',
    healthStatus: healthRaw || 'none',
  };
}

/**
 * Whether startMongo may skip `docker rm` + `compose up`.
 * @param {{ container: MongoContainerState|null, replicaSetOk: boolean }} input
 */
export function shouldSkipMongoRecreate({ container, replicaSetOk }) {
  if (!container?.running) return false;
  if (container.healthStatus !== 'healthy') return false;
  return replicaSetOk === true;
}

/**
 * Ready-panel timing: wall-clock to last ready service + per-service elapsed seconds.
 * @param {Record<string, { status?: string, startedAt?: number|null, readyAt?: number|null }>} services
 * @param {number} scriptStartedAt
 * @param {number} [now]
 */
export function computeReadyTiming(services, scriptStartedAt, now = Date.now()) {
  const names = ['mongo', 'backend', 'frontend'];
  /** @type {Record<string, number>} */
  const perService = {};
  let lastReadyAt = scriptStartedAt;
  let readyCount = 0;

  for (const name of names) {
    const s = services[name];
    if (s?.status === 'ready') readyCount += 1;
    if (!s?.startedAt || !s?.readyAt) continue;
    perService[name] = Math.round((s.readyAt - s.startedAt) / 1000);
    if (s.readyAt > lastReadyAt) lastReadyAt = s.readyAt;
  }

  const wallClockSec = Math.round((lastReadyAt - scriptStartedAt) / 1000);
  return {
    wallClockSec,
    perService,
    readyCount,
    allReady: readyCount === names.length,
  };
}

/**
 * PID-file keys that may hold process ids (ignore metadata like startedAt).
 * @param {Record<string, unknown>|null|undefined} pids
 */
export function extractStopPids(pids) {
  if (!pids) return [];
  const out = [];
  for (const key of ['backend', 'frontend']) {
    const pid = pids[key];
    if (typeof pid === 'number' && Number.isFinite(pid)) out.push({ key, pid });
    else if (typeof pid === 'string' && /^\d+$/.test(pid)) out.push({ key, pid: Number(pid) });
  }
  return out;
}
