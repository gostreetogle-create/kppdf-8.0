import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFrontendChildEnv,
  buildNxFrontendSpawn,
  shouldReuseFrontendOnPort,
  isFrontendHtmlHealthy,
  evaluateFrontendProbe,
  tailLines,
  formatSpawnFailure,
  formatSpawnCommand,
  isNumericPid,
  isStalePidEntry,
  isNxConsolePromptLine,
  containsNxConsolePrompt,
  ensureNxIdeNonInteractive,
  mergeNxIdePreferences,
  formatNxPromptFailure,
} from './start-launcher-helpers.mjs';

describe('buildFrontendChildEnv', () => {
  it('sets non-interactive nx env', () => {
    const env = buildFrontendChildEnv(true);
    assert.equal(env.CI, 'true');
    assert.equal(env.NX_INTERACTIVE, 'false');
    assert.equal(env.NX_SKIP_VSCODE_EXTENSION_INSTALL, 'true');
    assert.equal(env.NX_DAEMON, 'false');
  });

  it('does not set CI for legacy frontend', () => {
    const env = buildFrontendChildEnv(false);
    assert.equal(env.CI, undefined);
    assert.equal(env.NX_SKIP_VSCODE_EXTENSION_INSTALL, 'true');
    assert.equal(env.NX_DAEMON, 'false');
  });
});

describe('isNxConsolePromptLine', () => {
  it('detects Nx Console install prompt', () => {
    assert.equal(
      isNxConsolePromptLine('? Install Nx Console? (you can uninstall anytime) (Y/n)'),
      true,
    );
    assert.equal(isNxConsolePromptLine("Install Nx's official editor extension to:"), true);
    assert.equal(isNxConsolePromptLine('Application bundle generation complete.'), false);
  });

  it('detects prompt in accumulated output', () => {
    assert.equal(
      containsNxConsolePrompt('Starting...\n? Install Nx Console? (Y/n)\n'),
      true,
    );
  });
});

describe('ensureNxIdeNonInteractive', () => {
  it('writes auto_install_console false when missing', () => {
    const writes = [];
    const dirs = new Set();
    const fs = {
      existsSync: () => false,
      readFileSync: () => '{}',
      mkdirSync: (p) => dirs.add(p),
      writeFileSync: (p, d) => writes.push({ p, d }),
    };
    const changed = ensureNxIdeNonInteractive('/tmp/test-home', fs);
    assert.equal(changed, true);
    assert.equal(writes.length, 1);
    assert.match(writes[0].d, /"auto_install_console": false/);
  });

  it('skips write when already false', () => {
    const fs = {
      existsSync: () => true,
      readFileSync: () => '{"auto_install_console":false}',
      mkdirSync: () => {},
      writeFileSync: () => {
        throw new Error('should not write');
      },
    };
    assert.equal(ensureNxIdeNonInteractive('/tmp/test-home', fs), false);
  });
});

describe('formatNxPromptFailure', () => {
  it('includes command cwd and env hint', () => {
    const text = formatNxPromptFailure({
      cmd: 'node nx.js serve kppdf-web --port=4201',
      cwd: 'D:\\kppdf-8.0\\frontend-nx',
      lastLines: ['? Install Nx Console? (Y/n)'],
    });
    assert.match(text, /NX_SKIP_VSCODE_EXTENSION_INSTALL/);
    assert.match(text, /command: node nx.js/);
    assert.match(text, /Install Nx Console/);
  });
});

describe('mergeNxIdePreferences', () => {
  it('merges without dropping existing keys', () => {
    assert.deepEqual(
      mergeNxIdePreferences({ other: 1 }, { auto_install_console: false }),
      { other: 1, auto_install_console: false },
    );
  });
});

describe('buildNxFrontendSpawn', () => {
  it('builds node nx.js command with port and cwd', () => {
    const spawn = buildNxFrontendSpawn('/proj/frontend-nx', 4201, (cwd) =>
      `${cwd}/node_modules/nx/bin/nx.js`,
    );
    assert.equal(spawn.ok, true);
    assert.equal(spawn.cmd, 'node');
    assert.deepEqual(spawn.args, [
      '/proj/frontend-nx/node_modules/nx/bin/nx.js',
      'serve',
      'kppdf-web',
      '--port=4201',
    ]);
    assert.equal(spawn.cwd, '/proj/frontend-nx');
    assert.match(spawn.display, /--port=4201/);
  });

  it('fails when nx cli missing', () => {
    const spawn = buildNxFrontendSpawn('/proj/frontend-nx', 4201, () => null);
    assert.equal(spawn.ok, false);
    assert.match(spawn.error, /pnpm install/);
  });
});

describe('shouldReuseFrontendOnPort', () => {
  it('reuses occupied healthy angular frontend', () => {
    assert.equal(
      shouldReuseFrontendOnPort({ occupied: true, httpOk: true, htmlOk: true }),
      true,
    );
  });

  it('does not reuse when html is not angular', () => {
    assert.equal(
      shouldReuseFrontendOnPort({ occupied: true, httpOk: true, htmlOk: false }),
      false,
    );
  });

  it('does not reuse free port', () => {
    assert.equal(
      shouldReuseFrontendOnPort({ occupied: false, httpOk: false, htmlOk: false }),
      false,
    );
  });
});

describe('isFrontendHtmlHealthy', () => {
  it('accepts app-root shell', () => {
    assert.equal(isFrontendHtmlHealthy('<!doctype html><app-root></app-root>'), true);
  });

  it('rejects empty or generic http body', () => {
    assert.equal(isFrontendHtmlHealthy('ok'), false);
    assert.equal(isFrontendHtmlHealthy(''), false);
    assert.equal(isFrontendHtmlHealthy(null), false);
  });
});

describe('evaluateFrontendProbe', () => {
  it('requires angular html for ok', () => {
    const good = evaluateFrontendProbe({
      status: 200,
      body: '<html><app-root></app-root></html>',
    });
    assert.equal(good.ok, true);

    const bad = evaluateFrontendProbe({ status: 200, body: 'not spa' });
    assert.equal(bad.ok, false);
    assert.equal(bad.httpOk, true);
    assert.equal(bad.htmlOk, false);
  });
});

describe('formatSpawnFailure', () => {
  it('includes command cwd exit and tail', () => {
    const text = formatSpawnFailure({
      label: 'frontend',
      cmd: 'node nx.js serve kppdf-web --port=4201',
      cwd: 'D:\\kppdf-8.0\\frontend-nx',
      code: 1,
      signal: null,
      lastLines: ['line1', 'line2', 'error: port in use'],
    });
    assert.match(text, /command: node nx.js/);
    assert.match(text, /cwd: D:\\kppdf-8.0\\frontend-nx/);
    assert.match(text, /code=1/);
    assert.match(text, /port in use/);
  });
});

describe('formatSpawnCommand', () => {
  it('joins cmd and args without shell quoting', () => {
    assert.equal(
      formatSpawnCommand('node', ['D:\\nx\\nx.js', 'serve', 'kppdf-web']),
      'node D:\\nx\\nx.js serve kppdf-web',
    );
  });
});

describe('isNumericPid / isStalePidEntry', () => {
  it('detects numeric pid values', () => {
    assert.equal(isNumericPid(1234), true);
    assert.equal(isNumericPid('5678'), true);
    assert.equal(isNumericPid('startedAt'), false);
    assert.equal(isNumericPid(0), false);
  });

  it('flags stale pid when not alive', () => {
    assert.equal(isStalePidEntry(99, () => false), true);
    assert.equal(isStalePidEntry(99, () => true), false);
    assert.equal(isStalePidEntry('meta', () => false), false);
  });
});

describe('tailLines', () => {
  it('returns last n lines', () => {
    assert.deepEqual(tailLines(['a', 'b', 'c', 'd'], 2), ['c', 'd']);
    assert.deepEqual(tailLines([], 5), []);
  });
});
