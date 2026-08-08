<script lang="ts">
  // v0.2 — «Подключение» (паринг + /auth/me). v0.3 — «Импорт» (excel/csv → таблица).
  import { onMount } from 'svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { open } from '@tauri-apps/plugin-dialog';
  import { readFile } from '@tauri-apps/plugin-fs';
  import { apiGet, ApiError } from './core/api';
  import { loadConfig, saveConfig, type AppConfig } from './core/config';
  import { parsePairing } from './core/pairing';
  import { importerFor, type RawRow } from './importers';
  import {
    appendInboxLog,
    auditInboxFile,
    cancelProposals,
    confirmProposals,
    createImportTaskFromRows,
    ensureInboxLayout,
    moveInboxFile,
    proposeMaterialRows,
    resolveInboxDir,
    scanInbox,
    type InboxAudit,
    type InboxFile,
  } from './core/inbox';
  import {
    MCP_PORT_MAX,
    MCP_PORT_MIN,
    McpHostController,
    mcpEndpoint,
    validateMcpPort,
    type McpHostState,
    type McpHostStatus,
  } from './core/mcpHost';
  import { buildMcpClientSnippet } from './core/mcpClientSnippet';
  import { DEFAULT_MCP_PORT } from './core/config';

  // Placeholder вынесен в JS: фигурные скобки в атрибуте Svelte парсит как выражение.
  const pairingPlaceholder =
    '{"apiBaseUrl":"https://app.kppdf.ru","apiKey":"...","username":"...","expiresAt":"..."}';

  let pairingJson = $state('');
  let errors = $state<string[]>([]);
  let connecting = $state(false);
  let connected = $state<{ username: string; apiBaseUrl: string } | null>(null);

  // MCP host (TZD-14): автозапуск при подключённом аккаунте, статус + настройки.
  let mcp: McpHostController;
  let mcpState = $state<McpHostState>({
    status: 'stopped',
    port: DEFAULT_MCP_PORT,
    allowLan: false,
  });
  let mcpPortInput = $state(String(DEFAULT_MCP_PORT));
  let mcpError = $state('');
  let mcpCopied = $state(false);
  let mcpJsonCopied = $state(false);
  let mcpFragmentCopied = $state(false);
  /** apiKey из конфига — нужен для mcp.json (не храним в connected). */
  let pairedApiKey = $state<string | undefined>(undefined);

  /** Подсказка внизу белой зоны (над футером версии) — по наведению на кнопки. */
  const HINT_IDLE = 'Наведите на кнопку — здесь появится, что она сделает.';
  let uiHint = $state(HINT_IDLE);
  function showHint(text: string) {
    uiHint = text;
  }
  function clearHint() {
    uiHint = HINT_IDLE;
  }
  const HINTS = {
    connect: 'Проверит токен на сервере и сохранит подключение. После этого MCP стартует сам.',
    disconnect: 'Забудет сохранённый токен на этом ПК. Сервер и данные не трогает.',
    startMcp: 'Поднимет локальный MCP для AI. Если порт занят — сам найдёт свободный.',
    stopMcp: 'Остановит локальный MCP. Веб-сервер kppdf и inbox не затрагиваются.',
    restartMcp: 'Остановит и снова запустит MCP (удобно после смены настроек).',
    copyMcp: 'Скопирует адрес MCP в буфер обмена для внешнего AI-клиента.',
    copyMcpJson:
      'Скопирует готовый mcp.json (url + Bearer) для Cursor и LM Studio — один формат на оба клиента.',
    copyMcpFragment:
      'Скопирует только фрагмент «kppdf»: {…} для вставки внутрь существующего mcpServers.',
    applyPort: 'Сохранит предпочтительный порт и перезапустит MCP, если он уже был запущен.',
    pickInbox: 'Выберет другую папку Inbox вместо каталога по умолчанию.',
    resetInbox: 'Вернёт папку Inbox к стандартной в данных приложения.',
    scanInbox: 'Сейчас перечитает файлы в папке Inbox.',
    audit: 'Только прочитает файл и покажет таблицу. В базу ничего не пишет.',
    propose:
      'Без сверки с базой — только черновики (proposals). В справочник материалов ещё НЕ попадёт — нужен «Подтвердить».',
    createAiTask:
      'Создаст задачу импорта для ИИ (Import Task). Proposals и справочник не трогает — сверка/план позже (TZD-23).',
    confirm: 'Запишет предложенные черновики в справочник материалов на сервере. Это уже реальное создание.',
    cancel: 'Снимет черновики без записи в базу. Файл уйдёт в «отклонённые».',
    discard: 'Переместит файл в папку «отклонённые» без записи на сервер.',
    pickFile: 'Откроет диалог выбора файла для локального предпросмотра (не Inbox).',
  } as const;

  const MCP_STATUS_LABEL: Record<McpHostStatus, string> = {
    stopped: 'Остановлен',
    starting: 'Запускается…',
    running: 'Запущен',
    stopping: 'Останавливается…',
    error: 'Ошибка',
  };

  /** Старт MCP: сам подберёт свободный порт; LAN выключен (надёжный one-click). */
  async function startMcp() {
    const cfg = await loadConfig();
    if (!cfg.apiKey || !cfg.apiBaseUrl) {
      mcpError = 'MCP недоступен: сначала подключите аккаунт.';
      return;
    }
    const preferred = Number(mcpPortInput);
    const port = validateMcpPort(preferred) === null ? preferred : DEFAULT_MCP_PORT;
    mcpError = '';
    // Клиентский режим: LAN только если явно включён в «Дополнительно».
    const allowLan = cfg.mcp.allowLan === true;
    mcp.setPrefs(port, allowLan);
    const inboxDir = await resolveInboxDir(cfg);
    await mcp.start({
      apiBaseUrl: cfg.apiBaseUrl,
      apiKey: cfg.apiKey,
      port,
      allowLan,
      inboxDir,
      onPortChosen: async (chosen) => {
        mcpPortInput = String(chosen);
        await saveConfig({ ...cfg, mcp: { ...cfg.mcp, port: chosen, allowLan } });
      },
    });
    // Если порт не менялся — всё равно синхронизируем фактический.
    const st = mcp.getState();
    if (st.status === 'running' && st.port !== cfg.mcp.port) {
      mcpPortInput = String(st.port);
      await saveConfig({ ...cfg, mcp: { ...cfg.mcp, port: st.port, allowLan } });
    } else if (st.status === 'running') {
      await saveConfig({ ...cfg, mcp: { ...cfg.mcp, port: st.port, allowLan } });
    }
  }

  async function stopMcp() {
    await mcp.stop();
  }

  async function restartMcp() {
    await startMcp(); // start() сам останавливает предыдущий процесс
  }

  /** Применить введённый порт: сохранить + перезапустить host. */
  async function applyMcpPort() {
    const port = Number(mcpPortInput);
    const portError = validateMcpPort(port);
    if (portError) {
      mcpError = portError;
      return;
    }
    mcpError = '';
    const cfg = await loadConfig();
    await saveConfig({ ...cfg, mcp: { ...cfg.mcp, port } });
    mcp.setPrefs(port, cfg.mcp.allowLan);
    if (mcpState.status === 'running' || mcpState.status === 'error') {
      await restartMcp();
    }
  }

  /** Переключение LAN-bind: сохранить + перезапустить host. */
  async function toggleMcpLan() {
    const cfg = await loadConfig();
    const allowLan = !cfg.mcp.allowLan;
    await saveConfig({ ...cfg, mcp: { ...cfg.mcp, allowLan } });
    mcp.setPrefs(cfg.mcp.port, allowLan);
    if (mcpState.status === 'running' || mcpState.status === 'error') {
      await restartMcp();
    }
  }

  async function copyMcpUrl() {
    try {
      await navigator.clipboard.writeText(mcpEndpoint(mcpState.port));
      mcpCopied = true;
      setTimeout(() => (mcpCopied = false), 1500);
    } catch {
      mcpError = 'Не удалось скопировать — скопируйте адрес вручную.';
    }
  }

  function canCopyMcpJson(): boolean {
    return Boolean(connected && pairedApiKey && mcpState.port > 0);
  }

  async function copyMcpJson(mode: 'full' | 'fragment') {
    if (!canCopyMcpJson() || !pairedApiKey) {
      mcpError = 'Сначала подключите паринг — без apiKey mcp.json не собрать.';
      return;
    }
    try {
      const text = buildMcpClientSnippet({
        port: mcpState.port,
        apiKey: pairedApiKey,
        mode,
      });
      await navigator.clipboard.writeText(text);
      if (mode === 'full') {
        mcpJsonCopied = true;
        setTimeout(() => (mcpJsonCopied = false), 2000);
      } else {
        mcpFragmentCopied = true;
        setTimeout(() => (mcpFragmentCopied = false), 2000);
      }
      uiHint = 'Скопировано — вставьте в Cursor / LM Studio mcp.json';
    } catch {
      mcpError = 'Не удалось скопировать mcp.json — соберите вручную по подсказке в docs.';
    }
  }

  // Импорт
  let importRows = $state<RawRow[]>([]);
  let importError = $state('');
  let importing = $state(false);

  let disposed = false;

  // Inbox (TZD-15): папка для файлов агента — audit → propose → confirm/cancel.
  type InboxFileStatus = 'new' | 'audited' | 'proposed' | 'applied' | 'failed';
  interface InboxFileUi extends InboxFile {
    status: InboxFileStatus;
    audit?: InboxAudit;
    proposalIds: string[];
    note?: string;
  }

  const INBOX_STATUS_LABEL: Record<InboxFileStatus, string> = {
    new: 'Новый',
    audited: 'Разобран',
    proposed: 'Предложен',
    applied: 'Применён',
    failed: 'Ошибка',
  };

  let inboxDir = $state('');
  let inboxFiles = $state<InboxFileUi[]>([]);
  let inboxError = $state('');
  let inboxBusy = $state(false);
  let inboxLog = $state('');
  let inboxScanTimer: ReturnType<typeof setInterval> | null = null;

  /** Инициализация: каталог + layout + первая выгрузка лога. */
  async function initInbox() {
    const cfg = await loadConfig();
    const dir = await resolveInboxDir(cfg);
    try {
      await ensureInboxLayout(dir);
      inboxDir = dir;
      await refreshInbox();
    } catch (err) {
      inboxError = `Не удалось подготовить inbox: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  /** Сканирование inbox и слияние статусов с уже известными файлами. */
  async function refreshInbox() {
    if (!inboxDir) return;
    try {
      const found = await scanInbox(inboxDir);
      const known = new Map(inboxFiles.map((f) => [f.name, f]));
      const merged: InboxFileUi[] = found.map((f) => {
        const prev = known.get(f.name);
        if (!prev) return { ...f, status: 'new', proposalIds: [] };
        // Файл мог поменяться (новый mtime) — сбрасываем в new.
        if (prev.modifiedAt !== f.modifiedAt && (prev.status === 'audited' || prev.status === 'new')) {
          return { ...f, status: 'new', audit: undefined, proposalIds: [] };
        }
        return { ...prev, ...f };
      });
      inboxFiles = merged;
      await loadInboxLog();
    } catch (err) {
      inboxError = `Не удалось прочитать inbox: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  /** Хвост лога inbox (последние строки). */
  async function loadInboxLog() {
    if (!inboxDir) return;
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      const raw = (await readTextFile(await join(inboxDir, 'inbox.log')).catch(() => '')) || '';
      inboxLog = raw.split('\n').filter(Boolean).slice(-8).join('\n');
    } catch {
      inboxLog = '';
    }
  }

  /** Начать периодическое сканирование (пока приложение открыто и есть inbox). */
  function startInboxWatcher() {
    if (inboxScanTimer) return;
    inboxScanTimer = setInterval(() => {
      if (disposed) {
        stopInboxWatcher();
        return;
      }
      void refreshInbox();
    }, 4000);
  }

  function stopInboxWatcher() {
    if (inboxScanTimer) {
      clearInterval(inboxScanTimer);
      inboxScanTimer = null;
    }
  }

  /** Выбрать каталог inbox нативным диалогом и сохранить в конфиг. */
  async function pickInboxDir() {
    try {
      const picked = await open({ directory: true, multiple: false });
      if (!picked || Array.isArray(picked)) return;
      const cfg = await loadConfig();
      await saveConfig({ ...cfg, inbox: { dir: picked } });
      await ensureInboxLayout(picked);
      inboxDir = picked;
      inboxFiles = [];
      await refreshInbox();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Не удалось выбрать каталог inbox.';
    }
  }

  /** Сбросить inbox на app-data/inbox по умолчанию. */
  async function resetInboxDir() {
    const cfg = await loadConfig();
    await saveConfig({ ...cfg, inbox: {} });
    await initInbox();
  }

  /** Audit: распарсить файл и показать строки (запись в SoT не происходит). */
  async function auditFile(file: InboxFileUi) {
    if (inboxBusy) return;
    inboxBusy = true;
    inboxError = '';
    try {
      const audit = await auditInboxFile(inboxDir, file.name);
      file.audit = audit;
      file.status = audit.error ? 'failed' : 'audited';
      file.note = audit.error;
      inboxFiles = [...inboxFiles];
    } catch (err) {
      file.status = 'failed';
      file.note = err instanceof Error ? err.message : 'Не удалось разобрать файл.';
      inboxFiles = [...inboxFiles];
    } finally {
      inboxBusy = false;
    }
  }

  /** TZD-22: файл → ImportTask (ready_for_ai), 0 journal proposals. */
  async function createAiTask(file: InboxFileUi) {
    if (inboxBusy) return;
    inboxBusy = true;
    inboxError = '';
    try {
      const cfg = await loadConfig();
      if (!cfg.apiKey || !cfg.apiBaseUrl) {
        inboxError = 'Задача для ИИ требует подключённого аккаунта.';
        return;
      }
      if (!file.audit) {
        const audit = await auditInboxFile(inboxDir, file.name);
        file.audit = audit;
        if (audit.error) {
          file.status = 'failed';
          file.note = audit.error;
          inboxFiles = [...inboxFiles];
          return;
        }
        file.status = 'audited';
      }
      const rows = file.audit?.rows ?? [];
      if (rows.length === 0) {
        inboxError = 'Нет строк после разбора — нечего отдавать ИИ.';
        return;
      }
      const result = await createImportTaskFromRows(
        { baseUrl: cfg.apiBaseUrl, apiKey: cfg.apiKey },
        { fileName: file.name, rows, inboxPath: inboxDir },
      );
      file.note = `Задача ИИ: ${result.id} · ${result.summary ?? ''} · ${result.status} (0 proposals)`;
      inboxFiles = [...inboxFiles];
      await appendInboxLog(
        inboxDir,
        `${file.name} → import-task ${result.id} (${result.rowCount} rows, status=${result.status})`,
      );
      await refreshInboxLog();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Не удалось создать задачу для ИИ.';
    } finally {
      inboxBusy = false;
    }
  }

  async function proposeFile(file: InboxFileUi) {
    if (inboxBusy) return;
    inboxBusy = true;
    try {
      const cfg = await loadConfig();
      if (!cfg.apiKey || !cfg.apiBaseUrl) {
        inboxError = 'Предложение строк требует подключённого аккаунта.';
        return;
      }
      // Кнопка «Предложить строки» видна только после «Разобрать», но защищаемся
      // от неразобранного файла: аудит инлайн (без busy-перехвата auditFile).
      if (!file.audit) {
        const audit = await auditInboxFile(inboxDir, file.name);
        file.audit = audit;
        if (audit.error) {
          file.status = 'failed';
          file.note = audit.error;
          inboxFiles = [...inboxFiles];
          return;
        }
      }
      const result = await proposeMaterialRows(
        { baseUrl: cfg.apiBaseUrl, apiKey: cfg.apiKey },
        file.audit?.rows ?? [],
      );
      file.proposalIds = result.proposalIds;
      file.status = result.proposed > 0 ? 'proposed' : 'failed';
      file.note = buildProposeNote(result);
      inboxFiles = [...inboxFiles];
    } finally {
      inboxBusy = false;
    }
  }

  function buildProposeNote(r: { proposed: number; skipped: number; failed: Array<{ rowName: string; error: string }> }) {
    const parts = [`Предложено: ${r.proposed}`, `пропущено без наименования: ${r.skipped}`];
    if (r.failed.length > 0) parts.push(`ошибок: ${r.failed.length} (${r.failed[0].error.slice(0, 80)})`);
    return parts.join(' · ');
  }

  /** Confirm: применить proposals и переместить файл в processed/ (или failed/). */
  async function confirmFile(file: InboxFileUi) {
    if (file.proposalIds.length === 0) return;
    const cfg = await loadConfig();
    if (!cfg.apiKey || !cfg.apiBaseUrl) {
      inboxError = 'Подтверждение требует подключённого аккаунта.';
      return;
    }
    inboxBusy = true;
    try {
      const res = await confirmProposals(
        { baseUrl: cfg.apiBaseUrl, apiKey: cfg.apiKey },
        file.proposalIds,
      );
      // Провалившиеся confirm-запросы оставили proposals в статусе proposed —
      // не даём им висеть до TTL: отменяем (SoT не меняется).
      const pendingIds = res.failed.map((f) => f.id);
      if (pendingIds.length > 0) {
        void cancelProposals({ baseUrl: cfg.apiBaseUrl, apiKey: cfg.apiKey }, pendingIds);
      }
      const outcome: 'processed' | 'failed' = res.applied > 0 ? 'processed' : 'failed';
      await moveInboxFile(inboxDir, file.name, outcome);
      await appendInboxLog(
        inboxDir,
        `${file.name} → ${outcome}: applied ${res.applied}/${file.proposalIds.length}` +
          (res.failed.length ? ` failed ${res.failed.map((f) => f.error).join('; ').slice(0, 200)}` : ''),
      );
      inboxFiles = inboxFiles.filter((f) => f.name !== file.name);
      await loadInboxLog();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Ошибка подтверждения.';
    } finally {
      inboxBusy = false;
    }
  }

  /** Cancel: отменить proposals (SoT не меняется), файл → failed/. */
  async function cancelFile(file: InboxFileUi) {
    if (file.proposalIds.length === 0) {
      await discardFile(file);
      return;
    }
    const cfg = await loadConfig();
    if (!cfg.apiKey || !cfg.apiBaseUrl) {
      inboxError = 'Отмена требует подключённого аккаунта.';
      return;
    }
    inboxBusy = true;
    try {
      await cancelProposals({ baseUrl: cfg.apiBaseUrl, apiKey: cfg.apiKey }, file.proposalIds);
      await moveInboxFile(inboxDir, file.name, 'failed');
      await appendInboxLog(inboxDir, `${file.name} → failed: отменено пользователем (SoT не менялся)`);
      inboxFiles = inboxFiles.filter((f) => f.name !== file.name);
      await loadInboxLog();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Ошибка отмены.';
    } finally {
      inboxBusy = false;
    }
  }

  /** Убрать файл в failed/ без network-операций. */
  async function discardFile(file: InboxFileUi) {
    try {
      await moveInboxFile(inboxDir, file.name, 'failed');
      await appendInboxLog(inboxDir, `${file.name} → failed: убран вручную`);
      inboxFiles = inboxFiles.filter((f) => f.name !== file.name);
      await loadInboxLog();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Не удалось переместить файл.';
    }
  }

  onMount(async () => {
    mcp = new McpHostController((state) => {
      mcpState = state;
    });
    // Остановка MCP при закрытии окна. В Tauri 2 onCloseRequested сам
    // вызывает destroy() после handler — нужны ACL allow-close/destroy.
    await getCurrentWindow().onCloseRequested(() => {
      disposed = true;
      stopInboxWatcher();
      try {
        mcp?.dispose();
      } catch {
        // не блокируем закрытие окна из‑за MCP
      }
    });

    // Восстанавливаем сохранённое подключение (живой ли токен — покажет первый запрос).
    const cfg = await loadConfig();
    if (cfg.apiKey && cfg.username) {
      connected = { username: cfg.username, apiBaseUrl: cfg.apiBaseUrl };
      pairedApiKey = cfg.apiKey;
      mcpPortInput = String(cfg.mcp.port);
      mcp.setPrefs(cfg.mcp.port, cfg.mcp.allowLan);
      // Автостарт MCP host для подключённого (paired) десктопа — без терминала.
      await startMcp();
    }

    // Inbox (TZD-15): подготовка каталога + периодическое сканирование.
    await initInbox();
    startInboxWatcher();
  });

  async function connect() {
    errors = [];
    connecting = true;
    try {
      const result = parsePairing(pairingJson);
      if (!result.ok || !result.payload) {
        errors = result.errors;
        return;
      }
      const p = result.payload;
      const existing = await loadConfig();
      const config: AppConfig = {
        apiBaseUrl: p.apiBaseUrl,
        apiKey: p.apiKey,
        username: p.username,
        aiProvider: existing.aiProvider,
        mcp: existing.mcp,
        inbox: existing.inbox,
      };
      // Проверка: токен живой? 401 → «подключение устарело».
      await apiGet({ baseUrl: p.apiBaseUrl, apiKey: p.apiKey }, '/api/auth/me');
      await saveConfig(config);
      connected = { username: p.username, apiBaseUrl: p.apiBaseUrl };
      pairedApiKey = p.apiKey;
      pairingJson = '';
      mcpError = '';
      // Подключённый (paired) десктоп автоматически поднимает MCP host.
      await startMcp();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        errors = ['Подключение устарело — сгенерируйте новый паринг.'];
      } else if (err instanceof ApiError) {
        errors = [`Сервер ответил ошибкой ${err.status} — проверьте URL и доступность.`];
      } else {
        const detail = err instanceof Error ? err.message : String(err);
        errors = [
          'Не удалось подключиться — проверьте URL, сеть и сервер.',
          detail ? `Детали: ${detail}` : '',
        ].filter(Boolean);
      }
    } finally {
      connecting = false;
    }
  }

  async function disconnect() {
    await mcp.stop();
    const cfg = await loadConfig();
    await saveConfig({ ...cfg, apiKey: undefined, username: undefined });
    connected = null;
    pairedApiKey = undefined;
    pairingJson = '';
    errors = [];
  }

  /** Выбрать файл через нативный диалог Tauri и прочитать его. */
  async function pickFile() {
    importError = '';
    try {
      const picked = await open({
        multiple: false,
        filters: [
          { name: 'Данные', extensions: ['xlsx', 'xls', 'csv', 'tsv'] },
          { name: 'Все файлы', extensions: ['*'] },
        ],
      });
      if (!picked || Array.isArray(picked)) return; // отмена
      await importFromPath(picked);
    } catch (err) {
      importError = err instanceof Error ? err.message : 'Не удалось открыть диалог выбора файла.';
    }
  }

  /** Общий путь: имя файла + байты → импортёр → parse (для диалога и drag&drop). */
  async function parseBytes(name: string, data: ArrayBuffer | Uint8Array) {
    const importer = importerFor(name);
    if (!importer) {
      importError = `Файл «${name}» не распознан — поддерживаются: Excel (.xlsx/.xls), CSV/TSV.`;
      importRows = [];
      return;
    }
    importing = true;
    importError = '';
    try {
      importRows = await importer.parse({ name, data });
    } catch (err) {
      importError = err instanceof Error ? err.message : 'Не удалось прочитать файл.';
      importRows = [];
    } finally {
      importing = false;
    }
  }

  /** Чтение файла (plugin-fs) → parseBytes. */
  async function importFromPath(path: string) {
    const name = path.split(/[\\/]/).pop() ?? path;
    try {
      const data = await readFile(path); // Uint8Array
      await parseBytes(name, data);
    } catch (err) {
      importError = err instanceof Error ? err.message : 'Не удалось прочитать файл.';
    }
  }

  /** Drag&drop файла (падение прямо в карточку «Импорт»). */
  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    void (async () => {
      try {
        await parseBytes(file.name, await file.arrayBuffer());
      } catch (err) {
        importError = err instanceof Error ? err.message : 'Не удалось прочитать файл.';
      }
    })();
  }
</script>

<svelte:head>
  <title>KPPDF Desktop</title>
</svelte:head>

<main class="shell">
  <header class="shell__header">
    <h1>KPPDF Desktop</h1>
    <p class="shell__subtitle">Десктоп-компаньон kppdf-8.0 — массовый ввод данных через AI</p>
  </header>

  <section class="cards">
    <article class="card">
      <h2>Подключение</h2>

      {#if connected}
        <p class="status">
          Подключено: <strong>{connected.username}</strong>
          <span class="status__url">{connected.apiBaseUrl}</span>
        </p>
        <button
          class="btn"
          type="button"
          onclick={disconnect}
          onmouseenter={() => showHint(HINTS.disconnect)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.disconnect)}
          onblur={clearHint}
        >
          Отключить
        </button>
      {:else}
        <p>Вставьте паринг-JSON из веб-клиента (кнопка «Подключить десктоп»).</p>
        <textarea
          class="pairing"
          bind:value={pairingJson}
          aria-label="Паринг JSON"
          placeholder={pairingPlaceholder}
          rows="5"
        ></textarea>

        {#if errors.length > 0}
          <ul class="errors" role="alert">
            {#each errors as err (err)}
              <li>{err}</li>
            {/each}
          </ul>
        {/if}

        <button
          class="btn btn--primary"
          type="button"
          onclick={connect}
          disabled={connecting}
          onmouseenter={() => showHint(HINTS.connect)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.connect)}
          onblur={clearHint}
        >
          {connecting ? 'Проверяем…' : 'Подключиться'}
        </button>
      {/if}
    </article>

    <article class="card">
      <h2>MCP — локальный доступ для AI</h2>

      {#if !connected}
        <p>MCP не запущен: сначала подключите аккаунт (карточка «Подключение» выше).</p>
      {:else}
        <div class="mcp-status">
          <span class="mcp-badge mcp-badge--{mcpState.status}" aria-live="polite">
            {MCP_STATUS_LABEL[mcpState.status]}
          </span>
        </div>

        {#if mcpError}
          <p class="errors" role="alert">{mcpError}</p>
        {/if}
        {#if mcpState.status === 'error' && mcpState.lastError}
          <p class="errors" role="alert">{mcpState.lastError}</p>
        {/if}

        <p class="mcp-url">
          <code>{mcpEndpoint(mcpState.port)}</code>
          <button
            class="btn btn--small"
            type="button"
            onclick={copyMcpUrl}
            onmouseenter={() => showHint(HINTS.copyMcp)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.copyMcp)}
            onblur={clearHint}
          >
            {mcpCopied ? 'Скопировано ✓' : 'Копировать'}
          </button>
        </p>

        <div class="mcp-json-actions">
          <button
            class="btn btn--small btn--primary"
            type="button"
            data-test="mcp-copy-json"
            onclick={() => copyMcpJson('full')}
            disabled={!canCopyMcpJson()}
            onmouseenter={() => showHint(HINTS.copyMcpJson)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.copyMcpJson)}
            onblur={clearHint}
          >
            {mcpJsonCopied ? 'Скопировано ✓' : 'Скопировать mcp.json'}
          </button>
          <button
            class="btn btn--small"
            type="button"
            data-test="mcp-copy-fragment"
            onclick={() => copyMcpJson('fragment')}
            disabled={!canCopyMcpJson()}
            onmouseenter={() => showHint(HINTS.copyMcpFragment)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.copyMcpFragment)}
            onblur={clearHint}
          >
            {mcpFragmentCopied ? 'Скопировано ✓' : 'Только фрагмент'}
          </button>
        </div>
        {#if !pairedApiKey}
          <p class="hint">Сначала подключите паринг — без токена mcp.json не собрать.</p>
        {:else}
          <p class="hint mcp-connect-hint">
            Один JSON подходит для Cursor и LM Studio. После нового паринга или смены порта —
            скопируйте снова и Reload MCP в клиенте. JWT живёт ~15 минут: при 401 обновите
            паринг и mcp.json. Несколько клиентов на один host — OK.
          </p>
        {/if}
        <p class="hint">
          При запуске порт подбирается сам, если занят. Обычно достаточно кнопки «Запустить MCP».
        </p>

        <div class="mcp-actions">
          {#if mcpState.status === 'running' || mcpState.status === 'starting'}
            <button
              class="btn"
              type="button"
              onclick={stopMcp}
              disabled={mcpState.status === 'starting'}
              onmouseenter={() => showHint(HINTS.stopMcp)}
              onmouseleave={clearHint}
              onfocus={() => showHint(HINTS.stopMcp)}
              onblur={clearHint}
            >
              Остановить
            </button>
          {/if}
          {#if mcpState.status === 'stopped' || mcpState.status === 'error'}
            <button
              class="btn btn--primary"
              type="button"
              onclick={startMcp}
              onmouseenter={() => showHint(HINTS.startMcp)}
              onmouseleave={clearHint}
              onfocus={() => showHint(HINTS.startMcp)}
              onblur={clearHint}
            >
              Запустить MCP
            </button>
          {/if}
          <button
            class="btn"
            type="button"
            onclick={restartMcp}
            disabled={mcpState.status === 'starting' || mcpState.status === 'stopping'}
            onmouseenter={() => showHint(HINTS.restartMcp)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.restartMcp)}
            onblur={clearHint}
          >
            Перезапустить
          </button>
        </div>

        <details class="mcp-advanced">
          <summary>Дополнительно (порт, LAN)</summary>
          <div class="mcp-controls">
            <label class="mcp-field">
              Предпочтительный порт
              <input
                class="mcp-port"
                type="number"
                min={MCP_PORT_MIN}
                max={MCP_PORT_MAX}
                bind:value={mcpPortInput}
                aria-label="Порт MCP host"
              />
              <button
                class="btn btn--small"
                type="button"
                onclick={applyMcpPort}
                disabled={mcpState.status === 'starting' || mcpState.status === 'stopping'}
                onmouseenter={() => showHint(HINTS.applyPort)}
                onmouseleave={clearHint}
                onfocus={() => showHint(HINTS.applyPort)}
                onblur={clearHint}
              >
                Применить
              </button>
            </label>
            <label
              class="mcp-lan"
              onmouseenter={() =>
                showHint(
                  'LAN: MCP будет доступен с других ПК в сети по IP. Включайте только в доверенной сети.',
                )}
              onmouseleave={clearHint}
            >
              <input type="checkbox" checked={mcpState.allowLan} onchange={toggleMcpLan} />
              Доступ по LAN (только доверенная сеть)
            </label>
            {#if mcpState.allowLan}
              <p class="hint mcp-warn">Слушает 0.0.0.0:{mcpState.port} — подключайтесь по IP этого ПК.</p>
            {/if}
          </div>
        </details>
      {/if}
    </article>

    <article class="card">
      <h2>Импорт</h2>
      <p>Файл → парсинг → таблица предпросмотра. Подтверждение и отправка — будущие TZ.</p>

      <button
        class="btn btn--primary"
        type="button"
        onclick={pickFile}
        disabled={importing}
        onmouseenter={() => showHint(HINTS.pickFile)}
        onmouseleave={clearHint}
        onfocus={() => showHint(HINTS.pickFile)}
        onblur={clearHint}
      >
        {importing ? 'Читаем…' : 'Выбрать файл'}
      </button>

      <div
        class="dropzone"
        role="region"
        aria-label="Зона перетаскивания файла"
        ondragover={(e) => e.preventDefault()}
        ondrop={onDrop}
      >
        или перетащите файл сюда
      </div>

      {#if importError}
        <p class="errors" role="alert">{importError}</p>
      {/if}

      {#if importRows.length > 0}
        <p class="import-status">
          Импортировано строк: <strong>{importRows.length}</strong>
        </p>
        {@render PreviewTable(importRows)}
      {/if}
    </article>

    <article class="card card--wide">
      <h2>Inbox — файлы для агента</h2>
      <p class="card__lead">
        Файл в папку → <strong>Разобрать</strong> → <strong>Создать задачу для ИИ</strong>
        (точка сборки, без proposals) или <strong>Предложить строки</strong> (expert, без сверки) →
        <strong>Подтвердить</strong> / <strong>Отменить</strong>.
      </p>

      <div class="inbox-dir">
        <code class="inbox-dir__path" title={inboxDir}>{inboxDir || '…'}</code>
        <button
          class="btn btn--small"
          type="button"
          onclick={pickInboxDir}
          onmouseenter={() => showHint(HINTS.pickInbox)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.pickInbox)}
          onblur={clearHint}
        >
          Выбрать папку…
        </button>
        <button
          class="btn btn--small"
          type="button"
          onclick={resetInboxDir}
          onmouseenter={() => showHint(HINTS.resetInbox)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.resetInbox)}
          onblur={clearHint}
        >
          По умолчанию
        </button>
        <button
          class="btn btn--small"
          type="button"
          onclick={() => refreshInbox()}
          onmouseenter={() => showHint(HINTS.scanInbox)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.scanInbox)}
          onblur={clearHint}
        >
          Сканировать
        </button>
      </div>

      {#if inboxError}
        <p class="errors" role="alert">{inboxError}</p>
      {/if}

      {#if inboxFiles.length === 0}
        <p class="hint">В папке inbox пока нет файлов (или все обработаны).</p>
      {:else}
        <ul class="inbox-list">
          {#each inboxFiles as file (file.name)}
            <li class="inbox-item">
              <div class="inbox-item__head">
                <span class="inbox-badge inbox-badge--{file.status}">
                  {INBOX_STATUS_LABEL[file.status]}
                </span>
                <strong class="inbox-item__name" title={file.name}>{file.name}</strong>
                <span class="inbox-item__meta">
                  {file.size > 0 ? `${(file.size / 1024).toFixed(1)} КБ` : '—'}
                  {file.modifiedAt ? `· ${new Date(file.modifiedAt).toLocaleString('ru-RU')}` : ''}
                </span>
              </div>

              {#if file.note}
                <p class="inbox-item__note" role="status">{file.note}</p>
              {/if}

              {#if file.audit && file.audit.rows.length > 0}
                <p class="inbox-item__rows">
                  Строк: <strong>{file.audit.rows.length}</strong>
                  {#if file.audit.skippedRows > 0}· без наименования: {file.audit.skippedRows}{/if}
                </p>
                {@render PreviewTable(file.audit.rows)}
              {/if}

              <div class="inbox-item__actions">
                {#if file.status === 'new' || file.status === 'audited'}
                  <button
                    class="btn btn--small"
                    type="button"
                    onclick={() => auditFile(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.audit)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.audit)}
                    onblur={clearHint}
                  >
                    Разобрать
                  </button>
                {/if}
                {#if file.status === 'audited'}
                  <button
                    class="btn btn--small btn--primary"
                    type="button"
                    onclick={() => createAiTask(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.createAiTask)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.createAiTask)}
                    onblur={clearHint}
                  >
                    Создать задачу для ИИ
                  </button>
                  <button
                    class="btn btn--small"
                    type="button"
                    onclick={() => proposeFile(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.propose)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.propose)}
                    onblur={clearHint}
                  >
                    Предложить строки
                  </button>
                {/if}
                {#if file.status === 'proposed'}
                  <button
                    class="btn btn--small btn--primary"
                    type="button"
                    onclick={() => confirmFile(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.confirm)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.confirm)}
                    onblur={clearHint}
                  >
                    Подтвердить ({file.proposalIds.length})
                  </button>
                  <button
                    class="btn btn--small"
                    type="button"
                    onclick={() => cancelFile(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.cancel)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.cancel)}
                    onblur={clearHint}
                  >
                    Отменить
                  </button>
                {/if}
                {#if file.status === 'new' || file.status === 'audited' || file.status === 'failed'}
                  <button
                    class="btn btn--small btn--danger"
                    type="button"
                    onclick={() => discardFile(file)}
                    disabled={inboxBusy}
                    onmouseenter={() => showHint(HINTS.discard)}
                    onmouseleave={clearHint}
                    onfocus={() => showHint(HINTS.discard)}
                    onblur={clearHint}
                  >
                    Убрать в «отклонённые»
                  </button>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}

      {#if inboxLog}
        <details class="inbox-log">
          <summary>Журнал inbox (последние строки)</summary>
          <pre>{inboxLog}</pre>
        </details>
      {/if}
    </article>
  </section>

  <div class="shell__hint" role="status" aria-live="polite">{uiHint}</div>

  <footer class="shell__footer">
    <p>v0.5 — паринг, импорт, MCP host (TZD-14) и inbox для агента (TZD-15): файл → аудит → предложение → подтверждение через журнал изменений.</p>
  </footer>
</main>

<!-- Таблица предпросмотра: первые строки + внутренний скролл (окно не «ломается»). -->
{#snippet PreviewTable(rows: RawRow[])}
  {@const preview = rows.slice(0, 8)}
  {@const columns = preview.length > 0 ? Object.keys(preview[0]) : []}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          {#each columns as col (col)}
            <th>{col}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each preview as row, i (i)}
          <tr>
            {#each columns as col (col)}
              <td>{String(row[col] ?? '')}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if rows.length > 8}
    <p class="import-more">…и ещё {rows.length - 8} строк (всего {rows.length})</p>
  {/if}
{/snippet}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      sans-serif;
    background: #f4f5f7;
    color: #1c2733;
  }

  .shell {
    min-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem 0.75rem;
    overflow: hidden;
  }

  .shell__header {
    border-bottom: 1px solid #d9dee3;
    padding-bottom: 0.65rem;
    margin-bottom: 0.85rem;
    flex-shrink: 0;
  }

  h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.01em;
  }

  .shell__subtitle {
    margin: 0.2rem 0 0;
    color: #5a6a78;
    font-size: 0.85rem;
  }

  .cards {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: minmax(220px, auto) 1fr;
    gap: 0.85rem;
    align-items: stretch;
    overflow: hidden;
  }

  .card {
    background: #ffffff;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 0.9rem 1rem;
    box-shadow: 0 1px 2px rgb(16 24 40 / 0.04);
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: auto;
  }

  .card h2 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
  }

  .card p,
  .card__lead {
    margin: 0 0 0.65rem;
    color: #44535f;
    font-size: 0.82rem;
    line-height: 1.4;
  }

  .mcp-controls {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    margin-bottom: 0.35rem;
  }

  .mcp-advanced {
    margin-top: 0.75rem;
    font-size: 0.82rem;
    color: #44535f;
  }

  .mcp-advanced summary {
    cursor: pointer;
    user-select: none;
  }

  .mcp-advanced[open] summary {
    margin-bottom: 0.5rem;
  }

  .mcp-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: 0.5rem;
  }

  .errors {
    margin: 0 0 0.65rem;
    padding: 0.5rem 0.7rem;
    list-style: none;
    border-radius: 8px;
    background: #fdf0ef;
    border: 1px solid #f2c8c4;
    color: #a12b23;
    font-size: 0.78rem;
    max-height: 4.5rem;
    overflow: auto;
  }

  .pairing {
    width: 100%;
    font: inherit;
    font-size: 0.85rem;
    padding: 0.6rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
    background: #fbfcfd;
    color: #1c2733;
    resize: vertical;
    margin-bottom: 0.75rem;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  }

  .errors li + li {
    margin-top: 0.25rem;
  }

  .status {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .status__url {
    color: #5a6a78;
    font-size: 0.8rem;
  }

  .mcp-status {
    margin: 0 0 0.75rem;
  }

  .mcp-badge {
    display: inline-block;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .mcp-badge--stopped {
    background: #eef1f4;
    color: #5a6a78;
  }

  .mcp-badge--starting,
  .mcp-badge--stopping {
    background: #fdf3dd;
    color: #8a6d1a;
  }

  .mcp-badge--running {
    background: #e6f4ea;
    color: #1e7d43;
  }

  .mcp-badge--error {
    background: #fdf0ef;
    color: #a12b23;
  }

  .mcp-url {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .mcp-url code {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 0.9rem;
    background: #fbfcfd;
    border: 1px solid #d9dee3;
    border-radius: 6px;
    padding: 0.2rem 0.45rem;
  }

  .mcp-json-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 0.35rem 0 0.5rem;
  }

  .mcp-connect-hint {
    margin: 0 0 0.5rem;
  }

  .hint {
    color: #7a8794;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .mcp-warn {
    color: #8a6d1a;
  }

  .mcp-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.75rem 0;
    color: #44535f;
    font-size: 0.9rem;
  }

  .mcp-port {
    width: 6rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
    font: inherit;
  }

  .mcp-lan {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.35rem 0;
    font-size: 0.82rem;
    color: #44535f;
    cursor: pointer;
  }

  .btn--small {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
  }

  .btn--danger {
    border-color: #e8c4bf;
    background: #fdf0ef;
    color: #a12b23;
  }

  .btn--danger:hover:not(:disabled) {
    background: #f6dcd8;
    border-color: #d9a39d;
  }

  .card--wide {
    grid-column: 1 / -1;
    min-height: 0;
  }

  .inbox-dir {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .inbox-dir__path {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 0.78rem;
    background: #fbfcfd;
    border: 1px solid #d9dee3;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .inbox-list {
    list-style: none;
    margin: 0 0 0.75rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .inbox-item {
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 0.9rem 1rem;
    background: #fbfcfd;
  }

  .inbox-item__head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .inbox-item__name {
    font-size: 0.9rem;
    word-break: break-all;
  }

  .inbox-item__meta {
    color: #7a8794;
    font-size: 0.75rem;
    margin-left: auto;
  }

  .inbox-item__note {
    margin: 0.5rem 0 0 !important;
    font-size: 0.8rem;
    color: #8a6d1a;
  }

  .inbox-item__rows {
    margin: 0.5rem 0 0 !important;
    font-size: 0.85rem;
  }

  .inbox-item__actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.6rem;
  }

  .inbox-badge {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .inbox-badge--new {
    background: #eef1f4;
    color: #5a6a78;
  }

  .inbox-badge--audited {
    background: #e8f0fb;
    color: #2b5d8f;
  }

  .inbox-badge--proposed {
    background: #fdf3dd;
    color: #8a6d1a;
  }

  .inbox-badge--applied {
    background: #e6f4ea;
    color: #1e7d43;
  }

  .inbox-badge--failed {
    background: #fdf0ef;
    color: #a12b23;
  }

  .inbox-log {
    margin-top: 0.75rem;
    font-size: 0.8rem;
  }

  .inbox-log summary {
    cursor: pointer;
    color: #44535f;
  }

  .inbox-log pre {
    margin: 0.5rem 0 0;
    padding: 0.6rem 0.8rem;
    background: #1c2733;
    color: #d7e0e8;
    border-radius: 8px;
    font-size: 0.75rem;
    line-height: 1.5;
    overflow-x: auto;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  }

  .dropzone {
    margin: 0.75rem 0;
    padding: 0.9rem;
    border: 1px dashed #b7c0c8;
    border-radius: 8px;
    text-align: center;
    color: #7a8794;
    font-size: 0.85rem;
  }

  .import-status {
    font-size: 0.9rem;
  }

  .import-more {
    margin-top: 0.5rem !important;
    font-size: 0.8rem;
    color: #7a8794;
  }

  .table-wrap {
    overflow: auto;
    max-height: 11rem;
    border: 1px solid #d9dee3;
    border-radius: 8px;
    flex-shrink: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  th,
  td {
    text-align: left;
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid #e4e8ec;
    white-space: nowrap;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    background: #eef1f4;
    color: #44535f;
    font-weight: 600;
    position: sticky;
    top: 0;
  }

  .btn {
    font: inherit;
    padding: 0.5rem 1rem;
    border: 1px solid #b7c0c8;
    border-radius: 8px;
    background: #eef1f4;
    color: #44535f;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }

  .btn:hover:not(:disabled) {
    background: #e2e7ec;
    border-color: #9aa6b1;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn--primary {
    background: #1c2733;
    color: #f4f5f7;
    border-color: #1c2733;
  }

  .btn--primary:hover:not(:disabled) {
    background: #2c3a49;
  }

  .shell__hint {
    flex-shrink: 0;
    margin-top: 0.35rem;
    min-height: 2.4rem;
    padding: 0.45rem 0.65rem;
    border-radius: 8px;
    background: #eef2f5;
    border: 1px solid #dde3e8;
    color: #334155;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .shell__footer {
    flex-shrink: 0;
    margin-top: 0.4rem;
    padding-top: 0.45rem;
    border-top: 1px solid #e4e8ec;
    color: #7a8794;
    font-size: 0.72rem;
  }

  @media (max-width: 1100px) {
    .cards {
      grid-template-columns: 1fr;
      grid-template-rows: none;
      overflow: auto;
    }

    .shell {
      height: auto;
      min-height: 100vh;
      overflow: auto;
    }
  }
</style>
