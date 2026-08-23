/**
 * Жизненный цикл встроенного AI-раннера (Фаза 2).
 *
 * Desktop (Tauri) запускает Node-процесс `src/ai-runner/index.ts` через
 * tauri-plugin-shell (как MCP host). Раннер отдаёт OpenAI-совместимый
 * `/v1/chat/completions` на 127.0.0.1:<порт> — существующий клиент
 * `core/ai/client.ts` работает без изменений.
 *
 * Статус-машина: stopped → starting → running | error; stopping → stopped.
 */

import { Command, type Child } from '@tauri-apps/plugin-shell';
import { appDataDir, dirname, join, resourceDir } from '@tauri-apps/api/path';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import type { LocalModelEntry } from './model-catalog';
import { formatBytes } from './model-catalog';
import { describeRunnerFetchError } from './ai/error-messages';

export const DEFAULT_AI_PORT = 9744;
const HEALTHZ_WAIT_MS = 45_000;
const DESKTOP_PACKAGE_NAME = 'kppdf-desktop';

export type AiRunnerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface AiDownloadState {
  active: boolean;
  fileName: string;
  received: number;
  total: number;
  error?: string;
}

export interface AiRunnerState {
  status: AiRunnerStatus;
  port?: number;
  pid?: number;
  lastError?: string;
  specs?: { totalMemoryGb: number; freeMemoryGb: number; cpus: number };
  modelLoaded: boolean;
  modelName?: string;
  modelError?: string;
  download: AiDownloadState;
}

export interface AiRunnerStartOptions {
  /** Каталог моделей (app-data/models). */
  modelDir: string;
  /** Имя GGUF-файла; пусто — раннер поднимается без модели. */
  modelFile?: string;
}

export function aiEndpoint(port: number): string {
  return `http://127.0.0.1:${port}`;
}

export function aiHealthzUrl(port: number): string {
  return `http://127.0.0.1:${port}/health`;
}

/** Каталог моделей по умолчанию: app-data/models. */
export async function defaultModelDir(): Promise<string> {
  return join(await appDataDir(), 'models');
}

/** Имя env-переменной с абсолютным путём к каталогу ai-runner (TZD-55). */
export const AI_RUNNER_DIR_ENV = 'KPPDF_AI_RUNNER_DIR';

/**
 * Значение `KPPDF_AI_RUNNER_DIR` из Vite `import.meta.env` (dev Desktop) или
 * `process.env` (Node-контекст, напр. тесты). Приоритет над resourceDir walk.
 */
export function envAiRunnerDir(): string | undefined {
  const metaEnv = (import.meta as { env?: Record<string, unknown> }).env;
  const fromMeta = typeof metaEnv?.[AI_RUNNER_DIR_ENV] === 'string' ? metaEnv[AI_RUNNER_DIR_ENV] : '';
  if (fromMeta.trim()) return fromMeta.trim();
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fromProcess = proc?.env?.[AI_RUNNER_DIR_ENV];
  if (fromProcess?.trim()) return fromProcess.trim();
  return undefined;
}

/** `dirname`, не бросающий «path does not have a parent» на корне диска. */
async function safeDirname(dir: string): Promise<string | null> {
  try {
    const parent = await dirname(dir);
    return parent === dir ? null : parent;
  } catch {
    return null;
  }
}

/**
 * Чистый обход вверх от startDir в поисках пакета kppdf-desktop.
 * Вынесен отдельно для теста release-layout (parentOf → null = корень, не бросает).
 */
export async function walkUpToPackage(
  startDir: string,
  readName: (dir: string) => Promise<string | null>,
  parentOf: (dir: string) => Promise<string | null>,
): Promise<string | null> {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const name = await readName(dir);
    if (name === DESKTOP_PACKAGE_NAME) return dir;
    const parent = await parentOf(dir);
    if (!parent) break;
    dir = parent;
  }
  return null;
}

/** Обход от resourceDir вверх в поисках пакета kppdf-desktop (dev fallback). */
export async function resolveDesktopDir(): Promise<string> {
  const env = envAiRunnerDir();
  if (env) return env;

  const start = await resourceDir();
  const found = await walkUpToPackage(start, readPackageNameAt, safeDirname);
  if (found) return found;
  // Последний заход: resourceDir — это часто …/desktop/src-tauri; parent — desktop.
  return (await safeDirname(start)) ?? start;
}

/** FS-адаптер: в runtime — Tauri; в тестах — Node path + mock exists. */
export interface AiPathIo {
  join: (...parts: string[]) => Promise<string>;
  exists: (p: string) => Promise<boolean>;
}

export type AiLaunchPlan =
  | { kind: 'dev'; cwd: string; tsxCli: string; entry: string }
  | { kind: 'bundled'; cwd: string; entry: string };

export const BUNDLED_RUNNER_MISSING =
  'AI-раннер не найден в этом билде. Обновите Desktop (0.5.6+) или задайте KPPDF_AI_RUNNER_DIR.';

export function nodeArgsForPlan(plan: AiLaunchPlan, extra: string[] = []): string[] {
  if (plan.kind === 'dev') return [plan.tsxCli, plan.entry, ...extra];
  return [plan.entry, ...extra];
}

function nodeModulesDir(cwd: string): string {
  const sep = cwd.includes('\\') ? '\\' : '/';
  return `${cwd}${sep}node_modules`;
}

export async function bundledEntryCandidates(
  resourceDirPath: string,
  joinFn: AiPathIo['join'],
): Promise<string[]> {
  return [
    await joinFn(resourceDirPath, 'ai-runner', 'ai-runner.mjs'),
    await joinFn(resourceDirPath, 'resources', 'ai-runner', 'ai-runner.mjs'),
    await joinFn(resourceDirPath, 'ai-runner.mjs'),
  ];
}

async function firstExisting(paths: string[], exists: AiPathIo['exists']): Promise<string | null> {
  for (const p of paths) {
    if (await exists(p)) return p;
  }
  return null;
}

async function devPlanAt(dir: string, io: AiPathIo): Promise<AiLaunchPlan | null> {
  const entry = await io.join(dir, 'src', 'ai-runner', 'index.ts');
  const tsxCli = await io.join(dir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  if ((await io.exists(entry)) && (await io.exists(tsxCli))) {
    return { kind: 'dev', cwd: dir, tsxCli, entry };
  }
  return null;
}

async function bundledPlanAt(dir: string, io: AiPathIo): Promise<AiLaunchPlan | null> {
  const entry = await firstExisting(await bundledEntryCandidates(dir, io.join), io.exists);
  if (!entry) return null;
  const cut = Math.max(entry.lastIndexOf('/'), entry.lastIndexOf('\\'));
  const cwd = cut > 0 ? entry.slice(0, cut) : dir;
  return { kind: 'bundled', cwd, entry };
}

/**
 * Dev (есть src/ai-runner + tsx) побеждает leftover resource.
 * Release NSIS: нет исходников → bundled ai-runner.mjs рядом с resourceDir.
 */
export async function resolveAiLaunchPlan(
  io: AiPathIo,
  opts: { envDir?: string; resourceDirPath: string; desktopDir: string },
): Promise<{ ok: true; plan: AiLaunchPlan } | { ok: false; error: string }> {
  if (opts.envDir) {
    const fromEnvBundled = await bundledPlanAt(opts.envDir, io);
    if (fromEnvBundled) return { ok: true, plan: fromEnvBundled };
    const fromEnvDev = await devPlanAt(opts.envDir, io);
    if (fromEnvDev) return { ok: true, plan: fromEnvDev };
  }
  const fromDev = await devPlanAt(opts.desktopDir, io);
  if (fromDev) return { ok: true, plan: fromDev };
  const fromBundle = await bundledPlanAt(opts.resourceDirPath, io);
  if (fromBundle) return { ok: true, plan: fromBundle };
  return { ok: false, error: BUNDLED_RUNNER_MISSING };
}

const tauriIo: AiPathIo = { join, exists };

async function resolveRuntimeLaunchPlan(): Promise<
  { ok: true; plan: AiLaunchPlan } | { ok: false; error: string }
> {
  let desktopDir: string;
  try {
    desktopDir = await resolveDesktopDir();
  } catch (err) {
    return {
      ok: false,
      error: `Не найден каталог desktop: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  return resolveAiLaunchPlan(tauriIo, {
    envDir: envAiRunnerDir(),
    resourceDirPath: await resourceDir(),
    desktopDir,
  });
}

async function readPackageNameAt(dir: string): Promise<string | null> {
  try {
    const raw = await readTextFile(await join(dir, 'package.json'));
    const parsed = JSON.parse(raw) as { name?: unknown };
    return typeof parsed.name === 'string' ? parsed.name : null;
  } catch {
    return null;
  }
}

function childEnv(extra: Record<string, string>): Record<string, string> {
  const nodeDir = 'C:\\Program Files\\nodejs';
  const mergedPath = [nodeDir, 'C:\\Windows\\System32', 'C:\\Windows'].join(';');
  return {
    ...extra,
    Path: mergedPath,
    PATH: mergedPath,
    SYSTEMROOT: 'C:\\Windows',
    SystemRoot: 'C:\\Windows',
  };
}

export class AiRunnerController {
  private state: AiRunnerState = {
    status: 'stopped',
    download: { active: false, fileName: '', received: 0, total: 0 },
    modelLoaded: false,
  };

  private child: Child | null = null;
  private expectedRunning = false;
  private generation = 0;
  private sawListenLog = false;
  private stderrTail: string[] = [];
  private disposed = false;

  constructor(private readonly onState: (state: AiRunnerState) => void) {}

  getState(): AiRunnerState {
    return { ...this.state, download: { ...this.state.download } };
  }

  private setState(patch: Partial<AiRunnerState>): void {
    this.state = { ...this.state, ...patch };
    this.onState(this.getState());
  }

  setModelInfo(modelLoaded: boolean, modelName?: string, modelError?: string): void {
    this.setState({ modelLoaded, modelName, modelError });
  }

  /** Характеристики ПК через одноразовый запуск раннера (--specs). */
  async getSpecs(): Promise<{ totalMemoryGb: number; freeMemoryGb: number; cpus: number }> {
    try {
      const resolved = await resolveRuntimeLaunchPlan();
      if (!resolved.ok) {
        this.setState({ lastError: resolved.error });
        throw new Error(resolved.error);
      }
      const plan = resolved.plan;
      const cmd = Command.create('nodejs', nodeArgsForPlan(plan, ['--specs']), {
        cwd: plan.cwd,
        env: childEnv(plan.kind === 'bundled' ? { NODE_PATH: nodeModulesDir(plan.cwd) } : {}),
      });
      const output = await new Promise<string>((resolve, reject) => {
        let out = '';
        let err = '';
        cmd.stdout.on('data', (line) => (out += String(line)));
        cmd.stderr.on('data', (line) => (err += String(line)));
        cmd.on('close', (payload) => {
          if (payload.code === 0 && out.trim()) resolve(out.trim());
          else reject(new Error(err.trim() || `код ${payload.code}`));
        });
        cmd.spawn().catch(reject);
      });
      const parsed = JSON.parse(output.split('\n')[0]) as {
        totalMemoryGb?: number;
        freeMemoryGb?: number;
        cpus?: number;
      };
      const specs = {
        totalMemoryGb: parsed.totalMemoryGb ?? 0,
        freeMemoryGb: parsed.freeMemoryGb ?? 0,
        cpus: parsed.cpus ?? 0,
      };
      this.setState({ specs });
      return specs;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ lastError: `Не удалось определить характеристики ПК: ${message}` });
      throw err;
    }
  }

  /** Стартует раннер; модель загружается лениво при первом запросе. */
  async start(opts: AiRunnerStartOptions): Promise<void> {
    if (this.disposed) return;
    await this.stop();

    const gen = ++this.generation;
    this.expectedRunning = true;
    this.stderrTail = [];
    this.sawListenLog = false;
    this.setState({ status: 'starting', lastError: undefined, port: undefined });

    const resolved = await resolveRuntimeLaunchPlan();
    if (!resolved.ok) {
      this.expectedRunning = false;
      this.setState({ status: 'error', lastError: resolved.error });
      return;
    }
    const plan = resolved.plan;

    try {
      const cmd = Command.create('nodejs', nodeArgsForPlan(plan), {
        cwd: plan.cwd,
        env: childEnv({
          KPPDF_AI_PORT: String(DEFAULT_AI_PORT),
          KPPDF_AI_MODEL_DIR: opts.modelDir,
          KPPDF_AI_MODEL_FILE: opts.modelFile ?? '',
          ...(plan.kind === 'bundled' ? { NODE_PATH: nodeModulesDir(plan.cwd) } : {}),
        }),
      });

      cmd.on('error', (message) => {
        if (gen !== this.generation) return;
        this.expectedRunning = false;
        this.setState({ status: 'error', lastError: this.describeSpawnError(message) });
      });

      const onLogLine = (line: string) => {
        const text = String(line).trim();
        if (!text) return;
        this.stderrTail.push(text);
        if (this.stderrTail.length > 12) this.stderrTail.shift();
        if (text.includes('[kppdf-ai] listening')) {
          this.sawListenLog = true;
          const match = /listening (\d+)/.exec(text);
          if (match) this.setState({ port: Number(match[1]) });
        }
      };
      cmd.stdout.on('data', onLogLine);
      cmd.stderr.on('data', onLogLine);

      cmd.on('close', (payload) => {
        if (gen !== this.generation) return;
        const code = payload.code ?? null;
        if (this.expectedRunning && this.sawListenLog && (code === 0 || code === null)) {
          this.child = null;
          this.setState({ status: 'running' });
          return;
        }
        const crashed = this.expectedRunning;
        this.expectedRunning = false;
        this.child = null;
        if (crashed) {
          this.setState({ status: 'error', lastError: this.describeExit(code, this.stderrTail) });
        } else {
          this.setState({ status: 'stopped', pid: undefined });
        }
      });

      const child = await cmd.spawn();
      if (gen !== this.generation) {
        await child.kill().catch(() => undefined);
        return;
      }
      this.child = child;
      this.setState({ pid: child.pid });

      const healthy = await this.waitForHealth(gen);
      if (gen !== this.generation || !this.expectedRunning) return;
      if (healthy) {
        this.setState({ status: 'running' });
        this.refreshHealth();
      } else {
        this.expectedRunning = false;
        this.generation += 1;
        const tail = this.stderrTail.filter(Boolean).join(' · ').slice(0, 400);
        await this.killChild();
        this.setState({
          status: 'error',
          lastError:
            `AI-раннер не поднялся за ${Math.round(HEALTHZ_WAIT_MS / 1000)} с. ` +
            (tail ? `Лог: ${tail}` : 'Проверьте Node.js в «C:\\Program Files\\nodejs».'),
        });
      }
    } catch (err) {
      if (gen !== this.generation) return;
      this.expectedRunning = false;
      this.setState({ status: 'error', lastError: this.describeSpawnError(err instanceof Error ? err.message : String(err)) });
    }
  }

  async stop(): Promise<void> {
    this.generation += 1;
    const child = this.child;
    this.child = null;
    if (child) {
      this.expectedRunning = false;
      this.setState({ status: 'stopping' });
      try {
        await child.kill();
      } catch {
        // процесс мог уже завершиться
      }
    }
    this.expectedRunning = false;
    this.setState({ status: 'stopped', pid: undefined });
  }

  dispose(): void {
    this.disposed = true;
    this.generation += 1;
    const child = this.child;
    this.child = null;
    this.expectedRunning = false;
    if (child) void child.kill().catch(() => undefined);
  }

  /** Скачивание модели через раннер; прогресс приходит в state.download. */
  async downloadModel(model: LocalModelEntry): Promise<boolean> {
    const port = this.state.port;
    if (this.state.status !== 'running' || !port) {
      this.setState({ lastError: 'Сначала запустите AI-раннер.' });
      return false;
    }
    this.setState({ download: { active: true, fileName: model.fileName, received: 0, total: model.sizeBytes } });
    try {
      // Приём задачи: раннер отвечает сразу, скачивание идёт в фоне.
      const res = await fetch(`${aiEndpoint(port)}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: model.url, fileName: model.fileName, expectedBytes: model.sizeBytes }),
        signal: AbortSignal.timeout(15_000),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || body.ok !== true) {
        this.setState({ download: { active: false, fileName: '', received: 0, total: 0, error: body.error ?? 'Не удалось начать скачивание.' } });
        return false;
      }
      // Ждём завершения, опрашивая статус (скачивание — в фоне раннера).
      const deadline = Date.now() + 60 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const status = (await this.fetchJson(`${aiEndpoint(port)}/download/status`)) as AiDownloadState | null;
        if (!status) continue;
        this.setState({ download: status });
        if (!status.active) {
          if (status.error) {
            this.setState({ modelError: status.error });
            return false;
          }
          // Файл скачан, но модель ещё не в памяти — modelLoaded подтвердит /health
          // после «Перезапустить»; здесь оставляем false (честно).
          this.setModelInfo(false, model.fileName, undefined);
          await this.refreshHealth();
          return true;
        }
      }
      this.setState({ download: { ...this.state.download, error: 'Превышено время скачивания.' } });
      return false;
    } catch (err) {
      const message = describeRunnerFetchError(err);
      this.setState({ download: { active: false, fileName: '', received: 0, total: 0, error: message } });
      // TZD-67: a raw fetch failure here can mean the runner truly stopped
      // responding on this port (e.g. it restarted internally and picked a
      // different port after EADDRINUSE) even though `status` still reads
      // "running" from the last stdout listen-line. Re-probe health once so
      // the badge doesn't keep claiming healthy against a request that just
      // failed to connect at all.
      try {
        await this.fetchJson(aiHealthzUrl(port));
      } catch {
        this.setState({
          status: 'error',
          lastError: 'Раннер перестал отвечать на этом порту. Нажмите «Перезапустить».',
        });
      }
      return false;
    }
  }

  /** Один запрос к раннеру; null при недоступности. */
  async refreshHealth(): Promise<void> {
    const port = this.state.port;
    if (this.state.status !== 'running' || !port) return;
    try {
      const body = (await this.fetchJson(aiHealthzUrl(port))) as {
        modelLoaded?: boolean;
        modelName?: string | null;
        modelError?: string | null;
        specs?: { totalMemoryGb?: number; freeMemoryGb?: number; cpus?: number };
        download?: AiDownloadState;
      } | null;
      if (!body) return;
      this.setModelInfo(body.modelLoaded === true, body.modelName ?? undefined, body.modelError ?? undefined);
      if (body.specs) {
        this.setState({
          specs: {
            totalMemoryGb: body.specs.totalMemoryGb ?? 0,
            freeMemoryGb: body.specs.freeMemoryGb ?? 0,
            cpus: body.specs.cpus ?? 0,
          },
          download: body.download ?? this.state.download,
        });
      }
    } catch {
      // раннер может быть в процессе загрузки модели — не считаем ошибкой
    }
  }

  private async fetchJson(url: string): Promise<unknown> {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  private async waitForHealth(gen: number): Promise<boolean> {
    const deadline = Date.now() + HEALTHZ_WAIT_MS;
    while (Date.now() < deadline) {
      if (gen !== this.generation) return false;
      if (this.sawListenLog) return true;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    return this.sawListenLog;
  }

  private async killChild(): Promise<void> {
    const child = this.child;
    this.child = null;
    if (child) {
      try {
        await child.kill();
      } catch {
        // ignore
      }
    }
  }

  private describeSpawnError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('path does not have a parent')) {
      return BUNDLED_RUNNER_MISSING;
    }
    if (lower.includes('not found') || lower.includes('notfound')) {
      return 'AI-раннер не запущен: не найден Node.js (нужен установленный Node для десктопа).';
    }
    return `AI-раннер не запустился: ${raw}`;
  }

  private describeExit(code: number | null, stderrTail: string[]): string {
    const tail = stderrTail.join(' ');
    if (code === 0 && !tail) {
      return 'AI-раннер закрыл процесс с кодом 0 (возможно ложный сигнал). Нажмите «Запустить» ещё раз.';
    }
    if (tail) return `AI-раннер завершился${code !== null ? ` (код ${code})` : ''}: ${tail.slice(0, 300)}`;
    return `AI-раннер завершился неожиданно${code !== null ? ` (код ${code})` : ''}.`;
  }
}

/** Русская подпись состояния скачивания для UI. */
export function formatDownload(state: AiDownloadState): string {
  if (!state.active && !state.error) return '';
  if (state.error) return `Ошибка: ${state.error}`;
  const percent = state.total > 0 ? Math.round((state.received / state.total) * 100) : 0;
  return `Скачивание ${state.fileName}: ${formatBytes(state.received)} из ${formatBytes(state.total)} (${percent}%)`;
}
