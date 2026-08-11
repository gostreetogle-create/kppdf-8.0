/**
 * MCP host lifecycle (TZD-14).
 *
 * Desktop (Tauri) запускает Node-процесс MCP host (`desktop/mcp`, http-server.ts)
 * без ручного терминала: через tauri-plugin-shell (CREATE_NO_WINDOW на Windows).
 * Плагин сам убивает дочерние процессы при выходе приложения (RunEvent::Exit),
 * плюс явный stop() для кнопки «Остановить» / «Отключить».
 *
 * Статус-машина: stopped → starting → running | error; stopping → stopped.
 */

import { Command, type Child } from '@tauri-apps/plugin-shell';
import { dirname, join, resourceDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { DEFAULT_MCP_PORT } from './config';

export type McpHostStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface McpHostState {
  status: McpHostStatus;
  port: number;
  allowLan: boolean;
  /** pid процесса host (пока жив). */
  pid?: number;
  /** Текст ошибки для статуса error. */
  lastError?: string;
}

export interface McpStartOptions {
  apiBaseUrl: string;
  apiKey: string;
  port: number;
  allowLan: boolean;
  /** Каталог пакета desktop/mcp; по умолчанию вычисляется из resourceDir. */
  hostDir?: string;
  /** Каталог inbox агента (TZD-15); передаётся host-процессу как KPPDF_INBOX_DIR. */
  inboxDir?: string;
  /** Nginx «подъезд» для публичного URL → KPPDF_HTTP_BASIC_*. */
  basicAuth?: { username: string; password: string };
}

export const MCP_PORT_MIN = 1024;
export const MCP_PORT_MAX = 65535;

/** URL эндпоинта MCP для клиентов (всегда loopback-адрес). */
export function mcpEndpoint(port: number): string {
  return `http://127.0.0.1:${port}/mcp`;
}

/** URL health-check MCP host. */
export function mcpHealthzUrl(port: number): string {
  return `http://127.0.0.1:${port}/healthz`;
}

/** Проверка порта для поля ввода; null = валидно. */
export function validateMcpPort(port: number): string | null {
  if (!Number.isInteger(port) || port < MCP_PORT_MIN || port > MCP_PORT_MAX) {
    return `Порт должен быть целым числом от ${MCP_PORT_MIN} до ${MCP_PORT_MAX}.`;
  }
  return null;
}

/** Имя пакета MCP (package.json name), которому доверяет host (TZD-31). */
export const MCP_PACKAGE_NAME = '@kppdf/desktop-mcp';

/** Имя env-переменной с абсолютным путём к пакету desktop/mcp (TZD-31). */
export const MCP_HOST_DIR_ENV = 'KPPDF_MCP_HOST_DIR';

/**
 * Значение env `KPPDF_MCP_HOST_DIR` из Vite `import.meta.env` (dev Desktop,
 * .env с envPrefix KPPDF_) или `process.env` (Node-контекст, напр. тесты).
 * Приоритет над resourceDir walk — см. McpHostController.start().
 */
export function envMcpHostDir(): string | undefined {
  const metaEnv = (import.meta as { env?: Record<string, unknown> }).env;
  const fromMeta = typeof metaEnv?.[MCP_HOST_DIR_ENV] === 'string' ? metaEnv[MCP_HOST_DIR_ENV] : '';
  if (fromMeta.trim()) return fromMeta.trim();
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fromProcess = proc?.env?.[MCP_HOST_DIR_ENV];
  if (fromProcess?.trim()) return fromProcess.trim();
  return undefined;
}

/**
 * Каталог пакета `desktop/mcp`.
 * 1) явный hostDir / env
 * 2) обход вверх от resourceDir в поисках package.json name=@kppdf/desktop-mcp
 * 3) legacy join(…/desktop, 'mcp') — для ошибки в UI
 */
export async function resolveMcpHostDir(): Promise<string> {
  const tried: string[] = [];
  const pushUnique = (p: string) => {
    const n = p.replace(/[\\/]+$/, '');
    if (n && !tried.includes(n)) tried.push(n);
  };

  let dir = await resourceDir();
  for (let i = 0; i < 10; i++) {
    pushUnique(await join(dir, 'mcp'));
    pushUnique(await join(dir, 'desktop', 'mcp'));
    const parent = await dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const candidate of tried) {
    const name = await readPackageNameAt(candidate);
    if (name === MCP_PACKAGE_NAME) return candidate;
  }

  // Legacy path (часто %USERPROFILE%\mcp у NSIS) — для понятного сообщения об ошибке.
  const resource = await resourceDir();
  const parent1 = await dirname(resource);
  const parent2 = await dirname(parent1);
  const desktopDir = await dirname(parent2);
  return join(desktopDir, 'mcp');
}

async function readPackageNameAt(hostDir: string): Promise<string | null> {
  try {
    const raw = await readTextFile(await join(hostDir, 'package.json'));
    const parsed = JSON.parse(raw) as { name?: unknown };
    return typeof parsed.name === 'string' ? parsed.name : null;
  } catch {
    return null;
  }
}

export class McpHostController {
  private state: McpHostState = {
    status: 'stopped',
    port: DEFAULT_MCP_PORT,
    allowLan: false,
  };

  private child: Child | null = null;
  /** true — мы ожидаем, что процесс жив (закрытие без kill = сбой). */
  private expectedRunning = false;
  /** Счётчик поколений: защита от устаревших healthz-поллингов после stop/restart. */
  private generation = 0;
  private healthTimer: ReturnType<typeof setTimeout> | null = null;
  private stderrTail: string[] = [];
  private disposed = false;

  constructor(private readonly onState: (state: McpHostState) => void) {}

  getState(): McpHostState {
    return { ...this.state };
  }

  private setState(patch: Partial<McpHostState>): void {
    this.state = { ...this.state, ...patch };
    this.onState(this.getState());
  }

  private clearHealthTimer(): void {
    if (this.healthTimer !== null) {
      clearTimeout(this.healthTimer);
      this.healthTimer = null;
    }
  }

  /** Обновляет отображаемые настройки без перезапуска (перед start/restart). */
  setPrefs(port: number, allowLan: boolean): void {
    this.setState({ port, allowLan });
  }

  /**
   * Стартует MCP host на 127.0.0.1:<port> (или 0.0.0.0 при allowLan).
   * Идемпотентно: останавливает предыдущий процесс, если он ещё жив.
   */
  async start(opts: McpStartOptions): Promise<void> {
    if (this.disposed) return;

    const portError = validateMcpPort(opts.port);
    if (portError) {
      // Не трогаем уже запущенный host: только показываем ошибку порта.
      this.setState({ status: 'error', lastError: portError });
      return;
    }

    await this.stop();

    const gen = ++this.generation;
    this.expectedRunning = true;
    this.stderrTail = [];
    this.setState({
      status: 'starting',
      port: opts.port,
      allowLan: opts.allowLan,
      lastError: undefined,
    });

    let hostDir: string;
    try {
      hostDir =
        opts.hostDir?.trim() ||
        envMcpHostDir() ||
        (await resolveMcpHostDir());
    } catch (err) {
      this.expectedRunning = false;
      this.setState({
        status: 'error',
        lastError: `Не удалось определить каталог MCP: ${err instanceof Error ? err.message : String(err)}`,
      });
      return;
    }

    // TZD-31: не поднимать host из «не той» папки — пакет должен быть @kppdf/desktop-mcp.
    const pkgName = await this.readPackageName(hostDir);
    if (pkgName !== MCP_PACKAGE_NAME) {
      this.expectedRunning = false;
      this.setState({
        status: 'error',
        lastError:
          `Каталог MCP «${hostDir}» — не пакет ${MCP_PACKAGE_NAME} ` +
          `(package.json name: ${pkgName ?? 'нет/не читается'}). ` +
          `Задайте ${MCP_HOST_DIR_ENV} (например ${MCP_HOST_DIR_ENV}=D:\\kppdf-8.0\\desktop\\mcp), ` +
          `выполните git pull в рабочей копии и перезапустите MCP.`,
      });
      return;
    }

    try {
      const cli = await join(hostDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
      const entry = await join(hostDir, 'src', 'http-server.ts');

      const cmd = Command.create('node', [cli, entry], {
        cwd: hostDir,
        env: {
          KPPDF_API_BASE_URL: opts.apiBaseUrl,
          KPPDF_API_KEY: opts.apiKey,
          KPPDF_MCP_PORT: String(opts.port),
          KPPDF_MCP_ALLOW_LAN: opts.allowLan ? '1' : '0',
          ...(opts.inboxDir ? { KPPDF_INBOX_DIR: opts.inboxDir } : {}),
          ...(opts.basicAuth?.username
            ? {
                KPPDF_HTTP_BASIC_USER: opts.basicAuth.username,
                KPPDF_HTTP_BASIC_PASS: opts.basicAuth.password ?? '',
              }
            : {}),
        },
      });

      cmd.on('error', (message) => {
        if (gen !== this.generation) return;
        this.expectedRunning = false;
        this.setState({ status: 'error', lastError: this.describeSpawnError(message) });
      });

      cmd.stderr.on('data', (line) => {
        const text = String(line);
        this.stderrTail.push(text.trim());
        if (this.stderrTail.length > 8) this.stderrTail.shift();
      });

      cmd.on('close', (payload) => {
        if (gen !== this.generation) return;
        const crashed = this.expectedRunning;
        this.expectedRunning = false;
        this.child = null;
        if (crashed) {
          this.setState({
            status: 'error',
            lastError: this.describeExit(payload.code, this.stderrTail),
          });
        } else {
          this.setState({ status: 'stopped' });
        }
      });

      const child = await cmd.spawn();
      if (gen !== this.generation) {
        // За это время вызвали stop() — процесс больше не нужен.
        await child.kill().catch(() => undefined);
        return;
      }
      this.child = child;
      this.setState({ pid: child.pid });

      // Подтверждаем running по /healthz (максимум ~10 c).
      const healthy = await this.waitForHealth(opts.port, gen);
      if (gen !== this.generation || !this.expectedRunning) return;
      if (healthy) {
        this.setState({ status: 'running' });
      } else {
        this.expectedRunning = false;
        // Инвалидируем поколение ДО kill: close-событие от нашего kill
        // не должно перезаписать статус error на stopped.
        this.generation += 1;
        await this.killChild();
        this.setState({
          status: 'error',
          lastError:
            `MCP host не ответил на /healthz в течение 10 секунд. ` +
            `Проверьте, что порт ${opts.port} свободен и Node.js установлен.`,
        });
      }
    } catch (err) {
      if (gen !== this.generation) return;
      this.expectedRunning = false;
      this.setState({
        status: 'error',
        lastError: this.describeSpawnError(err instanceof Error ? err.message : String(err)),
      });
    }
  }

  /** Останавливает процесс (если запущен) и переводит в stopped. */
  async stop(): Promise<void> {
    this.generation += 1;
    this.clearHealthTimer();
    const child = this.child;
    this.child = null;
    if (child) {
      this.expectedRunning = false;
      this.setState({ status: 'stopping' });
      try {
        await child.kill();
      } catch {
        // процесс уже мог завершиться; статус всё равно stopped
      }
      this.setState({ status: 'stopped', pid: undefined });
    } else {
      this.expectedRunning = false;
      this.setState({ status: 'stopped', pid: undefined });
    }
  }

  /** Перезапуск: те же настройки (если процесс уже жив — сначала stop). */
  async restart(opts: McpStartOptions): Promise<void> {
    await this.start(opts);
  }

  /** Полное освобождение (onUnmount / выход приложения). */
  dispose(): void {
    this.disposed = true;
    this.generation += 1;
    this.clearHealthTimer();
    const child = this.child;
    this.child = null;
    this.expectedRunning = false;
    if (child) {
      void child.kill().catch(() => undefined);
    }
  }

  /** Читает name из package.json пакета MCP; null если нет/не читается. */
  private async readPackageName(hostDir: string): Promise<string | null> {
    try {
      const raw = await readTextFile(await join(hostDir, 'package.json'));
      const pkg = JSON.parse(raw) as { name?: unknown };
      return typeof pkg.name === 'string' ? pkg.name : null;
    } catch {
      return null;
    }
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

  private async waitForHealth(port: number, gen: number): Promise<boolean> {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      if (gen !== this.generation) return false;
      try {
        const res = await fetch(mcpHealthzUrl(port), { signal: AbortSignal.timeout(800) });
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
          if (body?.ok === true || body === null) return true;
        }
      } catch {
        // ещё поднимается — пробуем дальше
      }
      await new Promise((resolve) => {
        this.healthTimer = setTimeout(resolve, 500);
      });
    }
    return false;
  }

  private describeSpawnError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('not found') || lower.includes('notfound')) {
      return 'MCP host не запущен: не найден Node.js (нужен установленный Node для desktop/mcp).';
    }
    return `MCP host не запустился: ${raw}`;
  }

  private describeExit(code: number | null, stderrTail: string[]): string {
    const tail = stderrTail.join(' ');
    if (tail) {
      return `MCP host завершился с ошибкой${code !== null ? ` (код ${code})` : ''}: ${tail.slice(0, 300)}`;
    }
    return `MCP host завершился неожиданно${code !== null ? ` (код ${code})` : ''}.`;
  }
}
