<script lang="ts">
  // v0.2 — «Подключение» (паринг + /auth/me). v0.3 — «Импорт» (excel/csv → таблица).
  import { onMount, tick } from 'svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { getVersion } from '@tauri-apps/api/app';
  import { open } from '@tauri-apps/plugin-dialog';
  import { open as openExternal } from '@tauri-apps/plugin-shell';
  import { exists, mkdir, readFile } from '@tauri-apps/plugin-fs';
  import { apiGet, apiPost, ApiError, type ApiClientOptions, type HttpBasicAuth } from './core/api';
  import { loadConfig, saveConfig, type AppConfig } from './core/config';
  import {
    decideCompat,
    resolveDownloadUrl,
    type CompatDecision,
    type DesktopCompatInfo,
  } from './core/version-compat';
  import { parsePairing } from './core/pairing';
  import { importerFor, type RawRow } from './importers';
  import { parseExcelWorkbook, type ExcelSheetPreview } from './importers/excel';
  import {
    canConfirmMapping,
    classifyHeaders,
    updateMapping,
    type MappingResult,
    type ValidatedImportRow,
  } from './core/import-mapping';
  import {
    IMPORT_TARGETS,
    IMPORT_TARGET_ORDER,
    isImportTargetKey,
    isReferenceTargetKey,
    type ImportTargetKey,
  } from './core/import-targets';
  import {
    analyzeTables,
    applyTableMapping,
    referenceDedupeKeysOf,
    reshapeForTable,
    validateTableRows,
  } from './core/multi-import';
  import {
    FORM_CATEGORIES,
    formFileName,
    formTemplateFor,
    formTemplatesByCategory,
    identityMappingForForm,
    serializeFormWorkbook,
    type FormCategoryKey,
    type FormFingerprint,
  } from './core/excel-form-template';
  import type { RowValidationStatus } from './core/import-mapping';
  import {
    buildSpecificationPreview,
    specificationBlockingIssues,
    type SpecificationKind,
    type SpecificationPreview,
    type SpecificationTreeNode,
  } from './core/specification-import';
  import {
    createImportMappingProfile,
    deleteImportMappingProfile,
    listImportMappingProfiles,
    suggestMappingThroughMcp,
    updateImportMappingProfile,
    type ImportMappingProfile,
  } from './core/import-mapping-profiles';
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
  import {
    AiRunnerController,
    defaultModelDir,
    formatDownload,
    aiEndpoint,
    type AiRunnerState,
    type AiRunnerStatus,
  } from './core/aiRunner';
  import { LOCAL_MODELS, recommendModel, modelById, formatBytes, formatRamGb } from './core/model-catalog';
  import { scanGgufModelsInDir, type ScannedGgufModel, type RejectedGgufFile } from './core/gguf-scan';
  import { chatCompletion, buildDesktopChatSystemPrompt } from './core/ai';
  import { buildMappingPrompt, parseMappingJson } from './core/ai/suggest-mapping';
  import ChatPanel from './ChatPanel.svelte';

  // Placeholder вынесен в JS: фигурные скобки в атрибуте Svelte парсит как выражение.
  const pairingPlaceholder =
    '{"apiBaseUrl":"https://app.kppdf.ru","apiKey":"...","username":"...","expiresAt":"..."}';

  let pairingJson = $state('');
  let basicUser = $state('');
  let basicPass = $state('');
  let errors = $state<string[]>([]);
  let connecting = $state(false);
  let connected = $state<{ username: string; apiBaseUrl: string } | null>(null);
  type DesktopTab = 'connection' | 'import' | 'ai';
  let activeTab = $state<DesktopTab>('import');

  // MCP host (TZD-14): автозапуск при подключённом аккаунте, статус + настройки.
  let mcp: McpHostController;
  let mcpState = $state<McpHostState>({
    status: 'stopped',
    port: DEFAULT_MCP_PORT,
    allowLan: false,
  });

  // Встроенный AI-раннер (Фаза 2): локальная модель для умного подбора колонок.
  let aiRunner: AiRunnerController;
  let aiState = $state<AiRunnerState>({
    status: 'stopped',
    modelLoaded: false,
    download: { active: false, fileName: '', received: 0, total: 0 },
  });
  let selectedModelId = $state('');
  let aiBusy = $state(false);
  let aiMessage = $state('');
  let aiModelDir = $state('');
  /** TZD-63: любые `.gguf`, найденные в папке моделей (не только каталог скачивания). */
  let diskModels = $state<ScannedGgufModel[]>([]);
  let diskModelsRejected = $state<RejectedGgufFile[]>([]);
  /** Пусто — использовать файл из каталога (`selectedModelId`) ниже. */
  let selectedDiskFileName = $state('');
  /** TZD-62: чат жив, только когда раннер работает и модель в памяти. */
  let chatReady = $derived(aiState.status === 'running' && aiState.modelLoaded && !!aiState.port);
  let chatDisabledReason = $derived.by(() => {
    if (aiState.status === 'starting') return 'Раннер запускается — подождите…';
    if (aiState.status === 'stopping') return 'Раннер останавливается — подождите…';
    if (aiState.status !== 'running') return 'Раннер не запущен. Нажмите «Открыть чат».';
    if (!aiState.modelLoaded) return 'Модель ещё не загружена в память.';
    return '';
  });
  const desktopChatSystemPrompt = buildDesktopChatSystemPrompt();
  const AI_STATUS_LABEL: Record<AiRunnerStatus, string> = {
    stopped: 'остановлен',
    starting: 'запускается…',
    running: 'работает',
    stopping: 'останавливается…',
    error: 'ошибка',
  };
  /** Semver из tauri.conf / Cargo — не хардкод «v0.5». */
  let appVersion = $state('…');
  /** TZD-40: решение совместимости версий после /api/desktop/compat. */
  let compat = $state<{ decision: CompatDecision; info: DesktopCompatInfo } | null>(null);
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
    connect:
      'Проверит ключ на сервере и сохранит подключение. Если сайт спрашивает «подъезд» до входа — заполните поля ниже. После этого MCP стартует сам.',
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
    openInbox: 'Откроет папку Inbox в проводнике — туда можно скопировать файлы, и они появятся в списке.',
    pickInbox: 'Выберет другую папку Inbox вместо каталога по умолчанию.',
    resetInbox: 'Вернёт папку Inbox к стандартной в данных приложения.',
    scanInbox: 'Перечитает файлы папки сейчас (обычно не нужно — папка отслеживается автоматически).',
    audit: 'Только прочитает файл и покажет таблицу. В базу ничего не пишет.',
    propose:
      'Без сверки с базой — только черновики (proposals). В справочник материалов ещё НЕ попадёт — нужен «Подтвердить».',
    createAiTask:
      'Создаст задачу импорта для ИИ (Import Task). Proposals и справочник не трогает — сверка/план позже (TZD-23).',
    confirm: 'Запишет предложенные черновики в справочник материалов на сервере. Это уже реальное создание.',
    cancel: 'Снимет черновики без записи в базу. Файл уйдёт в «отклонённые».',
    discard: 'Переместит файл в папку «отклонённые» без записи на сервер.',
    pickFile: 'Откроет диалог выбора файла для локального предпросмотра (не Inbox).',
    downloadForm:
      'Скачает готовый .xlsx с каноническими русскими заголовками. Заполните лист «Данные» и загрузите файл в студии импорта — форма распознается сама. Аккаунт для скачивания не нужен.',
    startAi:
      'Запустит встроенный движок llama.cpp. Если модель уже скачана — она загрузится в память.',
    stopAi: 'Остановит встроенный AI-раннер. Скачанная модель останется на диске.',
    downloadModel: 'Скачает выбранную модель (~2 ГБ) в папку приложения один раз. Нужен запущенный раннер.',
    openModelFolder:
      'Откроет папку с моделями. Сюда кладётся файл .gguf (~2 ГБ): можно скачать кнопкой или положить вручную с тем же именем, что в списке.',
    openChat:
      'Если файл выбранной модели уже на диске — запустит раннер (если нужно) и откроет чат. Если файла нет — подскажет скачать или открыть папку моделей.',
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
      basicAuth: cfg.basicAuth,
      hostDir: cfg.mcp.hostDir,
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

  // Встроенный AI-раннер (Фаза 2): функции управления моделью.
  async function startAi() {
    if (aiBusy) return;
    aiBusy = true;
    try {
      const cfg = await loadConfig();
      aiModelDir = await defaultModelDir();
      // TZD-63: файл с диска (любое имя) побеждает каталог скачивания, если выбран.
      const fileName = selectedDiskFileName || modelById(selectedModelId)?.fileName;
      aiMessage = '';
      await aiRunner.start({ modelDir: aiModelDir, modelFile: fileName });
      const st = aiRunner.getState();
      if (st.status === 'running') {
        await saveConfig({ ...cfg, modelId: selectedModelId || undefined });
        await aiRunner.refreshHealth();
      }
    } finally {
      aiBusy = false;
    }
  }

  async function stopAi() {
    if (aiBusy) return;
    aiBusy = true;
    try {
      await aiRunner.stop();
    } finally {
      aiBusy = false;
    }
  }

  /**
   * TZD-63 ШАГ 3: «Скачать» работает даже на остановленном раннере — сам
   * поднимает его без модели, качает, затем перезапускает уже с этим файлом.
   * Без ручного «Перезапустить» третьим кликом.
   */
  async function downloadSelectedModel() {
    if (aiBusy) return;
    const model = modelById(selectedModelId);
    if (!model) {
      aiMessage = 'Выберите модель из списка.';
      return;
    }
    aiBusy = true;
    try {
      aiMessage = '';
      aiModelDir = aiModelDir || (await defaultModelDir());
      if (aiState.status !== 'running') {
        await aiRunner.start({ modelDir: aiModelDir });
        if (aiRunner.getState().status !== 'running') {
          aiMessage = aiState.lastError || 'Не удалось запустить AI-раннер для скачивания.';
          return;
        }
      }
      const ok = await aiRunner.downloadModel(model);
      if (!ok) {
        aiMessage = aiState.download.error ?? 'Не удалось скачать модель.';
        return;
      }
      await aiRunner.start({ modelDir: aiModelDir, modelFile: model.fileName });
      const cfg = await loadConfig();
      await saveConfig({ ...cfg, modelId: selectedModelId });
      await rescanModels();
      selectedDiskFileName = model.fileName;
      const loaded = await waitForModelLoaded(60_000);
      aiMessage = loaded
        ? `Модель ${model.name} скачана и загружена — можно писать в чат.`
        : aiState.modelError || 'Модель скачана, но не загрузилась за отведённое время — попробуйте ещё раз.';
    } finally {
      aiBusy = false;
    }
  }

  /** TZD-63 ШАГ 1–2: скан папки моделей на любые `.gguf` (не только каталог). */
  async function rescanModels() {
    aiModelDir = aiModelDir || (await defaultModelDir());
    try {
      const { models, rejected } = await scanGgufModelsInDir(aiModelDir);
      diskModels = models;
      diskModelsRejected = rejected;
      if (selectedDiskFileName && !models.some((m) => m.fileName === selectedDiskFileName)) {
        selectedDiskFileName = '';
      }
    } catch {
      diskModels = [];
      diskModelsRejected = [];
    }
  }

  /** Автоопределение ПК → рекомендация + восстановление выбранной модели из конфига. */
  async function loadAiSettings() {
    aiModelDir = await defaultModelDir();
    const cfg = await loadConfig();
    selectedModelId = cfg.modelId && modelById(cfg.modelId) ? cfg.modelId : '';
    try {
      const specs = await aiRunner.getSpecs();
      if (!selectedModelId) {
        selectedModelId = recommendModel(specs.totalMemoryGb).id;
      }
    } catch {
      // ПК определить не удалось — рекомендация остаётся прежней (Qwen 3B).
      selectedModelId = selectedModelId || LOCAL_MODELS[0].id;
    }
  }

  /** Ждёт `modelLoaded` через опрос `/health` (модель грузится в фоне после старта раннера). */
  async function waitForModelLoaded(timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await aiRunner.refreshHealth();
      const st = aiRunner.getState();
      if (st.modelLoaded) return true;
      if (st.modelError) return false;
      if (st.status !== 'running') return false;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    return false;
  }

  /** Фокусирует поле ввода чата (после того как он стал доступен). */
  async function focusChatInput() {
    await tick();
    document.querySelector<HTMLTextAreaElement>('[data-test="ai-chat-input"]')?.focus();
  }

  /**
   * TZD-63: какой файл использовать для чата/раннера — сначала выбранный файл
   * с диска (любое имя, из `rescanModels()`), иначе файл выбранной модели
   * каталога, если он реально лежит в папке моделей. `null`, если нечем стартовать.
   */
  async function resolveChatModelFile(): Promise<{ fileName: string } | null> {
    if (selectedDiskFileName && diskModels.some((m) => m.fileName === selectedDiskFileName)) {
      return { fileName: selectedDiskFileName };
    }
    const model = selectedModelId ? modelById(selectedModelId) : undefined;
    if (!model) return null;
    aiModelDir = aiModelDir || (await defaultModelDir());
    const { join: joinPath } = await import('@tauri-apps/api/path');
    const modelPath = await joinPath(aiModelDir, model.fileName);
    if (!(await exists(modelPath))) return null;
    return { fileName: model.fileName };
  }

  /**
   * TZD-62 ШАГ 3 / TZD-63 ШАГ 2: «Открыть чат» одним кликом — пересканирует
   * папку моделей, берёт выбранный файл с диска или файл выбранной модели
   * каталога, запускает (или перезапускает) раннер этим файлом, ждёт
   * `modelLoaded`, фокусирует чат. Если файла нет — не падает: RU-подсказка,
   * «Открыть папку моделей» и «Скачать модель» уже есть в карточке ниже.
   */
  async function openChat() {
    if (aiBusy) return;
    aiBusy = true;
    try {
      aiMessage = '';
      await rescanModels();
      const target = await resolveChatModelFile();
      if (!target) {
        aiMessage = 'Модели нет в папке — скачайте её кнопкой ниже или скопируйте .gguf с флешки в папку моделей.';
        return;
      }

      const alreadyReady =
        aiState.status === 'running' && aiState.modelLoaded && aiState.modelName === target.fileName;
      if (!alreadyReady) {
        const cfg = await loadConfig();
        await aiRunner.start({ modelDir: aiModelDir, modelFile: target.fileName });
        if (aiRunner.getState().status === 'running' && selectedModelId) {
          await saveConfig({ ...cfg, modelId: selectedModelId });
        }
      }
      if (aiRunner.getState().status !== 'running') {
        aiMessage = aiState.lastError || 'Не удалось запустить AI-раннер.';
        return;
      }
      const loaded = await waitForModelLoaded(60_000);
      if (!loaded) {
        aiMessage = aiState.modelError || 'Модель не загрузилась за отведённое время — попробуйте ещё раз.';
        return;
      }
      await focusChatInput();
    } finally {
      aiBusy = false;
    }
  }

  /** «Предложить сопоставление» через встроенную модель (если раннер жив и модель загружена). */
  async function suggestWithAi(
    headers: string[],
    rows: RawRow[],
  ): Promise<Record<ImportTargetKey, MappingResult>> {
    const port = aiState.port;
    if (!port) throw new Error('AI-раннер не готов: нет порта.');
    const out = {} as Record<ImportTargetKey, MappingResult>;
    for (const block of importBlocks) {
      const { system, user } = buildMappingPrompt(headers, block.targetKey);
      const res = await chatCompletion(
        { baseUrl: aiEndpoint(port), timeoutMs: 120_000 },
        {
          model: aiState.modelName ?? 'local',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.2,
        },
      );
      const text = res.choices?.[0]?.message?.content ?? '';
      const suggested = parseMappingJson(text, block.targetKey);
      out[block.targetKey] = applyTableMapping(headers, block.targetKey, suggested);
    }
    return out;
  }

  // Импорт
  let importRows = $state<RawRow[]>([]);
  let importError = $state('');
  let importing = $state(false);
  let importStage = $state<'mapping' | 'rows'>('mapping');
  let importFileName = $state('');
  let importSheets = $state<ExcelSheetPreview[]>([]);
  let activeSheetName = $state('');
  /** Один файл → несколько таблиц: блок сопоставления на каждую. */
  interface ImportBlock {
    targetKey: ImportTargetKey;
    mapping: MappingResult;
    validated: ValidatedImportRow[];
    proposalIds: string[];
  }
  let importBlocks = $state<ImportBlock[]>([]);
  /** Есть ли блоки, которые пишут в SoT сразу (не через журнал предложений). */
  let hasDirectWriteBlocks = $derived(
    importBlocks.some((block) => block.targetKey !== 'material'),
  );
  let mappingBusy = $state(false);
  let mappingMessage = $state('');
  let profileName = $state('');
  let profiles = $state<ImportMappingProfile[]>([]);
  let selectedProfileId = $state('');
  let specificationPreview = $state<SpecificationPreview | null>(null);
  let specificationBusy = $state(false);
  let specificationMessage = $state('');

  // Формы Excel (TZD-50): категория → таблица → скачать .xlsx с fingerprint «_kppdf».
  let formCategory = $state<FormCategoryKey | ''>('');
  let formTable = $state<ImportTargetKey | ''>('');
  let formBusy = $state(false);
  let formMessage = $state('');
  let availableFormTemplates = $derived(formCategory ? formTemplatesByCategory(formCategory) : []);
  let selectedFormTemplate = $derived(formTable ? formTemplateFor(formTable) : undefined);
  /** Отклонённые строки последней отправки — источник отчёта .csv. */
  let rejectionReport = $state<
    | Array<{ table: string; rowIndex: number; name: string; status: string; message: string }>
    | null
  >(null);

  /** Русские подписи статусов строки (TZD-50: UI без английских лейблов). */
  const ROW_STATUS_LABEL: Record<string, string> = {
    ok_new: 'Новая',
    ok_update: 'Обновление',
    duplicate: 'Дубликат',
    invalid: 'Ошибка',
    needs_review: 'Нужна проверка',
    skip: 'Пропуск',
  };

  function countStatus(block: ImportBlock, status: RowValidationStatus): number {
    return block.validated.filter((row) => row.status === status).length;
  }

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
  /** Функция отмены fs.watch (встроенное слежение за папкой). */
  let inboxUnwatch: (() => void) | null = null;
  /** Файл из папки агента, открытый сейчас в студии (для финализации после отправки). */
  let activeInboxFile = $state('');

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

  /**
   * Слежение за папкой в реальном времени: fs.watch (Tauri) с дебаунсом;
   * если watch недоступен (вне Tauri-рантайма) — fallback на опрос раз в 4 с.
   */
  async function startInboxWatcher() {
    stopInboxWatcher();
    if (!inboxDir) return;
    try {
      const { watch } = await import('@tauri-apps/plugin-fs');
      inboxUnwatch = await watch(
        inboxDir,
        () => {
          if (disposed) return;
          void refreshInbox();
        },
        { recursive: true, delayMs: 700 },
      );
    } catch {
      // fs.watch недоступен (например, запуск вне Tauri) — опрос.
      inboxUnwatch = null;
      inboxScanTimer = setInterval(() => {
        if (disposed) {
          stopInboxWatcher();
          return;
        }
        void refreshInbox();
      }, 4000);
    }
  }

  function stopInboxWatcher() {
    if (inboxUnwatch) {
      try {
        inboxUnwatch();
      } catch {
        // функция отмены могла уже не действовать
      }
      inboxUnwatch = null;
    }
    if (inboxScanTimer) {
      clearInterval(inboxScanTimer);
      inboxScanTimer = null;
    }
  }

  /** Открыть папку inbox в проводнике (путь из конфига или дефолт). */
  async function openInboxFolder() {
    const dir = inboxDir || (await resolveInboxDir(await loadConfig()));
    if (!dir) {
      inboxError = 'Папка inbox ещё не определена — сначала выберите папку.';
      return;
    }
    try {
      await openExternal(dir);
    } catch {
      inboxError = 'Не удалось открыть папку в проводнике — откройте её вручную по пути выше.';
    }
  }

  /** Открыть папку моделей в проводнике (app-data/models), создав её при отсутствии. */
  async function openModelFolder() {
    try {
      const dir = aiModelDir || (await defaultModelDir());
      aiModelDir = dir;
      await mkdir(dir, { recursive: true });
      await openExternal(dir);
    } catch {
      aiMessage = 'Не удалось открыть папку моделей — откройте её вручную из данных приложения.';
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
      await startInboxWatcher(); // слежение переключается на новую папку
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Не удалось выбрать каталог inbox.';
    }
  }

  /** Сбросить inbox на app-data/inbox по умолчанию. */
  async function resetInboxDir() {
    const cfg = await loadConfig();
    await saveConfig({ ...cfg, inbox: {} });
    await initInbox();
    await startInboxWatcher(); // слежение возвращается на папку по умолчанию
  }

  /**
   * Audit: распарсить файл агента и открыть его в основной студии — те же
   * блоки таблиц, профили и дропдауны, что при ручном импорте (HITL).
   * Запись в SoT не происходит до «Отправить на подтверждение».
   */
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
      if (!audit.error && audit.rows.length > 0) {
        // Открываем в студии: те же таблицы/профили, что при ручном импорте.
        activeInboxFile = file.name;
        importFileName = file.name;
        importSheets = [];
        activeSheetName = '';
        importRows = audit.rows;
        prepareMapping(audit.rows, audit.fingerprint ?? undefined);
        file.note = 'Открыт в студии ниже — сопоставьте колонки и отправьте.';
        inboxFiles = [...inboxFiles];
      }
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
        apiFrom(cfg),
        { fileName: file.name, rows, inboxPath: inboxDir },
      );
      file.note = `Задача ИИ: ${result.id} · ${result.summary ?? ''} · ${result.status} (0 proposals)`;
      inboxFiles = [...inboxFiles];
      await appendInboxLog(
        inboxDir,
        `${file.name} → import-task ${result.id} (${result.rowCount} rows, status=${result.status})`,
      );
      await refreshInbox();
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
        apiFrom(cfg),
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
        apiFrom(cfg),
        file.proposalIds,
      );
      // Провалившиеся confirm-запросы оставили proposals в статусе proposed —
      // не даём им висеть до TTL: отменяем (SoT не меняется).
      const pendingIds = res.failed.map((f) => f.id);
      if (pendingIds.length > 0) {
        void cancelProposals(apiFrom(cfg), pendingIds);
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
      await cancelProposals(apiFrom(cfg), file.proposalIds);
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

  async function loadMappingProfiles() {
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) {
      profiles = [];
      return;
    }
    try {
      profiles = await listImportMappingProfiles(apiFrom(cfg));
    } catch {
      profiles = [];
    }
  }

  /** Блоки из профиля «метода приложения»: таблицы, чьи колонки есть в файле. */
  function blocksFromProfile(profile: ImportMappingProfile): ImportBlock[] {
    const headers = Object.keys(importRows[0] ?? {});
    const tables = profile.tables?.length
      ? profile.tables
      : [{ targetEntity: profile.targetEntity, columnMap: profile.columnMap }];
    const skipped: string[] = [];
    const blocks: ImportBlock[] = [];
    for (const table of tables) {
      // Неизвестная сущность (legacy `bom` и т.п.) — пропускаем, студию не роняем.
      if (!isImportTargetKey(table.targetEntity)) {
        skipped.push(String(table.targetEntity));
        continue;
      }
      if (!headers.some((header) => table.columnMap[header] !== undefined && table.columnMap[header] !== null)) {
        continue;
      }
      blocks.push({
        targetKey: table.targetEntity,
        mapping: applyTableMapping(headers, table.targetEntity, table.columnMap),
        validated: [],
        proposalIds: [],
      });
    }
    if (skipped.length > 0) {
      mappingMessage = `Профиль содержит таблицы, которых больше нет в студии: ${skipped.join(', ')} — они пропущены.`;
    }
    return blocks;
  }

  function prepareMapping(rows: RawRow[], fingerprint?: FormFingerprint | null) {
    rejectionReport = null;
    specificationPreview = buildSpecificationPreview(rows);
    const headers = Object.keys(rows[0] ?? {});
    if (fingerprint?.targetKey) {
      // TZD-50 round-trip: скачанная форма — один блок на targetKey из паспорта,
      // identity-карта по русским заголовкам (суффикс « *» обязательности снимается).
      const targetKey = fingerprint.targetKey;
      importBlocks = [
        {
          targetKey,
          mapping: identityMappingForForm(headers, targetKey),
          validated: [],
          proposalIds: [],
        },
      ];
      importStage = 'mapping';
      specificationMessage = '';
      const generated =
        fingerprint.generatedAt && !Number.isNaN(Date.parse(fingerprint.generatedAt))
          ? new Date(fingerprint.generatedAt).toLocaleString('ru-RU')
          : '';
      mappingMessage =
        `Форма распознана: «${IMPORT_TARGETS[targetKey].label}»${generated ? ` (сгенерирована ${generated})` : ''}. ` +
        'Проверьте колонки и подтвердите сопоставление.';
      return;
    }
    importBlocks = analyzeTables(headers).map((suggestion) => ({
      targetKey: suggestion.targetKey,
      mapping: suggestion.mapping,
      validated: [],
      proposalIds: [],
    }));
    importStage = 'mapping';
    mappingMessage = '';
    specificationMessage = '';
    const defaultProfile = profiles.find((profile) => profile.isDefault);
    if (defaultProfile && importBlocks.length > 0) {
      const profileBlocks = blocksFromProfile(defaultProfile);
      if (profileBlocks.length > 0) importBlocks = profileBlocks;
      selectedProfileId = defaultProfile.id;
      mappingMessage = `Профиль «${defaultProfile.name}» применён автоматически — проверьте карту перед подтверждением.`;
    }
  }

  function selectImportSheet(sheetName: string) {
    const sheet = importSheets.find((item) => item.name === sheetName);
    if (!sheet) return;
    activeSheetName = sheet.name;
    importRows = sheet.rows;
    prepareMapping(sheet.rows);
  }

  function changeMapping(blockIndex: number, header: string, event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    const block = importBlocks[blockIndex];
    if (!block) return;
    const mapping = updateMapping(block.mapping, header, value === '__ignore__' ? null : value);
    importBlocks = importBlocks.map((item, index) =>
      index === blockIndex ? { ...item, mapping } : item,
    );
  }

  function addImportTable(targetKey: ImportTargetKey) {
    if (importBlocks.some((block) => block.targetKey === targetKey)) return;
    const headers = Object.keys(importRows[0] ?? {});
    importBlocks = [
      ...importBlocks,
      {
        targetKey,
        mapping: classifyHeaders(headers, IMPORT_TARGETS[targetKey].columns),
        validated: [],
        proposalIds: [],
      },
    ];
  }

  function removeImportTable(index: number) {
    importBlocks = importBlocks.filter((_, item) => item !== index);
  }

  async function confirmMapping() {
    if (importBlocks.length === 0) {
      mappingMessage = 'Не найдено таблиц для импорта — добавьте таблицу вручную или выберите профиль.';
      return;
    }
    for (const block of importBlocks) {
      if (!canConfirmMapping(block.mapping)) {
        mappingMessage = `Сначала исправьте красные колонки в блоке «${IMPORT_TARGETS[block.targetKey].label}» или выберите «Игнорировать». Отправка закрыта.`;
        return;
      }
    }
    mappingBusy = true;
    try {
      // TZD-50: перед проверкой строк тянем ключи каталога для дедупликации.
      const hints: string[] = [];
      const existingByTarget: Partial<Record<ImportTargetKey, ReadonlySet<string>>> = {};
      const cfg = await loadConfig();
      if (cfg.apiBaseUrl && cfg.apiKey) {
        const targets = [...new Set(importBlocks.map((block) => block.targetKey))];
        for (const targetKey of targets) {
          const fetched = await fetchDedupeKeys(apiFrom(cfg), targetKey);
          existingByTarget[targetKey] = fetched.keys;
          if (fetched.truncated) {
            hints.push(
              `каталог «${IMPORT_TARGETS[targetKey].label}» больше 1000 записей — часть дублей станет видна только при записи`,
            );
          }
        }
      }
      importBlocks = importBlocks.map((block) => ({
        ...block,
        validated: validateTableRows(
          reshapeForTable(importRows, block.mapping),
          block.targetKey,
          existingByTarget[block.targetKey] ?? EMPTY_DEDUPE,
        ),
      }));
      importStage = 'rows';
      mappingMessage =
        ['Сопоставление подтверждено. Проверьте статусы строк в каждом блоке перед отправкой.', ...hints].join(' ') ||
        'Сопоставление подтверждено.';
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось проверить строки.';
    } finally {
      mappingBusy = false;
    }
  }

  async function saveMappingProfile() {
    const name = profileName.trim();
    if (!name || importBlocks.length === 0) {
      mappingMessage = 'Введите название профиля после сопоставления колонок.';
      return;
    }
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) {
      mappingMessage = 'Сохранение профиля требует подключённого аккаунта.';
      return;
    }
    mappingBusy = true;
    try {
      const created = await createImportMappingProfile(
        apiFrom(cfg),
        {
          name,
          tables: importBlocks.map((block) => ({
            targetEntity: block.targetKey,
            columnMap: block.mapping.mapping,
          })),
          isDefault: false,
        },
      );
      profiles = [created, ...profiles.filter((profile) => profile.id !== created.id)];
      selectedProfileId = created.id;
      profileName = '';
      mappingMessage = `Профиль «${created.name}» сохранён.`;
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось сохранить профиль.';
    } finally {
      mappingBusy = false;
    }
  }

  async function setDefaultMappingProfile(profile: ImportMappingProfile) {
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) return;
    mappingBusy = true;
    try {
      const updated = await updateImportMappingProfile(
        apiFrom(cfg),
        profile.id,
        { isDefault: true },
      );
      profiles = profiles.map((item) => ({ ...item, isDefault: item.id === updated.id }));
      mappingMessage = `Профиль «${updated.name}» выбран по умолчанию.`;
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось выбрать профиль по умолчанию.';
    } finally {
      mappingBusy = false;
    }
  }

  async function removeMappingProfile(profile: ImportMappingProfile) {
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) return;
    mappingBusy = true;
    try {
      await deleteImportMappingProfile(apiFrom(cfg), profile.id);
      profiles = profiles.filter((item) => item.id !== profile.id);
      if (selectedProfileId === profile.id) selectedProfileId = '';
      mappingMessage = `Профиль «${profile.name}» удалён.`;
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось удалить профиль.';
    } finally {
      mappingBusy = false;
    }
  }

  function applySavedProfile(profile: ImportMappingProfile) {
    selectedProfileId = profile.id;
    const blocks = blocksFromProfile(profile);
    if (blocks.length === 0) {
      mappingMessage = `Профиль «${profile.name}» не подходит к колонкам этого файла — сопоставьте вручную.`;
      return;
    }
    importBlocks = blocks;
    mappingMessage = `Профиль «${profile.name}» применён — подтвердите сопоставление вручную.`;
  }

  /**
   * «Предложить сопоставление»: перезапускает классификатор колонок.
   * Работает и без MCP — классификация локальная и детерминированная.
   * Если MCP-хост запущен — используем его классификатор (тот же результат,
   * но по образцу строк); сообщение о результате всегда видно в панели.
   */
  /** Перезапуск классификатора для всех блоков (локально или через MCP). */
  async function suggestMapping() {
    if (importBlocks.length === 0) return;
    mappingBusy = true;
    mappingMessage = '';
    try {
      const headers = Object.keys(importRows[0] ?? {});
      if (aiState.status === 'running' && aiState.modelLoaded && aiState.port) {
        // Встроенная модель (Фаза 2): умный подбор нестандартных колонок.
        const byTable = await suggestWithAi(headers, importRows.slice(0, 5));
        importBlocks = importBlocks.map((block) => ({
          ...block,
          mapping: byTable[block.targetKey],
        }));
      } else if (mcpState.status === 'running' && pairedApiKey) {
        const suggested = await suggestMappingThroughMcp(
          mcpState.port,
          pairedApiKey,
          headers,
          importRows.slice(0, 5),
        );
        importBlocks = importBlocks.map((block) => ({
          ...block,
          mapping: applyTableMapping(headers, block.targetKey, suggested),
        }));
      } else {
        importBlocks = importBlocks.map((block) => ({
          ...block,
          mapping: classifyHeaders(headers, IMPORT_TARGETS[block.targetKey].columns),
        }));
      }
      const ready = importBlocks.reduce(
        (sum, block) => sum + block.mapping.rows.filter((row) => row.state === 'ready').length,
        0,
      );
      const needCheck = importBlocks.reduce(
        (sum, block) =>
          sum + block.mapping.rows.filter((row) => row.state !== 'ready' && row.state !== 'ignored').length,
        0,
      );
      mappingMessage =
        `Сопоставление предложено: готово ${ready}, проверить ${needCheck}. ` +
        (needCheck > 0
          ? 'Исправьте красные строки или выберите «Игнорировать колонку», затем подтвердите.'
          : 'Все колонки определены — можно подтверждать.');
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось предложить сопоставление.';
    } finally {
      mappingBusy = false;
    }
  }

  function numberOr(value: unknown): number | undefined {
    if (value === undefined || value === null || String(value).trim() === '') return undefined;
    const n = Number(String(value).replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  }

  function dimensionsOr(row: RawRow): { length?: number; width?: number; height?: number; unit?: string } | undefined {
    const length = numberOr(row['dimensions.length']);
    const width = numberOr(row['dimensions.width']);
    const height = numberOr(row['dimensions.height']);
    const unit = row['dimensions.unit'] ? String(row['dimensions.unit']) : undefined;
    return length === undefined && width === undefined && height === undefined && !unit
      ? undefined
      : { length, width, height, unit };
  }

  /** Прямое создание записей (product/module/counterparty) из сопоставленных строк. */
  async function createEntities(
    targetKey: ImportTargetKey,
    rows: RawRow[],
  ): Promise<{ created: number; errors: Array<{ rowName: string; error: string }> }> {
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) {
      throw new Error('Запись требует подключённого аккаунта.');
    }
    let created = 0;
    const errors: Array<{ rowName: string; error: string }> = [];
    for (const row of rows) {
      try {
        if (targetKey === 'product') {
          const kind = String(row.kind ?? 'good').trim() as 'good' | 'service' | 'work';
          const safeKind = ['good', 'service', 'work'].includes(kind) ? kind : 'good';
          await apiPost(apiFrom(cfg), '/api/products', {
            name: String(row.name ?? '').trim(),
            sku: String(row.sku ?? row.article ?? '').trim(),
            kind: safeKind,
            unit: String(row.unit ?? 'шт').trim(),
            description: row.description ? String(row.description) : undefined,
            notes: row.notes ? String(row.notes) : undefined,
            listPrice: numberOr(row.listPrice),
            costPrice: numberOr(row.costPrice),
            stockQty: numberOr(row.stockQty),
            ralCode: row.ralCode ? String(row.ralCode) : undefined,
            dimensions: dimensionsOr(row),
            weightKg: numberOr(row.weightKg),
          });
        } else if (targetKey === 'module') {
          await apiPost(apiFrom(cfg), '/api/modules', {
            name: String(row.name ?? '').trim(),
            article: String(row.article ?? '').trim(),
            unit: String(row.unit ?? 'шт').trim(),
            notes: row.notes ? String(row.notes) : undefined,
            dimensions: dimensionsOr(row),
            weightKg: numberOr(row.weightKg),
          });
        } else if (targetKey === 'counterparty') {
          const name = String(row.name ?? '').trim();
          const inn = String(row.inn ?? '').trim();
          if (!name || !inn) {
            errors.push({ rowName: name || 'без имени', error: 'Контрагенту нужны имя и ИНН' });
            continue;
          }
          await apiPost(apiFrom(cfg), '/api/counterparties', {
            name,
            inn,
            roles: [],
            shortName: row.shortName ? String(row.shortName) : undefined,
            legalForm: row.legalForm ? String(row.legalForm) : undefined,
            kpp: row.kpp ? String(row.kpp) : undefined,
            ogrn: row.ogrn ? String(row.ogrn) : undefined,
            bankName: row.bankName ? String(row.bankName) : undefined,
            bankBik: row.bankBik ? String(row.bankBik) : undefined,
            bankAccount: row.bankAccount ? String(row.bankAccount) : undefined,
            bankCorrAccount: row.bankCorrAccount ? String(row.bankCorrAccount) : undefined,
            directorName: row.directorName ? String(row.directorName) : undefined,
          });
        } else if (targetKey === 'warehouse') {
          const name = String(row.name ?? '').trim();
          if (!name) {
            errors.push({ rowName: 'без имени', error: 'Складу нужно наименование' });
            continue;
          }
          const rawType = String(row.type ?? '').trim().toLowerCase();
          const type = ['main', 'branch', 'transit', 'production', 'other'].includes(rawType)
            ? rawType
            : 'main';
          await apiPost(apiFrom(cfg), '/api/warehouses', {
            name,
            type,
            address: row.address ? String(row.address) : undefined,
            description: row.description ? String(row.description) : undefined,
          });
        } else if (targetKey === 'workType') {
          const name = String(row.name ?? '').trim();
          const hourlyRate = numberOr(row.hourlyRate);
          if (!name || hourlyRate === undefined || hourlyRate < 0) {
            errors.push({
              rowName: name || 'без имени',
              error: 'Виду работ нужны наименование и ставка ₽/час (число от 0)',
            });
            continue;
          }
          await apiPost(apiFrom(cfg), '/api/work-types', {
            name,
            hourlyRate,
            section: row.section ? String(row.section) : undefined,
            description: row.description ? String(row.description) : undefined,
            days: numberOr(row.days) !== undefined ? Math.max(1, Math.round(numberOr(row.days)!)) : undefined,
          });
        } else if (targetKey === 'colorReference') {
          const name = String(row.name ?? '').trim();
          if (!name) {
            errors.push({ rowName: 'без имени', error: 'Цвету нужно наименование' });
            continue;
          }
          // organizationId приходит с сервера (по аккаунту) — не из Excel.
          await apiPost(apiFrom(cfg), '/api/color-references', {
            name,
            hex: row.hex ? String(row.hex) : undefined,
            description: row.description ? String(row.description) : undefined,
          });
        } else if (targetKey === 'category') {
          const name = String(row.name ?? '').trim();
          const type = String(row.type ?? '').trim().toLowerCase();
          const slug = String(row.slug ?? '').trim();
          const skuPrefix = String(row.skuPrefix ?? '').trim();
          if (!name || !type || !slug || !skuPrefix) {
            errors.push({
              rowName: name || 'без имени',
              error: 'Категории нужны наименование, тип, slug и префикс SKU',
            });
            continue;
          }
          await apiPost(apiFrom(cfg), '/api/categories', {
            name,
            type,
            slug,
            skuPrefix,
            description: row.description ? String(row.description) : undefined,
          });
        }
        created += 1;
      } catch (err) {
        errors.push({
          rowName: String(row.name ?? row.article ?? row.sku ?? 'строка'),
          error: err instanceof Error ? err.message : 'Ошибка сервера',
        });
      }
    }
    return { created, errors };
  }

  /** Отправить блоки: материалы → предложения журнала; остальные → прямое создание. */
  async function sendBlocks() {
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) {
      mappingMessage = 'Отправка требует подключённого аккаунта.';
      return;
    }
    // Non-material пишут в SoT сразу — честный confirm перед записью.
    const directCounts = importBlocks
      .filter((block) => block.targetKey !== 'material')
      .map((block) => ({
        label: IMPORT_TARGETS[block.targetKey].label,
        rows: block.validated.filter((row) => row.status === 'ok_new' || row.status === 'ok_update').length,
      }))
      .filter((item) => item.rows > 0);
    if (directCounts.length > 0) {
      const summary = directCounts.map((item) => `${item.label}: ${item.rows}`).join(', ');
      const ok = confirm(
        `Записать сразу? Эти записи попадут в систему без дополнительного подтверждения (справочники пишутся сразу):\n${summary}\nМатериалы останутся в журнале предложений.`,
      );
      if (!ok) return;
    }
    mappingBusy = true;
    try {
      let proposed = 0;
      let created = 0;
      const errors: string[] = [];
      const next: ImportBlock[] = [];
      for (const block of importBlocks) {
        const allowed = block.validated.filter((row) => row.status === 'ok_new' || row.status === 'ok_update');
        if (allowed.length === 0) {
          next.push(block);
          continue;
        }
        if (block.targetKey === 'material') {
          const result = await proposeMaterialRows(apiFrom(cfg), allowed.map((row) => row.values));
          proposed += result.proposed;
          errors.push(...result.failed.map((f) => `${f.rowName}: ${f.error}`));
          next.push({ ...block, proposalIds: result.proposalIds });
        } else {
          const result = await createEntities(block.targetKey, allowed.map((row) => row.values));
          created += result.created;
          errors.push(...result.errors.map((f) => `${f.rowName}: ${f.error}`));
          next.push(block);
        }
      }
      importBlocks = next;
      // TZD-50: отклонённые строки остаются в отчёте на экране + .csv.
      const rejected = next.flatMap((block) =>
        block.validated
          .filter((row) => row.status !== 'ok_new' && row.status !== 'ok_update')
          .map((row) => ({
            table: IMPORT_TARGETS[block.targetKey].label,
            rowIndex: row.rowIndex,
            name: String(row.values.name ?? row.values.article ?? row.values.sku ?? 'Строка'),
            status: ROW_STATUS_LABEL[row.status] ?? row.status,
            message: row.message,
          })),
      );
      rejectionReport = rejected.length > 0 ? rejected : null;
      const parts = [
        `записано: материалов в предложения ${proposed}, создано записей ${created}`,
        `отклонено: ${rejected.length}`,
      ];
      if (errors.length > 0) parts.push(`ошибок записи: ${errors.length}`);
      mappingMessage = parts.join(' · ');
      if (proposed > 0) mappingMessage += '. Материалы — в журнале предложений: подтвердите блок выше.';
      await finalizeInboxFileIfDone({ proposed, created });
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось отправить строки.';
    } finally {
      mappingBusy = false;
    }
  }

  /**
   * Если файл агента открыт в студии и все его блоки отправлены/подтверждены
   * (нет висящих предложений) — переносим файл в processed/ и убираем из списка.
   * Перенос только если хоть что-то реально ушло в SoT/журнал: (proposed + created) > 0.
   */
  async function finalizeInboxFileIfDone(summary?: { proposed: number; created: number }) {
    if (!activeInboxFile) return;
    const file = inboxFiles.find((f) => f.name === activeInboxFile);
    if (!file) {
      activeInboxFile = '';
      return;
    }
    const hasPending = importBlocks.some((block) => block.proposalIds.length > 0);
    if (hasPending) return; // ждём подтверждения предложений материалов
    if (summary && summary.proposed + summary.created === 0) {
      // Полный провал — файл остаётся в папке для повторной попытки.
      file.note = 'Ничего не записано — проверьте ошибки выше и отправьте снова.';
      inboxFiles = [...inboxFiles];
      return;
    }
    try {
      await moveInboxFile(inboxDir, file.name, 'processed');
      await appendInboxLog(inboxDir, `${file.name} → processed: импортирован через студию`);
      inboxFiles = inboxFiles.filter((f) => f.name !== file.name);
      activeInboxFile = '';
      await loadInboxLog();
    } catch (err) {
      inboxError = err instanceof Error ? err.message : 'Не удалось переместить файл после импорта.';
    }
  }

  async function confirmBlockProposals(blockIndex: number) {
    const block = importBlocks[blockIndex];
    if (!block || block.proposalIds.length === 0) return;
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) return;
    mappingBusy = true;
    try {
      const result = await confirmProposals(apiFrom(cfg), block.proposalIds);
      importBlocks = importBlocks.map((item, index) =>
        index === blockIndex ? { ...item, proposalIds: [] } : item,
      );
      mappingMessage = `Подтверждено: ${result.applied}. Изменения записаны через журнал.`;
      await finalizeInboxFileIfDone();
    } finally {
      mappingBusy = false;
    }
  }

  async function cancelBlockProposals(blockIndex: number) {
    const block = importBlocks[blockIndex];
    if (!block || block.proposalIds.length === 0) return;
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) return;
    mappingBusy = true;
    try {
      await cancelProposals(apiFrom(cfg), block.proposalIds);
      importBlocks = importBlocks.map((item, index) =>
        index === blockIndex ? { ...item, proposalIds: [] } : item,
      );
      mappingMessage = 'Предложения отменены; SoT не изменён.';
    } finally {
      mappingBusy = false;
    }
  }

  interface CatalogRef {
    _id?: string;
    id?: string;
    article?: string;
    sku?: string;
    name?: string;
  }

  function catalogId(item: CatalogRef): string | undefined {
    return item._id ?? item.id;
  }

  function catalogArticle(item: CatalogRef): string {
    return String(item.article ?? item.sku ?? '').trim();
  }

  /**
   * TZD-49: lookup по артикулу/sku (search API), не blind limit=100.
   * Модули — полный список /api/modules (кэш по article).
   */
  async function lookupSpecificationCatalog(
    cfg: AppConfig,
    lines: SpecificationPreview['lines'],
  ): Promise<Map<string, CatalogRef>> {
    const api = apiFrom(cfg);
    const byKind = new Map<string, CatalogRef>();
    const modules = await apiGet<CatalogRef[]>(api, '/api/modules');
    for (const item of modules ?? []) {
      const article = catalogArticle(item);
      if (article) byKind.set(`module:${article}`, item);
    }
    const articlesByKind = new Map<SpecificationKind, Set<string>>();
    for (const line of lines) {
      if (!line.article) continue;
      const set = articlesByKind.get(line.kind) ?? new Set<string>();
      set.add(line.article);
      articlesByKind.set(line.kind, set);
    }
    for (const [kind, articles] of articlesByKind) {
      if (kind === 'module') continue;
      const path = kind === 'product' ? '/api/products' : '/api/materials';
      for (const article of articles) {
        const key = `${kind}:${article}`;
        if (byKind.has(key)) continue;
        const resp = await apiGet<{ items?: CatalogRef[] }>(
          api,
          `${path}?limit=20&search=${encodeURIComponent(article)}`,
        );
        const exact = (resp.items ?? []).find((item) => catalogArticle(item) === article);
        if (exact) byKind.set(key, exact);
      }
    }
    return byKind;
  }

  function specificationCreateBody(line: SpecificationPreview['lines'][number]): Record<string, unknown> {
    if (line.kind === 'product') {
      return {
        name: line.name,
        sku: line.article,
        kind: 'good',
        unit: line.unit,
        ...(line.dimensions
          ? {
              dimensions: {
                length: line.dimensions.depth,
                width: line.dimensions.width,
                height: line.dimensions.height,
                unit: line.dimensions.unit,
              },
            }
          : {}),
        ...(line.weight !== undefined ? { weightKg: line.weight } : {}),
      };
    }
    if (line.kind === 'module') {
      return {
        name: line.name,
        article: line.article,
        unit: line.unit,
        ...(line.dimensions ? { dimensions: line.dimensions } : {}),
        ...(line.weight !== undefined ? { weight: line.weight } : {}),
      };
    }
    return {
      name: line.name,
      article: line.article,
      unit: line.unit,
      materialKind: 'purchased',
      ...(line.weight !== undefined ? { weightKg: line.weight } : {}),
    };
  }

  /**
   * TZD-38: explicit final confirmation is the only write step. Missing catalog
   * entities are created first, then composition lines use the existing REST
   * composition APIs. No local DB and no silent graph writes.
   */
  async function confirmSpecification() {
    const preview = specificationPreview;
    if (!preview?.hierarchical) return;
    const blocking = specificationBlockingIssues(preview.issues);
    if (blocking.length > 0) {
      specificationMessage = 'Исправьте конфликты спецификации перед подтверждением.';
      return;
    }
    const cfg = await loadConfig();
    if (!cfg.apiBaseUrl || !cfg.apiKey) {
      specificationMessage = 'Подтверждение состава требует подключённого аккаунта.';
      return;
    }
    specificationBusy = true;
    specificationMessage = 'Готовим предложения и проверяем каталог…';
    try {
      const byKind = await lookupSpecificationCatalog(cfg, preview.lines);

      const ids = new Map<string, string>();
      for (const line of preview.lines) {
        const key = `${line.kind}:${line.article}`;
        const existing = byKind.get(key);
        if (existing && catalogId(existing)) {
          ids.set(key, catalogId(existing)!);
          continue;
        }
        const path = line.kind === 'product' ? '/api/products' : line.kind === 'module' ? '/api/modules' : '/api/materials';
        const created = await apiPost<CatalogRef>(apiFrom(cfg), path, specificationCreateBody(line));
        const createdId = catalogId(created);
        if (!createdId) throw new Error(`Сервер не вернул id для «${line.article}»`);
        ids.set(key, createdId);
      }

      let compositionLines = 0;
      for (const line of preview.lines) {
        if (!line.parentArticle) continue;
        const parent = preview.lines.find((candidate) => candidate.article === line.parentArticle);
        const parentId = parent ? ids.get(`${parent.kind}:${parent.article}`) : undefined;
        const childId = ids.get(`${line.kind}:${line.article}`);
        if (!parentId || !childId) throw new Error(`Не удалось связать «${line.parentArticle} → ${line.article}»`);
        if (parent?.kind === 'module' && line.kind === 'product') throw new Error('Модуль не может содержать изделие');
        await apiPost(
          apiFrom(cfg),
          `/api/${parent?.kind === 'module' ? 'modules' : 'products'}/${encodeURIComponent(parentId)}/composition`,
          { lineType: line.kind, refId: childId, quantity: line.quantity, unit: line.unit, sourceCode: line.article },
        );
        compositionLines += 1;
      }
      specificationMessage = `Состав подтверждён: сущностей ${ids.size}, строк состава ${compositionLines}. Откройте изделие в веб-каталоге для проверки.`;
    } catch (err) {
      specificationMessage = err instanceof Error ? err.message : 'Не удалось подтвердить состав.';
    } finally {
      specificationBusy = false;
    }
  }

  /** TZD-40: /api/desktop/compat → решение (block/warn/ok). Ошибка → fail-open. */
  async function checkCompat(cfg: AppConfig): Promise<void> {
    try {
      const info = await apiGet<DesktopCompatInfo>(apiFrom(cfg), '/api/desktop/compat');
      compat = { decision: decideCompat(appVersion, info), info };
    } catch {
      compat = null;
    }
  }

  /** Открыть установщик в браузере по умолчанию (shell:allow-open). */
  async function openDownloadUrl(): Promise<void> {
    const info = compat?.info;
    const base = connected?.apiBaseUrl;
    if (!info || !base) return;
    const url = resolveDownloadUrl(info.downloadUrl, base);
    try {
      await openExternal(url);
    } catch {
      // Браузер недоступен — баннер остаётся, скачать можно с сайта.
    }
  }

  onMount(async () => {
    try {
      appVersion = await getVersion();
    } catch {
      appVersion = '0.5.1';
    }
    mcp = new McpHostController((state) => {
      mcpState = state;
    });
    aiRunner = new AiRunnerController((state) => {
      aiState = state;
    });
    await loadAiSettings();
    await rescanModels();
    // Закрытие по крестику (Tauri 2): listener + destroy ACL.
    // Без preventDefault→destroy и без core:window:allow-destroy крестик «молчит».
    await getCurrentWindow().onCloseRequested(async (event) => {
      event.preventDefault();
      disposed = true;
      stopInboxWatcher();
      try {
        mcp?.dispose();
      } catch {
        // MCP не должен блокировать выход
      }
      try {
        aiRunner?.dispose();
      } catch {
        // AI-раннер не должен блокировать выход
      }
      try {
        await getCurrentWindow().destroy();
      } catch {
        try {
          await getCurrentWindow().close();
        } catch {
          // last resort: OS may still keep the process; user can End Task
        }
      }
    });

    // Восстанавливаем сохранённое подключение (живой ли токен — покажет первый запрос).
    const cfg = await loadConfig();
    if (cfg.basicAuth?.username) {
      basicUser = cfg.basicAuth.username;
      basicPass = cfg.basicAuth.password ?? '';
    }
    if (cfg.apiKey && cfg.username) {
      connected = { username: cfg.username, apiBaseUrl: cfg.apiBaseUrl };
      pairedApiKey = cfg.apiKey;
      mcpPortInput = String(cfg.mcp.port);
      mcp.setPrefs(cfg.mcp.port, cfg.mcp.allowLan);
      // Автостарт MCP host для подключённого (paired) десктопа — без терминала.
      await checkCompat(cfg);
      if (compat?.decision !== 'block') {
        await startMcp();
      }
    }

    // Inbox (TZD-15): подготовка каталога + слежение в реальном времени.
    await initInbox();
    await loadMappingProfiles();
    await startInboxWatcher();
  });

  function apiFrom(cfg: AppConfig): ApiClientOptions {
    return {
      baseUrl: cfg.apiBaseUrl,
      apiKey: cfg.apiKey,
      basicAuth: cfg.basicAuth,
    };
  }

  function currentBasicAuth(): HttpBasicAuth | undefined {
    const username = basicUser.trim();
    if (!username) return undefined;
    return { username, password: basicPass };
  }

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
      const basicAuth = currentBasicAuth() ?? existing.basicAuth;
      const config: AppConfig = {
        apiBaseUrl: p.apiBaseUrl,
        apiKey: p.apiKey,
        username: p.username,
        basicAuth,
        aiProvider: existing.aiProvider,
        mcp: existing.mcp,
        inbox: existing.inbox,
      };
      // Проверка: токен живой? 401 → «подключение устарело».
      await apiGet(
        { baseUrl: p.apiBaseUrl, apiKey: p.apiKey, basicAuth },
        '/api/auth/me',
      );
      await saveConfig(config);
      if (basicAuth) {
        basicUser = basicAuth.username;
        basicPass = basicAuth.password;
      }
      connected = { username: p.username, apiBaseUrl: p.apiBaseUrl };
      pairedApiKey = p.apiKey;
      pairingJson = '';
      mcpError = '';
      // Подключённый (paired) десктоп автоматически поднимает MCP host,
      // если версия не ниже минимальной (TZD-40).
      await checkCompat(config);
      if (compat?.decision !== 'block') {
        await startMcp();
      }
      await loadMappingProfiles();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        errors = [
          'Подключение устарело или неверный подъездный пароль.',
          'Проверьте: 1) новый паринг из сайта; 2) тот же логин/пароль, что браузер спрашивает до /login (не admin).',
        ];
      } else if (err instanceof ApiError) {
        errors = [`Сервер ответил ошибкой ${err.status} — проверьте URL и доступность.`];
      } else {
        const detail = err instanceof Error ? err.message : String(err);
        errors = [
          'Не удалось подключиться — проверьте URL, сеть и сервер.',
          'Если сайт требует пароль «подъезда» до страницы входа — введите его в поля ниже и повторите.',
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
    await saveConfig({
      ...cfg,
      apiKey: undefined,
      username: undefined,
      // basicAuth оставляем — удобно переподключить без повторного ввода подъезда
    });
    connected = null;
    pairedApiKey = undefined;
    profiles = [];
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

  /** Общий путь: имя файла + байты → импортёр → mapping HITL. */
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
      // Ручной файл — не финализируем файлы агента по завершении.
      activeInboxFile = '';
      importFileName = name;
      if (importer.id === 'excel') {
        const workbook = await parseExcelWorkbook({ name, data });
        importSheets = workbook.sheets;
        activeSheetName = workbook.activeSheet;
        importRows = workbook.sheets.find((sheet) => sheet.name === workbook.activeSheet)?.rows ?? [];
        prepareMapping(importRows, workbook.fingerprint ?? undefined);
        return;
      }
      importSheets = [];
      activeSheetName = '';
      importRows = await importer.parse({ name, data });
      prepareMapping(importRows);
    } catch (err) {
      importError = err instanceof Error ? err.message : 'Не удалось прочитать файл.';
      importRows = [];
      importSheets = [];
      importBlocks = [];
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

  /** Скачать Excel-форму (TZD-50/53): сгенерировать .xlsx и сохранить нативным диалогом. */
  async function downloadExcelForm() {
    if (!formTable) return;
    formBusy = true;
    formMessage = '';
    try {
      const bytes = serializeFormWorkbook(formTable);
      const { save } = await import('@tauri-apps/plugin-dialog');
      const path = await save({
        defaultPath: formFileName(formTable),
        filters: [{ name: 'Excel-форма', extensions: ['xlsx'] }],
      });
      if (!path) return; // пользователь отменил диалог
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      await writeFile(path, bytes);
      formMessage = `Форма «${IMPORT_TARGETS[formTable].label}» сохранена: ${path}. Заполните лист «Данные» и загрузите файл в студии импорта — система распознает форму сама.`;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const denied =
        /permission|not allowed|forbidden|denied|capabilities|acl/i.test(detail);
      formMessage = denied
        ? `Не удалось сохранить форму: нет права записи файла (обновите Desktop). ${detail}`
        : `Не удалось сохранить форму: ${detail}`;
    } finally {
      formBusy = false;
    }
  }

  const EMPTY_DEDUPE: ReadonlySet<string> = new Set();

  /**
   * Ключи дедупликации каталога для таблицы (материалы — артикул,
   * изделия — SKU, модули — артикул, контрагенты — ИНН). Страничный обход
   * с потолком 10 страниц по 100 — частичная проверка честно помечается.
   */
  async function fetchDedupeKeys(
    api: ApiClientOptions,
    targetKey: ImportTargetKey,
  ): Promise<{ keys: Set<string>; truncated: boolean }> {
    const keys = new Set<string>();
    // TZD-51 — справочники: list endpoint возвращает массив, ключи нормализуются
    // той же функцией, что и строки файла (`referenceDedupeKeysOf`).
    if (isReferenceTargetKey(targetKey)) {
      const path =
        targetKey === 'warehouse'
          ? '/api/warehouses'
          : targetKey === 'workType'
            ? '/api/work-types'
            : targetKey === 'colorReference'
              ? '/api/color-references'
              : '/api/categories';
      const items = await apiGet<Array<Record<string, unknown>>>(api, path);
      for (const item of items) {
        for (const key of referenceDedupeKeysOf(targetKey, item)) keys.add(key);
      }
      return { keys, truncated: false };
    }
    const keyOf = (item: Record<string, unknown>): string => {
      if (targetKey === 'product') return String(item.sku ?? item.article ?? '').trim();
      if (targetKey === 'counterparty') return String(item.inn ?? '').trim();
      return String(item.article ?? item.sku ?? '').trim();
    };
    if (targetKey === 'module') {
      const items = await apiGet<Array<Record<string, unknown>>>(api, '/api/modules');
      for (const item of items) {
        const key = keyOf(item);
        if (key) keys.add(key);
      }
      return { keys, truncated: false };
    }
    const path =
      targetKey === 'material' ? '/api/materials' : targetKey === 'product' ? '/api/products' : '/api/counterparties';
    const MAX_PAGES = 10;
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const resp = await apiGet<{ items?: Array<Record<string, unknown>>; total?: number }>(
        api,
        `${path}?limit=100&page=${page}`,
      );
      const items = resp.items ?? [];
      for (const item of items) {
        const key = keyOf(item);
        if (key) keys.add(key);
      }
      const total = resp.total ?? items.length;
      if (items.length === 0 || page * 100 >= total) return { keys, truncated: false };
    }
    return { keys, truncated: true };
  }

  /** Сохранить отчёт отклонённых строк как .csv (простой, Excel-совместимый). */
  async function downloadRejectionReport() {
    if (!rejectionReport || rejectionReport.length === 0) return;
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const path = await save({
        defaultPath: 'kppdf-import-rejections.csv',
        filters: [{ name: 'CSV-отчёт', extensions: ['csv'] }],
      });
      if (!path) return;
      const lines = [
        ['Таблица', 'Строка', 'Имя', 'Статус', 'Причина'],
        ...rejectionReport.map((row) => [
          row.table,
          String(row.rowIndex + 1),
          row.name,
          row.status,
          row.message,
        ]),
      ];
      const csv =
        '\uFEFF' +
        lines
          .map((cells) => cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
          .join('\r\n');
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      await writeTextFile(path, csv);
      mappingMessage = `Отчёт отклонений сохранён: ${path}`;
    } catch (err) {
      mappingMessage = err instanceof Error ? err.message : 'Не удалось сохранить отчёт.';
    }
  }
</script>

<svelte:head>
  <title>KPPDF Desktop</title>
</svelte:head>

<main class="shell">
  <header class="shell__header">
    <div class="shell__brand">
      <div>
        <h1>KPPDF Desktop</h1>
        <p class="shell__subtitle">Импорт данных и локальный AI для kppdf</p>
      </div>
      <div class="session-chip" data-test="session-chip" aria-live="polite">
        <span class="session-chip__dot" aria-hidden="true"></span>
        {connected ? `Подключено: ${connected.username}` : 'Аккаунт не подключён'}
      </div>
    </div>
    <div class="tabs" aria-label="Разделы Desktop" role="tablist">
      <button
        class:tabs__button--active={activeTab === 'connection'}
        class="tabs__button"
        data-test="tab-connection"
        type="button"
        role="tab"
        aria-selected={activeTab === 'connection'}
        onclick={() => (activeTab = 'connection')}
      >
        Подключение
      </button>
      <button
        class:tabs__button--active={activeTab === 'import'}
        class="tabs__button"
        data-test="tab-import"
        type="button"
        role="tab"
        aria-selected={activeTab === 'import'}
        onclick={() => (activeTab = 'import')}
      >
        Импорт
      </button>
      <button
        class:tabs__button--active={activeTab === 'ai'}
        class="tabs__button"
        data-test="tab-ai"
        type="button"
        role="tab"
        aria-selected={activeTab === 'ai'}
        onclick={() => (activeTab = 'ai')}
      >
        AI
      </button>
    </div>
  </header>

  <section class="cards">
    {#if activeTab === 'connection'}
    <article class="card">
      <h2>Подключение</h2>

      {#if compat?.decision === 'block'}
        <div class="compat-banner compat-banner--block" role="alert" data-test="compat-block">
          <p class="compat-banner__text">
            Нужно обновить приложение: ваша версия v{appVersion} устарела — требуется минимум
            v{compat.info.minDesktopVersion}. MCP не запущен.
          </p>
          <button class="btn" type="button" onclick={openDownloadUrl}>Скачать</button>
        </div>
      {:else if compat?.decision === 'warn'}
        <div class="compat-banner compat-banner--warn" role="status" data-test="compat-warn">
          <p class="compat-banner__text">
            Рекомендуем обновить приложение до v{compat.info.recommendedDesktopVersion}.
          </p>
          <button class="btn" type="button" onclick={openDownloadUrl}>Скачать</button>
        </div>
      {/if}

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

        <div class="basic-auth" data-test="desktop-basic-auth">
          <p class="hint">
            Если браузер спрашивает логин/пароль <strong>до</strong> страницы входа сайта
            («подъезд») — введите их здесь. Это не пароль admin.
          </p>
          <label class="field">
            <span>Подъездный логин</span>
            <input class="input" type="text" bind:value={basicUser} autocomplete="username" />
          </label>
          <label class="field">
            <span>Подъездный пароль</span>
            <input
              class="input"
              type="password"
              bind:value={basicPass}
              autocomplete="current-password"
            />
          </label>
        </div>

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

    {:else if activeTab === 'ai'}
    <div class="ai-banner" role="note" data-test="ai-banner">
      Импорт и Excel-формы работают без модели и без MCP.
    </div>

    <article class="card">
      <h2>Чат</h2>
      <p class="hint">
        Нажмите «Открыть чат» — если модель уже на диске, она загрузится в память и можно сразу писать.
        Внешние AI-клиенты (Cursor, LM Studio) — отдельный контур: блок «MCP для агентов» ниже на этой же вкладке.
      </p>
      <button
        class="btn btn--primary"
        type="button"
        data-test="ai-open-chat"
        onclick={openChat}
        disabled={aiBusy}
        onmouseenter={() => showHint(HINTS.openChat)}
        onmouseleave={clearHint}
        onfocus={() => showHint(HINTS.openChat)}
        onblur={clearHint}
      >
        {aiBusy ? 'Открываем…' : 'Открыть чат'}
      </button>
      {#if aiMessage}
        <p class="hint" role="status" data-test="ai-open-chat-message">{aiMessage}</p>
      {/if}
      <ChatPanel
        port={aiState.port}
        modelName={aiState.modelName}
        systemPrompt={desktopChatSystemPrompt}
        ready={chatReady}
        disabledReason={chatDisabledReason}
      />
    </article>

    <article class="card">
      <h2>Локальная модель</h2>
      <p class="hint">
        Модель скачивается один раз (~2 ГБ) в папку приложения и работает офлайн — ничего больше ставить
        не нужно. Подбор колонок работает и без модели (детерминированный классификатор), модель помогает
        с нестандартными заголовками. Характеристики ПК определяются автоматически — рекомендация ниже.
      </p>

      <div class="mcp-status">
        <span class="mcp-badge mcp-badge--{aiState.status}" aria-live="polite">
          {AI_STATUS_LABEL[aiState.status]}
        </span>
        {#if aiState.modelLoaded && aiState.modelName}
          <span class="mcp-badge mcp-badge--running">модель загружена: {aiState.modelName}</span>
        {/if}
      </div>

      {#if aiState.lastError}
        <p class="errors" role="alert">{aiState.lastError}</p>
      {/if}
      {#if aiMessage}
        <p class="hint" role="status">{aiMessage}</p>
      {/if}
      {#if aiState.modelError}
        <p class="errors" role="alert">{aiState.modelError}</p>
      {/if}
      {#if formatDownload(aiState.download)}
        <p class="hint" role="status">{formatDownload(aiState.download)}</p>
      {/if}

      {#if aiState.specs}
        <p class="hint">
          Ваш ПК: ОЗУ {formatRamGb(aiState.specs.totalMemoryGb)} · свободно
          {formatRamGb(aiState.specs.freeMemoryGb)} · ядер CPU: {aiState.specs.cpus}
          {#if selectedModelId && modelById(selectedModelId)}
            → рекомендация: <strong>{modelById(selectedModelId)!.name}</strong>
          {/if}
        </p>
      {/if}

      <label class="field">
        <span>Модель из каталога (для «Скачать»)</span>
        <select class="input" bind:value={selectedModelId} aria-label="Выбор модели">
          {#each LOCAL_MODELS as model (model.id)}
            <option value={model.id}>
              {model.name} — {formatBytes(model.sizeBytes)}
            </option>
          {/each}
        </select>
      </label>

      <div class="mcp-status">
        <span class="hint">Файлы .gguf в папке моделей: {diskModels.length}</span>
        <button
          class="btn btn--small"
          type="button"
          data-test="ai-rescan-models"
          onclick={rescanModels}
          disabled={aiBusy}
        >
          Обновить список
        </button>
      </div>
      {#if diskModels.length > 0}
        <label class="field">
          <span>Файл на диске (любое имя — с флешки тоже)</span>
          <select
            class="input"
            bind:value={selectedDiskFileName}
            aria-label="Выбор файла модели с диска"
            data-test="ai-disk-model-select"
          >
            <option value="">— взять из каталога выше —</option>
            {#each diskModels as diskModel (diskModel.fileName)}
              <option value={diskModel.fileName}>{diskModel.fileName} — {formatBytes(diskModel.sizeBytes)}</option>
            {/each}
          </select>
        </label>
      {/if}
      {#if diskModelsRejected.length > 0}
        <p class="hint" data-test="ai-disk-models-rejected">
          Пропущено (не похоже на модель):
          {#each diskModelsRejected as rej, i (rej.fileName)}{i > 0 ? '; ' : ' '}{rej.fileName} — {rej.reason}{/each}
        </p>
      {/if}

      <div class="mcp-actions">
        {#if aiState.status === 'running' || aiState.status === 'starting'}
          <button
            class="btn"
            type="button"
            onclick={stopAi}
            disabled={aiState.status === 'starting'}
            onmouseenter={() => showHint(HINTS.stopAi)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.stopAi)}
            onblur={clearHint}
          >
            Остановить
          </button>
        {/if}
        {#if aiState.status === 'stopped' || aiState.status === 'error'}
          <button
            class="btn btn--primary"
            type="button"
            onclick={startAi}
            disabled={aiBusy}
            onmouseenter={() => showHint(HINTS.startAi)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.startAi)}
            onblur={clearHint}
          >
            Запустить раннер
          </button>
        {/if}
        {#if aiState.status === 'running'}
          <button
            class="btn"
            type="button"
            onclick={startAi}
            disabled={aiBusy}
            onmouseenter={() => showHint(HINTS.startAi)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.startAi)}
            onblur={clearHint}
          >
            Перезапустить
          </button>
        {/if}
        <button
          class="btn btn--small"
          type="button"
          onclick={downloadSelectedModel}
          disabled={aiState.download.active || aiBusy}
          onmouseenter={() => showHint(HINTS.downloadModel)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.downloadModel)}
          onblur={clearHint}
        >
          {aiState.download.active ? 'Скачивается…' : 'Скачать модель'}
        </button>
        <button
          class="btn btn--small"
          type="button"
          onclick={openModelFolder}
          onmouseenter={() => showHint(HINTS.openModelFolder)}
          onmouseleave={clearHint}
          onfocus={() => showHint(HINTS.openModelFolder)}
          onblur={clearHint}
        >
          Открыть папку моделей
        </button>
      </div>
      <p class="hint">
        Можно скачать кнопкой «Скачать модель» (раннер поднимется сам, если ещё не запущен) или
        скопировать `.gguf` с флешки в папку моделей и нажать «Обновить список» — обязательного порядка
        «Запустить → Скачать → Перезапустить» больше нет: «Открыть чат» выше делает всё сама.
      </p>
    </article>

    <article class="card">
      <h2>MCP для агентов</h2>
      <p class="hint">Нужен Cursor или LM Studio. Для обычного импорта Excel не обязателен.</p>

      {#if !connected}
        <p>MCP не запущен: сначала подключите аккаунт (вкладка «Подключение»).</p>
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

    {:else}
    <article class="card card--studio">
      <h2>Импорт</h2>
      <p>
        Два способа загрузить данные: <strong>перетащите файл сюда</strong> (или выберите кнопкой), либо
        <strong>положите файл в папку агента</strong> — он появится в списке ниже.
      </p>
      <p class="hint">
        Шпаргалка: <strong>1</strong> скачайте форму → <strong>2</strong> заполните лист «Данные» →
        <strong>3</strong> загрузите файл обратно и подтвердите сопоставление.
      </p>

      <section class="form-studio" aria-label="Формы Excel">
        <div class="form-studio__head">
          <h3>Формы Excel</h3>
          <p class="hint">
            Скачайте готовую форму с каноническими заголовками — заполните её в Excel и загрузите обратно:
            система сама распознает таблицу и колонки.
          </p>
        </div>
        <div class="form-studio__controls">
          <label class="field">
            <span>Категория</span>
            <select
              class="input"
              aria-label="Категория формы"
              value={formCategory}
              onchange={(event) => {
                formCategory = (event.currentTarget as HTMLSelectElement).value as FormCategoryKey | '';
                formTable = '';
              }}
            >
              <option value="">— Выберите категорию —</option>
              {#each FORM_CATEGORIES as category (category.key)}
                <option value={category.key}>{category.labelRu}</option>
              {/each}
            </select>
          </label>
          <label class="field">
            <span>Таблица</span>
            <select
              class="input"
              aria-label="Таблица формы"
              value={formTable}
              disabled={!formCategory}
              onchange={(event) => {
                formTable = (event.currentTarget as HTMLSelectElement).value as ImportTargetKey | '';
              }}
            >
              <option value="">
                {formCategory ? '— Выберите таблицу —' : 'Сначала выберите категорию'}
              </option>
              {#each availableFormTemplates as template (template.targetKey)}
                <option value={template.targetKey}>{template.labelRu}</option>
              {/each}
            </select>
          </label>
          <button
            class="btn btn--primary"
            type="button"
            onclick={downloadExcelForm}
            disabled={!formTable || formBusy}
            onmouseenter={() => showHint(HINTS.downloadForm)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.downloadForm)}
            onblur={clearHint}
          >
            {formBusy ? 'Готовим…' : 'Скачать Excel-форму'}
          </button>
        </div>
        {#if selectedFormTemplate}
          <p class="hint">{selectedFormTemplate.descriptionRu}</p>
        {/if}
        <ol class="form-studio__steps">
          <li>Скачайте форму нужной таблицы (аккаунт для этого не нужен).</li>
          <li>Заполните лист «Данные» — строку с заголовками не удаляйте.</li>
          <li>Загрузите файл в студии импорта: «Выбрать файл» или папка агента.</li>
        </ol>
        {#if formMessage}
          <p class="hint" role="status">{formMessage}</p>
        {/if}
      </section>

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

      <section class="inbox-panel" aria-label="Файлы агента">
        <div class="inbox-panel__head">
          <div>
            <h3>Файлы агента (папка Inbox)</h3>
            <p class="card__lead">
              Положите файл в папку → <strong>Разобрать</strong> — он откроется в студии ниже: те же
              таблицы, профили и сопоставление колонок, что при ручном импорте. После отправки файл
              уходит в <code>processed/</code>. Для экспертных путей: <strong>Создать задачу для ИИ</strong>
              (без proposals) или <strong>Предложить строки</strong> (материалы, без сверки).
            </p>
          </div>
        </div>

        <div class="inbox-dir">
          <code class="inbox-dir__path" title={inboxDir}>{inboxDir || '…'}</code>
          <button
            class="btn btn--small"
            type="button"
            onclick={openInboxFolder}
            disabled={!inboxDir}
            onmouseenter={() => showHint(HINTS.openInbox)}
            onmouseleave={clearHint}
            onfocus={() => showHint(HINTS.openInbox)}
            onblur={clearHint}
          >
            Открыть папку…
          </button>
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
          <p class="hint">В папке inbox пока нет файлов (или все обработаны). Папка отслеживается — положите файл, и он появится здесь автоматически.</p>
        {:else}
          <ul class="inbox-list">
            {#each inboxFiles as file (file.name)}
              <li class="inbox-item">
                <div class="inbox-item__head">
                  <span class="inbox-badge inbox-badge--{file.status}">
                    {INBOX_STATUS_LABEL[file.status]}
                  </span>
                  {#if activeInboxFile === file.name}
                    <span class="inbox-badge inbox-badge--audited">в студии</span>
                  {/if}
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
                  {#if (file.status === 'new' || file.status === 'audited') && activeInboxFile !== file.name}
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
                  {#if activeInboxFile === file.name}
                    <button
                      class="btn btn--small"
                      type="button"
                      onclick={() => {
                        activeInboxFile = '';
                        file.note = 'Разобран — можно снова открыть в студии кнопкой «Разобрать».';
                        inboxFiles = [...inboxFiles];
                      }}
                      onmouseenter={() => showHint('Закроет файл в студии — сопоставление останется, файл не перемещается.')}
                      onmouseleave={clearHint}
                    >
                      Закрыть в студии
                    </button>
                  {/if}
                  {#if file.status === 'audited' && activeInboxFile !== file.name}
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
      </section>

      {#if importSheets.length > 1}
        <div class="sheet-picker" aria-label="Листы Excel">
          <span class="sheet-picker__label">Лист:</span>
          {#each importSheets as sheet (sheet.name)}
            <button
              class:sheet-picker__button--active={sheet.name === activeSheetName}
              class="sheet-picker__button"
              type="button"
              onclick={() => selectImportSheet(sheet.name)}
            >
              {sheet.name} <span>({sheet.rows.length})</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if importRows.length > 0}
        <p class="import-status">
          {importFileName ? `Файл: ${importFileName}` : 'Файл'} · строк: <strong>{importRows.length}</strong>
          {#if activeSheetName} · лист: <strong>{activeSheetName}</strong>{/if}
        </p>

        {#if specificationPreview?.hierarchical}
          {@const blockingIssues = specificationBlockingIssues(specificationPreview.issues)}
          {@const warningIssues = specificationPreview.issues.filter((issue) => issue.severity === 'warning')}
          <section class="specification-panel" aria-label="Иерархия спецификации">
            <div class="specification-panel__head">
              <div>
                <h3>Спецификация: дерево состава</h3>
                <p class="hint">
                  Проверьте изделие → модули → материалы и количество. Кнопка подтверждения создаёт
                  изделия, модули и материалы в каталоге сразу (не через журнал предложений).
                </p>
              </div>
              <span
                class:specification-badge--error={blockingIssues.length > 0}
                class:specification-badge--warn={blockingIssues.length === 0 && warningIssues.length > 0}
                class="specification-badge"
              >
                {#if blockingIssues.length > 0}
                  Конфликтов: {blockingIssues.length}
                {:else if warningIssues.length > 0}
                  Замечаний: {warningIssues.length}
                {:else}
                  Готово к HITL
                {/if}
              </span>
            </div>
            {#if blockingIssues.length > 0}
              <ul class="specification-issues" role="alert">
                {#each blockingIssues.slice(0, 12) as issue (issue.rowIndex + issue.code + issue.message)}
                  <li>#{issue.rowIndex + 1}: {issue.message}</li>
                {/each}
              </ul>
              {#if blockingIssues.length > 12}
                <p class="hint">…и ещё {blockingIssues.length - 12} конфликтов — исправьте файл или строки.</p>
              {/if}
            {:else}
              {#if warningIssues.length > 0}
                <ul class="specification-warnings" role="status">
                  {#each warningIssues.slice(0, 12) as issue (issue.rowIndex + issue.code + issue.message)}
                    <li>#{issue.rowIndex + 1}: {issue.message}</li>
                  {/each}
                </ul>
                {#if warningIssues.length > 12}
                  <p class="hint">…и ещё {warningIssues.length - 12} замечаний (имя из артикула и т.п.).</p>
                {/if}
              {/if}
              <div class="specification-tree">
                {#each specificationPreview.roots as root (root.article)}
                  {@render SpecificationTree(root)}
                {/each}
              </div>
              <button class="btn btn--primary" type="button" onclick={confirmSpecification} disabled={specificationBusy || !connected}>
                {specificationBusy ? 'Подтверждаем…' : 'Подтвердить и записать состав'}
              </button>
            {/if}
            {#if specificationMessage}<p class="hint" role="status">{specificationMessage}</p>{/if}
          </section>
        {/if}

        {#if importStage === 'mapping'}
          <section class="mapping-panel" aria-label="Сопоставление полей">
            <div class="mapping-panel__head">
              <div>
                <h3>1. Сопоставление полей</h3>
                <p class="hint">Агент нашёл таблицы, куда данные подходят. Проверьте колонки каждого блока: исправьте красные или выберите «Игнорировать».</p>
              </div>
              <button
                class="btn btn--small"
                type="button"
                onclick={suggestMapping}
                disabled={mappingBusy || importBlocks.length === 0}
                title="Перезапускает подбор полей: известные колонки подставляются сразу, сомнительные помечаются красным. Подтверждение всегда за человеком."
              >
                {mappingBusy ? 'Подбираем…' : 'Предложить сопоставление'}
              </button>
            </div>
            <p class="hint">
              Подбор работает без подключений (детерминированный классификатор по библиотеке таблиц).
              Скачайте модель во вкладке «AI» (Запустить → Скачать → Перезапустить) — она поможет
              с нестандартными колонками. MCP-хост для внешних AI-клиентов — тоже во вкладке «AI».
            </p>
            {#if activeInboxFile}
              <p class="hint" role="status">
                Файл из папки агента: <strong>{activeInboxFile}</strong>. После отправки он будет перемещён в
                <code>processed/</code>.
              </p>
            {/if}

            {#if importBlocks.length === 0}
              <p class="hint">Подходящих таблиц не найдено — добавьте таблицу вручную или примените сохранённый профиль.</p>
            {/if}

            <div class="import-blocks">
              {#each importBlocks as block, blockIndex (block.targetKey)}
                <div class="import-block">
                  <div class="import-block__head">
                    <strong>{IMPORT_TARGETS[block.targetKey].label}</strong>
                    <button class="btn btn--small" type="button" onclick={() => removeImportTable(blockIndex)}>Убрать</button>
                  </div>
                  <div class="mapping-list">
                    {#each block.mapping.rows as row (row.header)}
                      <div class:mapping-row--bad={row.state !== 'ready'} class="mapping-row">
                        <span class="mapping-row__source">{row.header || 'Без заголовка'}</span>
                        <span class="mapping-row__state">{row.state === 'ready' ? 'Готово' : row.state === 'conflict' ? 'Конфликт' : row.state === 'ignored' ? 'Игнорировано' : 'Нужно проверить'}</span>
                        <select
                          aria-label={`Поле для ${row.header}`}
                          value={row.canonical ?? '__ignore__'}
                          onchange={(event) => changeMapping(blockIndex, row.header, event)}
                        >
                          <option value="__ignore__">Игнорировать колонку</option>
                          {#each IMPORT_TARGETS[block.targetKey].columns as column (column.key)}
                            <option value={column.key}>{column.label} ({column.key})</option>
                          {/each}
                        </select>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>

            <select
              class="import-block-add"
              aria-label="Добавить таблицу"
              value=""
              onchange={(event) => {
                const key = (event.currentTarget as HTMLSelectElement).value as ImportTargetKey;
                if (key) addImportTable(key);
                (event.currentTarget as HTMLSelectElement).value = '';
              }}
            >
              <option value="">+ Добавить таблицу…</option>
              {#each IMPORT_TARGET_ORDER as key (key)}
                {#if !importBlocks.some((block) => block.targetKey === key)}
                  <option value={key}>{IMPORT_TARGETS[key].label}</option>
                {/if}
              {/each}
            </select>

            {#if mappingMessage}
              <p class="hint" role="status">{mappingMessage}</p>
            {/if}

            <div class="mapping-actions">
              <button class="btn btn--primary" type="button" onclick={confirmMapping} disabled={mappingBusy || importBlocks.length === 0}>
                Подтвердить сопоставление
              </button>
              <input class="profile-name" bind:value={profileName} placeholder="Название профиля…" aria-label="Название профиля" />
              <button class="btn btn--small" type="button" onclick={saveMappingProfile} disabled={mappingBusy || importBlocks.length === 0}>
                Сохранить профиль
              </button>
            </div>

            {#if profiles.length > 0}
              <div class="profiles">
                <span class="profiles__label">Методы сопоставления:</span>
                {#each profiles as profile (profile.id)}
                  <button class="profile-chip" type="button" onclick={() => applySavedProfile(profile)}>
                    {profile.isDefault ? '★ ' : ''}{profile.name}
                  </button>
                  <button class="profile-chip profile-chip--icon" type="button" aria-label={`Сделать профиль ${profile.name} основным`} onclick={() => setDefaultMappingProfile(profile)}>★</button>
                  <button class="profile-chip profile-chip--icon" type="button" aria-label={`Удалить профиль ${profile.name}`} onclick={() => removeMappingProfile(profile)}>×</button>
                {/each}
              </div>
            {/if}
          </section>
        {:else if importStage === 'rows'}
          <section class="validation-panel" aria-label="Проверка строк">
            <div class="validation-panel__head">
              <div>
                <h3>2. Проверка строк</h3>
                {#if hasDirectWriteBlocks}
                  <p class="hint">
                    <strong>Внимание:</strong> изделия, модули и контрагенты попадут в каталог
                    <strong>сразу</strong> после кнопки записи; материалы — через журнал предложений
                    (нужно подтверждение).
                  </p>
                {:else}
                  <p class="hint">До вашего подтверждения ничего не записывается в систему (SoT) — материалы уходят в журнал предложений.</p>
                {/if}
              </div>
            </div>

            {#each importBlocks as block, blockIndex (block.targetKey)}
              <div class="import-block">
                <div class="import-block__head">
                  <strong>{IMPORT_TARGETS[block.targetKey].label}</strong>
                  <span class="validation-counts">
                    {#if countStatus(block, 'ok_new') > 0}
                      <span class="vc vc--ok">Новые: {countStatus(block, 'ok_new')}</span>
                    {/if}
                    {#if countStatus(block, 'ok_update') > 0}
                      <span class="vc">Обновления: {countStatus(block, 'ok_update')}</span>
                    {/if}
                    {#if countStatus(block, 'duplicate') > 0}
                      <span class="vc vc--bad">Дубликаты: {countStatus(block, 'duplicate')}</span>
                    {/if}
                    {#if countStatus(block, 'invalid') > 0}
                      <span class="vc vc--bad">Ошибки: {countStatus(block, 'invalid')}</span>
                    {/if}
                    {#if countStatus(block, 'needs_review') > 0}
                      <span class="vc vc--warn">Проверить: {countStatus(block, 'needs_review')}</span>
                    {/if}
                  </span>
                  {#if block.targetKey === 'material' && block.proposalIds.length > 0}
                    <button class="btn btn--primary" type="button" onclick={() => confirmBlockProposals(blockIndex)} disabled={mappingBusy}>
                      Подтвердить предложения ({block.proposalIds.length})
                    </button>
                    <button class="btn btn--small" type="button" onclick={() => cancelBlockProposals(blockIndex)} disabled={mappingBusy}>Отменить</button>
                  {/if}
                </div>
                <div class="validation-list">
                  {#each block.validated as row (row.rowIndex)}
                    <div class="validation-row validation-row--{row.status}">
                      <span>#{row.rowIndex + 1}</span>
                      <strong>{String(row.values.name ?? row.values.article ?? row.values.sku ?? 'Строка')}</strong>
                      <span>{ROW_STATUS_LABEL[row.status] ?? row.status}</span>
                      <small>{row.message}</small>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}

            {@render PreviewTable(importRows)}
            {#if mappingMessage}<p class="hint" role="status">{mappingMessage}</p>{/if}
            {#if rejectionReport && rejectionReport.length > 0}
              <div class="rejection-summary" role="status">
                <p class="hint">
                  Отклонено строк: <strong>{rejectionReport.length}</strong> — они не записаны. Скачайте отчёт,
                  исправьте файл и загрузите снова.
                </p>
                <button class="btn btn--small" type="button" onclick={downloadRejectionReport}>
                  Скачать отчёт отклонений (.csv)
                </button>
              </div>
            {/if}
            <div class="mapping-actions">
              <button
                class="btn btn--primary"
                type="button"
                onclick={sendBlocks}
                disabled={mappingBusy || importBlocks.every((block) => block.validated.filter((row) => row.status === 'ok_new' || row.status === 'ok_update').length === 0)}
              >
                {hasDirectWriteBlocks ? 'Записать в каталог' : 'Отправить на подтверждение'}
              </button>
              <button class="btn btn--small" type="button" onclick={() => prepareMapping(importRows)}>Изменить сопоставление</button>
            </div>
          </section>
        {/if}
      {/if}
    </article>

    {/if}
  </section>

  <div class="shell__hint" role="status" aria-live="polite">{uiHint}</div>

  <footer class="shell__footer">
    <p>v{appVersion} — паринг, импорт, MCP host (TZD-14) и inbox для агента (TZD-15): файл → аудит → предложение → подтверждение через журнал изменений.</p>
  </footer>
</main>

<!-- Дерево спецификации: recursive preview only, no writes. -->
{#snippet SpecificationTree(node: SpecificationTreeNode)}
  <div class="specification-node" style={`--spec-level: ${node.level}`}>
    <span class="specification-node__kind">{node.kind}</span>
    <strong>{node.article}</strong>
    <span>{node.name}</span>
    <span class="specification-node__qty">× {node.quantity} {node.unit}</span>
  </div>
  {#if node.children.length > 0}
    <div class="specification-node__children">
      {#each node.children as child (child.article + child.rowIndex)}
        {@render SpecificationTree(child)}
      {/each}
    </div>
  {/if}
{/snippet}

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

  .shell__brand {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .session-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
    padding: 0.35rem 0.65rem;
    border: 1px solid #d9dee3;
    border-radius: 999px;
    background: #fbfcfd;
    color: #44535f;
    font-size: 0.78rem;
  }

  .session-chip__dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: #9aa6b1;
  }

  .tabs {
    display: flex;
    gap: 0.35rem;
    margin-top: 0.85rem;
  }

  .tabs__button {
    appearance: none;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #5a6a78;
    cursor: pointer;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
  }

  .tabs__button:hover,
  .tabs__button--active {
    border-bottom-color: #1c2733;
    color: #1c2733;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: minmax(0, 1fr);
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

  .basic-auth {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid #d5dde4;
    border-radius: 8px;
    background: #f6f8fa;
  }

  .basic-auth .hint {
    margin: 0;
    font-size: 0.78rem;
    color: #5a6a78;
    line-height: 1.35;
  }

  .basic-auth .field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.8rem;
    color: #3a4a58;
  }

  .basic-auth .input {
    font: inherit;
    padding: 0.45rem 0.55rem;
    border: 1px solid #b7c0c8;
    border-radius: 6px;
    background: #fff;
    color: #1c2733;
  }

  .errors li + li {
    margin-top: 0.25rem;
  }

  .compat-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
  }

  .compat-banner__text {
    margin: 0;
    line-height: 1.35;
  }

  .compat-banner--block {
    background: #fdf0ef;
    border: 1px solid #f2c8c4;
    color: #a12b23;
  }

  .compat-banner--warn {
    background: #fdf6e7;
    border: 1px solid #ecd9a8;
    color: #7a5c12;
  }

  .ai-banner {
    grid-column: 1 / -1;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    background: #eef4fb;
    border: 1px solid #c8d9ee;
    color: #1e4a76;
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

  .card--wide,
  .card--studio {
    grid-column: 1 / -1;
    min-height: 0;
  }

  .card--studio .table-wrap {
    flex: 1;
    min-height: 12rem;
    max-height: min(42vh, 30rem);
  }

  .card--studio .dropzone {
    min-height: 6.5rem;
    display: grid;
    place-items: center;
    border-style: dashed;
    background: #fbfcfd;
  }

  .form-studio {
    margin: 0.85rem 0;
    padding: 0.9rem 1rem;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    background: #fbfcfd;
  }

  .form-studio__head h3 {
    margin: 0 0 0.3rem;
    font-size: 0.95rem;
  }

  .form-studio__head .hint {
    margin: 0;
  }

  .form-studio__controls {
    display: flex;
    align-items: flex-end;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0.6rem;
  }

  .form-studio .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    color: #5a6a78;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .form-studio .field select.input {
    min-width: 12rem;
    padding: 0.4rem 0.5rem;
    border: 1px solid #b7c0c8;
    border-radius: 6px;
    background: #ffffff;
    color: #1c2733;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 400;
  }

  .form-studio .field select.input:disabled {
    background: #eef1f4;
    color: #7a8794;
  }

  .form-studio__steps {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0.65rem 0 0;
    padding-left: 1.25rem;
    color: #44535f;
    font-size: 0.78rem;
  }

  .sheet-picker,
  .mapping-actions,
  .profiles,
  .validation-panel__head,
  .mapping-panel__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .sheet-picker {
    margin: 0.4rem 0 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e4e8ec;
  }

  .sheet-picker__label,
  .profiles__label {
    color: #5a6a78;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .sheet-picker__button,
  .profile-chip {
    border: 1px solid #d9dee3;
    border-radius: 999px;
    background: #fbfcfd;
    color: #44535f;
    cursor: pointer;
    font: inherit;
    font-size: 0.76rem;
    padding: 0.25rem 0.55rem;
  }

  .sheet-picker__button--active,
  .profile-chip:hover {
    border-color: #1c2733;
    color: #1c2733;
  }

  .sheet-picker__button span {
    color: #7a8794;
  }

  .specification-panel {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin: 0.65rem 0;
    padding: 0.75rem;
    border: 1px solid #c9d8e6;
    border-radius: 8px;
    background: #f7fbff;
  }

  .specification-panel__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .specification-panel h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .specification-badge {
    flex-shrink: 0;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    background: #e6f4eb;
    color: #1e7d43;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .specification-badge--error {
    background: #fdf0ef;
    color: #a12b23;
  }

  .specification-badge--warn {
    background: #fff6e6;
    color: #8a5a00;
  }

  .specification-issues {
    margin: 0;
    padding: 0.5rem 0.75rem 0.5rem 1.8rem;
    border: 1px solid #efc5bf;
    border-radius: 7px;
    background: #fff6f5;
    color: #a12b23;
    font-size: 0.78rem;
  }

  .specification-warnings {
    margin: 0 0 0.5rem;
    padding: 0.5rem 0.75rem 0.5rem 1.8rem;
    border: 1px solid #e8d4a8;
    border-radius: 7px;
    background: #fffbf0;
    color: #7a5a10;
    font-size: 0.78rem;
  }

  .specification-tree {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
    max-height: 17rem;
    overflow: auto;
  }

  .specification-node {
    display: grid;
    grid-template-columns: 4.5rem minmax(7rem, 0.8fr) minmax(8rem, 1.5fr) auto;
    align-items: center;
    gap: 0.5rem;
    margin-left: calc(var(--spec-level) * 1rem);
    padding: 0.35rem 0.5rem;
    border: 1px solid #d9e3ec;
    border-radius: 6px;
    background: #ffffff;
    font-size: 0.78rem;
  }

  .specification-node__kind {
    color: #5a6a78;
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  .specification-node__qty {
    color: #44535f;
    white-space: nowrap;
  }

  .specification-node__children {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }

  .mapping-panel,
  .validation-panel {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .mapping-panel h3,
  .validation-panel h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .import-blocks {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .import-block {
    border: 1px solid #d0d7de;
    border-radius: 9px;
    padding: 0.55rem 0.65rem;
    background: #f7f9fb;
  }

  .import-block__head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 0.45rem;
  }

  .import-block__head strong {
    font-size: 0.85rem;
  }

  .import-block-add {
    margin-top: 0.55rem;
    padding: 0.35rem 0.45rem;
    border: 1px dashed #b7c0c8;
    border-radius: 6px;
    background: #ffffff;
    color: #1c2733;
    font: inherit;
    font-size: 0.78rem;
    max-width: 16rem;
  }

  .mapping-list,
  .validation-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    overflow: auto;
    max-height: 13rem;
    padding-right: 0.2rem;
  }

  .mapping-row,
  .validation-row {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) auto minmax(10rem, 14rem);
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.55rem;
    border: 1px solid #d9dee3;
    border-radius: 7px;
    background: #fbfcfd;
    font-size: 0.78rem;
  }

  .mapping-row--bad {
    border-color: #d9a39d;
    background: #fdf0ef;
  }

  .mapping-row__source {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mapping-row__state {
    color: #1e7d43;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .mapping-row--bad .mapping-row__state {
    color: #a12b23;
  }

  .mapping-row select,
  .profile-name {
    min-width: 0;
    padding: 0.35rem 0.45rem;
    border: 1px solid #b7c0c8;
    border-radius: 6px;
    background: #ffffff;
    color: #1c2733;
    font: inherit;
    font-size: 0.78rem;
  }

  .profile-name {
    width: 12rem;
  }

  .profiles {
    padding-top: 0.35rem;
  }

  .profile-chip--icon {
    margin-left: -0.4rem;
    padding-inline: 0.4rem;
  }

  .validation-counts {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    color: #5a6a78;
    font-size: 0.72rem;
  }

  .vc--ok {
    color: #1e7d43;
  }

  .vc--bad {
    color: #a12b23;
  }

  .vc--warn {
    color: #8a6d1a;
  }

  .validation-row {
    grid-template-columns: 2.5rem minmax(8rem, 1fr) 5rem minmax(12rem, 2fr);
  }

  .validation-row--ok_new {
    border-color: #a8cdb4;
  }

  .validation-row--ok_update {
    border-color: #a9c4dc;
  }

  .validation-row--duplicate,
  .validation-row--invalid {
    border-color: #d9a39d;
    background: #fdf0ef;
  }

  .validation-row--needs_review {
    border-color: #e3cf9e;
    background: #fdf7e8;
  }

  .rejection-summary {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    padding: 0.55rem 0.7rem;
    border: 1px solid #e8c4bf;
    border-radius: 8px;
    background: #fdf0ef;
  }

  .rejection-summary .hint {
    margin: 0 !important;
    color: #a12b23;
  }

  .validation-row small {
    color: #5a6a78;
  }

  .inbox-panel {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e9ed;
  }

  .inbox-panel__head {
    margin-bottom: 0.6rem;
  }

  .inbox-panel__head h3 {
    margin: 0 0 0.25rem;
  }

  .inbox-panel__head .card__lead {
    margin: 0;
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
    .shell__brand {
      align-items: stretch;
      flex-direction: column;
      gap: 0.6rem;
    }

    .session-chip {
      align-self: flex-start;
    }

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
