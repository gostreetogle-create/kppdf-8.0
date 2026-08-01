<script lang="ts">
  // v0.2 — «Подключение» (паринг + /auth/me). v0.3 — «Импорт» (excel/csv → таблица).
  import { onMount } from 'svelte';
  import { open } from '@tauri-apps/plugin-dialog';
  import { readFile } from '@tauri-apps/plugin-fs';
  import { apiGet, ApiError } from './core/api';
  import { loadConfig, saveConfig, type AppConfig } from './core/config';
  import { parsePairing } from './core/pairing';
  import { importerFor, type RawRow } from './importers';

  // Placeholder вынесен в JS: фигурные скобки в атрибуте Svelte парсит как выражение.
  const pairingPlaceholder =
    '{"apiBaseUrl":"https://app.kppdf.ru","apiKey":"...","username":"...","expiresAt":"..."}';

  let pairingJson = $state('');
  let errors = $state<string[]>([]);
  let connecting = $state(false);
  let connected = $state<{ username: string; apiBaseUrl: string } | null>(null);

  // Импорт
  let importRows = $state<RawRow[]>([]);
  let importError = $state('');
  let importing = $state(false);

  onMount(async () => {
    // Восстанавливаем сохранённое подключение (живой ли токен — покажет первый запрос).
    const cfg = await loadConfig();
    if (cfg.apiKey && cfg.username) {
      connected = { username: cfg.username, apiBaseUrl: cfg.apiBaseUrl };
    }
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
      };
      // Проверка: токен живой? 401 → «подключение устарело».
      await apiGet({ baseUrl: p.apiBaseUrl, apiKey: p.apiKey }, '/api/auth/me');
      await saveConfig(config);
      connected = { username: p.username, apiBaseUrl: p.apiBaseUrl };
      pairingJson = '';
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
  </section>

  <footer class="shell__footer">
    <p>v0.3 — паринг и импорт Excel/CSV работают, отправка на сервер помечена TODO.</p>
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
