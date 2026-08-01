<script lang="ts">
  // Экран «Подключение» (v0.2): вставка паринг-JSON → saveConfig → проверка /auth/me.
  // AI-импорт — будущая TZ (кнопка-стаб).
  import { onMount } from 'svelte';
  import { apiGet, ApiError } from './core/api';
  import { loadConfig, saveConfig, type AppConfig } from './core/config';
  import { parsePairing } from './core/pairing';

  // Placeholder вынесен в JS: фигурные скобки в атрибуте Svelte парсит как выражение.
  const pairingPlaceholder =
    '{"apiBaseUrl":"https://app.kppdf.ru","apiKey":"...","username":"...","expiresAt":"..."}';

  let pairingJson = $state('');
  let errors = $state<string[]>([]);
  let connecting = $state(false);
  let connected = $state<{ username: string; apiBaseUrl: string } | null>(null);

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
      <h2>AI-импорт</h2>
      <p>Массовый ввод данных: файл → парсинг → AI-нормализация → подтверждение → батч-отправка.</p>
      <button class="btn" type="button" disabled title="TODO: реализация — будущая TZ">
        Импортировать данные
      </button>
    </article>
  </section>

  <footer class="shell__footer">
    <p>Скелет v0.2 — паринг работает, импорт помечен TODO (см. README.md → Roadmap).</p>
  </footer>
</main>

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
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
