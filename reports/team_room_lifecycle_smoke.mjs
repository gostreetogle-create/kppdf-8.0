import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stateRoot, repositoryIdentity } from '../OrchestratorKit/team-room/cli.mjs';

const cli = path.resolve('OrchestratorKit/team-room/cli.mjs');
const agent = 'lifecycle-smoke';
const task = 'TZ-238';
const stateDir = stateRoot(repositoryIdentity().repoId);
const run = (args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 30_000 });
const markers = () => fs.readdirSync(stateDir).filter((entry) => entry.startsWith('watch-') && entry.endsWith('.json'));
const markerPayloads = () => markers().map((entry) => JSON.parse(fs.readFileSync(path.join(stateDir, entry), 'utf8')));
const isAlive = (pid) => {
  if (!pid) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
};
const waitUntil = async (predicate, timeoutMs = 5000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return predicate();
};

const joined = run(['join', '--agent', agent, '--role', 'Lifecycle smoke']);
const markersBeforeClaim = markers();
const claimed = markersBeforeClaim.length === 0 ? run(['claim', task, '--agent', agent]) : { status: 1 };
await waitUntil(() => markerPayloads().some((marker) => marker.status === 'running' && marker.pid));
const afterClaim = markers();
const markerPayload = markerPayloads();
const watcherPid = markerPayload.find((marker) => marker.status === 'running' && marker.pid)?.pid ?? null;
const released = run(['release', task, '--agent', agent, '--status', 'review']);
const markerRemoved = await waitUntil(() => markers().length === 0);
const watcherStopped = await waitUntil(() => !isAlive(watcherPid));
const evidence = {
  task,
  agent,
  joinExit: joined.status,
  claimExit: claimed.status,
  releaseExit: released.status,
  markersBeforeClaim: markersBeforeClaim.length,
  markerCountAfterClaim: afterClaim.length,
  markerPayload,
  watcherPid,
  markerCountAfterRelease: markers().length,
  markerRemoved,
  watcherStopped,
  runningWatcher: Boolean(watcherPid),
  result: joined.status === 0 && claimed.status === 0 && released.status === 0 && markersBeforeClaim.length === 0 && afterClaim.length === 1 && Boolean(watcherPid) && markerRemoved && watcherStopped ? 'PASS' : 'FAIL',
};
console.log(JSON.stringify(evidence, null, 2));
fs.writeFileSync(path.resolve('reports/team_room_lifecycle_smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
if (evidence.result !== 'PASS') process.exitCode = 1;
