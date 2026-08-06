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

  const MCP_STATUS_LABEL: Record<McpHostStatus, string> = {
    stopped: 'Остановлен',
    starting: 'Запускается…',
    running: 'Запущен',
    stopping: 'Останавливается…',
    error: 'Ошибка',
  };

  /** Старт MCP host с текущими настройками конфига (порт из поля ввода). */
  async function startMcp() {
    const cfg = await loadConfig();
    if (!cfg.apiKey || !cfg.apiBaseUrl) {
      mcpError = 'MCP недоступен: сначала подключите аккаунт.';
      return;
    }
    const port = Number(mcpPortInput);
    const portError = validateMcpPort(port);
    if (portError) {
      mcpError = portError;
      return;
    }
    mcpError = '';
    await saveConfig({ ...cfg, mcp: { ...cfg.mcp, port } });
    mcp.setPrefs(port, cfg.mcp.allowLan);
    const inboxDir = await resolveInboxDir(cfg);
    await mcp.start({
      apiBaseUrl: cfg.apiBaseUrl,
      apiKey: cfg.apiKey,
      port,
      allowLan: cfg.mcp.allowLan,
      inboxDir,
    });
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

  /** Propose: строки → proposals (не в SoT). Требует живого подключения. */
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
    // Остановка MCP при закрытии окна/выходе из приложения.
    // (Плагин shell дополнительно убивает дочерние процессы на RunEvent::Exit —
    // это страховка на случай сбоя.)
    await getCurrentWindow().onCloseRequested(() => {
      disposed = true;
      stopInboxWatcher();
      mcp.dispose();
    });

    // Восстанавливаем сохранённое подключение (живой ли токен — покажет первый запрос).
    const cfg = await loadConfig();
    if (cfg.apiKey && cfg.username) {
      connected = { username: cfg.username, apiBaseUrl: cfg.apiBaseUrl };
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
        errors = ['Не удалось подключиться — проверьте URL, сеть и сервер.'];
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
        <button class="btn" type="button" onclick={disconnect}>Отключить</button>
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

        <button class="btn btn--primary" type="button" onclick={connect} disabled={connecting}>
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
          <button class="btn btn--small" type="button" onclick={copyMcpUrl}>
            {mcpCopied ? 'Скопировано ✓' : 'Копировать'}
          </button>
        </p>
        <p class="hint">
          Любой MCP-клиент подключается по этому адресу с заголовком
          <code>Authorization: Bearer &lt;apiKey из паринга&gt;</code>. Токен тот же, что у десктопа;
          права — те же, что у пользователя в вебе.
        </p>

        <label class="mcp-field">
          Порт
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
          >
            Применить порт
          </button>
        </label>

        <label class="mcp-lan">
          <input type="checkbox" checked={mcpState.allowLan} onchange={toggleMcpLan} />
          Разрешить доступ по локальной сети (LAN)
        </label>
        {#if mcpState.allowLan}
          <p class="hint mcp-warn">
            MCP слушает 0.0.0.0:{mcpState.port} — с других машин подключайтесь по IP этого
            компьютера. Включайте только в доверенной сети.
          </p>
        {/if}

        <div class="mcp-actions">
          {#if mcpState.status === 'running' || mcpState.status === 'starting'}
            <button
              class="btn"
              type="button"
              onclick={stopMcp}
              disabled={mcpState.status === 'starting'}
            >
              Остановить
            </button>
          {/if}
          {#if mcpState.status === 'stopped' || mcpState.status === 'error'}
            <button class="btn btn--primary" type="button" onclick={startMcp}>
              Запустить MCP
            </button>
          {/if}
          <button
            class="btn"
            type="button"
            onclick={restartMcp}
            disabled={mcpState.status === 'starting' || mcpState.status === 'stopping'}
          >
            Перезапустить
          </button>
        </div>
      {/if}
    </article>

    <article class="card">
      <h2>Импорт</h2>
      <p>Файл → парсинг → таблица предпросмотра. Подтверждение и отправка — будущие TZ.</p>

      <button class="btn btn--primary" type="button" onclick={pickFile} disabled={importing}>
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
      <p>
        Положите файл (<code>xlsx / csv / tsv / txt</code>) в каталог inbox — десктоп
        обнаружит его, разберёт и предложит строки как материалы (без записи в базу).
        Подтверждение — только после вашего согласия, через журнал изменений.
      </p>

      <div class="inbox-dir">
        <code class="inbox-dir__path" title={inboxDir}>{inboxDir || '…'}</code>
        <button class="btn btn--small" type="button" onclick={pickInboxDir}>Выбрать папку…</button>
        <button class="btn btn--small" type="button" onclick={resetInboxDir}>По умолчанию</button>
        <button class="btn btn--small" type="button" onclick={() => refreshInbox()}>Сканировать</button>
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
                  >
                    Разобрать
                  </button>
                {/if}
                {#if file.status === 'audited'}
                  <button
                    class="btn btn--small btn--primary"
                    type="button"
                    onclick={() => proposeFile(file)}
                    disabled={inboxBusy}
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
                  >
                    Подтвердить ({file.proposalIds.length})
                  </button>
                  <button
                    class="btn btn--small"
                    type="button"
                    onclick={() => cancelFile(file)}
                    disabled={inboxBusy}
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
                  >
                    Убрать в failed
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

  <footer class="shell__footer">
    <p>v0.5 — паринг, импорт, MCP host (TZD-14) и inbox для агента (TZD-15): файл → аудит → предложение → подтверждение через журнал изменений.</p>
  </footer>
</main>

<!-- Таблица предпросмотра: первые 10 строк + счётчик. -->
{#snippet PreviewTable(rows: RawRow[])}
  {@const preview = rows.slice(0, 10)}
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
  {#if rows.length > 10}
    <p class="import-more">…и ещё {rows.length - 10} строк (всего {rows.length})</p>
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
    display: flex;
    flex-direction: column;
    padding: 2rem 2.5rem;
  }

  .shell__header {
    border-bottom: 1px solid #d9dee3;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    letter-spacing: -0.01em;
  }

  .shell__subtitle {
    margin: 0.35rem 0 0;
    color: #5a6a78;
    font-size: 0.95rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 1.25rem;
  }

  .card {
    background: #ffffff;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 2px rgb(16 24 40 / 0.04);
  }

  .card h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  .card p {
    margin: 0 0 1rem;
    color: #44535f;
    font-size: 0.9rem;
    line-height: 1.45;
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

  .errors {
    margin: 0 0 0.75rem;
    padding: 0.6rem 0.9rem;
    list-style: none;
    border-radius: 8px;
    background: #fdf0ef;
    border: 1px solid #f2c8c4;
    color: #a12b23;
    font-size: 0.85rem;
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

  .hint {
    color: #7a8794;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .hint code {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 0.78rem;
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
    margin: 0.75rem 0;
    font-size: 0.9rem;
    color: #44535f;
    cursor: pointer;
  }

  .mcp-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
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
    overflow-x: auto;
    border: 1px solid #d9dee3;
    border-radius: 8px;
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

  .shell__footer {
    margin-top: auto;
    padding-top: 1.5rem;
    color: #7a8794;
    font-size: 0.8rem;
  }
</style>
