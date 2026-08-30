/**
 * Pure helpers for start.mjs NX frontend launcher.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

/** Patterns for Nx Console install prompt (nx@21.4 enquirer). */
export const NX_CONSOLE_PROMPT_PATTERNS = [
  /Install Nx Console\?/i,
  /Install Nx's official editor extension/i,
  /Install Nx Console/i,
];

/**
 * Env for nx/angular child — non-interactive launcher (no port / Nx Console prompts).
 * @param {boolean} nxMode
 */
export function buildFrontendChildEnv(nxMode) {
  const base = {
    NX_DAEMON: 'false',
    NX_INTERACTIVE: 'false',
    NX_SKIP_VSCODE_EXTENSION_INSTALL: 'true',
  };
  // Nx params.isTTY() checks CI === 'true' (not '1'); isCI() accepts any truthy CI.
  if (nxMode) return { ...base, CI: 'true' };
  return base;
}

/**
 * @param {string} line
 */
export function isNxConsolePromptLine(line) {
  const t = String(line).replace(/\x1b\[[0-9;]*m/g, '').trim();
  if (!t) return false;
  return NX_CONSOLE_PROMPT_PATTERNS.some((re) => re.test(t));
}

/**
 * @param {string} text accumulated stdout/stderr
 */
export function containsNxConsolePrompt(text) {
  return String(text)
    .split(/\r?\n/)
    .some((line) => isNxConsolePromptLine(line));
}

/**
 * @param {string} [home]
 */
export function nxIdePreferencesPath(home = homedir()) {
  return join(home, '.nx', 'ide.json');
}

/**
 * Merge ide.json patch for non-interactive Nx Console policy.
 * @param {Record<string, unknown>|null|undefined} existing
 * @param {Record<string, unknown>} patch
 */
export function mergeNxIdePreferences(existing, patch) {
  const base = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
  return { ...base, ...patch };
}

/**
 * Persist ~/.nx/ide.json auto_install_console=false (no extension install prompt).
 * @param {string} [home]
 * @param {{ existsSync: Function, readFileSync: Function, writeFileSync: Function, mkdirSync: Function }} [fs]
 * @returns {boolean} true when file was written/updated
 */
export function ensureNxIdeNonInteractive(home = homedir(), fs = null) {
  const f = fs ?? { existsSync, readFileSync, writeFileSync, mkdirSync };
  const dir = join(home, '.nx');
  const path = nxIdePreferencesPath(home);
  /** @type {Record<string, unknown>} */
  let data = {};
  if (f.existsSync(path)) {
    try {
      data = JSON.parse(String(f.readFileSync(path, 'utf8')));
    } catch {
      data = {};
    }
  }
  if (data.auto_install_console === false) return false;
  const next = mergeNxIdePreferences(data, { auto_install_console: false });
  f.mkdirSync(dir, { recursive: true });
  f.writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return true;
}

/**
 * @param {{ cmd: string, cwd: string, lastLines?: string[] }} input
 */
export function formatNxPromptFailure({ cmd, cwd, lastLines = [] }) {
  const tail = tailLines(lastLines, 6);
  const parts = [
    'frontend: Nx Console interactive prompt в non-interactive launcher',
    '  причина: nx@21.4 может спросить Install Nx Console при piped stdio',
    `  command: ${cmd}`,
    `  cwd: ${cwd}`,
    '  env: CI=true, NX_INTERACTIVE=false, NX_SKIP_VSCODE_EXTENSION_INSTALL=true',
    '  fix: ~/.nx/ide.json → {"auto_install_console": false}',
  ];
  if (tail.length) {
    parts.push('  last output:');
    for (const line of tail) parts.push(`    ${line}`);
  }
  return parts.join('\n');
}

/**
 * Resolve nx serve spawn: direct node nx.js (stable PID on Windows, no pnpm.cmd wrapper).
 * @param {string} feDir absolute frontend-nx root
 * @param {number} port
 * @param {(cwd: string) => string|null} resolveNxCli
 */
export function buildNxFrontendSpawn(feDir, port, resolveNxCli) {
  const nxJs = resolveNxCli(feDir);
  if (!nxJs) {
    return { ok: false, error: `${feDir}: nx не найден — выполните pnpm install в frontend-nx/` };
  }
  return {
    ok: true,
    cmd: 'node',
    args: [nxJs, 'serve', 'kppdf-web', `--port=${port}`],
    cwd: feDir,
    display: `node ${nxJs} serve kppdf-web --port=${port}`,
  };
}

/**
 * Whether occupied frontend port may be reused instead of kill+respawn.
 * @param {{ occupied: boolean, httpOk: boolean, htmlOk: boolean }} input
 */
export function shouldReuseFrontendOnPort({ occupied, httpOk, htmlOk }) {
  return occupied === true && httpOk === true && htmlOk === true;
}

/**
 * Angular SPA index.html sanity check (not arbitrary HTTP on the port).
 * @param {string|null|undefined} body
 */
export function isFrontendHtmlHealthy(body) {
  if (!body || typeof body !== 'string') return false;
  return (
    body.includes('<app-root') ||
    body.includes('kppdf-web') ||
    body.includes('ng-version')
  );
}

/**
 * Evaluate frontend HTTP probe for readiness / reuse decisions.
 * @param {{ status: number, body: string|null }} probe
 */
export function evaluateFrontendProbe(probe) {
  const httpOk = probe.status >= 200 && probe.status < 300;
  const htmlOk = httpOk && isFrontendHtmlHealthy(probe.body);
  return { httpOk, htmlOk, ok: htmlOk };
}

/**
 * @param {string[]|null|undefined} lines
 * @param {number} [n]
 */
export function tailLines(lines, n = 12) {
  if (!lines?.length) return [];
  return lines.slice(-n);
}

/**
 * Human-readable spawn failure block for console.
 * @param {{ label: string, cmd: string, cwd: string, code: number|null, signal: string|null, lastLines: string[] }} input
 */
export function formatSpawnFailure({ label, cmd, cwd, code, signal, lastLines }) {
  const tail = tailLines(lastLines, 8);
  const parts = [
    `${label} завершился до готовности`,
    `  command: ${cmd}`,
    `  cwd: ${cwd}`,
    `  exit: code=${code ?? 'null'} signal=${signal ?? 'null'}`,
  ];
  if (tail.length) {
    parts.push('  last output:');
    for (const line of tail) parts.push(`    ${line}`);
  }
  return parts.join('\n');
}

/**
 * Windows-safe quoting hint for logs (no shell:true).
 * @param {string} cmd
 * @param {string[]} args
 */
export function formatSpawnCommand(cmd, args) {
  return [cmd, ...args].join(' ');
}

/**
 * @param {unknown} pid
 */
export function isNumericPid(pid) {
  if (typeof pid === 'number' && Number.isFinite(pid) && pid > 0) return true;
  return typeof pid === 'string' && /^\d+$/.test(pid) && Number(pid) > 0;
}

/**
 * Stale PID file entry: pid present but not alive.
 * @param {unknown} pid
 * @param {(n: number) => boolean} isAlive
 */
export function isStalePidEntry(pid, isAlive) {
  if (!isNumericPid(pid)) return false;
  return !isAlive(Number(pid));
}
