/**
 * Встроенный AI-раннер (Фаза 2): локальная LLM через llama.cpp (node-llama-cpp)
 * + скачивание GGUF-моделей с прогрессом.
 *
 * Поднимается десктопом как фоновый Node-процесс (тот же паттерн, что MCP host).
 * API — OpenAI-совместимый (/v1/chat/completions), поэтому существующий клиент
 * `core/ai/client.ts` работает без изменений.
 *
 * Режимы:
 *   --specs          → печатает JSON с характеристиками ПК и завершается
 *   (default)        → HTTP-сервер: /health, /v1/chat/completions, /download, /download/status
 *
 * Лог-маркер готовности для контроллера: `[kppdf-ai] listening <port>`
 */

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { isAllowedModelUrl } from './security';

const PORT_START = Number(process.env.KPPDF_AI_PORT ?? '9744');
const MODEL_DIR = process.env.KPPDF_AI_MODEL_DIR ?? '';
const MODEL_FILE = process.env.KPPDF_AI_MODEL_FILE ?? '';
const MODEL_PATH = MODEL_FILE ? path.join(MODEL_DIR, MODEL_FILE) : '';

interface DownloadJob {
  active: boolean;
  fileName: string;
  received: number;
  total: number;
  error?: string;
}

const job: DownloadJob = { active: false, fileName: '', received: 0, total: 0 };

// --- системные характеристики -------------------------------------------------

function collectSpecs(): { totalMemoryGb: number; freeMemoryGb: number; cpus: number } {
  return {
    totalMemoryGb: os.totalmem() / 1024 ** 3,
    freeMemoryGb: os.freemem() / 1024 ** 3,
    cpus: os.cpus().length,
  };
}

function printSpecsAndExit(): void {
  process.stdout.write(`${JSON.stringify(collectSpecs())}\n`);
  process.exit(0);
}

if (process.argv.includes('--specs')) printSpecsAndExit();

// --- llama.cpp (загружается по требованию; без модели раннер живёт) -----------

let llamaModule: typeof import('node-llama-cpp') | null = null;
// LlamaModel/LlamaChatSession имеют private-конструкторы — тип берём через `InstanceType`
// нельзя, поэтому объявляем через импорт типа (структурный тип с публичным API).
type LlamaModelLike = import('node-llama-cpp').LlamaModel;
type LlamaChatSessionLike = import('node-llama-cpp').LlamaChatSession;
let model: LlamaModelLike | null = null;
let session: LlamaChatSessionLike | null = null;
let modelLoadError: string | null = null;
/** sticky только для реальных ошибок загрузки; «файл не скачан» — перепроверяемо. */
let modelLoadErrorSticky = false;

async function ensureModel(): Promise<void> {
  if (session) return;
  // Реальная ошибка загрузки — sticky до перезапуска процесса.
  if (modelLoadError && modelLoadErrorSticky) return;
  // «Файл не скачан» — перепроверяем: файл мог появиться после download.
  if (modelLoadError && !modelLoadErrorSticky && !fs.existsSync(MODEL_PATH)) return;
  modelLoadError = null;
  modelLoadErrorSticky = false;
  try {
    llamaModule = await import('node-llama-cpp');
    if (!MODEL_PATH || !fs.existsSync(MODEL_PATH)) {
      modelLoadError = 'Модель не скачана — сначала скачайте модель во вкладке «Модель».';
      modelLoadErrorSticky = false;
      return;
    }
    const { getLlama } = llamaModule;
    const llama = await getLlama();
    model = await llama.loadModel({ modelPath: MODEL_PATH });
    const context = await model.createContext({ contextSize: 4096 });
    session = new llamaModule.LlamaChatSession({ contextSequence: context.getSequence() });
    process.stdout.write(`[kppdf-ai] model loaded ${MODEL_FILE}\n`);
  } catch (err) {
    modelLoadError = err instanceof Error ? err.message : 'Не удалось загрузить модель';
    modelLoadErrorSticky = true;
    process.stdout.write(`[kppdf-ai] model error: ${modelLoadError}\n`);
  }
}

/** Файл появился после успешного скачивания — снимаем «файл не скачан». */
function clearMissingFileError(): void {
  if (modelLoadError && !modelLoadErrorSticky) {
    modelLoadError = null;
  }
}

// --- скачивание модели --------------------------------------------------------

function safeFileName(name: string): string {
  const base = path.basename(name).replace(/[^A-Za-z0-9._-]/g, '_');
  return base.endsWith('.gguf') ? base : `${base}.gguf`;
}

/**
 * Запускает скачивание в фоне; HTTP-контракт: POST /download отвечает сразу,
 * прогресс — только в GET /download/status.
 */
function startDownload(url: string, fileName: string, expectedBytes?: number): void {
  if (job.active) return;
  if (!isAllowedModelUrl(url)) {
    job.error = 'Ссылка вне списка разрешённых (только Hugging Face).';
    return;
  }
  const safe = safeFileName(fileName);
  const tmpPath = path.join(MODEL_DIR, `${safe}.tmp`);
  const finalPath = path.join(MODEL_DIR, safe);
  try {
    // Первый download на чистой машине: каталога models/ ещё нет.
    fs.mkdirSync(MODEL_DIR, { recursive: true });
  } catch (err) {
    job.error = `Не удалось создать каталог моделей: ${err instanceof Error ? err.message : String(err)}`;
    return;
  }
  job.active = true;
  job.fileName = safe;
  job.received = 0;
  job.total = expectedBytes ?? 0;
  job.error = undefined;
  const out = fs.createWriteStream(tmpPath);

  const finish = (error?: string): void => {
    job.active = false;
    job.error = error;
    if (error) {
      out.destroy();
      fs.rm(tmpPath, { force: true }, () => undefined);
      return;
    }
    out.close(() => {
      fs.rename(tmpPath, finalPath, (renameErr) => {
        if (renameErr) {
          fs.rm(tmpPath, { force: true }, () => undefined);
          return;
        }
        job.total = job.received;
        clearMissingFileError();
        process.stdout.write(`[kppdf-ai] downloaded ${safe}\n`);
      });
    });
  };

  const fetchUrl = (target: string): void => {
    if (!isAllowedModelUrl(target)) {
      finish('Редирект на ссылку вне списка разрешённых (только Hugging Face).');
      return;
    }
    https
      .get(target, { headers: { 'User-Agent': 'kppdf-desktop' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307) {
          const redirect = res.headers.location;
          out.destroy();
          if (redirect) {
            const next = new URL(redirect, target).toString();
            if (!isAllowedModelUrl(next)) {
              finish('Редирект на ссылку вне списка разрешённых (только Hugging Face).');
              return;
            }
            fetchUrl(next);
          } else {
            finish('Сервер не дал адрес файла.');
          }
          return;
        }
        if (res.statusCode !== 200) {
          finish(`Сервер ответил ${res.statusCode} (${res.statusMessage ?? ''}). Проверьте ссылку модели.`);
          return;
        }
        const contentLength = Number(res.headers['content-length'] ?? 0);
        job.total = contentLength > 0 ? contentLength : (expectedBytes ?? 0);
        res.on('data', (chunk: Buffer) => {
          job.received += chunk.length;
          out.write(chunk);
        });
        res.on('end', () => finish());
        res.on('error', (err) => finish(err.message));
      })
      .on('error', (err) => finish(err.message));
  };

  fetchUrl(url);
}

// --- HTTP ---------------------------------------------------------------------

function json(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Тело запроса — не JSON.'));
      }
    });
    req.on('error', reject);
  });
}

let chatRequestQueue: Promise<void> = Promise.resolve();
function enqueueChat(
  handler: () => Promise<unknown>,
): Promise<unknown> {
  const run = chatRequestQueue.then(handler);
  chatRequestQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function handleChat(body: Record<string, unknown>): Promise<unknown> {
  await ensureModel();
  if (modelLoadError) {
    return { error: { message: modelLoadError, code: 'model_unavailable' } };
  }
  if (!session) {
    return { error: { message: 'Модель не готова.', code: 'model_unavailable' } };
  }
  const messages = (body.messages ?? []) as Array<{ role?: string; content?: unknown }>;
  const promptMessages = messages
    .filter((m) => typeof m.content === 'string')
    .map((m) => ({ role: (m.role === 'assistant' || m.role === 'system' || m.role === 'user' ? m.role : 'user') as 'system' | 'user' | 'assistant', content: m.content as string }));
  if (promptMessages.length === 0) {
    return { error: { message: 'Нет сообщений для модели.', code: 'bad_request' } };
  }
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 1024;
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.2;
  // LlamaChatSession: system-промпт задаётся при создании сессии, prompt() — строка.
  // Для одноразовых задач (подбор колонок) склеиваем system в начало текста.
  const system = promptMessages.find((m) => m.role === 'system')?.content ?? '';
  const user = promptMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => m.content)
    .join('\n');
  const answer = await session.prompt(system ? `Инструкция: ${system}\n\n${user}` : user, {
    maxTokens,
    temperature,
  });
  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    model: MODEL_FILE || 'local',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: answer },
        finish_reason: 'stop',
      },
    ],
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT_START}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, {
        ok: true,
        engineAvailable: await import('node-llama-cpp')
          .then(() => true)
          .catch(() => false),
        modelLoaded: session !== null,
        modelName: MODEL_FILE || null,
        modelError: modelLoadError,
        specs: collectSpecs(),
        download: job,
      });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/download/status') {
      json(res, 200, job);
      return;
    }
    if (req.method === 'POST' && url.pathname === '/download') {
      const body = (await readBody(req)) as { url?: string; fileName?: string; expectedBytes?: number };
      if (!body.url || !body.fileName) {
        json(res, 400, { ok: false, error: 'Укажите url и fileName.' });
        return;
      }
      if (job.active) {
        json(res, 409, { ok: false, error: 'Другое скачивание уже идёт.' });
        return;
      }
      if (!isAllowedModelUrl(body.url)) {
        json(res, 400, { ok: false, error: 'Ссылка вне списка разрешённых (только Hugging Face).' });
        return;
      }
      // Принимаем задачу и отвечаем сразу; прогресс — в /download/status.
      startDownload(body.url, body.fileName, body.expectedBytes);
      json(res, 200, { ok: true, started: true });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
      const body = (await readBody(req)) as Record<string, unknown>;
      const result = await enqueueChat(() => handleChat(body));
      if (result && typeof result === 'object' && 'error' in result) {
        json(res, 503, result);
        return;
      }
      json(res, 200, result);
      return;
    }
    json(res, 404, { error: 'Не найдено' });
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : 'Внутренняя ошибка раннера' });
  }
});

function listen(): void {
  const tryPort = (port: number): void => {
    const srv = server.listen(port, '127.0.0.1', () => {
      process.stdout.write(`[kppdf-ai] listening ${port}\n`);
    });
    srv.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && port < PORT_START + 20) {
        tryPort(port + 1);
        return;
      }
      process.stdout.write(`[kppdf-ai] error ${err.message}\n`);
      process.exit(1);
    });
  };
  tryPort(PORT_START);
}

listen();
